import { WalletError } from "./errors.ts";
import { getWalletPlatform } from "./platform.ts";
import type {
  ConnectOptions,
  WalletChain,
  WalletDefinition,
  WalletExtension,
  WalletOption,
  WalletPrompt,
  WalletTransportId,
} from "./types.ts";

type WalletPromptMode = WalletPrompt["kind"];

interface WalletConnectionPlan {
  readonly wallet: WalletOption;
  readonly chain: WalletChain;
  readonly transport: WalletTransportId;
  readonly extension: WalletExtension | null;
  readonly promptMode: WalletPromptMode | null;
}

function normalize(value: string | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function hasMobileRoute(wallet: WalletDefinition): boolean {
  return Boolean(wallet.mobile?.native || wallet.mobile?.universal);
}

function findMatchingExtension(
  wallet: WalletDefinition,
  extensions: readonly WalletExtension[],
): WalletExtension | null {
  const extensionSupport = wallet.desktop?.extension;

  if (!extensionSupport) {
    return null;
  }

  const ids = new Set((extensionSupport.ids ?? []).map(normalize));
  const names = new Set([wallet.name, ...(extensionSupport.names ?? [])].map(normalize));

  return (
    extensions.find((extension) => {
      const extensionId = normalize(extension.id);
      const extensionName = normalize(extension.name);

      return ids.has(extensionId) || names.has(extensionName);
    }) ?? null
  );
}

function getReadyState(wallet: WalletDefinition, extension: WalletExtension | null): WalletOption {
  const platform = getWalletPlatform();
  const supportsExtension =
    wallet.transports.includes("extension") && Boolean(wallet.desktop?.extension);
  const supportsWalletConnect = wallet.transports.includes("walletconnect");

  if (platform === "server") {
    return {
      ...wallet,
      readyState: "unsupported",
      defaultTransport: null,
      extension: null,
    };
  }

  if (platform === "desktop") {
    if (extension && supportsExtension) {
      return {
        ...wallet,
        readyState: "installed",
        defaultTransport: "extension",
        extension,
      };
    }

    if (supportsExtension) {
      return {
        ...wallet,
        readyState: "install-required",
        defaultTransport: null,
        extension: null,
      };
    }

    if (supportsWalletConnect) {
      return {
        ...wallet,
        readyState: "cross-device",
        defaultTransport: null,
        extension: null,
      };
    }
  }

  if (platform === "mobile") {
    if (hasMobileRoute(wallet) || supportsWalletConnect) {
      return {
        ...wallet,
        readyState: "loadable",
        defaultTransport: "walletconnect",
        extension: null,
      };
    }
  }

  return {
    ...wallet,
    readyState: "unsupported",
    defaultTransport: null,
    extension: null,
  };
}

function compareReadyState(left: WalletOption, right: WalletOption): number {
  const order: Record<WalletOption["readyState"], number> = {
    installed: 0,
    loadable: 1,
    "install-required": 2,
    "cross-device": 3,
    unsupported: 4,
  };

  return order[left.readyState] - order[right.readyState];
}

export function resolveWalletOptions(
  wallets: readonly WalletDefinition[],
  extensions: readonly WalletExtension[],
): readonly WalletOption[] {
  return wallets
    .map((wallet) => getReadyState(wallet, findMatchingExtension(wallet, extensions)))
    .sort(compareReadyState);
}

export function createWalletPrompt(input: {
  readonly uri: string;
  readonly wallet: WalletOption;
  readonly mode: WalletPromptMode;
  readonly returnHref?: string;
}): WalletPrompt {
  if (input.mode === "qr") {
    return {
      kind: "qr",
      uri: input.uri,
      wallet: input.wallet,
    };
  }

  if (input.mode === "deeplink") {
    const href = input.wallet.mobile?.native
      ? buildWalletHref(input.wallet.mobile.native, input.uri)
      : input.wallet.mobile?.universal
        ? buildWalletHref(input.wallet.mobile.universal, input.uri)
        : null;

    if (!href) {
      throw new WalletError(
        "DEEPLINK_UNAVAILABLE",
        `${input.wallet.name} does not expose a mobile deep link for this flow.`,
      );
    }

    return {
      kind: "deeplink",
      uri: input.uri,
      href,
      wallet: input.wallet,
    };
  }

  return {
    kind: "return",
    wallet: input.wallet,
    href: input.returnHref,
    uri: input.uri,
  };
}

function buildWalletHref(template: string, uri: string): string {
  if (template.includes("{uri}")) {
    return template.replaceAll("{uri}", encodeURIComponent(uri));
  }

  const separator = template.includes("?") ? "&" : "?";
  return `${template}${separator}uri=${encodeURIComponent(uri)}`;
}

export function planConnection(input: {
  readonly wallet: WalletOption;
  readonly chain: WalletChain;
  readonly options?: ConnectOptions;
}): WalletConnectionPlan {
  const { wallet, chain } = input;
  const options = input.options ?? {};
  const platform = getWalletPlatform();
  const explicitTransport = options.transport;
  const explicitPresentation = options.presentation;
  const supportsWalletConnect = wallet.transports.includes("walletconnect");
  const supportsExtension = wallet.transports.includes("extension");

  if (explicitTransport === "extension") {
    if (!wallet.extension || !supportsExtension) {
      throw new WalletError(
        "WALLET_NOT_SUPPORTED_ON_DESKTOP",
        `${wallet.name} does not expose an installed desktop extension for this browser.`,
      );
    }

    return {
      wallet,
      chain,
      transport: "extension",
      extension: wallet.extension,
      promptMode: null,
    };
  }

  if (explicitPresentation === "qr") {
    if (!supportsWalletConnect) {
      throw new WalletError(
        "PAIRING_REQUIRED",
        `${wallet.name} does not support WalletConnect pairing.`,
      );
    }

    return {
      wallet,
      chain,
      transport: "walletconnect",
      extension: null,
      promptMode: "qr",
    };
  }

  if (explicitTransport === "walletconnect") {
    if (!supportsWalletConnect) {
      throw new WalletError("CONNECT_FAILED", `${wallet.name} does not support WalletConnect.`);
    }

    if (platform === "desktop") {
      return {
        wallet,
        chain,
        transport: "walletconnect",
        extension: null,
        promptMode: "qr",
      };
    }

    return {
      wallet,
      chain,
      transport: "walletconnect",
      extension: null,
      promptMode: hasMobileRoute(wallet) ? "deeplink" : "return",
    };
  }

  if (explicitPresentation === "deeplink") {
    if (platform !== "mobile") {
      throw new WalletError(
        "DEEPLINK_UNAVAILABLE",
        "Mobile deep links only work from a mobile browser.",
      );
    }

    return {
      wallet,
      chain,
      transport: "walletconnect",
      extension: null,
      promptMode: hasMobileRoute(wallet) ? "deeplink" : "return",
    };
  }

  if (platform === "mobile") {
    if (!supportsWalletConnect) {
      throw new WalletError(
        "CONNECT_FAILED",
        `${wallet.name} cannot open a mobile wallet flow from this device.`,
      );
    }

    return {
      wallet,
      chain,
      transport: "walletconnect",
      extension: null,
      promptMode: hasMobileRoute(wallet) ? "deeplink" : "return",
    };
  }

  if (wallet.extension && supportsExtension) {
    return {
      wallet,
      chain,
      transport: "extension",
      extension: wallet.extension,
      promptMode: null,
    };
  }

  if (wallet.readyState === "install-required") {
    throw new WalletError(
      "WALLET_NOT_INSTALLED",
      `${wallet.name} is not installed in this browser yet.`,
    );
  }

  if (wallet.readyState === "cross-device") {
    throw new WalletError(
      "PAIRING_REQUIRED",
      `${wallet.name} needs an explicit cross-device WalletConnect flow on desktop.`,
    );
  }

  throw new WalletError(
    "WALLET_NOT_SUPPORTED_ON_DESKTOP",
    `${wallet.name} does not support this desktop browser flow.`,
  );
}
