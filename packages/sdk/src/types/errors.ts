export type ErrorCode =
  | "CONFIG_INVALID_NETWORK"
  | "CONFIG_INVALID_OPERATOR"
  | "CONFIG_INVALID_KEY"
  | "SIGNER_REQUIRED"
  | "SIGNER_ACCOUNT_ID_REQUIRED"
  | "SIGNER_ACCOUNT_KEY_REQUIRED"
  | "TX_PRECHECK_FAILED"
  | "TX_RECEIPT_FAILED"
  | "TX_MISSING_RECEIPT_FIELD"
  | "CONTRACT_CALL_FAILED"
  | "CONTRACT_SIGNATURE_REQUIRED"
  | "CONTRACT_ARGUMENT_MISMATCH"
  | "SCHEDULE_DELETED"
  | "SCHEDULE_NOT_EXECUTED"
  | "MIRROR_QUERY_FAILED"
  | "UNEXPECTED_ERROR"
  | `HEDERA_${string}`;

export type ErrorDetailsValue = string | number | boolean | null | undefined;

export type ErrorDetails = Readonly<Record<string, ErrorDetailsValue>>;

export interface HieroErrorShape {
  readonly code: ErrorCode;
  readonly message: string;
  readonly hint?: string;
  readonly transactionId?: string;
  readonly details?: ErrorDetails;
}
