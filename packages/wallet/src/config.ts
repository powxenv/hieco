import { AccountId } from "@hiero-ledger/sdk";
import { createInternalLogger } from "@hieco/utils";
import { atom } from "nanostores";
import SignClient from "@walletconnect/sign-client";
import type { SessionTypes } from "@walletconnect/types";
import { hederaTestnet } from "./chains";
import { asWalletError, createWalletError, type WalletError } from "./errors";
import { resolveManagedProjectId } from "./managed";
import { inferAppMetadata } from "./metadata";
import { isBrowser } from "./platform";
import { createWalletPrompt } from "./prompt";
import { WalletConnectHederaSigner } from "./signer";
import { createStorage } from "./storage";
import type {
  ConnectOptions,
  CreateWalletOptions,
  Wallet,
  WalletAccount,
  WalletChain,
  WalletConnection,
  WalletDefinition,
  WalletOption,
  WalletState,
} from "./types";
import { getDefaultWallets } from "./wallets";

const DEFAULT_STORAGE_KEY = "hieco.wallet.v1";
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
  readonly pairingTopic?: string;
}

function assertBrowserRuntime(): void {
  if (isBrowser()) {
    return;
  }

  throw createWalletError("WALLET_NOT_READY", "Hieco wallet connections run in the browser only.", {
    hint: "Create the runtime anywhere you like, but call connect() and restore() from client-side code.",
  });
}

function toWalletOptions(wallets: readonly WalletDefinition[]): readonly WalletOption[] {
  return wallets.map((wallet) => ({
    ...wallet,
    readyState: isBrowser() ? "loadable" : "unsupported",
  }));
}

function createInitialState(
  chains: readonly WalletChain[],
  wallets: readonly WalletOption[],
  error: WalletError | null = null,
): WalletState {
  const chain = chains[0];

  if (!chain) {
    throw createWalletError(
      "CHAIN_UNSUPPORTED",
      "Add at least one Hedera network before creating a wallet runtime.",
      {
        hint: "Use the default network, or pass chains: [hederaTestnet()] or another Hedera chain.",
      },
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
    error,
    prompt: null,
  };
}

function parseCaipAccount(value: string): WalletAccount {
  const [namespace, network, accountId] = value.split(":");

  if (namespace !== "hedera" || !network || !accountId) {
    throw createWalletError(
      "CONNECT_FAILED",
      "The wallet returned an account in a format this SDK does not understand.",
      {
        hint: "Reconnect the wallet and make sure it exposes a Hedera account.",
      },
    );
  }

  AccountId.fromString(accountId);

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
    throw createWalletError(
      "CHAIN_UNSUPPORTED",
      `The wallet asked for ${chainId}, but this app does not support it.`,
      {
        hint: "Choose one of the configured Hedera chains for this app.",
      },
    );
  }

  return chain;
}

function isPersistedSession(value: unknown): value is PersistedSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const walletId = Reflect.get(value, "walletId");
  const chainId = Reflect.get(value, "chainId");
  const topic = Reflect.get(value, "topic");
  const pairingTopic = Reflect.get(value, "pairingTopic");

  return (
    typeof walletId === "string" &&
    typeof chainId === "string" &&
    typeof topic === "string" &&
    (pairingTopic === undefined || typeof pairingTopic === "string")
  );
}

