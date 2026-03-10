export type WalletErrorCode =
  | "CONNECT_FAILED"
  | "USER_REJECTED"
  | "SESSION_EXPIRED"
  | "PAIRING_FAILED"
  | "PAIRING_REQUIRED"
  | "WALLET_NOT_READY"
  | "WALLET_NOT_INSTALLED"
  | "WALLET_NOT_SUPPORTED_ON_DESKTOP"
  | "CHAIN_UNSUPPORTED"
  | "STORAGE_UNAVAILABLE"
  | "RESTORE_FAILED"
  | "DISCONNECT_FAILED"
  | "SIGNER_UNAVAILABLE"
  | "DEEPLINK_UNAVAILABLE"
  | "RETURN_TO_APP_UNAVAILABLE";

export class WalletError extends Error {
  readonly code: WalletErrorCode;
  override readonly cause?: unknown;

  constructor(
    code: WalletErrorCode,
    message?: string,
    options: {
      readonly cause?: unknown;
    } = {},
  ) {
    super(message ?? code, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = "WalletError";
    this.code = code;
    this.cause = options.cause;
  }
}

export function asWalletError(error: unknown, fallback: WalletErrorCode): WalletError {
  if (error instanceof WalletError) {
    return error;
  }

  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (message.includes("user rejected") || message.includes("user disapproved")) {
    return new WalletError("USER_REJECTED", "USER_REJECTED", {
      cause: error,
    });
  }

  if (message.includes("expired")) {
    return new WalletError("SESSION_EXPIRED", "SESSION_EXPIRED", {
      cause: error,
    });
  }

  return new WalletError(
    fallback,
    error instanceof Error && error.message ? error.message : fallback,
    {
      cause: error,
    },
  );
}
