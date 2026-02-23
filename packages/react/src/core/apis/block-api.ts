import type { ApiResult, PaginationParams, Timestamp } from "../../types/rest-api";
import type { BlocksResponse, Block } from "../../types/entities/network";
import type { CursorPaginator } from "../builders";
import { BaseApi } from "../base-api";

export interface BlocksListParams extends PaginationParams {
  block_number?: number;
  timestamp?: Timestamp;
}

export class BlockApi extends BaseApi {
  private buildBlocksParams(params?: BlocksListParams): Record<string, string> {
    const builder = this.createQueryBuilder();

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

  createBlocksPaginator(params?: BlocksListParams): CursorPaginator<Block> {
    return super.createPaginator<Block>("blocks", this.buildBlocksParams(params));
  }
}
