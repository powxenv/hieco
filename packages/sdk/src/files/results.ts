import type { EntityId } from "@hieco/utils";
import type { FileInfo } from "@hiero-ledger/sdk";
import type { TransactionReceiptData } from "../results/transaction.ts";

export interface FileReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly fileId: EntityId;
}

export interface FileChunkedReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly fileId: EntityId;
  readonly chunks: number;
}

export interface FileInfoData {
  readonly fileId: EntityId;
  readonly info: FileInfo;
}

export interface FileContentsData {
  readonly fileId: EntityId;
  readonly contents: Uint8Array;
}
