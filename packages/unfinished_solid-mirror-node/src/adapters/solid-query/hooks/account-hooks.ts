import { useQuery } from "@tanstack/solid-query";
import type { SolidQueryOptions, UseQueryResult } from "@tanstack/solid-query";
import type { ApiResult, ApiError, EntityId, PaginationParams } from "@hiecom/mirror-node";
import type {
    AccountInfo,
    Balance,
    CryptoAllowance,
    NftAllowance,
    StakingReward,
    TokenRelationship,
    TokenAllowance,
    TokenAirdropsResponse,
} from "@hiecom/mirror-node";
import { useMirrorNodeClient, useNetwork } from "../../../solid/hooks";
import { mirrorNodeKeys } from "../query-keys";
import type { Accessor } from "solid-js";

export type { AccountListParams, AccountNftsParams } from "@hiecom/mirror-node";

export interface AccountTokenAllowancesParams {
    readonly spender?: EntityId;
    readonly "token.id"?: EntityId;
}

type AccountQueryFnData<T> = ApiResult<T>;
type AccountQueryError = ApiError;

type ToAccessor<T> = {
    [K in keyof T]?: Accessor<T[K]> | T[K];
};

export interface UseAccountInfoOptions extends ToAccessor<
    Omit<SolidQueryOptions<AccountQueryFnData<AccountInfo>, AccountQueryError>, "queryKey" | "queryFn">
> {
    accountId: Accessor<EntityId>;
}

export type UseAccountInfoResult = UseQueryResult<AccountQueryFnData<AccountInfo>, AccountQueryError>;

export interface UseAccountBalancesOptions extends ToAccessor<
    Omit<SolidQueryOptions<AccountQueryFnData<Balance>, AccountQueryError>, "queryKey" | "queryFn">
> {
    accountId: Accessor<EntityId>;
}

export type UseAccountBalancesResult = UseQueryResult<AccountQueryFnData<Balance>, AccountQueryError>;

export interface UseAccountTokensOptions extends ToAccessor<
    Omit<SolidQueryOptions<AccountQueryFnData<TokenRelationship[]>, AccountQueryError>, "queryKey" | "queryFn">
> {
    accountId: Accessor<EntityId>;
    params?: PaginationParams & { readonly "token.id"?: EntityId };
}

export type UseAccountTokensResult = UseQueryResult<AccountQueryFnData<TokenRelationship[]>, AccountQueryError>;

export interface UseAccountNftsOptions extends ToAccessor<
    Omit<SolidQueryOptions<AccountQueryFnData<TokenRelationship[]>, AccountQueryError>, "queryKey" | "queryFn">
> {
    accountId: Accessor<EntityId>;
    params?: {
        readonly limit?: number;
        readonly order?: "asc" | "desc";
        readonly "token.id"?: EntityId;
        readonly serial_number?: number;
    };
}

export type UseAccountNftsResult = UseQueryResult<AccountQueryFnData<TokenRelationship[]>, AccountQueryError>;

export interface UseAccountStakingRewardsOptions extends ToAccessor<
    Omit<SolidQueryOptions<AccountQueryFnData<StakingReward[]>, AccountQueryError>, "queryKey" | "queryFn">
> {
    accountId: Accessor<EntityId>;
    params?: PaginationParams & { readonly timestamp?: string };
}

export type UseAccountStakingRewardsResult = UseQueryResult<AccountQueryFnData<StakingReward[]>, AccountQueryError>;

export interface UseAccountCryptoAllowancesOptions extends ToAccessor<
    Omit<SolidQueryOptions<AccountQueryFnData<CryptoAllowance[]>, AccountQueryError>, "queryKey" | "queryFn">
> {
    accountId: Accessor<EntityId>;
}

export type UseAccountCryptoAllowancesResult = UseQueryResult<AccountQueryFnData<CryptoAllowance[]>, AccountQueryError>;

export interface UseAccountTokenAllowancesOptions extends ToAccessor<
    Omit<SolidQueryOptions<AccountQueryFnData<TokenAllowance[]>, AccountQueryError>, "queryKey" | "queryFn">
> {
    accountId: Accessor<EntityId>;
    params?: AccountTokenAllowancesParams;
}

export type UseAccountTokenAllowancesResult = UseQueryResult<AccountQueryFnData<TokenAllowance[]>, AccountQueryError>;

export interface UseAccountNftAllowancesOptions extends ToAccessor<
    Omit<SolidQueryOptions<AccountQueryFnData<NftAllowance[]>, AccountQueryError>, "queryKey" | "queryFn">
> {
    accountId: Accessor<EntityId>;
    params?: { readonly "token.id"?: EntityId };
}

export type UseAccountNftAllowancesResult = UseQueryResult<AccountQueryFnData<NftAllowance[]>, AccountQueryError>;

export interface UseAccountOutstandingAirdropsOptions extends ToAccessor<
    Omit<SolidQueryOptions<AccountQueryFnData<TokenAirdropsResponse>, AccountQueryError>, "queryKey" | "queryFn">
