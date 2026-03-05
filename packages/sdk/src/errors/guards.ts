import type {
  SdkError,
  TransactionError,
  InvalidSignatureError,
  ConfigurationError,
} from "./types.ts";

export function isSdkError(value: unknown): value is SdkError {
  if (typeof value !== "object" || value === null) return false;
  if (!("_tag" in value) || !("message" in value)) return false;
  return typeof value._tag === "string" && typeof value.message === "string";
}

export function isTransactionError(error: SdkError): error is TransactionError {
  return error._tag === "TransactionError";
}

export function isInvalidSignatureError(error: SdkError): error is InvalidSignatureError {
  return error._tag === "InvalidSignatureError";
}

export function isConfigurationError(error: SdkError): error is ConfigurationError {
  return error._tag === "ConfigurationError";
}
