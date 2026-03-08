import { useQuery } from "@tanstack/solid-query";
import type { UseQueryResult, UseInfiniteQueryResult } from "@tanstack/solid-query";
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
import { createMemo, type Accessor } from "solid-js";
import { useMirrorNodeClient, useNetwork } from "./context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";
import { createMirrorNodeInfiniteQuery } from "./shared/infinite";

export type { AccountListParams, AccountNftsParams } from "@hieco/mirror";

export interface AccountTokenAllowancesParams {
  readonly spender?: string;
  readonly "token.id"?: string;
}

export interface CreateAccountInfoOptions {
  readonly accountId: string;
  readonly enabled?: boolean;
}

type CreateAccountInfoResult = UseQueryResult<ApiResult<AccountInfo>, ApiError>;

export interface CreateAccountBalancesOptions {
  readonly accountId: string;
  readonly enabled?: boolean;
}

type CreateAccountBalancesResult = UseQueryResult<ApiResult<Balance>, ApiError>;

export interface CreateAccountTokensOptions {
  readonly accountId: string;
  readonly params?: PaginationParams & { readonly "token.id"?: string };
  readonly enabled?: boolean;
}

type CreateAccountTokensResult = UseQueryResult<ApiResult<TokenRelationship[]>, ApiError>;

export interface CreateAccountNftsOptions {
  readonly accountId: string;
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly "token.id"?: string;
    readonly serial_number?: number;
  };
  readonly enabled?: boolean;
}

type CreateAccountNftsResult = UseQueryResult<ApiResult<TokenRelationship[]>, ApiError>;

export interface CreateAccountStakingRewardsOptions {
  readonly accountId: string;
  readonly params?: PaginationParams & { readonly timestamp?: string };
  readonly enabled?: boolean;
}

type CreateAccountStakingRewardsResult = UseQueryResult<ApiResult<StakingReward[]>, ApiError>;

export interface CreateAccountCryptoAllowancesOptions {
  readonly accountId: string;
  readonly enabled?: boolean;
}

type CreateAccountCryptoAllowancesResult = UseQueryResult<ApiResult<CryptoAllowance[]>, ApiError>;

export interface CreateAccountTokenAllowancesOptions {
  readonly accountId: string;
  readonly params?: AccountTokenAllowancesParams;
  readonly enabled?: boolean;
}

type CreateAccountTokenAllowancesResult = UseQueryResult<ApiResult<TokenAllowance[]>, ApiError>;

export interface CreateAccountNftAllowancesOptions {
  readonly accountId: string;
  readonly params?: { readonly "token.id"?: string };
  readonly enabled?: boolean;
}

type CreateAccountNftAllowancesResult = UseQueryResult<ApiResult<NftAllowance[]>, ApiError>;

export interface CreateAccountsOptions {
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly account?: string | QueryOperator<string>;
    readonly alias?: string;
  };
  readonly enabled?: boolean;
}

type CreateAccountsResult = UseQueryResult<ApiResult<AccountInfo[]>, ApiError>;

export interface CreateAccountsInfiniteOptions {
  readonly params?: { readonly limit?: number; readonly order?: "asc" | "desc" };
  readonly enabled?: boolean;
}

type CreateAccountsInfiniteResult = UseInfiniteQueryResult<
  ApiResult<PaginatedResponse<AccountInfo>>,
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

  return createMirrorNodeInfiniteQuery(
    mirrorNodeKeys.account.list(network()),
    options,
    (pageParam, opts) => {
      if (pageParam) {
        return client().account.listPaginatedPageByUrl(pageParam);
      }
      return client().account.listPaginatedPage({
        ...opts.params,
        limit: opts.params?.limit ?? 25,
      });
    },
    (lastPage) => {
      if (!lastPage.success) return undefined;
      return lastPage.data.links.next ?? undefined;
    },
  );
}

export interface CreateAccountOutstandingAirdropsOptions {
  readonly accountId: string;
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly "receiver.id"?: string;
    readonly serial_number?: number;
    readonly "token.id"?: string;
  };
  readonly enabled?: boolean;
}

type CreateAccountOutstandingAirdropsResult = UseQueryResult<
  ApiResult<TokenAirdropsResponse>,
  ApiError
>;

export interface CreateAccountPendingAirdropsOptions {
  readonly accountId: string;
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly "sender.id"?: string;
    readonly serial_number?: number;
    readonly "token.id"?: string;
  };
  readonly enabled?: boolean;
}

type CreateAccountPendingAirdropsResult = UseQueryResult<
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

export interface CreateAccountOverviewOptions {
  readonly accountId: string;
  readonly includeBalances?: boolean;
  readonly includeTokens?: boolean;
}

export interface AccountOverviewData {
  readonly info: AccountInfo | null;
  readonly balances: Balance | null;
  readonly tokens: TokenRelationship[] | null;
}

export function createAccountOverview(
  options: Accessor<CreateAccountOverviewOptions>,
): Accessor<AccountOverviewData> {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  const opts = createMemo(() => options());

  const infoQuery = useQuery(() => {
    const o = opts();
    return {
      queryKey: mirrorNodeKeys.account.info(network(), o.accountId),
      queryFn: () => client().account.getInfo(o.accountId),
    };
  });

  const balancesQuery = useQuery(() => {
    const o = opts();
    return {
      queryKey: mirrorNodeKeys.account.balances(network(), o.accountId),
      queryFn: () => client().account.getBalances(o.accountId),
      get enabled() {
        return o.includeBalances ?? true;
      },
    };
  });

  const tokensQuery = useQuery(() => {
    const o = opts();
    return {
      queryKey: mirrorNodeKeys.account.tokens(network(), o.accountId),
      queryFn: () => client().account.getTokens(o.accountId),
      get enabled() {
        return o.includeTokens ?? true;
      },
    };
  });

  return createMemo(() => ({
    info: infoQuery.data?.success ? infoQuery.data.data : null,
    balances: balancesQuery.data?.success ? balancesQuery.data.data : null,
    tokens: tokensQuery.data?.success ? tokensQuery.data.data : null,
  }));
}