> {
    accountId: Accessor<EntityId>;
    params?: {
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

export interface UseAccountPendingAirdropsOptions extends ToAccessor<
    Omit<SolidQueryOptions<AccountQueryFnData<TokenAirdropsResponse>, AccountQueryError>, "queryKey" | "queryFn">
> {
    accountId: Accessor<EntityId>;
    params?: {
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

export interface UseAccountsOptions extends ToAccessor<
    Omit<SolidQueryOptions<AccountQueryFnData<AccountInfo[]>, AccountQueryError>, "queryKey" | "queryFn">
> {
    params?: {
        readonly limit?: number;
        readonly order?: "asc" | "desc";
        readonly account?: EntityId;
        readonly alias?: string;
    };
}

export type UseAccountsResult = UseQueryResult<AccountQueryFnData<AccountInfo[]>, AccountQueryError>;

export interface UseAccountsInfiniteOptions extends ToAccessor<
    Omit<SolidQueryOptions<AccountQueryFnData<AccountInfo[]>, AccountQueryError>, "queryKey" | "queryFn">
> {
    params?: { readonly limit?: number; readonly order?: "asc" | "desc" };
}

export type UseAccountsInfiniteResult = UseQueryResult<AccountQueryFnData<AccountInfo[]>, AccountQueryError>;

function resolveValue<T>(value: Accessor<T> | T | undefined): T | undefined {
    return typeof value === "function" ? (value as Accessor<T>)() : value;
}

function buildQueryOptions(options: Record<string, any>) {
    const queryOptions: Record<string, unknown> = {};
    
    const enabled = resolveValue(options.enabled);
    if (enabled !== undefined) queryOptions.enabled = enabled;
    
    const staleTime = resolveValue(options.staleTime);
    if (staleTime !== undefined) queryOptions.staleTime = staleTime;
    
    const gcTime = resolveValue(options.gcTime);
    if (gcTime !== undefined) queryOptions.gcTime = gcTime;
    
    const refetchOnWindowFocus = resolveValue(options.refetchOnWindowFocus);
    if (refetchOnWindowFocus !== undefined) queryOptions.refetchOnWindowFocus = refetchOnWindowFocus;
    
    const refetchOnMount = resolveValue(options.refetchOnMount);
    if (refetchOnMount !== undefined) queryOptions.refetchOnMount = refetchOnMount;
    
    const refetchOnReconnect = resolveValue(options.refetchOnReconnect);
    if (refetchOnReconnect !== undefined) queryOptions.refetchOnReconnect = refetchOnReconnect;
    
    const refetchInterval = resolveValue(options.refetchInterval);
    if (refetchInterval !== undefined) queryOptions.refetchInterval = refetchInterval;
    
    const refetchIntervalInBackground = resolveValue(options.refetchIntervalInBackground);
    if (refetchIntervalInBackground !== undefined) queryOptions.refetchIntervalInBackground = refetchIntervalInBackground;
    
    const retry = resolveValue(options.retry);
    if (retry !== undefined) queryOptions.retry = retry;
    
    const retryOnMount = resolveValue(options.retryOnMount);
    if (retryOnMount !== undefined) queryOptions.retryOnMount = retryOnMount;
    
    const retryDelay = resolveValue(options.retryDelay);
    if (retryDelay !== undefined) queryOptions.retryDelay = retryDelay;
    
    const select = resolveValue(options.select);
    if (select !== undefined) queryOptions.select = select;
    
    const placeholderData = resolveValue(options.placeholderData);
    if (placeholderData !== undefined) queryOptions.placeholderData = placeholderData;
    
    const throwOnError = resolveValue(options.throwOnError);
    if (throwOnError !== undefined) queryOptions.throwOnError = throwOnError;
    
    const networkMode = resolveValue(options.networkMode);
    if (networkMode !== undefined) queryOptions.networkMode = networkMode;
    
    const initialData = resolveValue(options.initialData);
    if (initialData !== undefined) queryOptions.initialData = initialData;
    
    const initialDataUpdatedAt = resolveValue(options.initialDataUpdatedAt);
    if (initialDataUpdatedAt !== undefined) queryOptions.initialDataUpdatedAt = initialDataUpdatedAt;
    
    const meta = resolveValue(options.meta);
    if (meta !== undefined) queryOptions.meta = meta;
    
    return queryOptions;
}

export function useAccountInfo(options: UseAccountInfoOptions): UseAccountInfoResult {
    const client = useMirrorNodeClient();
    const { network } = useNetwork();

    return useQuery(() => ({
        queryKey: mirrorNodeKeys.account.info(network(), options.accountId()),
        queryFn: async () => {
            return client().account.getInfo(options.accountId());
        },
        ...buildQueryOptions(options),
    }));
}

export function useAccountBalances(options: UseAccountBalancesOptions): UseAccountBalancesResult {
    const client = useMirrorNodeClient();
    const { network } = useNetwork();

    return useQuery(() => ({
        queryKey: mirrorNodeKeys.account.balances(network(), options.accountId()),
        queryFn: async () => {
            return client().account.getBalances(options.accountId());
        },
        ...buildQueryOptions(options),
    }));
}

export function useAccountTokens(options: UseAccountTokensOptions): UseAccountTokensResult {
    const client = useMirrorNodeClient();
    const { network } = useNetwork();

    return useQuery(() => ({
        queryKey: mirrorNodeKeys.account.tokens(network(), options.accountId()),
        queryFn: async () => {
            return client().account.getTokens(options.accountId(), options.params);
        },
        ...buildQueryOptions(options),
    }));
}

export function useAccountNfts(options: UseAccountNftsOptions): UseAccountNftsResult {
    const client = useMirrorNodeClient();
    const { network } = useNetwork();

    return useQuery(() => ({
        queryKey: mirrorNodeKeys.account.nfts(network(), options.accountId()),
        queryFn: async () => {
            return client().account.getNfts(options.accountId(), options.params);
        },
        ...buildQueryOptions(options),
    }));
}

export function useAccountStakingRewards(options: UseAccountStakingRewardsOptions): UseAccountStakingRewardsResult {
    const client = useMirrorNodeClient();
    const { network } = useNetwork();

    return useQuery(() => ({
        queryKey: mirrorNodeKeys.account.stakingRewards(network(), options.accountId()),
        queryFn: async () => {
            return client().account.getStakingRewards(options.accountId(), options.params);
        },
        ...buildQueryOptions(options),
    }));
}

export function useAccountCryptoAllowances(
    options: UseAccountCryptoAllowancesOptions,
): UseAccountCryptoAllowancesResult {
    const client = useMirrorNodeClient();
    const { network } = useNetwork();

    return useQuery(() => ({
        queryKey: mirrorNodeKeys.account.cryptoAllowances(network(), options.accountId()),
        queryFn: async () => {
            return client().account.getCryptoAllowances(options.accountId());
        },
        ...buildQueryOptions(options),
    }));
}

export function useAccountTokenAllowances(options: UseAccountTokenAllowancesOptions): UseAccountTokenAllowancesResult {
    const client = useMirrorNodeClient();
    const { network } = useNetwork();

    return useQuery(() => ({
        queryKey: mirrorNodeKeys.account.tokenAllowances(network(), options.accountId()),
        queryFn: async () => {
            return client().account.getTokenAllowances(options.accountId(), options.params);
        },
        ...buildQueryOptions(options),
    }));
}

export function useAccountNftAllowances(options: UseAccountNftAllowancesOptions): UseAccountNftAllowancesResult {
    const client = useMirrorNodeClient();
    const { network } = useNetwork();

    return useQuery(() => ({
        queryKey: mirrorNodeKeys.account.nftAllowances(network(), options.accountId()),
        queryFn: async () => {
            return client().account.getNftAllowances(options.accountId(), options.params);
        },
        ...buildQueryOptions(options),
    }));
}

export function useAccountOutstandingAirdrops(
    options: UseAccountOutstandingAirdropsOptions,
): UseAccountOutstandingAirdropsResult {
    const client = useMirrorNodeClient();
    const { network } = useNetwork();

    return useQuery(() => ({
        queryKey: mirrorNodeKeys.account.outstandingAirdrops(network(), options.accountId()),
        queryFn: async () => {
            return client().account.getOutstandingAirdrops(options.accountId(), options.params);
        },
        ...buildQueryOptions(options),
    }));
}

export function useAccountPendingAirdrops(options: UseAccountPendingAirdropsOptions): UseAccountPendingAirdropsResult {
    const client = useMirrorNodeClient();
    const { network } = useNetwork();

    return useQuery(() => ({
        queryKey: mirrorNodeKeys.account.pendingAirdrops(network(), options.accountId()),
        queryFn: async () => {
            return client().account.getPendingAirdrops(options.accountId(), options.params);
        },
        ...buildQueryOptions(options),
    }));
}

export function useAccounts(options: UseAccountsOptions = {}): UseAccountsResult {
    const client = useMirrorNodeClient();
    const { network } = useNetwork();

    return useQuery(() => ({
        queryKey: mirrorNodeKeys.account.list(network()),
        queryFn: async () => {
            return client().account.listPaginated(options.params);
        },
        ...buildQueryOptions(options),
    }));
}

export function useAccountsInfinite(options: UseAccountsInfiniteOptions): UseAccountsInfiniteResult {
    const client = useMirrorNodeClient();
    const { network } = useNetwork();

    return useQuery(() => ({
        queryKey: mirrorNodeKeys.account.list(network()),
        queryFn: async () => {
            const params = {
                ...options.params,
                limit: options.params?.limit ?? 25,
            };
            return client().account.listPaginated(params);
        },
        ...buildQueryOptions(options),
    }));
}
