import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { ApiResult, ApiError, Timestamp } from "../../../types/rest-api";
import type { BlocksResponse, Block } from "../../../types/entities/network";
import { useMirrorNodeClient } from "../../../react/hooks";
import { mirrorNodeKeys } from "../query-keys";

export type { BlocksListParams } from "../../../core/apis/block-api";

type BlockQueryFnData<T> = ApiResult<T>;
type BlockQueryError = ApiError;

export interface UseBlocksOptions extends Omit<
  UseQueryOptions<BlockQueryFnData<BlocksResponse>, BlockQueryError>,
  "queryKey" | "queryFn"
> {
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    block_number?: number;
    timestamp?: Timestamp;
  };
}

export type UseBlocksResult = UseQueryResult<
  BlockQueryFnData<BlocksResponse>,
  BlockQueryError
>;

export interface UseBlockOptions extends Omit<
  UseQueryOptions<BlockQueryFnData<Block>, BlockQueryError>,
  "queryKey" | "queryFn"
> {
  hashOrNumber: string;
}

export type UseBlockResult = UseQueryResult<BlockQueryFnData<Block>, BlockQueryError>;

export function useBlocks(
  options: UseBlocksOptions = {},
): UseBlocksResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.block.list(),
    queryFn: async () => {
      return client.block.getBlocks(options.params);
    },
  });
}

export function useBlock(
  options: UseBlockOptions,
): UseBlockResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.block.info(options.hashOrNumber),
    queryFn: async () => {
      return client.block.getBlock(options.hashOrNumber);
    },
  });
}
