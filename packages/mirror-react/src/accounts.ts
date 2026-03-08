import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type {
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseQueryResult,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
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
import { useMirrorNodeClient, useNetwork } from "./context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";

export type { AccountListParams, AccountNftsParams } from "@hieco/mirror";

export interface AccountTokenAllowancesParams {
  readonly spender?: string;
  readonly "token.id"?: string;
}

export interface UseAccountInfoOptions extends Omit<
  UseQueryOptions<ApiResult<AccountInfo>, ApiError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: string;
}

type UseAccountInfoResult = UseQueryResult<ApiResult<AccountInfo>, ApiError>;

export interface UseAccountBalancesOptions extends Omit<
  UseQueryOptions<ApiResult<Balance>, ApiError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: string;
}

type UseAccountBalancesResult = UseQueryResult<ApiResult<Balance>, ApiError>;

export interface UseAccountTokensOptions extends Omit<
  UseQueryOptions<ApiResult<TokenRelationship[]>, ApiError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: string;
  readonly params?: PaginationParams & { readonly "token.id"?: string };
}

type UseAccountTokensResult = UseQueryResult<ApiResult<TokenRelationship[]>, ApiError>;

export interface UseAccountNftsOptions extends Omit<
  UseQueryOptions<ApiResult<TokenRelationship[]>, ApiError>,
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

type UseAccountNftsResult = UseQueryResult<ApiResult<TokenRelationship[]>, ApiError>;

export interface UseAccountStakingRewardsOptions extends Omit<
  UseQueryOptions<ApiResult<StakingReward[]>, ApiError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: string;
  readonly params?: PaginationParams & { readonly timestamp?: string };
}

type UseAccountStakingRewardsResult = UseQueryResult<ApiResult<StakingReward[]>, ApiError>;

export interface UseAccountCryptoAllowancesOptions extends Omit<
  UseQueryOptions<ApiResult<CryptoAllowance[]>, ApiError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: string;
}

type UseAccountCryptoAllowancesResult = UseQueryResult<ApiResult<CryptoAllowance[]>, ApiError>;

export interface UseAccountTokenAllowancesOptions extends Omit<
  UseQueryOptions<ApiResult<TokenAllowance[]>, ApiError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: string;
  readonly params?: AccountTokenAllowancesParams;
}

type UseAccountTokenAllowancesResult = UseQueryResult<ApiResult<TokenAllowance[]>, ApiError>;

export interface UseAccountNftAllowancesOptions extends Omit<
  UseQueryOptions<ApiResult<NftAllowance[]>, ApiError>,
  "queryKey" | "queryFn"
> {
  readonly accountId: string;
  readonly params?: { readonly "token.id"?: string };
}

type UseAccountNftAllowancesResult = UseQueryResult<ApiResult<NftAllowance[]>, ApiError>;

export interface UseAccountsOptions extends Omit<
  UseQueryOptions<ApiResult<AccountInfo[]>, ApiError>,
  "queryKey" | "queryFn"
> {
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly account?: string | QueryOperator<string>;
    readonly alias?: string;
  };
}

type UseAccountsResult = UseQueryResult<ApiResult<AccountInfo[]>, ApiError>;

export interface UseAccountsInfiniteOptions extends Omit<
  UseInfiniteQueryOptions<ApiResult<PaginatedResponse<AccountInfo>>, ApiError>,
  "queryKey" | "queryFn" | "getNextPageParam"
> {
  readonly params?: { readonly limit?: number; readonly order?: "asc" | "desc" };
}

type UseAccountsInfiniteResult = UseInfiniteQueryResult<
  ApiResult<PaginatedResponse<AccountInfo>>,
  ApiError
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
  UseQueryOptions<ApiResult<TokenAirdropsResponse>, ApiError>,
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

type UseAccountOutstandingAirdropsResult = UseQueryResult<
  ApiResult<TokenAirdropsResponse>,
  ApiError
>;

export interface UseAccountPendingAirdropsOptions extends Omit<
  UseQueryOptions<ApiResult<TokenAirdropsResponse>, ApiError>,
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

type UseAccountPendingAirdropsResult = UseQueryResult<ApiResult<TokenAirdropsResponse>, ApiError>;

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

export interface UseAccountOverviewOptions {
  readonly accountId: string;
  readonly includeBalances?: boolean;
  readonly includeTokens?: boolean;
}

export interface AccountOverviewData {
  info: AccountInfo | null;
  balances: Balance | null;
  tokens: TokenRelationship[] | null;
}

export function useAccountOverview(options: UseAccountOverviewOptions): AccountOverviewData {
  const { accountId, includeBalances = true, includeTokens = true } = options;
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  const infoQuery = useQuery({
    queryKey: mirrorNodeKeys.account.info(network, accountId),
    queryFn: () => client.account.getInfo(accountId),
  });

  const balancesQuery = useQuery({
    queryKey: mirrorNodeKeys.account.balances(network, accountId),
    queryFn: () => client.account.getBalances(accountId),
    enabled: includeBalances,
  });

  const tokensQuery = useQuery({
    queryKey: mirrorNodeKeys.account.tokens(network, accountId),
    queryFn: () => client.account.getTokens(accountId),
    enabled: includeTokens,
  });

  return {
    info: infoQuery.data?.success ? infoQuery.data.data : null,
    balances: balancesQuery.data?.success ? balancesQuery.data.data : null,
    tokens: tokensQuery.data?.success ? tokensQuery.data.data : null,
  };
}
