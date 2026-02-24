import { useQuery, useInfiniteQuery } from "@tanstack/solid-query";
import type { UseQueryResult, UseInfiniteQueryResult } from "@tanstack/solid-query";
import type {
  ApiResult,
  ApiError,
  EntityId,
  PaginationParams,
  QueryOperator,
} from "@hiecom/mirror-node";
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
import type { Accessor } from "solid-js";
import { useMirrorNodeClient, useNetwork } from "../../../solid/hooks";
import { mirrorNodeKeys } from "../query-keys";

export type { AccountListParams, AccountNftsParams } from "@hiecom/mirror-node";

export interface AccountTokenAllowancesParams {
  readonly spender?: EntityId;
  readonly "token.id"?: EntityId;
}

export interface CreateAccountInfoOptions {
  readonly accountId: EntityId;
  readonly enabled?: boolean;
}

export type CreateAccountInfoResult = UseQueryResult<ApiResult<AccountInfo>, ApiError>;

export interface CreateAccountBalancesOptions {
  readonly accountId: EntityId;
  readonly enabled?: boolean;
}

export type CreateAccountBalancesResult = UseQueryResult<ApiResult<Balance>, ApiError>;

export interface CreateAccountTokensOptions {
  readonly accountId: EntityId;
  readonly params?: PaginationParams & { readonly "token.id"?: EntityId };
  readonly enabled?: boolean;
}

export type CreateAccountTokensResult = UseQueryResult<ApiResult<TokenRelationship[]>, ApiError>;

export interface CreateAccountNftsOptions {
  readonly accountId: EntityId;
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly "token.id"?: EntityId;
    readonly serial_number?: number;
  };
  readonly enabled?: boolean;
}

export type CreateAccountNftsResult = UseQueryResult<ApiResult<TokenRelationship[]>, ApiError>;

export interface CreateAccountStakingRewardsOptions {
  readonly accountId: EntityId;
  readonly params?: PaginationParams & { readonly timestamp?: string };
  readonly enabled?: boolean;
}

export type CreateAccountStakingRewardsResult = UseQueryResult<
  ApiResult<StakingReward[]>,
  ApiError
>;

export interface CreateAccountCryptoAllowancesOptions {
  readonly accountId: EntityId;
  readonly enabled?: boolean;
}

export type CreateAccountCryptoAllowancesResult = UseQueryResult<
  ApiResult<CryptoAllowance[]>,
  ApiError
>;

export interface CreateAccountTokenAllowancesOptions {
  readonly accountId: EntityId;
  readonly params?: AccountTokenAllowancesParams;
  readonly enabled?: boolean;
}

export type CreateAccountTokenAllowancesResult = UseQueryResult<
  ApiResult<TokenAllowance[]>,
  ApiError
>;

export interface CreateAccountNftAllowancesOptions {
  readonly accountId: EntityId;
  readonly params?: { readonly "token.id"?: EntityId };
  readonly enabled?: boolean;
}

export type CreateAccountNftAllowancesResult = UseQueryResult<ApiResult<NftAllowance[]>, ApiError>;

export interface CreateAccountsOptions {
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly account?: EntityId | QueryOperator<EntityId>;
    readonly alias?: string;
  };
  readonly enabled?: boolean;
}

export type CreateAccountsResult = UseQueryResult<ApiResult<AccountInfo[]>, ApiError>;

export interface CreateAccountsInfiniteOptions {
  readonly params?: { readonly limit?: number; readonly order?: "asc" | "desc" };
  readonly enabled?: boolean;
}

export type CreateAccountsInfiniteResult = UseInfiniteQueryResult<
  ApiResult<AccountInfo[]>,
  ApiError
>;

