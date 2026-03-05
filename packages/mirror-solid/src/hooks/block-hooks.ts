import { useQuery } from "@tanstack/solid-query";
import type { UseQueryResult } from "@tanstack/solid-query";
import type { ApiResult, ApiError, Timestamp } from "@hieco/mirror";
import type { BlocksResponse, Block } from "@hieco/mirror";
import type { Accessor } from "solid-js";
import { useMirrorNodeClient, useNetwork } from "../context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";

export type { BlocksListParams } from "@hieco/mirror";

export interface CreateBlocksOptions {
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly block_number?: number;
    readonly timestamp?: Timestamp;
  };
  readonly enabled?: boolean;
}

export type CreateBlocksResult = UseQueryResult<ApiResult<BlocksResponse>, ApiError>;

export interface CreateBlockOptions {
  readonly hashOrNumber: string;
  readonly enabled?: boolean;
}

export type CreateBlockResult = UseQueryResult<ApiResult<Block>, ApiError>;

export function createBlocks(
  options: Accessor<CreateBlocksOptions> = () => ({}),
): CreateBlocksResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.block.list(network()),
      queryFn: async () => {
        return client().block.getBlocks(opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createBlock(options: Accessor<CreateBlockOptions>): CreateBlockResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.block.info(network(), opts.hashOrNumber),
      queryFn: async () => {
        return client().block.getBlock(opts.hashOrNumber);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}
