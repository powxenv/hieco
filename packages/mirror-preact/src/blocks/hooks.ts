import { useQuery } from "@tanstack/preact-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/preact-query";
import type { ApiResult, ApiError } from "@hieco/mirror";
import type { BlocksResponse, Block } from "@hieco/mirror";
import { useMirrorNodeClient, useNetwork } from "../context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";

export type { BlocksListParams } from "@hieco/mirror";

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
    timestamp?: string;
  };
}

export type UseBlocksResult = UseQueryResult<BlockQueryFnData<BlocksResponse>, BlockQueryError>;

export interface UseBlockOptions extends Omit<
  UseQueryOptions<BlockQueryFnData<Block>, BlockQueryError>,
  "queryKey" | "queryFn"
> {
  hashOrNumber: string;
}

export type UseBlockResult = UseQueryResult<BlockQueryFnData<Block>, BlockQueryError>;

export function useBlocks(options: UseBlocksOptions = {}): UseBlocksResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.block.list(network),
    queryFn: async () => {
      return client.block.getBlocks(options.params);
    },
  });
}

export function useBlock(options: UseBlockOptions): UseBlockResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.block.info(network, options.hashOrNumber),
    queryFn: async () => {
      return client.block.getBlock(options.hashOrNumber);
    },
  });
}
