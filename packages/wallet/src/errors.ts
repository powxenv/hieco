export const walletErrorCodes = [
  "CONNECT_FAILED",
  "USER_REJECTED",
  "SESSION_EXPIRED",
  "PAIRING_FAILED",
  "WALLET_NOT_READY",
  "CHAIN_UNSUPPORTED",
  "STORAGE_UNAVAILABLE",
  "RESTORE_FAILED",
  "DISCONNECT_FAILED",
  "SIGNER_UNAVAILABLE",
  "DEEPLINK_UNAVAILABLE",
  "RETURN_TO_APP_UNAVAILABLE",
  "MANAGED_MODE_UNAVAILABLE",
] as const;

export type WalletErrorCode = (typeof walletErrorCodes)[number];

export interface WalletError extends Error {
  readonly code: WalletErrorCode;
  readonly hint?: string;
  readonly cause?: unknown;
}

function isWalletErrorCode(value: unknown): value is WalletErrorCode {
  return typeof value === "string" && walletErrorCodes.some((code) => code === value);
}

function isWalletError(value: unknown): value is WalletError {
  return value instanceof Error && isWalletErrorCode(Reflect.get(value, "code"));
}

function defaultMessage(code: WalletErrorCode): string {
  switch (code) {
    case "CONNECT_FAILED":
      return "We couldn't connect to the wallet.";
    case "USER_REJECTED":
      return "You canceled the wallet request.";
    case "SESSION_EXPIRED":
      return "Your wallet session expired.";
    case "PAIRING_FAILED":
      return "We couldn't pair with the wallet.";
    case "WALLET_NOT_READY":
      return "The wallet isn't ready yet.";
    case "CHAIN_UNSUPPORTED":
      return "This wallet session doesn't support that Hedera network.";
    case "STORAGE_UNAVAILABLE":
      return "We couldn't save your wallet session on this device.";
    case "RESTORE_FAILED":
      return "We couldn't restore the previous wallet session.";
    case "DISCONNECT_FAILED":
      return "We couldn't disconnect the wallet cleanly.";
    case "SIGNER_UNAVAILABLE":
      return "This wallet can't sign right now.";
    case "DEEPLINK_UNAVAILABLE":
      return "This wallet can't be opened from the current device.";
    case "RETURN_TO_APP_UNAVAILABLE":
      return "This wallet can't send you back to the app automatically.";
    case "MANAGED_MODE_UNAVAILABLE":
      return "Hieco couldn't prepare wallet connectivity automatically.";
  }
}

function defaultHint(code: WalletErrorCode): string | undefined {
  switch (code) {
    case "CONNECT_FAILED":
      return "Try again, or choose a different wallet.";
    case "USER_REJECTED":
      return "Open the wallet again when you're ready to continue.";
    case "SESSION_EXPIRED":
      return "Reconnect the wallet to start a fresh session.";
    case "PAIRING_FAILED":
      return "Open the wallet again and approve the pairing request.";
    case "WALLET_NOT_READY":
      return "Check the wallet setup and try again.";
    case "CHAIN_UNSUPPORTED":
      return "Switch to a supported Hedera network and try again.";
    case "STORAGE_UNAVAILABLE":
      return "The app can still work, but it won't remember the wallet after a refresh.";
    case "RESTORE_FAILED":
      return "Reconnect the wallet to start a new session.";
    case "DISCONNECT_FAILED":
      return "Try disconnecting again.";
    case "SIGNER_UNAVAILABLE":
      return "Reconnect the wallet or choose a wallet that supports signing.";
    case "DEEPLINK_UNAVAILABLE":
      return "Use the QR flow instead, or pick a wallet that supports mobile links.";
    case "RETURN_TO_APP_UNAVAILABLE":
      return "Approve in the wallet, then return to your browser manually.";
    case "MANAGED_MODE_UNAVAILABLE":
      return "Pass projectId explicitly, or expose a managed project ID through Hieco's browser hooks.";
  }
}

export function createWalletError(
  code: WalletErrorCode,
  message: string,
  options: {
    readonly hint?: string;
    readonly cause?: unknown;
  } = {},
): WalletError {
  const error = new Error(message) as WalletError;
  Object.defineProperty(error, "name", {
    value: "WalletError",
    enumerable: false,
    configurable: true,
  });
  Object.defineProperty(error, "code", {
    value: code,
    enumerable: true,
    configurable: true,
  });
  if (options.hint !== undefined) {
    Object.defineProperty(error, "hint", {
      value: options.hint,
      enumerable: true,
      configurable: true,
    });
  }
  if (options.cause !== undefined) {
    Object.defineProperty(error, "cause", {
      value: options.cause,
      enumerable: true,
      configurable: true,
    });
  }
  return error;
}

export function formatWalletError(error: WalletError): string {
  if (!error.hint) {
    return error.message;
  }

  return `${error.message} ${error.hint}`;
}

export function asWalletError(error: unknown, fallback: WalletErrorCode): WalletError {
  if (isWalletError(error)) {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("user rejected") || message.includes("user disapproved")) {
      return createWalletError("USER_REJECTED", defaultMessage("USER_REJECTED"), {
        cause: error,
        hint: defaultHint("USER_REJECTED"),
      });
    }
    if (message.includes("expired")) {
      return createWalletError("SESSION_EXPIRED", defaultMessage("SESSION_EXPIRED"), {
        cause: error,
        hint: defaultHint("SESSION_EXPIRED"),
      });
    }
  }

  return createWalletError(fallback, defaultMessage(fallback), {
    cause: error,
    hint: defaultHint(fallback),
  });
}
