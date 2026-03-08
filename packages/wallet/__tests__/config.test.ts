import { afterEach, describe, expect, test } from "bun:test";
import { createWallet } from "../src/config";
import { createWalletPrompt, planConnection, resolveWalletOptions } from "../src/planner";
import { genericWalletConnectWallet, hashpack, kabila } from "../src/wallets";

const originalWindow = Reflect.get(globalThis, "window");
const originalDocument = Reflect.get(globalThis, "document");
const originalNavigator = Reflect.get(globalThis, "navigator");

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

function setBrowserEnvironment(
  input: {
    readonly userAgent?: string;
  } = {},
): void {
  const querySelector = (selector: string) => {
    if (selector === 'meta[name="description"]') {
      return {
        getAttribute: (name: string) => (name === "content" ? "Wallet test app" : null),
      };
    }

    return null;
  };

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
      querySelector,
      querySelectorAll: () => [],
      visibilityState: "visible",
    },
    configurable: true,
    writable: true,
  });

  Object.defineProperty(globalThis, "navigator", {
    value: {
      userAgent: input.userAgent ?? "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      clipboard: {
        writeText: async () => undefined,
      },
    },
    configurable: true,
    writable: true,
  });
}

afterEach(() => {
  restoreGlobals();
});

function clearBrowserEnvironment(): void {
  Reflect.deleteProperty(globalThis, "window");
  Reflect.deleteProperty(globalThis, "document");
  Reflect.deleteProperty(globalThis, "navigator");
}

describe("createWallet", () => {
  test("keeps browser-only connect guarded on the server", async () => {
    clearBrowserEnvironment();
    const wallet = createWallet();

    expect(wallet.connect()).rejects.toMatchObject({
      code: "WALLET_NOT_READY",
      message: "Hieco wallet connections run in the browser only.",
    });
  });

  test("keeps browser-only restore guarded on the server", async () => {
    clearBrowserEnvironment();
    const wallet = createWallet();

    expect(wallet.restore()).rejects.toMatchObject({
      code: "WALLET_NOT_READY",
      message: "Hieco wallet connections run in the browser only.",
    });
  });

  test("uses the new neutral generic wallet fallback", () => {
    const wallet = genericWalletConnectWallet();

    expect(wallet.id).toBe("hedera-wallet");
    expect(wallet.name).toBe("Other Hedera wallet");
    expect(wallet.installUrl).toBeUndefined();
  });
});

describe("resolveWalletOptions", () => {
  test("prioritizes installed desktop extensions", () => {
    setBrowserEnvironment();

    const wallets = resolveWalletOptions(
      [hashpack(), kabila(), genericWalletConnectWallet()],
      [
        {
          id: "hashpack",
          name: "HashPack",
          availableInIframe: false,
        },
      ],
    );

    expect(wallets[0]).toMatchObject({
      id: "hashpack",
      readyState: "installed",
      defaultTransport: "extension",
      extension: {
        id: "hashpack",
      },
    });
    expect(wallets[1]).toMatchObject({
      id: "kabila",
      readyState: "install-required",
    });
    expect(wallets[2]).toMatchObject({
      id: "hedera-wallet",
      readyState: "cross-device",
    });
  });

  test("marks mobile wallets as directly loadable on mobile browsers", () => {
    setBrowserEnvironment({
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    });

    const wallets = resolveWalletOptions([hashpack(), genericWalletConnectWallet()], []);

    expect(wallets[0]).toMatchObject({
      id: "hashpack",
      readyState: "loadable",
      defaultTransport: "walletconnect",
    });
    expect(wallets[1]).toMatchObject({
      id: "hedera-wallet",
      readyState: "loadable",
      defaultTransport: "walletconnect",
    });
  });
});

describe("planConnection", () => {
  test("uses the installed extension on desktop by default", () => {
    setBrowserEnvironment();

    const wallet = resolveWalletOptions(
      [hashpack()],
      [
        {
          id: "hashpack",
          name: "HashPack",
          availableInIframe: false,
        },
      ],
    );
    const installedWallet = wallet[0];

    if (!installedWallet) {
      throw new Error("Expected an installed wallet option.");
    }

    const plan = planConnection({
      wallet: installedWallet,
      chain: {
        id: "hedera:testnet",
        network: "testnet",
        ledgerId: "testnet",
      },
    });

    expect(plan).toMatchObject({
      transport: "extension",
      promptMode: null,
      extension: {
        id: "hashpack",
      },
    });
  });

  test("requires explicit QR pairing for desktop cross-device wallets", () => {
    setBrowserEnvironment();

    const wallets = resolveWalletOptions([genericWalletConnectWallet()], []);
    const wallet = wallets[0];

    if (!wallet) {
      throw new Error("Expected a wallet option.");
    }

    expect(() =>
      planConnection({
        wallet,
        chain: {
          id: "hedera:testnet",
          network: "testnet",
          ledgerId: "testnet",
        },
      }),
    ).toThrow("needs an explicit cross-device WalletConnect flow");
  });

  test("allows explicit QR pairing on desktop", () => {
    setBrowserEnvironment();

    const wallets = resolveWalletOptions([genericWalletConnectWallet()], []);
    const wallet = wallets[0];

    if (!wallet) {
      throw new Error("Expected a wallet option.");
    }

    const plan = planConnection({
      wallet,
      chain: {
        id: "hedera:testnet",
        network: "testnet",
        ledgerId: "testnet",
      },
      options: {
        presentation: "qr",
      },
    });

    expect(plan).toMatchObject({
      transport: "walletconnect",
      promptMode: "qr",
    });
  });
});

describe("createWalletPrompt", () => {
  test("creates a QR prompt for explicit cross-device pairing", () => {
    setBrowserEnvironment();
    const wallet = {
      ...genericWalletConnectWallet(),
      readyState: "cross-device" as const,
      defaultTransport: null,
      extension: null,
    };

    expect(createWalletPrompt({ uri: "wc:test", wallet, mode: "qr" })).toEqual({
      kind: "qr",
      uri: "wc:test",
      wallet,
    });
  });

  test("creates a deeplink prompt when the wallet provides a deep link", () => {
    setBrowserEnvironment({
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    });

    expect(
      createWalletPrompt({
        uri: "wc:test",
        wallet: {
          ...hashpack(),
          readyState: "loadable",
          defaultTransport: "walletconnect",
          extension: null,
          mobile: {
            native: "hashpack://wc?uri={uri}",
          },
        },
        mode: "deeplink",
      }),
    ).toEqual({
      kind: "deeplink",
      uri: "wc:test",
      href: "hashpack://wc?uri=wc%3Atest",
      wallet: {
        ...hashpack(),
        readyState: "loadable",
        defaultTransport: "walletconnect",
        extension: null,
        mobile: {
          native: "hashpack://wc?uri={uri}",
        },
      },
    });
  });

  test("falls back to a return prompt when mobile flow has no deep link", () => {
    setBrowserEnvironment({
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    });

    const wallet = {
      ...genericWalletConnectWallet(),
      readyState: "loadable" as const,
      defaultTransport: "walletconnect" as const,
      extension: null,
    };

    expect(
      createWalletPrompt({
        uri: "wc:test",
        wallet,
        mode: "return",
        returnHref: "https://example.com/return",
      }),
    ).toEqual({
      kind: "return",
      wallet,
      href: "https://example.com/return",
      uri: "wc:test",
    });
  });
});
