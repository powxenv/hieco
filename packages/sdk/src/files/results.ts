import type { FileInfo } from "@hieco/runtime";
import type { TransactionReceiptData } from "../results/transaction.ts";

export interface FileReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly fileId: string;
}

export interface FileChunkedReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly fileId: string;
  readonly chunks: number;
}

export interface FileInfoData {
  readonly fileId: string;
  readonly info: FileInfo;
}

export interface FileContentsData {
  readonly fileId: string;
  readonly contents: Uint8Array;
}
