export type SdkError = TransactionError | InvalidSignatureError | ConfigurationError | FlowError;

export interface TransactionError {
  readonly _tag: "TransactionError";
  readonly status: string;
  readonly transactionId: string;
  readonly message: string;
}

export interface InvalidSignatureError {
  readonly _tag: "InvalidSignatureError";
  readonly transactionId: string;
  readonly message: string;
}
export interface ConfigurationError {
  readonly _tag: "ConfigurationError";
  readonly field: string;
  readonly message: string;
}

export interface FlowError {
  readonly _tag: "FlowError";
  readonly name: string;
  readonly message: string;
  readonly scheduleId?: string;
}
