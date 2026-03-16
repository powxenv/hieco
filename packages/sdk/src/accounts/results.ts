import type { AccountInfo } from "@hieco/mirror";
import type { TransactionRecord } from "@hieco/runtime";
import type { TransactionReceiptData } from "../results/transaction.ts";

export interface TransferResult {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
}

export interface CreateAccountResult {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly accountId: string;
}

export interface UpdateAccountResult {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
}

export interface DeleteAccountResult {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
}

export interface AccountInfoData {
  readonly accountId: string;
  readonly account: AccountInfo;
}

export interface AccountRecordsData {
  readonly accountId: string;
  readonly records: ReadonlyArray<TransactionRecord>;
}
