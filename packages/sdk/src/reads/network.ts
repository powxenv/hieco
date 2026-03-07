import type { PaginationParams } from "@hieco/mirror";
import type { NetworkNodesParams, ReadsNamespace } from "./namespace.ts";
import { readPage, readSingle, type ReadsContext, withDefaultLimit } from "./shared.ts";

export function createNetworkReads(context: ReadsContext): ReadsNamespace["network"] {
  const exchangeRate = async (params?: { readonly timestamp?: string }) => {
    return readSingle(
      await context.mirror.network.getExchangeRate(params),
      "Mirror network.getExchangeRate failed",
    );
  };

  const fees = async (params?: PaginationParams & { readonly timestamp?: string }) => {
    return readSingle(
      await context.mirror.network.getFees(params),
      "Mirror network.getFees failed",
    );
  };

  const nodes = async (params?: NetworkNodesParams) => {
    return readPage(
      await context.mirror.network.listPaginatedPage(withDefaultLimit(params)),
      "Mirror network.listPaginatedPage failed",
    );
  };

  const nodesPageByUrl = async (url: string) => {
    return readPage(
      await context.mirror.network.listPaginatedPageByUrl(url),
      "Mirror network.listPaginatedPageByUrl failed",
    );
  };

  const stake = async () => {
    return readSingle(await context.mirror.network.getStake(), "Mirror network.getStake failed");
  };

  const supply = async () => {
    return readSingle(await context.mirror.network.getSupply(), "Mirror network.getSupply failed");
  };

  return {
    exchangeRate,
    fees,
    nodes,
    nodesPageByUrl,
    stake,
    supply,
  };
}
