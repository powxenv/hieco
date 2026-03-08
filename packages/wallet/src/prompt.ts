import { createWalletError } from "./errors";
import { isMobileBrowser } from "./platform";
import type { WalletOption, WalletPresentation, WalletPrompt } from "./types";

function replaceWalletUri(template: string, uri: string): string {
  if (template.includes("{uri}")) {
    return template.replaceAll("{uri}", encodeURIComponent(uri));
  }

  const separator = template.includes("?") ? "&" : "?";
  return `${template}${separator}uri=${encodeURIComponent(uri)}`;
}

function buildWalletHref(wallet: WalletOption, uri: string): string | null {
  const mobile = wallet.mobile;

  if (!mobile) {
    return null;
  }

  if (mobile.native) {
    return replaceWalletUri(mobile.native, uri);
  }

  if (mobile.universal) {
    return replaceWalletUri(mobile.universal, uri);
  }

  return null;
}

export function createWalletPrompt(
  uri: string,
  wallet: WalletOption,
  presentation: WalletPresentation = "auto",
): WalletPrompt {
  if (presentation === "qr") {
    return {
      kind: "qr",
      uri,
      wallet,
    };
  }

  const href = buildWalletHref(wallet, uri);

  if (presentation === "deeplink") {
    if (!href) {
      throw createWalletError(
        "DEEPLINK_UNAVAILABLE",
        `${wallet.name} does not expose a mobile deep link for this flow.`,
        {
          hint: "Use QR presentation instead, or provide mobile link metadata for this wallet.",
        },
      );
    }

    return {
      kind: "deeplink",
      uri,
      href,
      wallet,
    };
  }

  if (isMobileBrowser() && href) {
    return {
      kind: "deeplink",
      uri,
      href,
      wallet,
    };
  }

  return {
    kind: "qr",
    uri,
    wallet,
  };
}
