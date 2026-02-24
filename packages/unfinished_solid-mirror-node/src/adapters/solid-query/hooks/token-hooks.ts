import { useQuery } from "@tanstack/solid-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/solid-query";
import type {
  ApiResult,
  ApiError,
  EntityId,
  PaginationParams,
  QueryOperator,
} from "@hiecom/mirror-node";
import type { Nft, TokenDistribution, TokenInfo } from "@hiecom/mirror-node";
import type { Transaction } from "@hiecom/mirror-node";
import { useMirrorNodeClient, useNetwork } from "../../../solid/hooks";
import { mirrorNodeKeys } from "../query-keys";
import type { Accessor } from "solid-js";

function getQueryOptions(opts: Record<string, any>) {
    return {
        get enabled() { return opts.enabled; },
        get staleTime() { return opts.staleTime; },
        get gcTime() { return opts.gcTime; },
        get refetchOnWindowFocus() { return opts.refetchOnWindowFocus; },
        get refetchOnMount() { return opts.refetchOnMount; },
        get refetchOnReconnect() { return opts.refetchOnReconnect; },
        get refetchInterval() { return opts.refetchInterval; },
        get refetchIntervalInBackground() { return opts.refetchIntervalInBackground; },
        get retry() { return opts.retry; },
        get retryOnMount() { return opts.retryOnMount; },
        get retryDelay() { return opts.retryDelay; },
        get select() { return opts.select; },
        get placeholderData() { return opts.placeholderData; },
        get throwOnError() { return opts.throwOnError; },
    };
}

export type { TokenListParams, TokenBalancesParams, TokenNftsParams } from "@hiecom/mirror-node";

type TokenQueryFnData<T> = ApiResult<T>;
type TokenQueryError = ApiError;

export interface UseTokenInfoOptions extends Omit<
  UseQueryOptions<TokenQueryFnData<TokenInfo>, TokenQueryError>,
  "queryKey" | "queryFn"
> {
  tokenId: Accessor<EntityId>;
}

export type UseTokenInfoResult = UseQueryResult<TokenQueryFnData<TokenInfo>, TokenQueryError>;

export interface UseTokenBalancesOptions extends Omit<
  UseQueryOptions<TokenQueryFnData<TokenDistribution[]>, TokenQueryError>,
  "queryKey" | "queryFn"
> {
  tokenId: Accessor<EntityId>;
  params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly account?: EntityId;
    readonly "account.balance"?: QueryOperator<number>;
  };
}

export type UseTokenBalancesResult = UseQueryResult<TokenQueryFnData<TokenDistribution[]>, TokenQueryError>;

export interface UseTokenNftsOptions extends Omit<
  UseQueryOptions<TokenQueryFnData<Nft[]>, TokenQueryError>,
  "queryKey" | "queryFn"
> {
  tokenId: Accessor<EntityId>;
  params?: { readonly limit?: number; readonly order?: "asc" | "desc"; readonly serial_number?: number };
}

export type UseTokenNftsResult = UseQueryResult<TokenQueryFnData<Nft[]>, TokenQueryError>;

export interface UseTokenNftOptions extends Omit<
  UseQueryOptions<TokenQueryFnData<Nft>, TokenQueryError>,
  "queryKey" | "queryFn"
> {
  tokenId: Accessor<EntityId>;
  serialNumber: Accessor<number>;
}

export type UseTokenNftResult = UseQueryResult<TokenQueryFnData<Nft>, TokenQueryError>;

export interface UseTokenNftTransactionsOptions extends Omit<
  UseQueryOptions<TokenQueryFnData<Transaction[]>, TokenQueryError>,
  "queryKey" | "queryFn"
> {
  tokenId: Accessor<EntityId>;
  serialNumber: Accessor<number>;
  params?: PaginationParams;
}

export type UseTokenNftTransactionsResult = UseQueryResult<TokenQueryFnData<Transaction[]>, TokenQueryError>;

export interface UseTokensOptions extends Omit<
  UseQueryOptions<TokenQueryFnData<TokenInfo[]>, TokenQueryError>,
  "queryKey" | "queryFn"
> {
  params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly "token.id"?: EntityId | QueryOperator<EntityId>;
    readonly type?: "FUNGIBLE_COMMON" | "NON_FUNGIBLE_UNIQUE";
  };
}

export type UseTokensResult = UseQueryResult<TokenQueryFnData<TokenInfo[]>, TokenQueryError>;

export interface UseTokensInfiniteOptions extends Omit<
  UseQueryOptions<TokenQueryFnData<TokenInfo[]>, TokenQueryError>,
  "queryKey" | "queryFn"
> {
  params?: { readonly limit?: number; readonly order?: "asc" | "desc" };
}

export type UseTokensInfiniteResult = UseQueryResult<TokenQueryFnData<TokenInfo[]>, TokenQueryError>;

export function useTokenInfo(options: UseTokenInfoOptions): UseTokenInfoResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.token.info(network(), options.tokenId()),
    queryFn: async () => {
      return client().token.getInfo(options.tokenId());
    },
  }));
}

export function useTokenBalances(options: UseTokenBalancesOptions): UseTokenBalancesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.token.balances(network(), options.tokenId()),
    queryFn: async () => {
      return client().token.getBalances(options.tokenId(), options.params);
    },
  }));
}

export function useTokenNfts(options: UseTokenNftsOptions): UseTokenNftsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.token.nfts(network(), options.tokenId()),
    queryFn: async () => {
      return client().token.getNfts(options.tokenId(), options.params);
    },
  }));
}

export function useTokenNft(options: UseTokenNftOptions): UseTokenNftResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.token.nft(network(), options.tokenId(), options.serialNumber()),
    queryFn: async () => {
      return client().token.getNft(options.tokenId(), options.serialNumber());
    },
  }));
}

export function useTokenNftTransactions(
  options: UseTokenNftTransactionsOptions,
): UseTokenNftTransactionsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.token.nftTransactions(network(), options.tokenId(), options.serialNumber()),
    queryFn: async () => {
      return client().token.getNftTransactions(options.tokenId(), options.serialNumber(), options.params);
    },
  }));
}

export function useTokens(options: UseTokensOptions = {}): UseTokensResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.token.list(network()),
    queryFn: async () => {
      return client().token.listPaginated(options.params);
    },
  }));
}

export function useTokensInfinite(options: UseTokensInfiniteOptions): UseTokensInfiniteResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.token.list(network()),
    queryFn: async () => {
      const params = {
        ...options.params,
        limit: options.params?.limit ?? 25,
      };

      const result = client().token.listPaginated(params);

      return result;
    },
  }));
}
