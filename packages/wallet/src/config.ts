import { isValidEntityId } from "@hieco/utils";
import { atom } from "nanostores";
import SignClient from "@walletconnect/sign-client";
import type { SessionTypes } from "@walletconnect/types";
import { hederaTestnet } from "./chains.ts";
import { asWalletError, WalletError } from "./errors.ts";
import { discoverExtensions, pairExtension } from "./extensions.ts";
import { isBrowser } from "./platform.ts";
import { createWalletPrompt, planConnection, resolveWalletOptions } from "./planner.ts";
import { createStorage } from "./storage.ts";
import type {
  ConnectOptions,
  CreateWalletOptions,
  Wallet,
  WalletAccount,
  WalletChain,
  WalletConnection,
  WalletOption,
  WalletState,
  WalletTransportId,
} from "./types.ts";
import { getDefaultWallets } from "./wallets.ts";

const DEFAULT_STORAGE_KEY = "hieco.wallet.v1";
const EXTENSION_APPROVAL_TIMEOUT_MS = 20000;
const HEDERA_EVENTS = ["accountsChanged", "chainChanged"] as const;
const HEDERA_METHODS = [
  "hedera_getNodeAddresses",
  "hedera_executeTransaction",
  "hedera_signMessage",
  "hedera_signAndExecuteQuery",
  "hedera_signAndExecuteTransaction",
  "hedera_signTransaction",
] as const;

interface PersistedSession {
  readonly walletId: string;
  readonly chainId: string;
  readonly topic: string;
  readonly transport: WalletTransportId;
  readonly pairingTopic?: string;
  readonly extensionId?: string;
}

function assertBrowserRuntime(): void {
  if (isBrowser()) {
    return;
  }

  throw new WalletError("WALLET_NOT_READY", "Hieco wallet connections run in the browser only.");
}

function createInitialState(
  chains: readonly WalletChain[],
  wallets: readonly WalletOption[],
  error: WalletError | null = null,
): WalletState {
  const chain = chains[0];

  if (!chain) {
    throw new WalletError(
      "CHAIN_UNSUPPORTED",
      "Add at least one Hedera network before creating a wallet runtime.",
    );
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
    throw new WalletError(
      "CONNECT_FAILED",
      "The wallet returned an account in a format this SDK does not understand.",
    );
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
    throw new WalletError(
      "CHAIN_UNSUPPORTED",
      `The wallet asked for ${chainId}, but this app does not support it.`,
    );
  }

  return chain;
}

