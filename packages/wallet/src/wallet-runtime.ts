import { isValidEntityId } from "@hieco/utils";
import type { ProposalTypes, SessionTypes, SignClientTypes } from "@walletconnect/types";
import { hederaTestnet } from "./chains";
import { asWalletError, WalletError } from "./errors";
import { discoverExtensions, pairExtension } from "./extensions";
import type {
  CreateWalletOptions,
  Wallet,
  WalletChain,
  WalletConnection,
  WalletDefinition,
  WalletExtension,
  WalletInfo,
  WalletOption,
  WalletSession,
  WalletSessionKind,
  WalletState,
  WalletStorage,
} from "./types";
import { genericWalletConnectWallet, getDefaultWallets } from "./wallets";
import { createWalletConnectClientManager, findSession } from "./walletconnect-client";

const DEFAULT_STORAGE_KEY = "hieco.wallet.v4";
const HEDERA_METHODS = [
  "hedera_getNodeAddresses",
  "hedera_executeTransaction",
  "hedera_signMessage",
  "hedera_signAndExecuteQuery",
  "hedera_signAndExecuteTransaction",
  "hedera_signTransaction",
] as const;
const HEDERA_EVENTS = ["accountsChanged", "chainChanged"] as const;

interface RuntimeStore<T> {
  readonly get: () => T;
  readonly set: (value: T) => void;
  readonly subscribe: (listener: () => void) => () => void;
}

interface ParsedCaipAccount {
  readonly accountId: string;
  readonly caip10: string;
  readonly chainId: string;
}

interface PersistedSession {
  readonly kind: WalletSessionKind;
  readonly chainId: string;
  readonly topic: string;
  readonly walletId?: string;
  readonly extensionId?: string;
}

interface ActiveSession {
  readonly kind: WalletSessionKind;
  readonly wallet: WalletInfo;
  readonly session: SessionTypes.Struct;
  readonly walletId?: string;
  readonly extensionId?: string;
}

interface WalletRecord {
  readonly definition: WalletDefinition;
  readonly option: WalletOption;
  readonly wallet: WalletInfo;
  readonly extension: WalletExtension | null;
}

