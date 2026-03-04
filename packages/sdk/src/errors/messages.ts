import type { TransactionError, InvalidSignatureError, ConfigurationError } from "./types.ts";

export function transactionError(status: string, transactionId: string): TransactionError {
  return {
    _tag: "TransactionError",
    status,
    transactionId,
    message: `Transaction ${transactionId} failed with status ${status}`,
  };
}

export function invalidSignatureError(transactionId: string): InvalidSignatureError {
  return {
    _tag: "InvalidSignatureError",
    transactionId,
    message: `Transaction ${transactionId} has an invalid signature`,
  };
}

export function configurationError(field: string, detail: string): ConfigurationError {
  return {
    _tag: "ConfigurationError",
    field,
    message: `Configuration error for "${field}": ${detail}`,
  };
}
