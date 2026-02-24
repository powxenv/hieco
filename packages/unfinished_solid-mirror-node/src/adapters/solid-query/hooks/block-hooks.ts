import { useQuery } from "@tanstack/solid-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/solid-query";
import type { ApiResult, ApiError, Timestamp } from "@hiecom/mirror-node";
import type { BlocksResponse, Block } from "@hiecom/mirror-node";
import { useMirrorNodeClient, useNetwork } from "../../../solid/hooks";
import { mirrorNodeKeys } from "../query-keys";
import type { Accessor } from "solid-js";

export type { BlocksListParams } from "@hiecom/mirror-node";

type BlockQueryFnData<T> = ApiResult<T>;
type BlockQueryError = ApiError;

export interface UseBlocksOptions extends Omit<
  UseQueryOptions<BlockQueryFnData<BlocksResponse>, BlockQueryError>,
  "queryKey" | "queryFn"
> {
  params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly block_number?: number;
    readonly timestamp?: Timestamp;
  };
}

export type UseBlocksResult = UseQueryResult<BlockQueryFnData<BlocksResponse>, BlockQueryError>;

export interface UseBlockOptions extends Omit<
  UseQueryOptions<BlockQueryFnData<Block>, BlockQueryError>,
  "queryKey" | "queryFn"
> {
  hashOrNumber: Accessor<string>;
}

export type UseBlockResult = UseQueryResult<BlockQueryFnData<Block>, BlockQueryError>;

export function useBlocks(options: UseBlocksOptions = {}): UseBlocksResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.block.list(network()),
    queryFn: async () => {
      return client().block.getBlocks(options.params);
    },
  }));
}

export function useBlock(options: UseBlockOptions): UseBlockResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.block.info(network(), options.hashOrNumber()),
    queryFn: async () => {
      return client().block.getBlock(options.hashOrNumber());
    },
  }));
}
