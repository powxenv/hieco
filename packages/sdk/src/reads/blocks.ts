import type { BlocksListParams, ReadsNamespace } from "./namespace.ts";
import { readPage, readSingle, type ReadsContext, withDefaultLimit } from "./shared.ts";

export function createBlocksReads(context: ReadsContext): ReadsNamespace["blocks"] {
  const snapshot = async (params?: BlocksListParams) => {
    return readSingle(
      await context.mirror.block.getBlocks(params),
      "Mirror block.getBlocks failed",
    );
  };

  const list = async (params?: BlocksListParams) => {
    return readPage(
      await context.mirror.block.listPaginatedPage(withDefaultLimit(params)),
      "Mirror block.listPaginatedPage failed",
    );
  };

  const listPageByUrl = async (url: string) => {
    return readPage(
      await context.mirror.block.listPaginatedPageByUrl(url),
      "Mirror block.listPaginatedPageByUrl failed",
    );
  };

  const get = async (hashOrNumber: string) => {
    return readSingle(
      await context.mirror.block.getBlock(hashOrNumber),
      "Mirror block.getBlock failed",
    );
  };

  return {
    snapshot,
    list,
    listPageByUrl,
    get,
  };
}
