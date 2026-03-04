import type { EntityId } from "@hieco/types";

export type SdkError =
  | TransactionError
  | InsufficientBalanceError
  | InvalidSignatureError
  | GasEstimationError
  | NetworkError
  | TimeoutError
  | RateLimitError
  | ConfigurationError
  | InvalidEntityIdError;

export interface TransactionError {
  readonly _tag: "TransactionError";
  readonly status: string;
  readonly transactionId: string;
  readonly message: string;
}

export interface InsufficientBalanceError {
  readonly _tag: "InsufficientBalanceError";
  readonly accountId: EntityId;
  readonly message: string;
}

export interface InvalidSignatureError {
  readonly _tag: "InvalidSignatureError";
  readonly transactionId: string;
  readonly message: string;
}

export interface GasEstimationError {
  readonly _tag: "GasEstimationError";
  readonly contractId: EntityId;
  readonly message: string;
}

export interface NetworkError {
  readonly _tag: "NetworkError";
  readonly url: string;
  readonly statusCode: number;
  readonly message: string;
}

export interface TimeoutError {
  readonly _tag: "TimeoutError";
  readonly operation: string;
  readonly timeoutMs: number;
  readonly message: string;
}

export interface RateLimitError {
  readonly _tag: "RateLimitError";
  readonly retryAfterMs: number;
  readonly message: string;
}

export interface ConfigurationError {
  readonly _tag: "ConfigurationError";
  readonly field: string;
  readonly message: string;
}

export interface InvalidEntityIdError {
  readonly _tag: "InvalidEntityIdError";
  readonly value: string;
  readonly message: string;
}