interface ConnectionAttempt {
  uri: string | null;
  wallet: WalletRecord | null;
  result: Promise<WalletSession>;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function createStore<T>(initialValue: T): RuntimeStore<T> {
  let value = initialValue;
  const listeners = new Set<() => void>();

  return {
    get: () => value,
    set: (nextValue) => {
      value = nextValue;

      for (const listener of listeners) {
        listener();
      }
    },
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}

function createStorage(): WalletStorage {
  if (!isBrowser()) {
    return {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    };
  }

  return {
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => {
      localStorage.setItem(key, value);
    },
    removeItem: (key) => {
      localStorage.removeItem(key);
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parsePersistedSession(value: string | null): PersistedSession | null {
  if (!value) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (
      !isRecord(parsed) ||
      (parsed.kind !== "qr" && parsed.kind !== "extension") ||
      typeof parsed.chainId !== "string" ||
      typeof parsed.topic !== "string" ||
      (parsed.walletId !== undefined && typeof parsed.walletId !== "string") ||
      (parsed.extensionId !== undefined && typeof parsed.extensionId !== "string")
    ) {
      return null;
    }

    return {
      kind: parsed.kind,
      chainId: parsed.chainId,
      topic: parsed.topic,
      walletId: parsed.walletId,
      extensionId: parsed.extensionId,
    };
  } catch {
    return null;
  }
}

function parseCaipAccount(value: string): ParsedCaipAccount {
  const [namespace, network, accountId] = value.split(":");

  if (namespace !== "hedera" || !network || !accountId || !isValidEntityId(accountId)) {
    throw new WalletError("CONNECT_FAILED");
  }

  return {
    accountId,
    caip10: value,
    chainId: `${namespace}:${network}`,
  };
}

function getOptionalNamespaces(chain: WalletChain): ProposalTypes.OptionalNamespaces {
  return {
    hedera: {
      chains: [chain.id],
      methods: [...HEDERA_METHODS],
      events: [...HEDERA_EVENTS],
    },
  };
}

function toWalletInfo(wallet: WalletDefinition | WalletInfo): WalletInfo {
  return {
    id: wallet.id,
    name: wallet.name,
    icon: wallet.icon,
  };
}

function normalize(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function findInstalledExtension(
  definition: WalletDefinition,
  extensions: readonly WalletExtension[],
): WalletExtension | null {
  const desktopExtension = definition.desktop?.extension;

  if (!desktopExtension) {
    return null;
  }

  const ids = (desktopExtension.ids ?? []).map(normalize);
  const names = [definition.name, ...(desktopExtension.names ?? [])].map(normalize);

  for (const extension of extensions) {
    if (ids.includes(normalize(extension.id)) || names.includes(normalize(extension.name))) {
      return extension;
    }
  }

  return null;
}

function createWalletRecords(
  definitions: readonly WalletDefinition[],
  extensions: readonly WalletExtension[],
  walletConnectEnabled: boolean,
): readonly WalletRecord[] {
  const records: WalletRecord[] = [];

  for (const definition of definitions) {
    if (!definition.transports.includes("extension") || !definition.desktop?.extension) {
      continue;
    }

    const extension = findInstalledExtension(definition, extensions);

    records.push({
      definition,
      wallet: toWalletInfo(definition),
      extension,
      option: {
        ...toWalletInfo(definition),
        availability: extension ? "installed" : "unavailable",
        canConnect: extension !== null && walletConnectEnabled,
        installUrl: definition.desktop.extension.extensionUrl ?? definition.installUrl ?? undefined,
      },
    });
  }

  return [...records].sort((left: WalletRecord, right: WalletRecord) => {
    if (left.option.availability !== right.option.availability) {
      return left.option.availability === "installed" ? -1 : 1;
    }

    return left.option.name.localeCompare(right.option.name);
  });
}

function getSessionWalletInfo(session: SessionTypes.Struct): WalletInfo | null {
  const sessionValue: unknown = session;

  if (!isRecord(sessionValue)) {
    return null;
  }

  const peer = sessionValue.peer;

  if (!isRecord(peer)) {
    return null;
  }

  const metadata = peer.metadata;

  if (!isRecord(metadata)) {
    return null;
  }

  const name = metadata.name;
  const url = metadata.url;
  const icons = metadata.icons;

  if (
    typeof name !== "string" ||
    typeof url !== "string" ||
    !Array.isArray(icons) ||
    typeof icons[0] !== "string"
  ) {
    return null;
  }

  return {
    id: url,
    name,
    icon: icons[0],
  };
}

function getSessionAccount(session: SessionTypes.Struct, chainId: string): ParsedCaipAccount {
  const namespace = session.namespaces.hedera;

  if (!namespace) {
    throw new WalletError("CONNECT_FAILED");
  }

  const account = namespace.accounts.map(parseCaipAccount).find((item) => item.chainId === chainId);

  if (!account) {
    throw new WalletError("CHAIN_UNSUPPORTED");
  }

  return account;
}

function createInitialState(
  chain: WalletChain,
  definitions: readonly WalletDefinition[],
  walletConnectEnabled: boolean,
): WalletState {
  return {
    chain,
    walletConnectEnabled,
    wallets: createWalletRecords(definitions, [], walletConnectEnabled).map(
      (record) => record.option,
    ),
    session: null,
    connection: null,
  };
}

export function createWallet(options: CreateWalletOptions): Wallet {
  const app = options.app;
  const chain = options.chain ?? hederaTestnet();
  const definitions = options.wallets ?? getDefaultWallets();
  const projectId = options.projectId?.trim();
  const walletConnectEnabled = projectId !== undefined && projectId.length > 0;
  const storage = options.storage ?? createStorage();
  const storageKey = options.storageKey ?? DEFAULT_STORAGE_KEY;
  const restoreOnStart = options.restoreOnStart ?? false;

  let signerModulePromise: Promise<typeof import("./signer")> | null = null;
  let walletRecords = createWalletRecords(definitions, [], walletConnectEnabled);
  let connectionAttempt: ConnectionAttempt | null = null;
  let activeSession: ActiveSession | null = null;

  const store = createStore<WalletState>(
    createInitialState(chain, definitions, walletConnectEnabled),
  );

  const setState = (nextState: WalletState): void => {
    store.set(nextState);
  };

  const updateState = (updater: (state: WalletState) => WalletState): void => {
    setState(updater(store.get()));
  };

  const setConnection = (connection: WalletConnection | null): void => {
    updateState((state) => ({
      ...state,
      connection,
    }));
  };

  const setSession = (session: WalletSession | null): void => {
    updateState((state) => ({
      ...state,
      session,
      connection: null,
    }));
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

  const refreshWallets = async (): Promise<void> => {
    if (!isBrowser()) {
      return;
    }

    walletRecords = createWalletRecords(
      definitions,
      await discoverExtensions(),
      walletConnectEnabled,
    );

    updateState((state) => ({
      ...state,
      wallets: walletRecords.map((record) => record.option),
    }));
  };

  const readPersistedSession = async (): Promise<PersistedSession | null> => {
    return parsePersistedSession(await storage.getItem(storageKey));
  };

  const createSigner = async (input: {
    readonly accountId: string;
    readonly topic: string;
    readonly extensionId?: string;
  }): Promise<WalletSession["signer"]> => {
    const client = clientManager.current();

    if (!client) {
      throw new WalletError("SIGNER_UNAVAILABLE");
    }

    if (!signerModulePromise) {
      signerModulePromise = import("./signer");
    }

    const { WalletConnectHederaSigner } = await signerModulePromise;

    return new WalletConnectHederaSigner({
      accountId: input.accountId,
      chain,
      client,
      topic: input.topic,
      extensionId: input.extensionId,
    });
  };

  const clearPendingConnection = (): void => {
    connectionAttempt = null;
    setConnection(null);
  };

  const clearSession = async (): Promise<void> => {
    activeSession = null;
    clearPendingConnection();
    setSession(null);
    await writePersistedSession(null);
  };

  const persistActiveSession = async (session: WalletSession): Promise<void> => {
    if (!activeSession) {
      return;
    }

    await writePersistedSession({
      kind: activeSession.kind,
      chainId: session.chain.id,
      topic: activeSession.session.topic,
      walletId: activeSession.walletId,
      extensionId: activeSession.extensionId,
    });
  };

  const applySession = async (
    session: SessionTypes.Struct,
    details: {
      readonly kind: WalletSessionKind;
      readonly wallet: WalletInfo;
      readonly walletId?: string;
      readonly extensionId?: string;
    },
  ): Promise<WalletSession> => {
    const account = getSessionAccount(session, chain.id);
    const signer = await createSigner({
      accountId: account.accountId,
      topic: session.topic,
      extensionId: details.extensionId,
    });

    const nextSession: WalletSession = {
      kind: details.kind,
      wallet: details.wallet,
      accountId: account.accountId,
      caip10: account.caip10,
      chain,
      signer,
    };

    activeSession = {
      kind: details.kind,
      wallet: details.wallet,
      walletId: details.walletId,
      extensionId: details.extensionId,
      session,
    };

    setSession(nextSession);

    return nextSession;
  };

  const syncActiveSession = async (session: SessionTypes.Struct): Promise<void> => {
    if (!activeSession) {
      return;
    }

    const wallet =
      activeSession.kind === "qr"
        ? (getSessionWalletInfo(session) ?? toWalletInfo(genericWalletConnectWallet()))
        : activeSession.wallet;

    const nextSession = await applySession(session, {
      kind: activeSession.kind,
      wallet,
      walletId: activeSession.walletId,
      extensionId: activeSession.extensionId,
    });

    await persistActiveSession(nextSession);
  };

  const onSessionEvent = async (
    event: SignClientTypes.EventArguments["session_event"],
  ): Promise<void> => {
    if (!activeSession || activeSession.session.topic !== event.topic) {
      return;
    }

    const eventName = event.params.event.name;

    if (eventName !== "accountsChanged" && eventName !== "chainChanged") {
      return;
    }

    const client = clientManager.current();

    if (!client) {
      return;
    }

    const session = findSession(client, event.topic);

    if (!session) {
      await clearSession();
      return;
    }

    await syncActiveSession(session);
  };

  const onSessionUpdate = async (
    event: SignClientTypes.EventArguments["session_update"],
  ): Promise<void> => {
    if (!activeSession || activeSession.session.topic !== event.topic) {
      return;
    }

    const client = clientManager.current();

    if (!client) {
      return;
    }

    const session = findSession(client, event.topic);

    if (!session) {
      await clearSession();
      return;
    }

    await syncActiveSession(session);
  };

  const onSessionDelete = async (
    event: SignClientTypes.EventArguments["session_delete"],
  ): Promise<void> => {
    if (!activeSession || activeSession.session.topic !== event.topic) {
      return;
    }

    await clearSession();
  };

  const clientManager = projectId
    ? createWalletConnectClientManager({
        app,
        projectId,
        handlers: {
          onSessionEvent,
          onSessionUpdate,
          onSessionDelete,
        },
      })
    : {
        ensure: async () => {
          throw new WalletError("WALLET_NOT_READY");
        },
        clear: () => undefined,
        current: () => null,
      };

  const assertCanConnect = (): void => {
    if (!isBrowser() || !walletConnectEnabled) {
      throw new WalletError("WALLET_NOT_READY");
    }
  };

  const findWalletRecord = (walletId: string): WalletRecord => {
    const record = walletRecords.find((item) => item.option.id === walletId);

    if (!record?.extension || record.option.availability !== "installed") {
      throw new WalletError("WALLET_NOT_INSTALLED");
    }

    return record;
  };

  const assertActiveAttempt = (attempt: ConnectionAttempt): ConnectionAttempt => {
    if (!connectionAttempt || connectionAttempt !== attempt) {
      throw new WalletError("CONNECT_FAILED");
    }

    return connectionAttempt;
  };

  const createConnection = (attempt: ConnectionAttempt): WalletConnection => {
    return {
      uri: attempt.uri,
      extensionId: attempt.wallet?.option.id ?? null,
    };
  };

  const startConnection = (wallet: WalletRecord | null): Promise<WalletSession> => {
    const attempt: ConnectionAttempt = {
      uri: null,
      wallet,
      result: new Promise<WalletSession>(() => undefined),
    };

    connectionAttempt = attempt;
    setConnection(createConnection(attempt));

    attempt.result = (async () => {
      try {
        const client = await clientManager.ensure();
        const { uri, approval } = await client.connect({
          optionalNamespaces: getOptionalNamespaces(chain),
        });
        const activeAttempt = assertActiveAttempt(attempt);

        activeAttempt.uri = uri ?? null;
        setConnection(createConnection(activeAttempt));

        if (uri && activeAttempt.wallet?.extension) {
          pairExtension(activeAttempt.wallet.extension, uri);
        }

        const approvedSession = await approval();
        const settledAttempt = assertActiveAttempt(attempt);
        const selectedWallet = settledAttempt.wallet;
        const nextSession = await applySession(
          approvedSession,
          selectedWallet
            ? {
                kind: "extension",
                wallet: selectedWallet.wallet,
                walletId: selectedWallet.wallet.id,
                extensionId: selectedWallet.extension?.id,
              }
            : {
                kind: "qr",
                wallet:
                  getSessionWalletInfo(approvedSession) ??
                  toWalletInfo(genericWalletConnectWallet()),
              },
        );

        clearPendingConnection();
        await persistActiveSession(nextSession);

        return nextSession;
      } catch (error) {
        if (connectionAttempt === attempt) {
          clearPendingConnection();
        }

        throw asWalletError(error, "CONNECT_FAILED");
      }
    })();

    return attempt.result;
  };

  const joinConnection = (wallet: WalletRecord | null): Promise<WalletSession> => {
    if (!connectionAttempt) {
      return startConnection(wallet);
    }

    if (wallet) {
      connectionAttempt.wallet = wallet;
      setConnection(createConnection(connectionAttempt));

      if (connectionAttempt.uri && wallet.extension) {
        pairExtension(wallet.extension, connectionAttempt.uri);
      }
    }

    return connectionAttempt.result;
  };

  const connectQr = async (): Promise<WalletSession> => {
    assertCanConnect();

    const state = store.get();

    if (state.session) {
      return state.session;
    }

    return joinConnection(null);
  };

  const connectExtension = async (walletId: string): Promise<WalletSession> => {
    assertCanConnect();

    const state = store.get();

    if (state.session) {
      return state.session;
    }

    await refreshWallets();

    return joinConnection(findWalletRecord(walletId));
  };

  const cancelConnection = (): void => {
    if (!connectionAttempt || store.get().session) {
      return;
    }

    clearPendingConnection();
  };

  const disconnect = async (): Promise<void> => {
    if (!isBrowser()) {
      throw new WalletError("WALLET_NOT_READY");
    }

    if (!activeSession) {
      await clearSession();
      return;
    }

    try {
      const client = clientManager.current();

      if (client) {
        await client.disconnect({
          topic: activeSession.session.topic,
          reason: {
            code: 6000,
            message: "User disconnected.",
          },
        });
      }

      await clearSession();
    } catch (error) {
      throw asWalletError(error, "DISCONNECT_FAILED");
    }
  };

  const restore = async (): Promise<WalletSession | null> => {
    if (!isBrowser() || !walletConnectEnabled) {
      throw new WalletError("WALLET_NOT_READY");
    }

    const state = store.get();

    if (state.session) {
      return state.session;
    }

    await refreshWallets();

    const persistedSession = await readPersistedSession();

    if (!persistedSession || persistedSession.chainId !== chain.id) {
      if (persistedSession && persistedSession.chainId !== chain.id) {
        await writePersistedSession(null);
      }

      return null;
    }

    try {
      const client = await clientManager.ensure();
      const session = findSession(client, persistedSession.topic);

      if (!session) {
        await writePersistedSession(null);
        return null;
      }

      if (persistedSession.kind === "extension") {
        if (!persistedSession.walletId) {
          await writePersistedSession(null);
          return null;
        }

        const wallet = walletRecords.find(
          (item) =>
            item.option.id === persistedSession.walletId &&
            item.extension &&
            (persistedSession.extensionId === undefined ||
              item.extension.id === persistedSession.extensionId),
        );

        if (!wallet) {
          await writePersistedSession(null);
          return null;
        }

        const nextSession = await applySession(session, {
          kind: "extension",
          wallet: wallet.wallet,
          walletId: wallet.wallet.id,
          extensionId: wallet.extension?.id,
        });

        await persistActiveSession(nextSession);

        return nextSession;
      }

      const nextSession = await applySession(session, {
        kind: "qr",
        wallet: getSessionWalletInfo(session) ?? toWalletInfo(genericWalletConnectWallet()),
      });

      await persistActiveSession(nextSession);

      return nextSession;
    } catch {
      await writePersistedSession(null);
      return null;
    }
  };

  const destroy = async (): Promise<void> => {
    connectionAttempt = null;
    activeSession = null;
    clientManager.clear();
  };

  if (isBrowser()) {
    queueMicrotask(() => {
      void (async () => {
        await refreshWallets();

        if (restoreOnStart && walletConnectEnabled) {
          await restore();
        }
      })().catch(() => undefined);
    });
  }

  return {
    snapshot: store.get,
    subscribe: store.subscribe,
    connectQr,
    connectExtension,
    cancelConnection,
    disconnect,
    restore,
    destroy,
  };
}
