import type { Result } from "../results/result.ts";
import type {
  TransactionRecordData,
  TransactionReceiptQueryData,
  TransactionReceiptData,
} from "../results/shapes.ts";
import type { TransactionDescriptor } from "../shared/params.ts";

export type TransactionReceiptQueryOptions = {
  readonly includeChildren?: boolean;
  readonly includeDuplicates?: boolean;
  readonly validateStatus?: boolean;
};

export interface TransactionsNamespace {
  submit: (descriptor: TransactionDescriptor) => Promise<Result<TransactionReceiptData>>;
  record: (transactionId: string) => Promise<Result<TransactionRecordData>>;
  receipt: (
    transactionId: string,
    options?: TransactionReceiptQueryOptions,
  ) => Promise<Result<TransactionReceiptQueryData>>;
}

export function createTransactionsNamespace(context: {
  readonly submit: (descriptor: TransactionDescriptor) => Promise<Result<TransactionReceiptData>>;
  readonly queryRecord: (
    transactionId: string,
  ) => Promise<Result<import("@hieco/runtime").TransactionRecord>>;
  readonly queryReceipt: (
    transactionId: string,
    options?: TransactionReceiptQueryOptions,
  ) => Promise<Result<import("@hieco/runtime").TransactionReceipt>>;
}): TransactionsNamespace {
  const record = async (transactionId: string): Promise<Result<TransactionRecordData>> => {
    const result = await context.queryRecord(transactionId);
    if (!result.ok) return result;
    return { ok: true, value: { transactionId, record: result.value } };
  };

  const receipt = async (
    transactionId: string,
    options?: TransactionReceiptQueryOptions,
  ): Promise<Result<TransactionReceiptQueryData>> => {
    const result = await context.queryReceipt(transactionId, options);
    if (!result.ok) return result;
    return { ok: true, value: { transactionId, receipt: result.value } };
  };

  return {
    submit: (descriptor: TransactionDescriptor) => context.submit(descriptor),
    record,
    receipt,
  };
}
