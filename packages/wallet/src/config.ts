import { isValidEntityId } from "@hieco/utils";
import { atom } from "nanostores";
import SignClient from "@walletconnect/sign-client";
import type { SessionTypes } from "@walletconnect/types";
import { hederaTestnet } from "./chains.ts";
import { asWalletError, WalletError } from "./errors.ts";
import { discoverExtensions, pairExtension } from "./extensions.ts";
import { isBrowser } from "./platform.ts";
import { createStorage } from "./storage.ts";
import type {
  ConnectOptions,
  CreateWalletOptions,
  Wallet,
  WalletAccount,
  WalletChain,
  WalletConnection,
  WalletDefinition,
  WalletExtension,
  WalletOption,
  WalletState,
  WalletTransportId,
} from "./types.ts";
import { getDefaultWallets } from "./wallets.ts";

const DEFAULT_STORAGE_KEY = "hieco.wallet.v1";
const HEDERA_METHODS = [
  "hedera_getNodeAddresses",
  "hedera_executeTransaction",
  "hedera_signMessage",
  "hedera_signAndExecuteQuery",
  "hedera_signAndExecuteTransaction",
  "hedera_signTransaction",
] as const;
const HEDERA_EVENTS = ["accountsChanged", "chainChanged"] as const;

interface PersistedSession {
  readonly walletId: string;
  readonly chainId: string;
  readonly topic: string;
  readonly transport: WalletTransportId;
  readonly pairingTopic?: string;
  readonly extensionId?: string;
}

interface ActiveSession {
  readonly walletId: string;
  readonly transport: WalletTransportId;
  readonly extensionId?: string;
  readonly session: SessionTypes.Struct;
}

interface PendingQrConnection {
  readonly walletId: string;
  readonly chainId: string;
  readonly uri: string;
  readonly connection: Promise<WalletConnection>;
}

function normalize(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function findExtension(
  wallet: WalletDefinition,
  extensions: readonly WalletExtension[],
): WalletExtension | null {
  const extension = wallet.desktop?.extension;

  if (!extension) {
    return null;
  }

  const ids = (extension.ids ?? []).map(normalize);
  const names = [wallet.name, ...(extension.names ?? [])].map(normalize);

  for (const candidate of extensions) {
    if (ids.includes(normalize(candidate.id)) || names.includes(normalize(candidate.name))) {
      return candidate;
    }
  }

  return null;
}

function createInitialState(
  chains: readonly WalletChain[],
  wallets: readonly WalletOption[],
  error: WalletError | null = null,
): WalletState {
  const chain = chains[0];

  if (!chain) {
    throw new WalletError("CHAIN_UNSUPPORTED");
  }

  return {
    status: error ? "error" : "idle",
    wallets,
    wallet: null,
    account: null,
    accounts: [],
    chain,
    chains,
    signer: undefined,
    transport: null,
    error,
    prompt: null,
  };
}

function parseCaipAccount(value: string): WalletAccount {
  const [namespace, network, accountId] = value.split(":");

  if (namespace !== "hedera" || !network || !accountId || !isValidEntityId(accountId)) {
    throw new WalletError("CONNECT_FAILED");
  }

  return {
    accountId,
    caip10: value,
    chainId: `${namespace}:${network}`,
    ledgerId: network === "devnet" ? "local-node" : network,
  };
}

function findChain(chains: readonly WalletChain[], chainId: string): WalletChain {
  const chain = chains.find((item) => item.id === chainId);

  if (!chain) {
    throw new WalletError("CHAIN_UNSUPPORTED");
  }

  return chain;
}

function pickWallet(wallets: readonly WalletOption[], walletId?: string): WalletOption {
  if (!walletId) {
    const wallet = wallets[0];

    if (!wallet) {
      throw new WalletError("WALLET_NOT_READY");
    }

    return wallet;
  }

  const wallet = wallets.find((item) => item.id === walletId);

  if (!wallet) {
    throw new WalletError("WALLET_NOT_READY");
  }

  return wallet;
}

function parsePersistedSession(value: string | null): PersistedSession | null {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const record = parsed as Record<string, unknown>;

    if (
      typeof record.walletId !== "string" ||
      typeof record.chainId !== "string" ||
      typeof record.topic !== "string" ||
      (record.transport !== "extension" && record.transport !== "walletconnect")
    ) {
      return null;
    }

    if (record.pairingTopic !== undefined && typeof record.pairingTopic !== "string") {
      return null;
    }

    if (record.extensionId !== undefined && typeof record.extensionId !== "string") {
      return null;
    }

    return {
      walletId: record.walletId,
      chainId: record.chainId,
      topic: record.topic,
      transport: record.transport,
      pairingTopic: record.pairingTopic,
      extensionId: record.extensionId,
    };
  } catch {
    return null;
  }
}

