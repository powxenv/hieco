import type { BalancesListParams, ReadsNamespace } from "./namespace.ts";
import { readPage, readSingle, type ReadsContext, withDefaultLimit } from "./shared.ts";

export function createBalancesReads(context: ReadsContext): ReadsNamespace["balances"] {
  const snapshot = async (params?: BalancesListParams) => {
    return readSingle(
      await context.mirror.balance.getBalances(params),
      "Mirror balance.getBalances failed",
    );
  };

  const list = async (params?: BalancesListParams) => {
    return readPage(
      await context.mirror.balance.listPaginatedPage(withDefaultLimit(params)),
      "Mirror balance.listPaginatedPage failed",
    );
  };

  const listPageByUrl = async (url: string) => {
    return readPage(
      await context.mirror.balance.listPaginatedPageByUrl(url),
      "Mirror balance.listPaginatedPageByUrl failed",
    );
  };

  return {
    snapshot,
    list,
    listPageByUrl,
  };
}
