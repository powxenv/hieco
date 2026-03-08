import { afterEach, describe, expect, test } from "bun:test";
import { createWallet } from "../src/config";
import { createWalletPrompt } from "../src/prompt";
import { resolveManagedProjectId } from "../src/managed";
import { genericWalletConnectWallet, hashpack } from "../src/wallets";

const originalWindow = Reflect.get(globalThis, "window");
const originalDocument = Reflect.get(globalThis, "document");
const originalNavigator = Reflect.get(globalThis, "navigator");
const originalFetch = Reflect.get(globalThis, "fetch");
const originalManagedProjectId = Reflect.get(globalThis, "__HIECO_WALLET_PROJECT_ID__");

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

  if (originalFetch === undefined) {
    Reflect.deleteProperty(globalThis, "fetch");
  } else {
    Reflect.set(globalThis, "fetch", originalFetch);
  }

  if (originalManagedProjectId === undefined) {
    Reflect.deleteProperty(globalThis, "__HIECO_WALLET_PROJECT_ID__");
  } else {
    Reflect.set(globalThis, "__HIECO_WALLET_PROJECT_ID__", originalManagedProjectId);
  }
}

function setBrowserEnvironment(
  input: {
    readonly metaProjectId?: string;
    readonly fetchProjectId?: string;
    readonly userAgent?: string;
  } = {},
): void {
  const querySelector = (selector: string) => {
    if (selector === 'meta[name="hieco-wallet-project-id"]' && input.metaProjectId) {
      return {
        getAttribute: (name: string) => (name === "content" ? input.metaProjectId : null),
      };
    }

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
    },
    configurable: true,
    writable: true,
  });

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
      userAgent: input.userAgent ?? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
      clipboard: {
        writeText: async () => undefined,
      },
    },
    configurable: true,
    writable: true,
  });

  Object.defineProperty(globalThis, "fetch", {
    value: async () => ({
      ok: Boolean(input.fetchProjectId),
      headers: {
        get: () => "application/json",
      },
      json: async () => ({ projectId: input.fetchProjectId }),
      text: async () => input.fetchProjectId ?? "",
    }),
    configurable: true,
    writable: true,
  });
}

afterEach(() => {
  restoreGlobals();
});

describe("createWallet", () => {
  test("keeps browser-only connect guarded on the server", async () => {
    const wallet = createWallet();

    expect(wallet.connect()).rejects.toMatchObject({
      code: "WALLET_NOT_READY",
      message: "Hieco wallet connections run in the browser only.",
    });
  });

  test("keeps browser-only restore guarded on the server", async () => {
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

describe("resolveManagedProjectId", () => {
  test("uses the browser global first", async () => {
    setBrowserEnvironment();
    Reflect.set(globalThis, "__HIECO_WALLET_PROJECT_ID__", "managed-global");

    expect(resolveManagedProjectId()).resolves.toBe("managed-global");
  });

  test("falls back to the meta tag", async () => {
    setBrowserEnvironment({
      metaProjectId: "managed-meta",
    });

    expect(resolveManagedProjectId()).resolves.toBe("managed-meta");
  });

  test("falls back to the well-known endpoint", async () => {
    setBrowserEnvironment({
      fetchProjectId: "managed-endpoint",
    });

    expect(resolveManagedProjectId()).resolves.toBe("managed-endpoint");
  });
});

describe("createWalletPrompt", () => {
  test("uses QR on mobile when the wallet has no deep link metadata", () => {
    setBrowserEnvironment();
    const wallet = {
      ...hashpack(),
      readyState: "loadable" as const,
    };

    expect(createWalletPrompt("wc:test", wallet)).toEqual({
      kind: "qr",
      uri: "wc:test",
      wallet,
    });
  });

  test("creates a deeplink prompt when the wallet provides a deep link", () => {
    setBrowserEnvironment();

    expect(
      createWalletPrompt(
        "wc:test",
        {
          ...hashpack(),
          readyState: "loadable",
          mobile: {
            native: "hashpack://wc?uri={uri}",
          },
        },
        "deeplink",
      ),
    ).toEqual({
      kind: "deeplink",
      uri: "wc:test",
      href: "hashpack://wc?uri=wc%3Atest",
      wallet: {
        ...hashpack(),
        readyState: "loadable",
        mobile: {
          native: "hashpack://wc?uri={uri}",
        },
      },
    });
  });

  test("throws a dedicated error when deeplink presentation is forced but unavailable", () => {
    setBrowserEnvironment();

    expect(() =>
      createWalletPrompt(
        "wc:test",
        {
          ...hashpack(),
          readyState: "loadable",
        },
        "deeplink",
      ),
    ).toThrow("does not expose a mobile deep link");
  });
});