function getRequiredNamespaces(chains: readonly WalletChain[]) {
  return {
    hedera: {
      chains: chains.map((chain) => chain.id),
      methods: [...HEDERA_METHODS],
      events: [...HEDERA_EVENTS],
    },
  };
}

function findSession(client: SignClient, topic: string): SessionTypes.Struct | null {
  return client.session.getAll().find((session) => session.topic === topic) ?? null;
}

export function createWallet(options: CreateWalletOptions): Wallet {
  const app = options.app;
  const chains = options.chains ?? [hederaTestnet()];
  const definitions = options.wallets ?? getDefaultWallets();
  const storage = options.storage ?? createStorage();
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const autoConnect = options.autoConnect ?? true;

  let extensions: readonly WalletExtension[] = [];
  const readWallets = (): readonly WalletOption[] =>
    definitions.map((wallet) => ({
      ...wallet,
      extension: findExtension(wallet, extensions),
    }));
  let wallets = readWallets();
  let clientPromise: Promise<SignClient> | null = null;
  let signerModulePromise: Promise<typeof import("./signer.ts")> | null = null;
  let client: SignClient | null = null;
  let activeSession: ActiveSession | null = null;
  let pendingQr: PendingQrConnection | null = null;
  let pendingQrPromise: Promise<PendingQrConnection> | null = null;
  let pendingQrKey: string | null = null;
  let connectAttempt = 0;
  let destroyed = false;

  const $state = atom<WalletState>(createInitialState(chains, wallets));

  const snapshot = (): WalletState => $state.get();

  const resetState = (error: WalletError | null = null): void => {
    const current = snapshot();
    activeSession = null;
    $state.set({
      ...createInitialState(chains, wallets, error),
      chain: current.chain,
    });
  };

  const refreshWallets = async (): Promise<void> => {
    if (!isBrowser()) {
      return;
    }

    extensions = await discoverExtensions();
    wallets = readWallets();

    const current = snapshot();
    const currentWallet = current.wallet;
    const currentPrompt = current.prompt;
    $state.set({
      ...current,
      wallets,
      wallet: currentWallet ? (wallets.find((item) => item.id === currentWallet.id) ?? null) : null,
      prompt: currentPrompt
        ? {
            ...currentPrompt,
            wallet:
              wallets.find((item) => item.id === currentPrompt.wallet.id) ?? currentPrompt.wallet,
          }
        : null,
    });
  };

  const readPersistedSession = async (): Promise<PersistedSession | null> => {
    return parsePersistedSession(await storage.getItem(storageKey));
  };

  const writePersistedSession = async (session: PersistedSession | null): Promise<void> => {
    try {
      if (session) {
        await storage.setItem(storageKey, JSON.stringify(session));
        return;
      }

      await storage.removeItem(storageKey);
    } catch {}
  };

  const createSigner = async (input: {
    readonly accountId: string;
    readonly chain: WalletChain;
    readonly topic: string;
    readonly extensionId?: string;
  }): Promise<WalletConnection["signer"]> => {
    if (!client) {
      throw new WalletError("SIGNER_UNAVAILABLE");
    }

    if (!signerModulePromise) {
      signerModulePromise = import("./signer.ts");
    }

    const { WalletConnectHederaSigner } = await signerModulePromise;

    return new WalletConnectHederaSigner({
      accountId: input.accountId,
      chain: input.chain,
      client,
      topic: input.topic,
      extensionId: input.extensionId,
    });
  };

  const applySession = async (
    session: SessionTypes.Struct,
    walletId: string,
    transport: WalletTransportId,
    preferredChainId?: string,
    extensionId?: string,
  ): Promise<WalletConnection> => {
    const namespace = session.namespaces.hedera;

    if (!namespace) {
      throw new WalletError("CONNECT_FAILED");
    }

    const accounts = namespace.accounts.map(parseCaipAccount);
    const account = accounts.find((item) => item.chainId === preferredChainId) ?? accounts[0];

    if (!account) {
      throw new WalletError("CONNECT_FAILED");
    }

    const chain = findChain(chains, account.chainId);
    const wallet = pickWallet(wallets, walletId);
    const signer = await createSigner({
      accountId: account.accountId,
      chain,
      topic: session.topic,
      extensionId,
    });

    activeSession = {
      walletId,
      transport,
      extensionId,
      session,
    };

    $state.set({
      status: "connected",
      wallets,
      wallet,
      account,
      accounts,
      chain,
      chains,
      signer,
      transport,
      error: null,
      prompt: null,
    });

    return {
      wallet,
      account,
      accounts,
      chain,
      signer,
      transport,
      extensionId,
      topic: session.topic,
    };
  };

  const bindClient = (nextClient: SignClient): void => {
    if (client === nextClient) {
      return;
    }

    nextClient.on("session_event", (event) => {
      if (!activeSession || event.topic !== activeSession.session.topic) {
        return;
      }

      if (
        event.params.event.name === "accountsChanged" &&
        Array.isArray(event.params.event.data) &&
        event.params.event.data.every((value) => typeof value === "string")
      ) {
        void (async () => {
          const current = snapshot();
          const accounts = event.params.event.data.map(parseCaipAccount);
          const account =
            accounts.find((item: WalletAccount) => item.accountId === current.account?.accountId) ??
            accounts[0] ??
            null;

          if (!account || !activeSession) {
            resetState();
            return;
          }

          const chain = findChain(chains, account.chainId);
          const signer = await createSigner({
            accountId: account.accountId,
            chain,
            topic: activeSession.session.topic,
            extensionId: activeSession.extensionId,
          });

          $state.set({
            ...current,
            wallets,
            accounts,
            account,
            chain,
            signer,
          });
        })().catch((error) => {
          resetState(asWalletError(error, "CONNECT_FAILED"));
        });
      }

      if (
        event.params.event.name === "chainChanged" &&
        typeof event.params.event.data === "string"
      ) {
        void (async () => {
          const current = snapshot();
          const chain = findChain(chains, event.params.event.data);
          const account = current.accounts.find((item) => item.chainId === chain.id) ?? null;

          if (!account || !activeSession) {
            throw new WalletError("CHAIN_UNSUPPORTED");
          }

          const signer = await createSigner({
            accountId: account.accountId,
            chain,
            topic: activeSession.session.topic,
            extensionId: activeSession.extensionId,
          });

          $state.set({
            ...current,
            wallets,
            chain,
            account,
            signer,
          });
        })().catch((error) => {
          const current = snapshot();
          $state.set({
            ...current,
            wallets,
            status: "error",
            error: asWalletError(error, "CHAIN_UNSUPPORTED"),
            prompt: null,
          });
        });
      }
    });

    nextClient.on("session_update", (event) => {
      if (!activeSession || event.topic !== activeSession.session.topic) {
        return;
      }

      const session = findSession(nextClient, event.topic);

      if (!session) {
        resetState();
        return;
      }

      void applySession(
        session,
        activeSession.walletId,
        activeSession.transport,
        snapshot().chain.id,
        activeSession.extensionId,
      ).catch((error) => {
        resetState(asWalletError(error, "RESTORE_FAILED"));
      });
    });

    nextClient.on("session_delete", (event) => {
      if (!activeSession || event.topic !== activeSession.session.topic) {
        return;
      }

      void writePersistedSession(null);
      resetState();
    });

    client = nextClient;
  };

  const ensureClient = async (): Promise<SignClient> => {
    if (destroyed || !isBrowser() || !options.projectId) {
      throw new WalletError("WALLET_NOT_READY");
    }

    if (clientPromise) {
      return clientPromise;
    }

    clientPromise = SignClient.init({
      projectId: options.projectId,
      metadata: {
        ...app,
        icons: [...app.icons],
      },
    }).then((nextClient) => {
      bindClient(nextClient);
      return nextClient;
    });

    return clientPromise;
  };

  const pickQrWallet = (walletId?: string): WalletOption => {
    if (walletId) {
      const wallet = pickWallet(wallets, walletId);

      if (!wallet.transports.includes("walletconnect")) {
        throw new WalletError("CONNECT_FAILED");
      }

      return wallet;
    }

    const wallet =
      wallets.find(
        (item) => item.id === "hedera-wallet" && item.transports.includes("walletconnect"),
      ) ?? wallets.find((item) => item.transports.includes("walletconnect"));

    if (!wallet) {
      throw new WalletError("CONNECT_FAILED");
    }

    return wallet;
  };

  const clearPendingQr = (): void => {
    pendingQr = null;
    pendingQrPromise = null;
    pendingQrKey = null;
  };

  const prepareQr = async (connectOptions: ConnectOptions = {}): Promise<void> => {
    if (!isBrowser()) {
      throw new WalletError("WALLET_NOT_READY");
    }

    await refreshWallets();

    const current = snapshot();
    const wallet = pickQrWallet(connectOptions.wallet);
    const chain = findChain(chains, connectOptions.chain ?? current.chain.id);
    const key = `${wallet.id}:${chain.id}`;

    if (pendingQr && pendingQrKey === key && current.prompt?.uri === pendingQr.uri) {
      return;
    }

    if (pendingQrPromise && pendingQrKey === key) {
      await pendingQrPromise;
      return;
    }

    pendingQrKey = key;
    pendingQrPromise = (async (): Promise<PendingQrConnection> => {
      const nextClient = await ensureClient();
      const { uri, approval } = await nextClient.connect({
        requiredNamespaces: getRequiredNamespaces(chains),
      });

      if (!uri) {
        throw new WalletError("CONNECT_FAILED");
      }

      const connection = approval().then(async (session) => {
        if (!pendingQr || pendingQr.uri !== uri) {
          throw new WalletError("CONNECT_FAILED");
        }

        const nextConnection = await applySession(
          session,
          wallet.id,
          "walletconnect",
          chain.id,
          wallet.extension?.id,
        );

        await writePersistedSession({
          walletId: wallet.id,
          chainId: nextConnection.chain.id,
          topic: session.topic,
          transport: "walletconnect",
          pairingTopic: session.pairingTopic,
          extensionId: wallet.extension?.id,
        });

        clearPendingQr();
        return nextConnection;
      });

      const prepared = {
        walletId: wallet.id,
        chainId: chain.id,
        uri,
        connection,
      } satisfies PendingQrConnection;

      pendingQr = prepared;
      const latest = snapshot();
      $state.set({
        ...latest,
        wallets,
        status: latest.account ? latest.status : "idle",
        transport: latest.account ? latest.transport : null,
        error: null,
        prompt: {
          kind: "qr",
          uri,
          wallet,
        },
      });

      void connection.catch((error) => {
        if (!pendingQr || pendingQr.uri !== uri) {
          return;
        }

        clearPendingQr();

        const walletError = asWalletError(error, "CONNECT_FAILED");
        const latest = snapshot();
        $state.set({
          ...latest,
          wallets,
          status: latest.account ? latest.status : "error",
          transport: latest.account ? latest.transport : null,
          error: walletError,
          prompt: null,
        });
      });

      return prepared;
    })();

    try {
      await pendingQrPromise;
    } catch (error) {
      clearPendingQr();
      throw asWalletError(error, "CONNECT_FAILED");
    }
  };

  const connect = async (connectOptions: ConnectOptions = {}): Promise<WalletConnection> => {
    if (!isBrowser()) {
      throw new WalletError("WALLET_NOT_READY");
    }

    await refreshWallets();

    const current = snapshot();
    const wallet = pickWallet(wallets, connectOptions.wallet);
    const chain = findChain(chains, connectOptions.chain ?? current.chain.id);
    const canUseExtension = wallet.transports.includes("extension") && Boolean(wallet.extension);
    const canUseWalletConnect = wallet.transports.includes("walletconnect");
    const transport =
      connectOptions.transport ??
      (canUseExtension ? "extension" : canUseWalletConnect ? "walletconnect" : null);

    if (!transport) {
      throw new WalletError(wallet.desktop?.extension ? "WALLET_NOT_INSTALLED" : "CONNECT_FAILED");
    }

    if (transport === "extension" && !canUseExtension) {
      throw new WalletError(wallet.desktop?.extension ? "WALLET_NOT_INSTALLED" : "CONNECT_FAILED");
    }

    if (transport === "walletconnect" && !canUseWalletConnect) {
      throw new WalletError("CONNECT_FAILED");
    }

    if (transport === "walletconnect") {
      await prepareQr({
        wallet: wallet.id,
        chain: chain.id,
      });

      if (!pendingQr || pendingQr.walletId !== wallet.id || pendingQr.chainId !== chain.id) {
        throw new WalletError("CONNECT_FAILED");
      }

      return pendingQr.connection;
    }

    connectAttempt += 1;
    const attempt = connectAttempt;
    const prompt = current.prompt;

    $state.set({
      ...current,
      wallets,
      status: "connecting",
      wallet,
      chain,
      signer: undefined,
      transport,
      error: null,
      prompt,
    });

    try {
      const nextClient = await ensureClient();
      const { uri, approval } = await nextClient.connect({
        requiredNamespaces: getRequiredNamespaces(chains),
      });

      if (attempt !== connectAttempt) {
        throw new WalletError("CONNECT_FAILED");
      }

      if (uri) {
        if (transport === "extension" && wallet.extension) {
          pairExtension(wallet.extension, uri);
        }
      }

      const session = await approval();

      if (attempt !== connectAttempt) {
        void nextClient
          .disconnect({
            topic: session.topic,
            reason: {
              code: 6000,
              message: "Connection canceled.",
            },
          })
          .catch(() => {});
        throw new WalletError("CONNECT_FAILED");
      }

      const connection = await applySession(
        session,
        wallet.id,
        transport,
        chain.id,
        wallet.extension?.id,
      );

      await writePersistedSession({
        walletId: wallet.id,
        chainId: connection.chain.id,
        topic: session.topic,
        transport,
        pairingTopic: session.pairingTopic,
        extensionId: wallet.extension?.id,
      });

      clearPendingQr();

      return connection;
    } catch (error) {
      const walletError = asWalletError(error, "CONNECT_FAILED");

      if (attempt !== connectAttempt) {
        throw walletError;
      }

      $state.set({
        ...snapshot(),
        wallets,
        status: "error",
        wallet,
        chain,
        signer: undefined,
        transport: null,
        error: walletError,
        prompt,
      });

      throw walletError;
    }
  };

  const restore = async (): Promise<WalletConnection | null> => {
    if (!isBrowser()) {
      throw new WalletError("WALLET_NOT_READY");
    }

    await refreshWallets();

    const persisted = await readPersistedSession();

    if (!persisted) {
      return null;
    }

    $state.set({
      ...snapshot(),
      wallets,
      status: "restoring",
      transport: persisted.transport,
      error: null,
      prompt: null,
    });

    try {
      const nextClient = await ensureClient();
      const session = findSession(nextClient, persisted.topic);

      if (!session) {
        await writePersistedSession(null);
        resetState();
        return null;
      }

      const connection = await applySession(
        session,
        persisted.walletId,
        persisted.transport,
        persisted.chainId,
        persisted.extensionId,
      );

      await writePersistedSession({
        walletId: persisted.walletId,
        chainId: connection.chain.id,
        topic: session.topic,
        transport: persisted.transport,
        pairingTopic: session.pairingTopic,
        extensionId: persisted.extensionId,
      });

      return connection;
    } catch (error) {
      await writePersistedSession(null);
      resetState(asWalletError(error, "RESTORE_FAILED"));
      return null;
    }
  };

  const disconnect = async (): Promise<void> => {
    if (!isBrowser()) {
      throw new WalletError("WALLET_NOT_READY");
    }

    $state.set({
      ...snapshot(),
      wallets,
      status: "disconnecting",
      error: null,
      prompt: null,
    });

    try {
      if (activeSession && client) {
        await client.disconnect({
          topic: activeSession.session.topic,
          reason: {
            code: 6000,
            message: "User disconnected.",
          },
        });
      }

      await writePersistedSession(null);
      resetState();
    } catch (error) {
      const walletError = asWalletError(error, "DISCONNECT_FAILED");
      $state.set({
        ...snapshot(),
        wallets,
        status: "error",
        error: walletError,
        prompt: null,
      });
      throw walletError;
    }
  };

  const switchChain = async (chainId: string): Promise<void> => {
    const chain = findChain(chains, chainId);
    const current = snapshot();

    if (!current.wallet || !current.account || !activeSession) {
      $state.set({
        ...current,
        wallets,
        chain,
      });
      return;
    }

    const account = current.accounts.find((item) => item.chainId === chain.id);

    if (!account) {
      throw new WalletError("CHAIN_UNSUPPORTED");
    }

    const signer = await createSigner({
      accountId: account.accountId,
      chain,
      topic: activeSession.session.topic,
      extensionId: activeSession.extensionId,
    });

    $state.set({
      ...current,
      wallets,
      chain,
      account,
      signer,
    });

    await writePersistedSession({
      walletId: current.wallet.id,
      chainId: chain.id,
      topic: activeSession.session.topic,
      transport: activeSession.transport,
      pairingTopic: activeSession.session.pairingTopic,
      extensionId: activeSession.extensionId,
    });
  };

  const destroy = async (): Promise<void> => {
    destroyed = true;
    activeSession = null;
    clearPendingQr();
    client = null;
    clientPromise = null;
  };

  const wallet: Wallet = {
    $state,
    snapshot,
    onChange: (listener) =>
      $state.listen(() => {
        listener();
      }),
    prepareQr,
    connect,
    disconnect,
    restore,
    switchChain,
    signer: () => snapshot().signer,
    destroy,
  };

  if (isBrowser()) {
    queueMicrotask(() => {
      void refreshWallets();

      if (autoConnect) {
        void restore().catch(() => undefined);
      }
    });
  }

  return wallet;
}
