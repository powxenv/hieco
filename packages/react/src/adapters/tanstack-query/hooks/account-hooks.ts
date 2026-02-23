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
import type {
  AccountInfo,
  Balance,
  CryptoAllowance,
  NftAllowance,
  StakingReward,
  TokenRelationship,
  TokenAllowance,
  TokenAirdropsResponse,
} from "../../../types/entities/account";
import { useMirrorNodeClient } from "../../../react/hooks";
import { mirrorNodeKeys } from "../query-keys";

export type { AccountListParams, AccountNftsParams } from "../../../core/apis/account-api";

export interface AccountTokenAllowancesParams {
  readonly spender?: EntityId;
  readonly "token.id"?: EntityId;
}

type AccountQueryFnData<T> = ApiResult<T>;
type AccountQueryError = ApiError;

export interface UseAccountInfoOptions extends Omit<
  UseQueryOptions<AccountQueryFnData<AccountInfo>, AccountQueryError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: EntityId;
}

export type UseAccountInfoResult = UseQueryResult<
  AccountQueryFnData<AccountInfo>,
  AccountQueryError
>;

export interface UseAccountBalancesOptions extends Omit<
  UseQueryOptions<AccountQueryFnData<Balance>, AccountQueryError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: EntityId;
}

export type UseAccountBalancesResult = UseQueryResult<
  AccountQueryFnData<Balance>,
  AccountQueryError
>;

export interface UseAccountTokensOptions extends Omit<
  UseQueryOptions<AccountQueryFnData<TokenRelationship[]>, AccountQueryError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: EntityId;
  readonly params?: PaginationParams & { readonly "token.id"?: EntityId };
}

export type UseAccountTokensResult = UseQueryResult<
  AccountQueryFnData<TokenRelationship[]>,
  AccountQueryError
>;

export interface UseAccountNftsOptions extends Omit<
  UseQueryOptions<AccountQueryFnData<TokenRelationship[]>, AccountQueryError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: EntityId;
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly "token.id"?: EntityId;
    readonly serial_number?: number;
  };
}

export type UseAccountNftsResult = UseQueryResult<
  AccountQueryFnData<TokenRelationship[]>,
  AccountQueryError
>;

export interface UseAccountStakingRewardsOptions extends Omit<
  UseQueryOptions<AccountQueryFnData<StakingReward[]>, AccountQueryError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: EntityId;
  readonly params?: PaginationParams & { readonly timestamp?: string };
}

export type UseAccountStakingRewardsResult = UseQueryResult<
  AccountQueryFnData<StakingReward[]>,
  AccountQueryError
>;

export interface UseAccountCryptoAllowancesOptions extends Omit<
  UseQueryOptions<AccountQueryFnData<CryptoAllowance[]>, AccountQueryError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: EntityId;
}

export type UseAccountCryptoAllowancesResult = UseQueryResult<
  AccountQueryFnData<CryptoAllowance[]>,
  AccountQueryError
>;

export interface UseAccountTokenAllowancesOptions extends Omit<
  UseQueryOptions<AccountQueryFnData<TokenAllowance[]>, AccountQueryError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: EntityId;
  readonly params?: AccountTokenAllowancesParams;
}

export type UseAccountTokenAllowancesResult = UseQueryResult<
  AccountQueryFnData<TokenAllowance[]>,
  AccountQueryError
>;

export interface UseAccountNftAllowancesOptions extends Omit<
  UseQueryOptions<AccountQueryFnData<NftAllowance[]>, AccountQueryError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: EntityId;
  readonly params?: { readonly "token.id"?: EntityId };
}

export type UseAccountNftAllowancesResult = UseQueryResult<
  AccountQueryFnData<NftAllowance[]>,
  AccountQueryError
>;

export interface UseAccountsOptions extends Omit<
  UseQueryOptions<AccountQueryFnData<AccountInfo[]>, AccountQueryError>,
  "queryKey" | "queryFn"
> {
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly account?: EntityId | QueryOperator<EntityId>;
    readonly alias?: string;
  };
}

export type UseAccountsResult = UseQueryResult<
  AccountQueryFnData<AccountInfo[]>,
  AccountQueryError
>;

export interface UseAccountsInfiniteOptions extends Omit<
  UseInfiniteQueryOptions<AccountQueryFnData<AccountInfo[]>, AccountQueryError>,
  "queryKey" | "queryFn" | "getNextPageParam"
