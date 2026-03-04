import type {
  SdkError,
  TransactionError,
  InsufficientBalanceError,
  InvalidSignatureError,
  GasEstimationError,
  NetworkError,
  TimeoutError,
  RateLimitError,
  ConfigurationError,
  InvalidEntityIdError,
} from "./types.ts";

export function isSdkError(value: unknown): value is SdkError {
  if (typeof value !== "object" || value === null) return false;
  if (!("_tag" in value) || !("message" in value)) return false;
  return typeof value._tag === "string" && typeof value.message === "string";
}

export function isTransactionError(error: SdkError): error is TransactionError {
  return error._tag === "TransactionError";
}

export function isInsufficientBalanceError(error: SdkError): error is InsufficientBalanceError {
  return error._tag === "InsufficientBalanceError";
}

export function isInvalidSignatureError(error: SdkError): error is InvalidSignatureError {
  return error._tag === "InvalidSignatureError";
}

export function isGasEstimationError(error: SdkError): error is GasEstimationError {
  return error._tag === "GasEstimationError";
}

export function isNetworkError(error: SdkError): error is NetworkError {
  return error._tag === "NetworkError";
}

export function isTimeoutError(error: SdkError): error is TimeoutError {
  return error._tag === "TimeoutError";
}

export function isRateLimitError(error: SdkError): error is RateLimitError {
  return error._tag === "RateLimitError";
}

export function isConfigurationError(error: SdkError): error is ConfigurationError {
  return error._tag === "ConfigurationError";
}

export function isInvalidEntityIdError(error: SdkError): error is InvalidEntityIdError {
  return error._tag === "InvalidEntityIdError";
}
