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

export interface WalletError extends Error {
  readonly code: WalletErrorCode;
  readonly hint?: string;
  readonly cause?: unknown;
}

class HiecoWalletError extends Error implements WalletError {
  readonly code: WalletErrorCode;
  readonly hint?: string;
  override readonly cause?: unknown;

  constructor(
    code: WalletErrorCode,
    message: string,
    options: {
      readonly hint?: string;
      readonly cause?: unknown;
    } = {},
  ) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = "WalletError";
    this.code = code;
    this.hint = options.hint;
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
    case "PAIRING_REQUIRED":
      return "Choose an explicit QR pairing flow when you want to connect from another device.";
    case "WALLET_NOT_READY":
      return "Check the wallet setup and try again.";
    case "WALLET_NOT_INSTALLED":
      return "Install the wallet extension or app, then try again.";
    case "WALLET_NOT_SUPPORTED_ON_DESKTOP":
      return "Choose an installed desktop extension, or switch to a supported mobile or QR flow.";
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
  return new HiecoWalletError(code, message, options);
}

export function formatWalletError(error: WalletError): string {
  if (!error.hint) {
    return error.message;
  }

  return `${error.message} ${error.hint}`;
}

export function asWalletError(error: unknown, fallback: WalletErrorCode): WalletError {
  if (error instanceof HiecoWalletError) {
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