export function createAccountInfo(
  options: Accessor<CreateAccountInfoOptions>,
): CreateAccountInfoResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.account.info(network(), opts.accountId),
      queryFn: async () => {
        return client().account.getInfo(opts.accountId);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createAccountBalances(
  options: Accessor<CreateAccountBalancesOptions>,
): CreateAccountBalancesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.account.balances(network(), opts.accountId),
      queryFn: async () => {
        return client().account.getBalances(opts.accountId);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createAccountTokens(
  options: Accessor<CreateAccountTokensOptions>,
): CreateAccountTokensResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.account.tokens(network(), opts.accountId),
      queryFn: async () => {
        return client().account.getTokens(opts.accountId, opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createAccountNfts(
  options: Accessor<CreateAccountNftsOptions>,
): CreateAccountNftsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.account.nfts(network(), opts.accountId),
      queryFn: async () => {
        return client().account.getNfts(opts.accountId, opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createAccountStakingRewards(
  options: Accessor<CreateAccountStakingRewardsOptions>,
): CreateAccountStakingRewardsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.account.stakingRewards(network(), opts.accountId),
      queryFn: async () => {
        return client().account.getStakingRewards(opts.accountId, opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createAccountCryptoAllowances(
  options: Accessor<CreateAccountCryptoAllowancesOptions>,
): CreateAccountCryptoAllowancesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.account.cryptoAllowances(network(), opts.accountId),
      queryFn: async () => {
        return client().account.getCryptoAllowances(opts.accountId);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createAccountTokenAllowances(
  options: Accessor<CreateAccountTokenAllowancesOptions>,
): CreateAccountTokenAllowancesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.account.tokenAllowances(network(), opts.accountId),
      queryFn: async () => {
        return client().account.getTokenAllowances(opts.accountId, opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createAccountNftAllowances(
  options: Accessor<CreateAccountNftAllowancesOptions>,
): CreateAccountNftAllowancesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.account.nftAllowances(network(), opts.accountId),
      queryFn: async () => {
        return client().account.getNftAllowances(opts.accountId, opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createAccounts(
  options: Accessor<CreateAccountsOptions> = () => ({}),
): CreateAccountsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.account.list(network()),
      queryFn: async () => {
        return client().account.listPaginated(opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createAccountsInfinite(
  options: Accessor<CreateAccountsInfiniteOptions>,
): CreateAccountsInfiniteResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useInfiniteQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.account.list(network()),
      queryFn: async () => {
        const params = {
          ...opts.params,
          limit: opts.params?.limit ?? 25,
        };

        const result = await client().account.listPaginated(params);

        return result;
      },
      getNextPageParam: (lastPage) => {
        if (!lastPage.success || lastPage.data.length === 0) {
          return undefined;
        }
        return lastPage.data.length;
      },
      initialPageParam: 0,
    };
  });
}

export interface CreateAccountOutstandingAirdropsOptions {
  readonly accountId: EntityId;
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly "receiver.id"?: EntityId;
    readonly serial_number?: number;
    readonly "token.id"?: EntityId;
  };
  readonly enabled?: boolean;
}

export type CreateAccountOutstandingAirdropsResult = UseQueryResult<
  ApiResult<TokenAirdropsResponse>,
  ApiError
>;

export interface CreateAccountPendingAirdropsOptions {
  readonly accountId: EntityId;
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly "sender.id"?: EntityId;
    readonly serial_number?: number;
    readonly "token.id"?: EntityId;
  };
  readonly enabled?: boolean;
}

export type CreateAccountPendingAirdropsResult = UseQueryResult<
  ApiResult<TokenAirdropsResponse>,
  ApiError
>;

export function createAccountOutstandingAirdrops(
  options: Accessor<CreateAccountOutstandingAirdropsOptions>,
): CreateAccountOutstandingAirdropsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.account.outstandingAirdrops(network(), opts.accountId),
      queryFn: async () => {
        return client().account.getOutstandingAirdrops(opts.accountId, opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createAccountPendingAirdrops(
  options: Accessor<CreateAccountPendingAirdropsOptions>,
): CreateAccountPendingAirdropsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.account.pendingAirdrops(network(), opts.accountId),
      queryFn: async () => {
        return client().account.getPendingAirdrops(opts.accountId, opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}
