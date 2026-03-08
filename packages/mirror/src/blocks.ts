import type { ApiResult, PaginationParams } from "@hieco/utils";
import type { Block, BlocksResponse } from "./network";
import { QueryBuilder, type CursorPaginator, type PaginatedResponse } from "./shared/builders";
import { BaseApi } from "./shared/base";

export interface BlocksListParams extends PaginationParams {
  block_number?: number;
  timestamp?: string;
}

export class BlockApi extends BaseApi {
  private buildBlocksParams(params?: BlocksListParams): Record<string, string> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.block_number !== undefined) {
        builder.add("block.number", params.block_number);
      }
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
    }

    return builder.build();
  }

  async getBlocks(params?: BlocksListParams): Promise<ApiResult<BlocksResponse>> {
    return this.getSingle<BlocksResponse>("blocks", this.buildBlocksParams(params));
  }

  async getBlock(hashOrNumber: string): Promise<ApiResult<Block>> {
    return this.getSingle<Block>(`blocks/${hashOrNumber}`);
  }

  async listPaginated(params?: BlocksListParams): Promise<ApiResult<Block[]>> {
    return this.getAllPaginated<Block>("blocks", this.buildBlocksParams(params));
  }

  async listPaginatedPage(params?: BlocksListParams): Promise<ApiResult<PaginatedResponse<Block>>> {
    return this.getSinglePage<Block>("blocks", this.buildBlocksParams(params));
  }

  async listPaginatedPageByUrl(url: string): Promise<ApiResult<PaginatedResponse<Block>>> {
    return this.getSinglePageByUrl<Block>(url);
  }

  createBlocksPaginator(params?: BlocksListParams): CursorPaginator<Block> {
    return super.createPaginator<Block>("blocks", this.buildBlocksParams(params));
  }
}