async function readPersistedSession(
  storage: ReturnType<typeof createStorage>,
  storageKey: string,
  onReadError: (error: unknown) => void,
): Promise<PersistedSession | null> {
  try {
    const value = await storage.getItem(storageKey);

    if (!value) {
      return null;
    }

    const parsed = JSON.parse(value) as unknown;

    if (!isPersistedSession(parsed)) {
      return null;
    }

    return parsed;
  } catch (error) {
    onReadError(error);
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

function pickWallet(wallets: readonly WalletOption[], walletId?: string): WalletOption {
  if (walletId) {
    const wallet = wallets.find((item) => item.id === walletId);

    if (wallet) {
      return wallet;
    }

    throw createWalletError(
      "WALLET_NOT_READY",
      `The wallet "${walletId}" is not available in this runtime.`,
      {
        hint: "Choose one of the wallets returned by useWallets(), or remove the explicit wallet selection.",
      },
    );
  }

  const wallet = wallets[0];

  if (!wallet) {
    throw createWalletError("WALLET_NOT_READY", "No wallet is available to connect right now.", {
      hint: "Use the built-in wallets, or pass wallets when you create the wallet runtime.",
    });
  }

  return wallet;
}

function isAccountEvent(data: unknown): data is string[] {
  return Array.isArray(data) && data.every((value) => typeof value === "string");
}

function isChainEvent(data: unknown): data is string {
  return typeof data === "string";
}

export function createWallet(options: CreateWalletOptions = {}): Wallet {
  const app = inferAppMetadata(options.app);
  const chains = options.chains ?? [hederaTestnet()];
  const wallets = toWalletOptions(options.wallets ?? getDefaultWallets());
  const storage = options.storage ?? createStorage();
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const autoConnect = options.autoConnect ?? true;
  const logger = createInternalLogger("@hieco/wallet");
  const storageLogger = logger.child({ scope: "storage" });
  const sessionLogger = logger.child({ scope: "session" });
  const transportLogger = logger.child({ scope: "walletconnect" });
  const managedLogger = logger.child({ scope: "managed" });
  const $state = atom<WalletState>(createInitialState(chains, wallets));

  let signClientPromise: Promise<SignClient> | null = null;
  let managedProjectIdPromise: Promise<string | null> | null = null;
  let boundClient: SignClient | null = null;
  let activeSession: SessionTypes.Struct | null = null;
  let activeWalletId: string | undefined;
  let destroyed = false;

  const snapshot = (): WalletState => $state.get();

  const setState = (next: WalletState): void => {
    $state.set(next);
  };

  const updateState = (recipe: (current: WalletState) => WalletState): void => {
    setState(recipe(snapshot()));
  };

  const clearSession = (error: WalletError | null = null): void => {
    const current = snapshot();
    activeSession = null;
    activeWalletId = undefined;
    setState({
      ...createInitialState(chains, wallets, error),
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
    } catch (error) {
      storageLogger.warn({ error }, "Couldn't update the saved wallet session.");
    }
  };

  const applySession = (
    session: SessionTypes.Struct,
    walletId: string,
    preferredChainId?: string,
  ): WalletConnection => {
    const namespace = session.namespaces.hedera;

    if (!namespace) {
      throw createWalletError(
        "CONNECT_FAILED",
        "The wallet connected, but it did not grant Hedera access.",
        {
          hint: "Open the wallet again and approve Hedera access for this app.",
        },
      );
    }

    const accounts = namespace.accounts.map(parseCaipAccount);
    const account = accounts.find((item) => item.chainId === preferredChainId) ?? accounts[0];

    if (!account) {
      throw createWalletError(
        "CONNECT_FAILED",
        "The wallet connected, but it did not return a Hedera account.",
        {
          hint: "Choose a Hedera account in the wallet, then try again.",
        },
      );
    }

    const chain = findChain(chains, account.chainId);
    const wallet = pickWallet(wallets, walletId);
    const client = boundClient;

    if (!client) {
      throw createWalletError(
        "SIGNER_UNAVAILABLE",
        "The wallet connected, but signing is not ready yet.",
        {
          hint: "Try again in a moment.",
        },
      );
    }

    const signer = new WalletConnectHederaSigner({
      accountId: account.accountId,
      chain,
      client,
      topic: session.topic,
    });

    activeSession = session;
    activeWalletId = wallet.id;
    setState({
      status: "connected",
      wallets,
      wallet,
      account,
      accounts,
      chain,
      chains,
      signer,
      error: null,
      prompt: null,
    });

    return {
      wallet,
      account,
      accounts,
      chain,
      signer,
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
        isAccountEvent(event.params.event.data)
      ) {
        try {
          const accounts = event.params.event.data.map(parseCaipAccount);
          const current = snapshot();
          const account =
            accounts.find((item) => item.accountId === current.account?.accountId) ??
            accounts[0] ??
            null;

          if (!account || !current.wallet) {
            clearSession();
            return;
          }

          const chain = findChain(chains, account.chainId);
          setState({
            ...current,
            accounts,
            account,
            chain,
            signer: new WalletConnectHederaSigner({
              accountId: account.accountId,
              chain,
              client,
              topic: activeSession.topic,
            }),
          });
          sessionLogger.info(
            { accountId: account.accountId, chainId: chain.id },
            "Wallet accounts changed.",
          );
        } catch (error) {
          clearSession(asWalletError(error, "CONNECT_FAILED"));
        }
      }

      if (event.params.event.name === "chainChanged" && isChainEvent(event.params.event.data)) {
        try {
          const chain = findChain(chains, event.params.event.data);
          const current = snapshot();
          const account =
            current.accounts.find((item) => item.chainId === chain.id) ??
            current.accounts[0] ??
            null;

          if (!account) {
            throw createWalletError(
              "CHAIN_UNSUPPORTED",
              `This wallet session doesn't include ${chain.id}.`,
              {
                hint: "Reconnect with an account on that Hedera network.",
              },
            );
          }

          setState({
            ...current,
            chain,
            account,
            signer: new WalletConnectHederaSigner({
              accountId: account.accountId,
              chain,
              client,
              topic: activeSession.topic,
            }),
          });
          sessionLogger.info({ chainId: chain.id }, "Wallet chain changed.");
        } catch (error) {
          updateState((current) => ({
            ...current,
            status: "error",
            error: asWalletError(error, "CHAIN_UNSUPPORTED"),
            prompt: null,
          }));
        }
      }
    });

    client.on("session_update", (event) => {
      if (!activeSession || event.topic !== activeSession.topic || !activeWalletId) {
        return;
      }

      const session = findSession(client, event.topic);

      if (!session) {
        clearSession();
        return;
      }

      try {
        applySession(session, activeWalletId, snapshot().chain.id);
      } catch (error) {
        clearSession(asWalletError(error, "RESTORE_FAILED"));
      }
    });

    client.on("session_delete", (event) => {
      if (!activeSession || event.topic !== activeSession.topic) {
        return;
      }

      void persistSession(null);
      clearSession();
      sessionLogger.info("Wallet session ended.");
    });

    boundClient = client;
  };

  const resolveProjectId = async (): Promise<string> => {
    if (options.projectId && options.projectId.length > 0) {
      return options.projectId;
    }

    if (!managedProjectIdPromise) {
      managedProjectIdPromise = resolveManagedProjectId();
    }

    const managedProjectId = await managedProjectIdPromise;

    if (managedProjectId) {
      managedLogger.debug("Managed wallet project ID resolved.");
      return managedProjectId;
    }

    throw createWalletError(
      "MANAGED_MODE_UNAVAILABLE",
      "Hieco could not prepare wallet connectivity automatically for this app.",
      {
        hint: "Pass projectId explicitly, or expose a managed project ID through __HIECO_WALLET_PROJECT_ID__, a meta tag, or /.well-known/hieco/wallet/project-id.",
      },
    );
  };

  const ensureClient = async (): Promise<SignClient> => {
    if (destroyed) {
      throw createWalletError(
        "WALLET_NOT_READY",
        "This wallet runtime has already been destroyed.",
        {
          hint: "Create a new wallet runtime before connecting again.",
        },
      );
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
        transportLogger.debug("WalletConnect client ready.");
        return client;
      });

    return signClientPromise;
  };

  const connect = async (options: ConnectOptions = {}): Promise<WalletConnection> => {
    const current = snapshot();
    const wallet = pickWallet(wallets, options.wallet);
    const chain = findChain(chains, options.chain ?? current.chain.id);

    setState({
      ...current,
      status: "connecting",
      wallet,
      chain,
      error: null,
      prompt: null,
    });

    try {
      const client = await ensureClient();
      const persisted = await readPersistedSession(storage, storageKey, (error) => {
        storageLogger.warn({ error }, "Couldn't read the saved wallet session.");
      });
      const pairingTopic =
        persisted?.walletId === wallet.id ? (persisted.pairingTopic ?? persisted.topic) : undefined;
      const { uri, approval } = await client.connect({
        pairingTopic,
        requiredNamespaces: getRequiredNamespaces(chains),
      });

      if (uri) {
        updateState((currentState) => ({
          ...currentState,
          status: "connecting",
          wallet,
          chain,
          error: null,
          prompt: createWalletPrompt(uri, wallet, options.presentation),
        }));
      }

      const session = await approval();
      const connection = applySession(session, wallet.id, chain.id);

      await persistSession({
        walletId: wallet.id,
        chainId: connection.chain.id,
        topic: session.topic,
        pairingTopic: session.pairingTopic,
      });

      sessionLogger.info(
        {
          walletId: wallet.id,
          accountId: connection.account.accountId,
          chainId: connection.chain.id,
        },
        "Wallet connected.",
      );

      return connection;
    } catch (error) {
      const walletError = asWalletError(error, "CONNECT_FAILED");

      updateState((currentState) => ({
        ...currentState,
        status: "error",
        wallet,
        chain,
        error: walletError,
        prompt: null,
      }));

      logger.warn({ error: walletError, walletId: wallet.id }, walletError.message);
      throw walletError;
    }
  };

  const restore = async (): Promise<WalletConnection | null> => {
    assertBrowserRuntime();

    const persisted = await readPersistedSession(storage, storageKey, (error) => {
      storageLogger.warn({ error }, "Couldn't read the saved wallet session.");
    });

    if (!persisted) {
      return null;
    }

    updateState((current) => ({
      ...current,
      status: "restoring",
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

      const connection = applySession(session, persisted.walletId, persisted.chainId);

      await persistSession({
        walletId: persisted.walletId,
        chainId: connection.chain.id,
        topic: session.topic,
        pairingTopic: session.pairingTopic,
      });

      sessionLogger.info(
        {
          walletId: persisted.walletId,
          accountId: connection.account.accountId,
          chainId: connection.chain.id,
        },
        "Wallet session restored.",
      );

      return connection;
    } catch (error) {
      const walletError = asWalletError(error, "RESTORE_FAILED");

      await persistSession(null);
      clearSession(walletError);
      logger.warn({ error: walletError }, walletError.message);
      return null;
    }
  };

  const disconnect = async (): Promise<void> => {
    const current = snapshot();

    setState({
      ...current,
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
      sessionLogger.info("Wallet disconnected.");
    } catch (error) {
      const walletError = asWalletError(error, "DISCONNECT_FAILED");

      updateState((currentState) => ({
        ...currentState,
        status: "error",
        error: walletError,
        prompt: null,
      }));

      logger.warn({ error: walletError }, walletError.message);
      throw walletError;
    }
  };

  const switchChain = async (chainId: string): Promise<void> => {
    const chain = findChain(chains, chainId);
    const current = snapshot();

    if (!current.wallet || !current.account || !activeSession || !boundClient) {
      setState({
        ...current,
        chain,
      });
      return;
    }

    const account = current.accounts.find((item) => item.chainId === chain.id);

    if (!account) {
      throw createWalletError(
        "CHAIN_UNSUPPORTED",
        `This wallet session doesn't include ${chain.id}.`,
        {
          hint: "Reconnect with an account on the target Hedera network.",
        },
      );
    }

    setState({
      ...current,
      chain,
      account,
      signer: new WalletConnectHederaSigner({
        accountId: account.accountId,
        chain,
        client: boundClient,
        topic: activeSession.topic,
      }),
    });

    await persistSession({
      walletId: current.wallet.id,
      chainId: chain.id,
      topic: activeSession.topic,
      pairingTopic: activeSession.pairingTopic,
    });

    sessionLogger.info({ chainId: chain.id }, "Wallet chain switched.");
  };

  const destroy = async (): Promise<void> => {
    destroyed = true;
    activeSession = null;
    activeWalletId = undefined;
    boundClient = null;
    signClientPromise = null;
    managedProjectIdPromise = null;
    logger.debug("Wallet runtime destroyed.");
  };

  const wallet: Wallet = {
    $state,
    snapshot,
    onChange: (listener) =>
      $state.listen(() => {
        listener();
      }),
    connect,
    disconnect,
    restore,
    switchChain,
    signer: () => snapshot().signer,
    destroy,
  };

  if (autoConnect && isBrowser()) {
    queueMicrotask(() => {
      void restore().catch(() => undefined);
    });
  }

  logger.debug(
    {
      chains: chains.map((chain) => chain.id),
      wallets: wallets.map((walletOption) => walletOption.id),
      autoConnect,
      mode: options.projectId ? "project" : "managed",
    },
    "Wallet runtime ready.",
  );

  return wallet;
}
