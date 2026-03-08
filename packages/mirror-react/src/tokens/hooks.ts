import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type {
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseQueryResult,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { ApiResult, ApiError, PaginationParams, QueryOperator } from "@hieco/mirror";
import type { Nft, TokenBalancesResponse, TokenDistribution, TokenInfo } from "@hieco/mirror";
import type { Transaction } from "@hieco/mirror";
import type { PaginatedResponse } from "@hieco/mirror";
import { useMirrorNodeClient, useNetwork } from "../context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";

export type { TokenListParams, TokenBalancesParams, TokenNftsParams } from "@hieco/mirror";

export interface UseTokenInfoOptions extends Omit<
  UseQueryOptions<ApiResult<TokenInfo>, ApiError>,
  "queryKey" | "queryFn"
> {
  tokenId: string;
}

export type UseTokenInfoResult = UseQueryResult<ApiResult<TokenInfo>, ApiError>;

export interface UseTokenBalancesOptions extends Omit<
  UseQueryOptions<ApiResult<TokenDistribution[]>, ApiError>,
  "queryKey" | "queryFn"
> {
  tokenId: string;
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    account?: string;
    "account.balance"?: QueryOperator<number>;
  };
}

export type UseTokenBalancesResult = UseQueryResult<ApiResult<TokenDistribution[]>, ApiError>;

export interface UseTokenBalancesSnapshotOptions extends Omit<
  UseQueryOptions<ApiResult<TokenBalancesResponse>, ApiError>,
  "queryKey" | "queryFn"
> {
  tokenId: string;
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    account?: string;
    "account.balance"?: QueryOperator<number>;
  };
}

export type UseTokenBalancesSnapshotResult = UseQueryResult<
  ApiResult<TokenBalancesResponse>,
  ApiError
>;

export interface UseTokenNftsOptions extends Omit<
  UseQueryOptions<ApiResult<PaginatedResponse<Nft>>, ApiError>,
  "queryKey" | "queryFn"
> {
  tokenId: string;
  params?: { limit?: number; order?: "asc" | "desc"; serial_number?: number };
}

export type UseTokenNftsResult = UseQueryResult<ApiResult<PaginatedResponse<Nft>>, ApiError>;

export interface UseTokenNftOptions extends Omit<
  UseQueryOptions<ApiResult<Nft>, ApiError>,
  "queryKey" | "queryFn"
> {
  tokenId: string;
  serialNumber: number;
}

export type UseTokenNftResult = UseQueryResult<ApiResult<Nft>, ApiError>;

export interface UseTokenNftTransactionsOptions extends Omit<
  UseQueryOptions<ApiResult<Transaction[]>, ApiError>,
  "queryKey" | "queryFn"
> {
  tokenId: string;
  serialNumber: number;
  params?: PaginationParams;
}

export type UseTokenNftTransactionsResult = UseQueryResult<ApiResult<Transaction[]>, ApiError>;

export interface UseTokensOptions extends Omit<
  UseQueryOptions<ApiResult<TokenInfo[]>, ApiError>,
  "queryKey" | "queryFn"
> {
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    "token.id"?: string | QueryOperator<string>;
    type?: "FUNGIBLE_COMMON" | "NON_FUNGIBLE_UNIQUE";
  };
}

export type UseTokensResult = UseQueryResult<ApiResult<TokenInfo[]>, ApiError>;

export interface UseTokensInfiniteOptions extends Omit<
  UseInfiniteQueryOptions<ApiResult<PaginatedResponse<TokenInfo>>, ApiError>,
  "queryKey" | "queryFn" | "getNextPageParam"
> {
  params?: { limit?: number; order?: "asc" | "desc" };
}

export type UseTokensInfiniteResult = UseInfiniteQueryResult<
  ApiResult<PaginatedResponse<TokenInfo>>,
  ApiError
>;

export function useTokenInfo(options: UseTokenInfoOptions): UseTokenInfoResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.token.info(network, options.tokenId),
    queryFn: async () => {
      return client.token.getInfo(options.tokenId);
    },
    enabled: options.enabled !== false,
  });
}

export function useTokenBalances(options: UseTokenBalancesOptions): UseTokenBalancesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.token.balancesSnapshot(network, options.tokenId),
    queryFn: async () => {
      return client.token.getBalances(options.tokenId, options.params);
    },
    enabled: options.enabled !== false,
  });
}

export function useTokenBalancesSnapshot(
  options: UseTokenBalancesSnapshotOptions,
): UseTokenBalancesSnapshotResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.token.balances(network, options.tokenId),
    queryFn: async () => {
      return client.token.getBalancesSnapshot(options.tokenId, options.params);
    },
    enabled: options.enabled !== false,
  });
}

export function useTokenNfts(options: UseTokenNftsOptions): UseTokenNftsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.token.nfts(network, options.tokenId),
    queryFn: async () => {
      return client.token.getNfts(options.tokenId, options.params);
    },
    enabled: options.enabled !== false,
  });
}

export function useTokenNft(options: UseTokenNftOptions): UseTokenNftResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.token.nft(network, options.tokenId, options.serialNumber),
    queryFn: async () => {
      return client.token.getNft(options.tokenId, options.serialNumber);
    },
    enabled: options.enabled !== false,
  });
}

export function useTokenNftTransactions(
  options: UseTokenNftTransactionsOptions,
): UseTokenNftTransactionsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.token.nftTransactions(network, options.tokenId, options.serialNumber),
    queryFn: async () => {
      return client.token.getNftTransactions(options.tokenId, options.serialNumber, options.params);
    },
    enabled: options.enabled !== false,
  });
}

export function useTokens(options: UseTokensOptions = {}): UseTokensResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.token.list(network),
    queryFn: async () => {
      return client.token.listPaginated(options.params);
    },
  });
}

export function useTokensInfinite(options: UseTokensInfiniteOptions): UseTokensInfiniteResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useInfiniteQuery({
    ...options,
    queryKey: mirrorNodeKeys.token.list(network),
    queryFn: async ({ pageParam }) => {
      if (typeof pageParam === "string") {
        return client.token.listPaginatedPageByUrl(pageParam);
      }
      return client.token.listPaginatedPage({
        ...options.params,
        limit: options.params?.limit ?? 25,
      });
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.success) return undefined;
      return lastPage.data.links.next ?? undefined;
    },
    initialPageParam: null,
  });
}