> {
  readonly params?: { readonly limit?: number; readonly order?: "asc" | "desc" };
}

export type UseAccountsInfiniteResult = UseInfiniteQueryResult<
  AccountQueryFnData<AccountInfo[]>,
  AccountQueryError
>;

export function useAccountInfo(options: UseAccountInfoOptions): UseAccountInfoResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.info(options.accountId),
    queryFn: async () => {
      return client.account.getInfo(options.accountId);
    },
  });
}

export function useAccountBalances(options: UseAccountBalancesOptions): UseAccountBalancesResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.balances(options.accountId),
    queryFn: async () => {
      return client.account.getBalances(options.accountId);
    },
  });
}

export function useAccountTokens(options: UseAccountTokensOptions): UseAccountTokensResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.tokens(options.accountId),
    queryFn: async () => {
      return client.account.getTokens(options.accountId, options.params);
    },
  });
}

export function useAccountNfts(options: UseAccountNftsOptions): UseAccountNftsResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.nfts(options.accountId),
    queryFn: async () => {
      return client.account.getNfts(options.accountId, options.params);
    },
  });
}

export function useAccountStakingRewards(
  options: UseAccountStakingRewardsOptions,
): UseAccountStakingRewardsResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.stakingRewards(options.accountId),
    queryFn: async () => {
      return client.account.getStakingRewards(options.accountId, options.params);
    },
  });
}

export function useAccountCryptoAllowances(
  options: UseAccountCryptoAllowancesOptions,
): UseAccountCryptoAllowancesResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.cryptoAllowances(options.accountId),
    queryFn: async () => {
      return client.account.getCryptoAllowances(options.accountId);
    },
  });
}

export function useAccountTokenAllowances(
  options: UseAccountTokenAllowancesOptions,
): UseAccountTokenAllowancesResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.tokenAllowances(options.accountId),
    queryFn: async () => {
      return client.account.getTokenAllowances(options.accountId, options.params);
    },
  });
}

export function useAccountNftAllowances(
  options: UseAccountNftAllowancesOptions,
): UseAccountNftAllowancesResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.nftAllowances(options.accountId),
    queryFn: async () => {
      return client.account.getNftAllowances(options.accountId, options.params);
    },
  });
}

export function useAccounts(options: UseAccountsOptions = {}): UseAccountsResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.list(),
    queryFn: async () => {
      return client.account.listPaginated(options.params);
    },
  });
}

export function useAccountsInfinite(
  options: UseAccountsInfiniteOptions,
): UseAccountsInfiniteResult {
  const client = useMirrorNodeClient();

  return useInfiniteQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.list(),
    queryFn: async () => {
      const params = {
        ...options.params,
        limit: options.params?.limit ?? 25,
      };

      const result = await client.account.listPaginated(params);

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

export interface UseAccountOutstandingAirdropsOptions extends Omit<
  UseQueryOptions<AccountQueryFnData<TokenAirdropsResponse>, AccountQueryError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: EntityId;
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly "receiver.id"?: EntityId;
    readonly serial_number?: number;
    readonly "token.id"?: EntityId;
  };
}

export type UseAccountOutstandingAirdropsResult = UseQueryResult<
  AccountQueryFnData<TokenAirdropsResponse>,
  AccountQueryError
>;

export interface UseAccountPendingAirdropsOptions extends Omit<
  UseQueryOptions<AccountQueryFnData<TokenAirdropsResponse>, AccountQueryError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: EntityId;
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly "sender.id"?: EntityId;
    readonly serial_number?: number;
    readonly "token.id"?: EntityId;
  };
}

export type UseAccountPendingAirdropsResult = UseQueryResult<
  AccountQueryFnData<TokenAirdropsResponse>,
  AccountQueryError
>;

export function useAccountOutstandingAirdrops(
  options: UseAccountOutstandingAirdropsOptions,
): UseAccountOutstandingAirdropsResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.outstandingAirdrops(options.accountId),
    queryFn: async () => {
      return client.account.getOutstandingAirdrops(options.accountId, options.params);
    },
  });
}

export function useAccountPendingAirdrops(
  options: UseAccountPendingAirdropsOptions,
): UseAccountPendingAirdropsResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.pendingAirdrops(options.accountId),
    queryFn: async () => {
      return client.account.getPendingAirdrops(options.accountId, options.params);
    },
  });
}
