import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type {
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseQueryResult,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type {
  ApiResult,
  ApiError,
  EntityId,
  PaginationParams,
  QueryOperator,
} from "../../../types/rest-api";
import type { Nft, TokenDistribution, TokenInfo } from "../../../types/entities/token";
import type { Transaction } from "../../../types/entities/transaction";
import { useMirrorNodeClient } from "../../../react/hooks";
import { mirrorNodeKeys } from "../query-keys";

export type {
  TokenListParams,
  TokenBalancesParams,
  TokenNftsParams,
} from "../../../core/apis/token-api";

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

export interface UseTokenNftsOptions extends Omit<
  UseQueryOptions<TokenQueryFnData<Nft[]>, TokenQueryError>,
  "queryKey" | "queryFn"
> {
  tokenId: EntityId;
  params?: { limit?: number; order?: "asc" | "desc"; serial_number?: number };
}

export type UseTokenNftsResult = UseQueryResult<TokenQueryFnData<Nft[]>, TokenQueryError>;

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
  UseInfiniteQueryOptions<TokenQueryFnData<TokenInfo[]>, TokenQueryError>,
  "queryKey" | "queryFn" | "getNextPageParam"
> {
  params?: { limit?: number; order?: "asc" | "desc" };
}

export type UseTokensInfiniteResult = UseInfiniteQueryResult<
  TokenQueryFnData<TokenInfo[]>,
  TokenQueryError
>;

export function useTokenInfo(options: UseTokenInfoOptions): UseTokenInfoResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.token.info(options.tokenId),
    queryFn: async () => {
      return client.token.getInfo(options.tokenId);
    },
    enabled: options.enabled !== false,
  });
}

export function useTokenBalances(options: UseTokenBalancesOptions): UseTokenBalancesResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.token.balances(options.tokenId),
    queryFn: async () => {
      return client.token.getBalances(options.tokenId, options.params);
    },
    enabled: options.enabled !== false,
  });
}

export function useTokenNfts(options: UseTokenNftsOptions): UseTokenNftsResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.token.nfts(options.tokenId),
    queryFn: async () => {
      return client.token.getNfts(options.tokenId, options.params);
    },
    enabled: options.enabled !== false,
  });
}

export function useTokenNft(options: UseTokenNftOptions): UseTokenNftResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.token.nft(options.tokenId, options.serialNumber),
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

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.token.nftTransactions(options.tokenId, options.serialNumber),
    queryFn: async () => {
      return client.token.getNftTransactions(options.tokenId, options.serialNumber, options.params);
    },
    enabled: options.enabled !== false,
  });
}

export function useTokens(options: UseTokensOptions = {}): UseTokensResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.token.list(),
    queryFn: async () => {
      return client.token.listPaginated(options.params);
    },
  });
}

export function useTokensInfinite(options: UseTokensInfiniteOptions): UseTokensInfiniteResult {
  const client = useMirrorNodeClient();

  return useInfiniteQuery({
    ...options,
    queryKey: mirrorNodeKeys.token.list(),
    queryFn: async () => {
      const params = {
        ...options.params,
        limit: options.params?.limit ?? 25,
      };

      const result = await client.token.listPaginated(params);

      return result;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.success || lastPage.data.length === 0) {
        return undefined;
      }
      return lastPage.data.length;
    },
    initialPageParam: 0,
  });
}
