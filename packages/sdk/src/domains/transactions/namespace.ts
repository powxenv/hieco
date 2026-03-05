import type { Result } from "../../shared/results.ts";
import type {
  TransactionRecordData,
  TransactionReceiptQueryData,
} from "../../shared/results-shapes.ts";

export type TransactionIdInput = string | { readonly transactionId: string };

export type TransactionReceiptQueryOptions = {
  readonly includeChildren?: boolean;
  readonly includeDuplicates?: boolean;
  readonly validateStatus?: boolean;
};

export interface TransactionsNamespace {
  record: (transactionId: TransactionIdInput) => Promise<Result<TransactionRecordData>>;
  receipt: (
    transactionId: TransactionIdInput,
    options?: TransactionReceiptQueryOptions,
  ) => Promise<Result<TransactionReceiptQueryData>>;
}

export function createTransactionsNamespace(context: {
  readonly queryRecord: (transactionId: string) => Promise<
    Result<import("@hiero-ledger/sdk").TransactionRecord>
  >;
  readonly queryReceipt: (
    transactionId: string,
    options?: TransactionReceiptQueryOptions,
  ) => Promise<Result<import("@hiero-ledger/sdk").TransactionReceipt>>;
}): TransactionsNamespace {
  const resolveId = (input: TransactionIdInput): string =>
    typeof input === "string" ? input : input.transactionId;

  const record = async (transactionId: TransactionIdInput): Promise<Result<TransactionRecordData>> => {
    const id = resolveId(transactionId);
    const result = await context.queryRecord(id);
    if (!result.ok) return result;
    return { ok: true, value: { transactionId: id, record: result.value } };
  };

  const receipt = async (
    transactionId: TransactionIdInput,
    options?: TransactionReceiptQueryOptions,
  ): Promise<Result<TransactionReceiptQueryData>> => {
    const id = resolveId(transactionId);
    const result = await context.queryReceipt(id, options);
    if (!result.ok) return result;
    return { ok: true, value: { transactionId: id, receipt: result.value } };
  };

  return { record, receipt };
}
