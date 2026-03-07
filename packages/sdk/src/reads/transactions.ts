import type {
  ReadsNamespace,
  TransactionSearchParams,
  TransactionsByAccountParams,
} from "./namespace.ts";
import { readList, readPage, readSingle, type ReadsContext, withDefaultLimit } from "./shared.ts";

export function createTransactionsReads(context: ReadsContext): ReadsNamespace["transactions"] {
  const get = async (
    transactionId: string,
    params?: { readonly nonce?: number; readonly scheduled?: boolean },
  ) => {
    return readSingle(
      await context.mirror.transaction.getById(transactionId, params),
      "Mirror transaction.getById failed",
    );
  };

  const byAccount = async (accountId: string, params?: TransactionsByAccountParams) => {
    return readList(
      await context.mirror.transaction.listByAccount(accountId, params),
      "Mirror transaction.listByAccount failed",
    );
  };

  const list = async (params?: TransactionSearchParams) => {
    return readPage(
      await context.mirror.transaction.listPaginatedPage(withDefaultLimit(params)),
      "Mirror transaction.listPaginatedPage failed",
    );
  };

  const listPageByUrl = async (url: string) => {
    return readPage(
      await context.mirror.transaction.listPaginatedPageByUrl(url),
      "Mirror transaction.listPaginatedPageByUrl failed",
    );
  };

  const search = async (params?: TransactionSearchParams) => {
    return readPage(
      await context.mirror.transaction.listPaginatedPage(withDefaultLimit(params)),
      "Mirror transaction.listPaginatedPage failed",
    );
  };

  return {
    get,
    byAccount,
    list,
    listPageByUrl,
    search,
  };
}