async function readPersistedSession(
  storage: ReturnType<typeof createStorage>,
  storageKey: string,
): Promise<PersistedSession | null> {
  try {
    const value = await storage.getItem(storageKey);

    if (!value) {
      return null;
    }

    const parsed = JSON.parse(value);

    if (typeof parsed !== "object" || !parsed) {
      return null;
    }

    const walletId = Reflect.get(parsed, "walletId");
    const chainId = Reflect.get(parsed, "chainId");
    const topic = Reflect.get(parsed, "topic");
    const transport = Reflect.get(parsed, "transport");
    const pairingTopic = Reflect.get(parsed, "pairingTopic");
    const extensionId = Reflect.get(parsed, "extensionId");

    if (
      typeof walletId !== "string" ||
      typeof chainId !== "string" ||
      typeof topic !== "string" ||
      (transport !== "extension" && transport !== "walletconnect") ||
      (pairingTopic !== undefined && typeof pairingTopic !== "string") ||
      (extensionId !== undefined && typeof extensionId !== "string")
    ) {
      return null;
    }

    return {
      walletId,
      chainId,
      topic,
      transport,
      pairingTopic,
      extensionId,
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

function findSession(signClient: SignClient, topic: string): SessionTypes.Struct | null {
  return signClient.session.getAll().find((session) => session.topic === topic) ?? null;
}

function disconnectQuietly(client: SignClient, topic: string): void {
  void client
    .disconnect({
      topic,
      reason: {
        code: 6000,
        message: "Connection canceled.",
      },
    })
    .catch(() => {});
}

function pickWallet(wallets: readonly WalletOption[], walletId?: string): WalletOption {
  if (walletId) {
    const wallet = wallets.find((item) => item.id === walletId);

    if (wallet) {
      return wallet;
    }

    throw new WalletError(
      "WALLET_NOT_READY",
      `The wallet "${walletId}" is not available in this runtime.`,
    );
  }

  const wallet = wallets[0];

  if (!wallet) {
    throw new WalletError("WALLET_NOT_READY", "No wallet is available to connect right now.");
  }

  return wallet;
}

export function createWallet(options: CreateWalletOptions): Wallet {
  const app = options.app;
  const chains = options.chains ?? [hederaTestnet()];
  const walletDefinitions = options.wallets ?? getDefaultWallets();
  const storage = options.storage ?? createStorage();
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const autoConnect = options.autoConnect ?? true;

  let discoveredExtensions: readonly import("./types.ts").WalletExtension[] = [];
  let walletOptions = resolveWalletOptions(walletDefinitions, discoveredExtensions);

  const $state = atom<WalletState>(createInitialState(chains, walletOptions));

  let signClientPromise: Promise<SignClient> | null = null;
  let walletSignerModulePromise: Promise<typeof import("./signer.ts")> | null = null;
  let extensionDiscoveryPromise: Promise<readonly WalletOption[]> | null = null;
  let boundClient: SignClient | null = null;
  let activeSession: SessionTypes.Struct | null = null;
  let activeWalletId: string | undefined;
  let activeTransport: WalletTransportId | null = null;
  let activeExtensionId: string | undefined;
  let activeConnectAttempt = 0;
  let destroyed = false;

  const snapshot = (): WalletState => $state.get();

  const currentWallets = (): readonly WalletOption[] => walletOptions;

  const setState = (next: WalletState): void => {
    $state.set(next);
  };

  const updateState = (recipe: (current: WalletState) => WalletState): void => {
    setState(recipe(snapshot()));
  };

  const syncWalletOptions = (
    nextExtensions: readonly import("./types.ts").WalletExtension[],
  ): void => {
    discoveredExtensions = nextExtensions;
    walletOptions = resolveWalletOptions(walletDefinitions, discoveredExtensions);

    updateState((current) => {
      const wallet = current.wallet
        ? (walletOptions.find((item) => item.id === current.wallet?.id) ?? current.wallet)
        : null;
      const currentPrompt = current.prompt;
      const prompt = currentPrompt
        ? {
            ...currentPrompt,
            wallet:
              walletOptions.find((item) => item.id === currentPrompt.wallet.id) ??
              currentPrompt.wallet,
          }
        : null;

      return {
        ...current,
        wallets: walletOptions,
        wallet,
        prompt,
      };
    });
  };

  const refreshWalletOptions = async (): Promise<readonly WalletOption[]> => {
    if (!isBrowser()) {
      return currentWallets();
    }

    if (extensionDiscoveryPromise) {
      return extensionDiscoveryPromise;
    }

    extensionDiscoveryPromise = discoverExtensions()
      .then((extensions) => {
        syncWalletOptions(extensions);
        return currentWallets();
      })
      .finally(() => {
        extensionDiscoveryPromise = null;
      });

    return extensionDiscoveryPromise;
  };

  const createSigner = async (input: {
    readonly accountId: string;
    readonly chain: WalletChain;
    readonly client: SignClient;
    readonly topic: string;
    readonly extensionId?: string;
  }): Promise<WalletConnection["signer"]> => {
    if (!walletSignerModulePromise) {
      walletSignerModulePromise = import("./signer.ts");
    }

    const { WalletConnectHederaSigner } = await walletSignerModulePromise;

    return new WalletConnectHederaSigner(input);
  };

  const clearSession = (error: WalletError | null = null): void => {
    const current = snapshot();
    activeSession = null;
    activeWalletId = undefined;
    activeTransport = null;
    activeExtensionId = undefined;
    setState({
      ...createInitialState(chains, currentWallets(), error),
      chain: current.chain,
    });
  };

  const cancel = (): void => {
    const current = snapshot();

    if (current.status === "connected" || current.status === "disconnecting") {
      return;
    }

    activeConnectAttempt += 1;
    activeSession = null;
    activeWalletId = undefined;
    activeTransport = null;
    activeExtensionId = undefined;

    setState({
      ...createInitialState(chains, currentWallets(), null),
      chain: current.chain,
    });
  };

  const persistSession = async (session: PersistedSession | null): Promise<void> => {
    try {
      if (!session) {
        await storage.removeItem(storageKey);
        return;
      }

      await storage.setItem(storageKey, JSON.stringify(session));
    } catch {}
  };

  const applySession = async (
    session: SessionTypes.Struct,
    input: {
      readonly walletId: string;
      readonly preferredChainId?: string;
      readonly transport: WalletTransportId;
      readonly extensionId?: string;
    },
  ): Promise<WalletConnection> => {
    const namespace = session.namespaces.hedera;

    if (!namespace) {
      throw new WalletError(
        "CONNECT_FAILED",
        "The wallet connected, but it did not grant Hedera access.",
      );
    }

    const accounts = namespace.accounts.map(parseCaipAccount);
    const account = accounts.find((item) => item.chainId === input.preferredChainId) ?? accounts[0];

    if (!account) {
      throw new WalletError(
        "CONNECT_FAILED",
        "The wallet connected, but it did not return a Hedera account.",
      );
    }

    const chain = findChain(chains, account.chainId);
    const wallet = pickWallet(currentWallets(), input.walletId);
    const client = boundClient;

    if (!client) {
      throw new WalletError(
        "SIGNER_UNAVAILABLE",
        "The wallet connected, but signing is not ready yet.",
      );
    }

    const signer = await createSigner({
      accountId: account.accountId,
      chain,
      client,
      topic: session.topic,
      extensionId: input.extensionId,
    });

    activeSession = session;
    activeWalletId = wallet.id;
    activeTransport = input.transport;
    activeExtensionId = input.extensionId;

    setState({
      status: "connected",
      wallets: currentWallets(),
      wallet,
      account,
      accounts,
      chain,
      chains,
      signer,
      transport: input.transport,
      error: null,
      prompt: null,
    });

    return {
      wallet,
      account,
      accounts,
      chain,
      signer,
      transport: input.transport,
      extensionId: input.extensionId,
      topic: session.topic,
    };
  };

  const bindEvents = (client: SignClient): void => {
    if (boundClient === client) {
      return;
    }

    client.on("session_event", (event) => {
      if (!activeSession || event.topic !== activeSession.topic) {
        return;
      }

      if (
        event.params.event.name === "accountsChanged" &&
        Array.isArray(event.params.event.data) &&
        event.params.event.data.every((value) => typeof value === "string")
      ) {
        const nextAccountIds = event.params.event.data;

        void (async () => {
          try {
            const accounts: readonly WalletAccount[] = nextAccountIds.map(parseCaipAccount);
            const current = snapshot();
            const account =
              accounts.find((item) => item.accountId === current.account?.accountId) ??
              accounts[0] ??
              null;

            if (!account || !current.wallet || !activeTransport) {
              clearSession();
              return;
            }

            const chain = findChain(chains, account.chainId);
            setState({
              ...current,
              wallets: currentWallets(),
              accounts,
              account,
              chain,
              signer: await createSigner({
                accountId: account.accountId,
                chain,
                client,
                topic: activeSession.topic,
                extensionId: activeExtensionId,
              }),
            });
          } catch (error) {
            clearSession(asWalletError(error, "CONNECT_FAILED"));
          }
        })();
      }

      if (
        event.params.event.name === "chainChanged" &&
        typeof event.params.event.data === "string"
      ) {
        const nextChainId = event.params.event.data;

        void (async () => {
          try {
            const chain = findChain(chains, nextChainId);
            const current = snapshot();
            const account =
              current.accounts.find((item) => item.chainId === chain.id) ??
              current.accounts[0] ??
              null;

            if (!account) {
              throw new WalletError(
                "CHAIN_UNSUPPORTED",
                `This wallet session doesn't include ${chain.id}.`,
              );
            }

            setState({
              ...current,
              wallets: currentWallets(),
              chain,
              account,
              signer: await createSigner({
                accountId: account.accountId,
                chain,
                client,
                topic: activeSession.topic,
                extensionId: activeExtensionId,
              }),
            });
          } catch (error) {
            updateState((current) => ({
              ...current,
              wallets: currentWallets(),
              status: "error",
              error: asWalletError(error, "CHAIN_UNSUPPORTED"),
              prompt: null,
            }));
          }
        })();
      }
    });

    client.on("session_update", (event) => {
      if (
        !activeSession ||
        event.topic !== activeSession.topic ||
        !activeWalletId ||
        !activeTransport
      ) {
        return;
      }

      const session = findSession(client, event.topic);

      if (!session) {
        clearSession();
        return;
      }

      void applySession(session, {
        walletId: activeWalletId,
        preferredChainId: snapshot().chain.id,
        transport: activeTransport,
        extensionId: activeExtensionId,
      }).catch((error) => {
        clearSession(asWalletError(error, "RESTORE_FAILED"));
      });
    });

    client.on("session_delete", (event) => {
      if (!activeSession || event.topic !== activeSession.topic) {
        return;
      }

      void persistSession(null);
      clearSession();
    });

    boundClient = client;
  };

  const resolveProjectId = async (): Promise<string> => {
    if (options.projectId && options.projectId.length > 0) {
      return options.projectId;
    }

    throw new WalletError(
      "WALLET_NOT_READY",
      "WalletConnect needs a projectId before this wallet can connect.",
    );
  };

  const ensureClient = async (): Promise<SignClient> => {
    if (destroyed) {
      throw new WalletError("WALLET_NOT_READY", "This wallet runtime has already been destroyed.");
    }

    assertBrowserRuntime();

    if (signClientPromise) {
      return signClientPromise;
    }

    signClientPromise = resolveProjectId()
      .then((projectId) =>
        SignClient.init({
          projectId,
          metadata: {
            ...app,
            icons: [...app.icons],
          },
        }),
      )
      .then((client) => {
        bindEvents(client);
        return client;
      });

    return signClientPromise;
  };

  const connect = async (connectOptions: ConnectOptions = {}): Promise<WalletConnection> => {
    assertBrowserRuntime();
    await refreshWalletOptions();

    const current = snapshot();
    const attempt = activeConnectAttempt + 1;
    activeConnectAttempt = attempt;
    const wallet = pickWallet(currentWallets(), connectOptions.wallet);
    const chain = findChain(chains, connectOptions.chain ?? current.chain.id);
    const plan = planConnection({
      wallet,
      chain,
      options: connectOptions,
    });

    setState({
      ...current,
      wallets: currentWallets(),
      status: "connecting",
      wallet,
      chain,
      signer: undefined,
      transport: plan.transport,
      error: null,
      prompt: null,
    });

    try {
      const client = await ensureClient();
      const persisted = await readPersistedSession(storage, storageKey);
      const pairingTopic =
        persisted?.walletId === wallet.id ? (persisted.pairingTopic ?? persisted.topic) : undefined;
      const { uri, approval } = await client.connect({
        pairingTopic,
        requiredNamespaces: getRequiredNamespaces(chains),
      });

      if (attempt !== activeConnectAttempt) {
        throw new WalletError("CONNECT_FAILED", "This wallet request was canceled.");
      }

      if (uri) {
        if (plan.transport === "extension" && plan.extension) {
          pairExtension(plan.extension, uri);
        }

        const promptMode = plan.promptMode;

        if (promptMode) {
          updateState((currentState) => ({
            ...currentState,
            wallets: currentWallets(),
            status: "connecting",
            wallet,
            chain,
            transport: plan.transport,
            error: null,
            prompt: createWalletPrompt({
              uri,
              wallet,
              mode: promptMode,
              returnHref: app.redirect?.universal ?? app.redirect?.native,
            }),
          }));
        }
      }

      const session =
        plan.transport === "extension"
          ? await new Promise<SessionTypes.Struct>((resolve, reject) => {
              let settled = false;
              const timeout = window.setTimeout(() => {
                if (settled) {
                  return;
                }

                settled = true;
                reject(
                  new WalletError("CONNECT_FAILED", `${wallet.name} did not respond in time.`),
                );
              }, EXTENSION_APPROVAL_TIMEOUT_MS);

              void approval()
                .then((nextSession) => {
                  if (settled) {
                    disconnectQuietly(client, nextSession.topic);
                    return;
                  }

                  settled = true;
                  window.clearTimeout(timeout);
                  resolve(nextSession);
                })
                .catch((error) => {
                  if (settled) {
                    return;
                  }

                  settled = true;
                  window.clearTimeout(timeout);
                  reject(error);
                });
            })
          : await approval();

      if (attempt !== activeConnectAttempt) {
        disconnectQuietly(client, session.topic);

        throw new WalletError("CONNECT_FAILED", "This wallet request was canceled.");
      }

      const connection = await applySession(session, {
        walletId: wallet.id,
        preferredChainId: chain.id,
        transport: plan.transport,
        extensionId: plan.extension?.id,
      });

      await persistSession({
        walletId: wallet.id,
        chainId: connection.chain.id,
        topic: session.topic,
        transport: connection.transport,
        pairingTopic: session.pairingTopic,
        extensionId: connection.extensionId,
      });

      return connection;
    } catch (error) {
      const walletError = asWalletError(error, "CONNECT_FAILED");

      if (attempt !== activeConnectAttempt) {
        return Promise.reject(walletError);
      }

      updateState((currentState) => ({
        ...currentState,
        wallets: currentWallets(),
        status: "error",
        wallet,
        chain,
        transport: null,
        error: walletError,
        prompt: null,
      }));
      throw walletError;
    }
  };

  const restore = async (): Promise<WalletConnection | null> => {
    assertBrowserRuntime();
    await refreshWalletOptions();

    const persisted = await readPersistedSession(storage, storageKey);

    if (!persisted) {
      return null;
    }

    updateState((current) => ({
      ...current,
      wallets: currentWallets(),
      status: "restoring",
      transport: persisted.transport,
      error: null,
      prompt: null,
    }));

    try {
      const client = await ensureClient();
      const session = findSession(client, persisted.topic);

      if (!session) {
        await persistSession(null);
        clearSession();
        return null;
      }

      const connection = await applySession(session, {
        walletId: persisted.walletId,
        preferredChainId: persisted.chainId,
        transport: persisted.transport,
        extensionId: persisted.extensionId,
      });

      await persistSession({
        walletId: persisted.walletId,
        chainId: connection.chain.id,
        topic: session.topic,
        transport: connection.transport,
        pairingTopic: session.pairingTopic,
        extensionId: connection.extensionId,
      });

      return connection;
    } catch (error) {
      const walletError = asWalletError(error, "RESTORE_FAILED");

      await persistSession(null);
      clearSession(walletError);
      return null;
    }
  };

  const disconnect = async (): Promise<void> => {
    assertBrowserRuntime();

    const current = snapshot();

    setState({
      ...current,
      wallets: currentWallets(),
      status: "disconnecting",
      error: null,
      prompt: null,
    });

    try {
      if (activeSession && boundClient) {
        await boundClient.disconnect({
          topic: activeSession.topic,
          reason: {
            code: 6000,
            message: "User disconnected.",
          },
        });
      }

      await persistSession(null);
      clearSession();
    } catch (error) {
      const walletError = asWalletError(error, "DISCONNECT_FAILED");

      updateState((currentState) => ({
        ...currentState,
        wallets: currentWallets(),
        status: "error",
        error: walletError,
        prompt: null,
      }));
      throw walletError;
    }
  };

  const switchChain = async (chainId: string): Promise<void> => {
    const chain = findChain(chains, chainId);
    const current = snapshot();

    if (!current.wallet || !current.account || !activeSession || !boundClient) {
      setState({
        ...current,
        wallets: currentWallets(),
        chain,
      });
      return;
    }

    const account = current.accounts.find((item) => item.chainId === chain.id);

    if (!account) {
      throw new WalletError(
        "CHAIN_UNSUPPORTED",
        `This wallet session doesn't include ${chain.id}.`,
      );
    }

    const signer = await createSigner({
      accountId: account.accountId,
      chain,
      client: boundClient,
      topic: activeSession.topic,
      extensionId: activeExtensionId,
    });

    setState({
      ...current,
      wallets: currentWallets(),
      chain,
      account,
      signer,
    });

    await persistSession({
      walletId: current.wallet.id,
      chainId: chain.id,
      topic: activeSession.topic,
      transport: current.transport ?? activeTransport ?? "walletconnect",
      pairingTopic: activeSession.pairingTopic,
      extensionId: activeExtensionId,
    });
  };

  const destroy = async (): Promise<void> => {
    destroyed = true;
    activeSession = null;
    activeWalletId = undefined;
    activeTransport = null;
    activeExtensionId = undefined;
    boundClient = null;
    signClientPromise = null;
    extensionDiscoveryPromise = null;
  };

  const wallet: Wallet = {
    $state,
    snapshot,
    onChange: (listener) =>
      $state.listen(() => {
        listener();
      }),
    connect,
    cancel,
    disconnect,
    restore,
    switchChain,
    signer: () => snapshot().signer,
    destroy,
  };

  if (isBrowser()) {
    queueMicrotask(() => {
      void refreshWalletOptions();

      if (autoConnect) {
        void restore().catch(() => undefined);
      }
    });
  }

  return wallet;
}
