import { useQuery, useInfiniteQuery } from "@tanstack/preact-query";
import type {
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseQueryResult,
  UseInfiniteQueryResult,
} from "@tanstack/preact-query";
import type { ApiResult, ApiError, EntityId, PaginationParams, QueryOperator } from "@hieco/mirror";
import type { Nft, TokenBalancesResponse, TokenDistribution, TokenInfo } from "@hieco/mirror";
import type { Transaction } from "@hieco/mirror";
import type { PaginatedResponse } from "@hieco/mirror";
import { useMirrorNodeClient, useNetwork } from "../context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";

export type { TokenListParams, TokenBalancesParams, TokenNftsParams } from "@hieco/mirror";

type TokenQueryFnData<T> = ApiResult<T>;
type TokenQueryError = ApiError;

export interface UseTokenInfoOptions extends Omit<
  UseQueryOptions<TokenQueryFnData<TokenInfo>, TokenQueryError>,
  "queryKey" | "queryFn"
> {
  tokenId: EntityId;
}

export type UseTokenInfoResult = UseQueryResult<TokenQueryFnData<TokenInfo>, TokenQueryError>;

export interface UseTokenBalancesOptions extends Omit<
  UseQueryOptions<TokenQueryFnData<TokenDistribution[]>, TokenQueryError>,
  "queryKey" | "queryFn"
> {
  tokenId: EntityId;
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    account?: EntityId;
    "account.balance"?: QueryOperator<number>;
  };
}

export type UseTokenBalancesResult = UseQueryResult<
  TokenQueryFnData<TokenDistribution[]>,
  TokenQueryError
>;

export interface UseTokenBalancesSnapshotOptions extends Omit<
  UseQueryOptions<TokenQueryFnData<TokenBalancesResponse>, TokenQueryError>,
  "queryKey" | "queryFn"
> {
  tokenId: EntityId;
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    account?: EntityId;
    "account.balance"?: QueryOperator<number>;
  };
}

export type UseTokenBalancesSnapshotResult = UseQueryResult<
  TokenQueryFnData<TokenBalancesResponse>,
  TokenQueryError
>;

export interface UseTokenNftsOptions extends Omit<
  UseQueryOptions<TokenQueryFnData<PaginatedResponse<Nft>>, TokenQueryError>,
  "queryKey" | "queryFn"
> {
  tokenId: EntityId;
  params?: { limit?: number; order?: "asc" | "desc"; serial_number?: number };
}

export type UseTokenNftsResult = UseQueryResult<
  TokenQueryFnData<PaginatedResponse<Nft>>,
  TokenQueryError
>;

export interface UseTokenNftOptions extends Omit<
  UseQueryOptions<TokenQueryFnData<Nft>, TokenQueryError>,
  "queryKey" | "queryFn"
> {
  tokenId: EntityId;
  serialNumber: number;
}

export type UseTokenNftResult = UseQueryResult<TokenQueryFnData<Nft>, TokenQueryError>;

export interface UseTokenNftTransactionsOptions extends Omit<
  UseQueryOptions<TokenQueryFnData<Transaction[]>, TokenQueryError>,
  "queryKey" | "queryFn"
> {
  tokenId: EntityId;
  serialNumber: number;
  params?: PaginationParams;
}

export type UseTokenNftTransactionsResult = UseQueryResult<
  TokenQueryFnData<Transaction[]>,
  TokenQueryError
>;

export interface UseTokensOptions extends Omit<
  UseQueryOptions<TokenQueryFnData<TokenInfo[]>, TokenQueryError>,
  "queryKey" | "queryFn"
> {
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    "token.id"?: EntityId | QueryOperator<EntityId>;
    type?: "FUNGIBLE_COMMON" | "NON_FUNGIBLE_UNIQUE";
  };
}

export type UseTokensResult = UseQueryResult<TokenQueryFnData<TokenInfo[]>, TokenQueryError>;

export interface UseTokensInfiniteOptions extends Omit<
  UseInfiniteQueryOptions<TokenQueryFnData<PaginatedResponse<TokenInfo>>, TokenQueryError>,
  "queryKey" | "queryFn" | "getNextPageParam"
> {
  params?: { limit?: number; order?: "asc" | "desc" };
}

export type UseTokensInfiniteResult = UseInfiniteQueryResult<
  TokenQueryFnData<PaginatedResponse<TokenInfo>>,
  TokenQueryError
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
