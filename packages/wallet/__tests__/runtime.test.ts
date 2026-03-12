import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { WalletState } from "../src";

const originalWindow = Reflect.get(globalThis, "window");
const originalDocument = Reflect.get(globalThis, "document");
const originalNavigator = Reflect.get(globalThis, "navigator");
const TEST_APP = {
  name: "Wallet Test App",
  description: "Wallet test app",
  url: "https://example.com",
  icons: ["https://example.com/icon.png"],
} as const;

function restoreGlobals(): void {
  if (originalWindow === undefined) {
    Reflect.deleteProperty(globalThis, "window");
  } else {
    Reflect.set(globalThis, "window", originalWindow);
  }

  if (originalDocument === undefined) {
    Reflect.deleteProperty(globalThis, "document");
  } else {
    Reflect.set(globalThis, "document", originalDocument);
  }

  if (originalNavigator === undefined) {
    Reflect.deleteProperty(globalThis, "navigator");
  } else {
    Reflect.set(globalThis, "navigator", originalNavigator);
  }
}

function setBrowserEnvironment(): void {
  Object.defineProperty(globalThis, "window", {
    value: {
      location: {
        origin: "https://example.com",
        href: "https://example.com/wallet",
      },
      parent: undefined,
      postMessage: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      setTimeout,
      clearTimeout,
    },
    configurable: true,
    writable: true,
  });

  Reflect.set(globalThis.window, "parent", globalThis.window);

  Object.defineProperty(globalThis, "document", {
    value: {
      title: "Wallet Test App",
      querySelector: () => null,
      querySelectorAll: () => [],
      visibilityState: "visible",
    },
    configurable: true,
    writable: true,
  });

  Object.defineProperty(globalThis, "navigator", {
    value: {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
    configurable: true,
    writable: true,
  });
}

function createMemoryStorage(initialValue?: string) {
  let value = initialValue ?? null;

  return {
    getItem: () => value,
    setItem: (_key: string, nextValue: string) => {
      value = nextValue;
    },
    removeItem: () => {
      value = null;
    },
    read: () => value,
  };
}

function createMockSession() {
  return {
    topic: "session-topic",
    pairingTopic: "pairing-topic",
    namespaces: {
      hedera: {
        accounts: ["hedera:testnet:0.0.123"],
      },
    },
    peer: {
      metadata: {
        name: "HashPack Mobile",
        url: "https://wallet.example",
        icons: ["https://wallet.example/icon.png"],
      },
    },
  };
}

function flushMicrotasks(): Promise<void> {
  return Promise.resolve().then(() => undefined);
}

async function waitFor(predicate: () => boolean, attempts = 20): Promise<void> {
  for (let index = 0; index < attempts; index += 1) {
    if (predicate()) {
      return;
    }

    await flushMicrotasks();
  }

  throw new Error("Timed out waiting for wallet state.");
}

beforeEach(() => {
  setBrowserEnvironment();
});

afterEach(() => {
  mock.restore();
  restoreGlobals();
});

describe("wallet runtime", () => {
  test("wallet selectors split installed and unavailable wallets", async () => {
    const { getConnectableWallets, getUnavailableWallets } = await import("../src");

    const state: Pick<WalletState, "wallets"> = {
      wallets: [
        {
          id: "hashpack",
          name: "HashPack",
          icon: "https://example.com/hashpack.png",
          availability: "installed",
          canConnect: true,
        },
        {
          id: "kabila",
          name: "Kabila",
          icon: "https://example.com/kabila.png",
          availability: "unavailable",
          canConnect: false,
          installUrl: "https://example.com/install",
        },
      ],
    };

    expect(getConnectableWallets(state)).toEqual([state.wallets[0]!]);
    expect(getUnavailableWallets(state)).toEqual([state.wallets[1]!]);
  });

  test("connectQr creates one shared connection and clears it after approval", async () => {
    const session = createMockSession();
    let resolveApproval!: (value: typeof session) => void;
    const approval = new Promise<typeof session>((resolve) => {
      resolveApproval = resolve;
    });
    const handlers = new Map<string, (payload: unknown) => void>();
    const client = {
      on: mock((event: string, handler: (payload: unknown) => void) => {
        handlers.set(event, handler);
      }),
      connect: mock(async () => ({
        uri: "wc:test-uri",
        approval: () => approval,
      })),
      disconnect: mock(async () => undefined),
      session: {
        getAll: () => [session],
      },
    };

    mock.module("@walletconnect/sign-client", () => ({
      default: {
        init: mock(async () => client),
      },
    }));

    mock.module("../src/extensions.ts", () => ({
      discoverExtensions: mock(async () => []),
      pairExtension: mock(() => undefined),
      openExtension: mock(() => undefined),
    }));

    mock.module("../src/signer.ts", () => ({
      WalletConnectHederaSigner: class MockSigner {},
    }));

    const { createWallet } = await import("../src");
    const storage = createMemoryStorage();
    const wallet = createWallet({
      app: TEST_APP,
      projectId: "project-id",
      storage,
    });

    const pendingSession = wallet.connectQr();
    await waitFor(() => wallet.snapshot().connection?.uri === "wc:test-uri");

    expect(wallet.snapshot()).toEqual(
      expect.objectContaining({
        connection: {
          uri: "wc:test-uri",
          extensionId: null,
        },
      }),
    );
    expect(client.connect).toHaveBeenCalledTimes(1);

    resolveApproval(session);

    const connected = await pendingSession;

    expect(connected).toEqual(
      expect.objectContaining({
        kind: "qr",
        accountId: "0.0.123",
      }),
    );
    expect(wallet.snapshot()).toEqual(
      expect.objectContaining({
        connection: null,
        session: expect.objectContaining({
          kind: "qr",
          accountId: "0.0.123",
        }),
      }),
    );
    expect(storage.read()).toContain('"kind":"qr"');

    handlers.get("session_delete")?.({
      topic: "session-topic",
    });

    await waitFor(() => wallet.snapshot().session === null);

    expect(wallet.snapshot()).toEqual(
      expect.objectContaining({
        connection: null,
        session: null,
      }),
    );
  });

  test("cancelConnection clears the pending attempt", async () => {
    const session = createMockSession();
    let resolveApproval!: (value: typeof session) => void;
    const approval = new Promise<typeof session>((resolve) => {
      resolveApproval = resolve;
    });
    const client = {
      on: mock(() => undefined),
      connect: mock(async () => ({
        uri: "wc:test-uri",
        approval: () => approval,
      })),
      disconnect: mock(async () => undefined),
      session: {
        getAll: () => [],
      },
    };

    mock.module("@walletconnect/sign-client", () => ({
      default: {
        init: mock(async () => client),
      },
    }));

    mock.module("../src/extensions.ts", () => ({
      discoverExtensions: mock(async () => []),
      pairExtension: mock(() => undefined),
      openExtension: mock(() => undefined),
    }));

    mock.module("../src/signer.ts", () => ({
      WalletConnectHederaSigner: class MockSigner {},
    }));

    const { createWallet } = await import("../src");
    const wallet = createWallet({
      app: TEST_APP,
      projectId: "project-id",
    });

    const pendingSession = wallet.connectQr();
    await waitFor(() => wallet.snapshot().connection?.uri === "wc:test-uri");

    wallet.cancelConnection();

    expect(wallet.snapshot()).toEqual(
      expect.objectContaining({
        connection: null,
        session: null,
      }),
    );

    resolveApproval(session);

    await expect(pendingSession).rejects.toMatchObject({
      code: "CONNECT_FAILED",
    });
  });

  test("qr then extension reuses the same shared attempt", async () => {
    const session = createMockSession();
    let resolveApproval!: (value: typeof session) => void;
    const approval = new Promise<typeof session>((resolve) => {
      resolveApproval = resolve;
    });
    const pairExtension = mock(() => undefined);
    const client = {
      on: mock(() => undefined),
      connect: mock(async () => ({
        uri: "wc:test-uri",
        approval: () => approval,
      })),
      disconnect: mock(async () => undefined),
      session: {
        getAll: () => [session],
      },
    };

    mock.module("@walletconnect/sign-client", () => ({
      default: {
        init: mock(async () => client),
      },
    }));

    mock.module("../src/extensions.ts", () => ({
      discoverExtensions: mock(async () => [
        {
          id: "hashpack",
          name: "HashPack",
          icon: "https://example.com/icon.png",
          url: "https://example.com",
          availableInIframe: false,
        },
      ]),
      pairExtension,
      openExtension: mock(() => undefined),
    }));

    mock.module("../src/signer.ts", () => ({
      WalletConnectHederaSigner: class MockSigner {},
    }));

    const { createWallet } = await import("../src");
    const { hashpack } = await import("../src/wallets");
    const wallet = createWallet({
      app: TEST_APP,
      projectId: "project-id",
      wallets: [hashpack()],
    });

    const qrSession = wallet.connectQr();
    await waitFor(() => wallet.snapshot().connection?.uri === "wc:test-uri");

    const extensionSession = wallet.connectExtension("hashpack");
    await waitFor(() => wallet.snapshot().connection?.extensionId === "hashpack");

    expect(client.connect).toHaveBeenCalledTimes(1);
    expect(pairExtension).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "hashpack",
      }),
      "wc:test-uri",
    );

    resolveApproval(session);

    const [qrConnected, extensionConnected] = await Promise.all([qrSession, extensionSession]);

    expect(qrConnected.accountId).toBe("0.0.123");
    expect(extensionConnected.kind).toBe("extension");
    expect(wallet.snapshot().session?.kind).toBe("extension");
  });

  test("extension then qr reuses the same shared attempt", async () => {
    const session = createMockSession();
    let resolveApproval!: (value: typeof session) => void;
    const approval = new Promise<typeof session>((resolve) => {
      resolveApproval = resolve;
    });
    const pairExtension = mock(() => undefined);
    const client = {
      on: mock(() => undefined),
      connect: mock(async () => ({
        uri: "wc:test-uri",
        approval: () => approval,
      })),
      disconnect: mock(async () => undefined),
      session: {
        getAll: () => [session],
      },
    };

    mock.module("@walletconnect/sign-client", () => ({
      default: {
        init: mock(async () => client),
      },
    }));

    mock.module("../src/extensions.ts", () => ({
      discoverExtensions: mock(async () => [
        {
          id: "hashpack",
          name: "HashPack",
          icon: "https://example.com/icon.png",
          url: "https://example.com",
          availableInIframe: false,
        },
      ]),
      pairExtension,
      openExtension: mock(() => undefined),
    }));

    mock.module("../src/signer.ts", () => ({
      WalletConnectHederaSigner: class MockSigner {},
    }));

    const { createWallet } = await import("../src");
    const { hashpack } = await import("../src/wallets");
    const wallet = createWallet({
      app: TEST_APP,
      projectId: "project-id",
      wallets: [hashpack()],
    });

    const extensionSession = wallet.connectExtension("hashpack");
    await waitFor(() => wallet.snapshot().connection?.uri === "wc:test-uri");

    const qrSession = wallet.connectQr();

    expect(client.connect).toHaveBeenCalledTimes(1);
    expect(wallet.snapshot().connection).toEqual({
      uri: "wc:test-uri",
      extensionId: "hashpack",
    });

    resolveApproval(session);

    const [extensionConnected, qrConnected] = await Promise.all([extensionSession, qrSession]);

    expect(extensionConnected.kind).toBe("extension");
    expect(qrConnected.accountId).toBe("0.0.123");
  });

  test("repeated connect calls do not duplicate the underlying attempt", async () => {
    const session = createMockSession();
    let resolveApproval!: (value: typeof session) => void;
    const approval = new Promise<typeof session>((resolve) => {
      resolveApproval = resolve;
    });
    const client = {
      on: mock(() => undefined),
      connect: mock(async () => ({
        uri: "wc:test-uri",
        approval: () => approval,
      })),
      disconnect: mock(async () => undefined),
      session: {
        getAll: () => [session],
      },
    };

    mock.module("@walletconnect/sign-client", () => ({
      default: {
        init: mock(async () => client),
      },
    }));

    mock.module("../src/extensions.ts", () => ({
      discoverExtensions: mock(async () => [
        {
          id: "hashpack",
          name: "HashPack",
          icon: "https://example.com/icon.png",
          url: "https://example.com",
          availableInIframe: false,
        },
      ]),
      pairExtension: mock(() => undefined),
      openExtension: mock(() => undefined),
    }));

    mock.module("../src/signer.ts", () => ({
      WalletConnectHederaSigner: class MockSigner {},
    }));

    const { createWallet } = await import("../src");
    const { hashpack } = await import("../src/wallets");
    const wallet = createWallet({
      app: TEST_APP,
      projectId: "project-id",
      wallets: [hashpack()],
    });

    const firstQr = wallet.connectQr();
    const secondQr = wallet.connectQr();
    const extension = wallet.connectExtension("hashpack");

    await waitFor(() => wallet.snapshot().connection?.uri === "wc:test-uri");

    expect(client.connect).toHaveBeenCalledTimes(1);

    resolveApproval(session);

    const [first, second, third] = await Promise.all([firstQr, secondQr, extension]);

    expect(first.accountId).toBe("0.0.123");
    expect(second.accountId).toBe("0.0.123");
    expect(third.accountId).toBe("0.0.123");
  });

  test("restore rehydrates a persisted session", async () => {
    const session = createMockSession();
    const client = {
      on: mock(() => undefined),
      connect: mock(async () => ({
        uri: "wc:test-uri",
        approval: async () => session,
      })),
      disconnect: mock(async () => undefined),
      session: {
        getAll: () => [session],
      },
    };

    mock.module("@walletconnect/sign-client", () => ({
      default: {
        init: mock(async () => client),
      },
    }));

    mock.module("../src/extensions.ts", () => ({
      discoverExtensions: mock(async () => [
        {
          id: "hashpack",
          name: "HashPack",
          icon: "https://example.com/icon.png",
          url: "https://example.com",
          availableInIframe: false,
        },
      ]),
      pairExtension: mock(() => undefined),
      openExtension: mock(() => undefined),
    }));

    mock.module("../src/signer.ts", () => ({
      WalletConnectHederaSigner: class MockSigner {},
    }));

    const { createWallet } = await import("../src");
    const { hashpack } = await import("../src/wallets");
    const storage = createMemoryStorage(
      JSON.stringify({
        kind: "extension",
        chainId: "hedera:testnet",
        topic: "session-topic",
        walletId: "hashpack",
        extensionId: "hashpack",
      }),
    );
    const wallet = createWallet({
      app: TEST_APP,
      projectId: "project-id",
      wallets: [hashpack()],
      storage,
    });

    const restored = await wallet.restore();

    expect(restored).toEqual(
      expect.objectContaining({
        kind: "extension",
        accountId: "0.0.123",
      }),
    );
    expect(wallet.snapshot()).toEqual(
      expect.objectContaining({
        connection: null,
        session: expect.objectContaining({
          kind: "extension",
        }),
      }),
    );
  });

  test("exposes installed and unavailable wallets in one list", async () => {
    mock.module("@walletconnect/sign-client", () => ({
      default: {
        init: mock(async () => {
          throw new Error("Not needed");
        }),
      },
    }));

    mock.module("../src/extensions.ts", () => ({
      discoverExtensions: mock(async () => [
        {
          id: "hashpack",
          name: "HashPack",
          icon: "https://example.com/icon.png",
          url: "https://example.com",
          availableInIframe: false,
        },
      ]),
      pairExtension: mock(() => undefined),
      openExtension: mock(() => undefined),
    }));

    mock.module("../src/signer.ts", () => ({
      WalletConnectHederaSigner: class MockSigner {},
    }));

    const { createWallet } = await import("../src");
    const { hashpack, kabila } = await import("../src/wallets");
    const wallet = createWallet({
      app: TEST_APP,
      projectId: "project-id",
      wallets: [hashpack(), kabila()],
    });

    await waitFor(
      () =>
        wallet.snapshot().wallets.length === 2 &&
        wallet.snapshot().wallets.some((walletOption) => walletOption.availability === "installed"),
    );

    expect(wallet.snapshot().wallets).toEqual([
      expect.objectContaining({
        id: "hashpack",
        availability: "installed",
        canConnect: true,
      }),
      expect.objectContaining({
        id: "kabila",
        availability: "unavailable",
        canConnect: false,
      }),
    ]);
  });
});
