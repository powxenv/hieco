import type { EntityId } from "@hieco/types";
import type {
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

export function transactionError(status: string, transactionId: string): TransactionError {
  return {
    _tag: "TransactionError",
    status,
    transactionId,
    message: `Transaction ${transactionId} failed with status ${status}`,
  };
}

export function insufficientBalanceError(accountId: EntityId): InsufficientBalanceError {
  return {
    _tag: "InsufficientBalanceError",
    accountId,
    message: `Account ${accountId} has insufficient balance to complete this transaction`,
  };
}

export function invalidSignatureError(transactionId: string): InvalidSignatureError {
  return {
    _tag: "InvalidSignatureError",
    transactionId,
    message: `Transaction ${transactionId} has an invalid signature`,
  };
}

export function gasEstimationError(contractId: EntityId): GasEstimationError {
  return {
    _tag: "GasEstimationError",
    contractId,
    message: `Gas estimation failed for contract ${contractId}`,
  };
}

export function networkError(url: string, statusCode: number): NetworkError {
  return {
    _tag: "NetworkError",
    url,
    statusCode,
    message: `Network request to ${url} failed with status ${String(statusCode)}`,
  };
}

export function timeoutError(operation: string, timeoutMs: number): TimeoutError {
  return {
    _tag: "TimeoutError",
    operation,
    timeoutMs,
    message: `Operation "${operation}" timed out after ${String(timeoutMs)}ms`,
  };
}

export function rateLimitError(retryAfterMs: number): RateLimitError {
  return {
    _tag: "RateLimitError",
    retryAfterMs,
    message: `Rate limited. Retry after ${String(retryAfterMs)}ms`,
  };
}

export function configurationError(field: string, detail: string): ConfigurationError {
  return {
    _tag: "ConfigurationError",
    field,
    message: `Configuration error for "${field}": ${detail}`,
  };
}

export function invalidEntityIdError(value: string): InvalidEntityIdError {
  return {
    _tag: "InvalidEntityIdError",
    value,
    message: `Invalid entity ID: "${value}". Expected format: "shard.realm.num" (e.g., "0.0.1234")`,
  };
}
