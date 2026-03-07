import { useQuery, useInfiniteQuery } from "@tanstack/preact-query";
import type {
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseQueryResult,
  UseInfiniteQueryResult,
} from "@tanstack/preact-query";
import type { ApiResult, ApiError, PaginationParams, QueryOperator } from "@hieco/mirror";
import type {
  AccountInfo,
  Balance,
  CryptoAllowance,
  NftAllowance,
  StakingReward,
  TokenRelationship,
  TokenAllowance,
  TokenAirdropsResponse,
} from "@hieco/mirror";
import type { PaginatedResponse } from "@hieco/mirror";
import { useMirrorNodeClient, useNetwork } from "../context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";

export type { AccountListParams, AccountNftsParams } from "@hieco/mirror";

export interface AccountTokenAllowancesParams {
  readonly spender?: string;
  readonly "token.id"?: string;
}

type AccountQueryFnData<T> = ApiResult<T>;
type AccountQueryError = ApiError;

export interface UseAccountInfoOptions extends Omit<
  UseQueryOptions<AccountQueryFnData<AccountInfo>, AccountQueryError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: string;
}

export type UseAccountInfoResult = UseQueryResult<
  AccountQueryFnData<AccountInfo>,
  AccountQueryError
>;

export interface UseAccountBalancesOptions extends Omit<
  UseQueryOptions<AccountQueryFnData<Balance>, AccountQueryError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: string;
}

export type UseAccountBalancesResult = UseQueryResult<
  AccountQueryFnData<Balance>,
  AccountQueryError
>;

export interface UseAccountTokensOptions extends Omit<
  UseQueryOptions<AccountQueryFnData<TokenRelationship[]>, AccountQueryError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: string;
  readonly params?: PaginationParams & { readonly "token.id"?: string };
}

export type UseAccountTokensResult = UseQueryResult<
  AccountQueryFnData<TokenRelationship[]>,
  AccountQueryError
>;

export interface UseAccountNftsOptions extends Omit<
  UseQueryOptions<AccountQueryFnData<TokenRelationship[]>, AccountQueryError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: string;
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly "token.id"?: string;
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
  readonly accountId: string;
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
  readonly accountId: string;
}

export type UseAccountCryptoAllowancesResult = UseQueryResult<
  AccountQueryFnData<CryptoAllowance[]>,
  AccountQueryError
>;

export interface UseAccountTokenAllowancesOptions extends Omit<
  UseQueryOptions<AccountQueryFnData<TokenAllowance[]>, AccountQueryError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: string;
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
  readonly accountId: string;
  readonly params?: { readonly "token.id"?: string };
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
    readonly account?: string | QueryOperator<string>;
    readonly alias?: string;
  };
}

export type UseAccountsResult = UseQueryResult<
  AccountQueryFnData<AccountInfo[]>,
  AccountQueryError
>;

export interface UseAccountsInfiniteOptions extends Omit<
  UseInfiniteQueryOptions<AccountQueryFnData<PaginatedResponse<AccountInfo>>, AccountQueryError>,
  "queryKey" | "queryFn" | "getNextPageParam"
> {
  readonly params?: { readonly limit?: number; readonly order?: "asc" | "desc" };
}

export type UseAccountsInfiniteResult = UseInfiniteQueryResult<
  AccountQueryFnData<PaginatedResponse<AccountInfo>>,
  AccountQueryError
>;

export function useAccountInfo(options: UseAccountInfoOptions): UseAccountInfoResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.info(network, options.accountId),
    queryFn: async () => {
      return client.account.getInfo(options.accountId);
    },
  });
}

export function useAccountBalances(options: UseAccountBalancesOptions): UseAccountBalancesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.balances(network, options.accountId),
    queryFn: async () => {
      return client.account.getBalances(options.accountId);
    },
  });
}

export function useAccountTokens(options: UseAccountTokensOptions): UseAccountTokensResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.tokens(network, options.accountId),
    queryFn: async () => {
      return client.account.getTokens(options.accountId, options.params);
    },
  });
}

export function useAccountNfts(options: UseAccountNftsOptions): UseAccountNftsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.nfts(network, options.accountId),
    queryFn: async () => {
      return client.account.getNfts(options.accountId, options.params);
    },
  });
}

export function useAccountStakingRewards(
  options: UseAccountStakingRewardsOptions,
): UseAccountStakingRewardsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.stakingRewards(network, options.accountId),
    queryFn: async () => {
      return client.account.getStakingRewards(options.accountId, options.params);
    },
  });
}

export function useAccountCryptoAllowances(
  options: UseAccountCryptoAllowancesOptions,
): UseAccountCryptoAllowancesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.cryptoAllowances(network, options.accountId),
    queryFn: async () => {
      return client.account.getCryptoAllowances(options.accountId);
    },
  });
}

export function useAccountTokenAllowances(
  options: UseAccountTokenAllowancesOptions,
): UseAccountTokenAllowancesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.tokenAllowances(network, options.accountId),
    queryFn: async () => {
      return client.account.getTokenAllowances(options.accountId, options.params);
    },
  });
}

export function useAccountNftAllowances(
  options: UseAccountNftAllowancesOptions,
): UseAccountNftAllowancesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.nftAllowances(network, options.accountId),
    queryFn: async () => {
      return client.account.getNftAllowances(options.accountId, options.params);
    },
  });
}

export function useAccounts(options: UseAccountsOptions = {}): UseAccountsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.list(network),
    queryFn: async () => {
      return client.account.listPaginated(options.params);
    },
  });
}

export function useAccountsInfinite(
  options: UseAccountsInfiniteOptions,
): UseAccountsInfiniteResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useInfiniteQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.list(network),
    queryFn: async ({ pageParam }) => {
      if (typeof pageParam === "string") {
        return client.account.listPaginatedPageByUrl(pageParam);
      }
      const params = {
        ...options.params,
        limit: options.params?.limit ?? 25,
      };
      return client.account.listPaginatedPage(params);
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.success) return undefined;
      return lastPage.data.links.next ?? undefined;
    },
    initialPageParam: null,
  });
}

export interface UseAccountOutstandingAirdropsOptions extends Omit<
  UseQueryOptions<AccountQueryFnData<TokenAirdropsResponse>, AccountQueryError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: string;
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly "receiver.id"?: string;
    readonly serial_number?: number;
    readonly "token.id"?: string;
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
  readonly accountId: string;
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly "sender.id"?: string;
    readonly serial_number?: number;
    readonly "token.id"?: string;
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
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.outstandingAirdrops(network, options.accountId),
    queryFn: async () => {
      return client.account.getOutstandingAirdrops(options.accountId, options.params);
    },
  });
}

export function useAccountPendingAirdrops(
  options: UseAccountPendingAirdropsOptions,
): UseAccountPendingAirdropsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.account.pendingAirdrops(network, options.accountId),
    queryFn: async () => {
      return client.account.getPendingAirdrops(options.accountId, options.params);
    },
  });
}
