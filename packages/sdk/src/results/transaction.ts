import type { EntityId } from "@hieco/utils";
import type { TransactionRecord, TransactionReceipt } from "@hiero-ledger/sdk";

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

export interface TransactionRecordData {
  readonly transactionId: string;
  readonly record: TransactionRecord;
}

export interface TransactionReceiptQueryData {
  readonly transactionId: string;
  readonly receipt: TransactionReceipt;
}
