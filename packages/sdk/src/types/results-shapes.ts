import type { EntityId } from "@hieco/types";

export interface TransactionReceiptData {
  readonly status: string;
  readonly transactionId: string;
  readonly accountId?: EntityId;
  readonly fileId?: EntityId;
  readonly contractId?: EntityId;
  readonly topicId?: EntityId;
  readonly tokenId?: EntityId;
  readonly scheduleId?: EntityId;
  readonly totalSupply?: string;
  readonly serialNumbers?: ReadonlyArray<number>;
  readonly topicSequenceNumber?: string;
}

export interface TransferResult {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
}

export interface CreateAccountResult {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly accountId: EntityId;
}

export interface UpdateAccountResult {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
}

export interface DeleteAccountResult {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
}

export interface TokenReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly tokenId: EntityId;
}

export interface MintReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly totalSupply: string;
  readonly serialNumbers?: ReadonlyArray<number>;
}

export interface TopicReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly topicId: EntityId;
}

export interface MessageReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly topicSequenceNumber: string;
}

export interface ContractReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly contractId: EntityId;
}

export interface ContractExecuteReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
}

export interface ContractCallResult<T = unknown> {
  readonly contractId: EntityId;
  readonly gasUsed: number;
  readonly errorMessage: string;
  readonly raw: Uint8Array;
  readonly value: T;
}

export interface ScheduleReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly scheduleId: EntityId;
}

export interface FileReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly fileId: EntityId;
}
