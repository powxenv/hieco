import { afterEach, describe, expect, test } from "bun:test";
import { createWallet } from "../src";
import type { WalletDefinition } from "../src/types";

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
      clipboard: {
        writeText: async () => undefined,
      },
    },
    configurable: true,
    writable: true,
  });
}

function clearBrowserEnvironment(): void {
  Reflect.deleteProperty(globalThis, "window");
  Reflect.deleteProperty(globalThis, "document");
  Reflect.deleteProperty(globalThis, "navigator");
}

afterEach(() => {
  restoreGlobals();
});

describe("createWallet", () => {
  test("guards qr connect on the server", async () => {
    clearBrowserEnvironment();

    const wallet = createWallet({
      app: TEST_APP,
    });

    expect(wallet.connectQr()).rejects.toMatchObject({
      code: "WALLET_NOT_READY",
      message: "WALLET_NOT_READY",
    });
  });

  test("guards restore on the server", async () => {
    clearBrowserEnvironment();

    const wallet = createWallet({
      app: TEST_APP,
    });

    expect(wallet.restore()).rejects.toMatchObject({
      code: "WALLET_NOT_READY",
      message: "WALLET_NOT_READY",
    });
  });

  test("requires an installed configured extension", async () => {
    setBrowserEnvironment();

    const wallet = createWallet({
      app: TEST_APP,
      projectId: "project-id",
      wallets: [
        {
          id: "extension-only",
          name: "Extension Only",
          icon: "https://example.com/icon.png",
          installUrl: "https://example.com/install",
          desktop: {
            extension: {
              ids: ["extension-only"],
            },
          },
          transports: ["extension"],
        } satisfies WalletDefinition,
      ],
    });

    expect(wallet.connectExtension("extension-only")).rejects.toMatchObject({
      code: "WALLET_NOT_INSTALLED",
      message: "WALLET_NOT_INSTALLED",
    });
  });

  test("starts with minimal state", () => {
    clearBrowserEnvironment();

    const wallet = createWallet({
      app: TEST_APP,
    });

    expect(wallet.snapshot()).toEqual({
      chain: expect.objectContaining({
        id: "hedera:testnet",
      }),
      walletConnectEnabled: false,
      wallets: [
        expect.objectContaining({
          id: "hashpack",
          availability: "unavailable",
          canConnect: false,
        }),
        expect.objectContaining({
          id: "kabila",
          availability: "unavailable",
          canConnect: false,
        }),
      ],
      session: null,
      connection: null,
    });
  });
});
