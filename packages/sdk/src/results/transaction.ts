import type { TransactionRecord, TransactionReceipt } from "@hiero-ledger/sdk";

export interface TransactionReceiptData {
  readonly status: string;
  readonly transactionId: string;
  readonly accountId?: string;
  readonly fileId?: string;
  readonly contractId?: string;
  readonly topicId?: string;
  readonly tokenId?: string;
  readonly scheduleId?: string;
  readonly totalSupply?: string;
  readonly serialNumbers?: ReadonlyArray<number>;
  readonly topicSequenceNumber?: string;
}

export interface TransactionRecordData {
  readonly transactionId: string;
  readonly record: TransactionRecord;
}

export interface TransactionReceiptQueryData {
  readonly transactionId: string;
  readonly receipt: TransactionReceipt;
}
