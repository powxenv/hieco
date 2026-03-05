import type { Result } from "../../shared/results.ts";
import type { TransactionRecordData } from "../../shared/results-shapes.ts";

export interface TransactionsNamespace {
  record: (transactionId: string) => Promise<Result<TransactionRecordData>>;
}

export function createTransactionsNamespace(context: {
  readonly queryRecord: (
    transactionId: string,
  ) => Promise<Result<import("@hiero-ledger/sdk").TransactionRecord>>;
}): TransactionsNamespace {
  const record = async (transactionId: string): Promise<Result<TransactionRecordData>> => {
    const result = await context.queryRecord(transactionId);
    if (!result.ok) return result;
    return { ok: true, value: { transactionId, record: result.value } };
  };

  return { record };
}
