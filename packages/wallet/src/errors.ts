export const walletErrorCodes = [
  "CONNECT_FAILED",
  "USER_REJECTED",
  "SESSION_EXPIRED",
  "PAIRING_FAILED",
  "PAIRING_REQUIRED",
  "WALLET_NOT_READY",
  "WALLET_NOT_INSTALLED",
  "WALLET_NOT_SUPPORTED_ON_DESKTOP",
  "CHAIN_UNSUPPORTED",
  "STORAGE_UNAVAILABLE",
  "RESTORE_FAILED",
  "DISCONNECT_FAILED",
  "SIGNER_UNAVAILABLE",
  "DEEPLINK_UNAVAILABLE",
  "RETURN_TO_APP_UNAVAILABLE",
] as const;

export type WalletErrorCode = (typeof walletErrorCodes)[number];

export class WalletError extends Error {
  readonly code: WalletErrorCode;
  override readonly cause?: unknown;

  constructor(
    code: WalletErrorCode,
    message: string,
    options: {
      readonly cause?: unknown;
    } = {},
  ) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = "WalletError";
    this.code = code;
    this.cause = options.cause;
  }
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
    case "PAIRING_REQUIRED":
      return "This wallet needs an explicit pairing step.";
    case "WALLET_NOT_READY":
      return "The wallet isn't ready yet.";
    case "WALLET_NOT_INSTALLED":
      return "This wallet is not installed in your browser.";
    case "WALLET_NOT_SUPPORTED_ON_DESKTOP":
      return "This wallet does not support the current desktop flow.";
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
  }
}

export function asWalletError(error: unknown, fallback: WalletErrorCode): WalletError {
  if (error instanceof WalletError) {
    return error;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("user rejected") || message.includes("user disapproved")) {
      return new WalletError("USER_REJECTED", defaultMessage("USER_REJECTED"), {
        cause: error,
      });
    }
    if (message.includes("expired")) {
      return new WalletError("SESSION_EXPIRED", defaultMessage("SESSION_EXPIRED"), {
        cause: error,
      });
    }
  }

  return new WalletError(fallback, defaultMessage(fallback), {
    cause: error,
  });
}
