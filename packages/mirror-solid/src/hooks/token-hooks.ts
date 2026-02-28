import { useQuery } from "@tanstack/solid-query";
import type { UseQueryResult, UseInfiniteQueryResult } from "@tanstack/solid-query";
import type {
  ApiResult,
  ApiError,
  EntityId,
  PaginationParams,
  QueryOperator,
  TokenDistribution,
  TokenInfo,
  Nft,
  Transaction,
} from "@hieco/mirror";
import type { PaginatedResponse } from "@hieco/mirror";
import type { Accessor } from "solid-js";
import { useMirrorNodeClient, useNetwork } from "../context-hooks";
import { mirrorNodeKeys } from "@hieco/mirror-shared";
import { createMirrorNodeInfiniteQuery } from "../utils";

export type { TokenListParams, TokenBalancesParams, TokenNftsParams } from "@hieco/mirror";

export interface CreateTokenInfoOptions {
  readonly tokenId: EntityId;
  readonly enabled?: boolean;
}

export type CreateTokenInfoResult = UseQueryResult<ApiResult<TokenInfo>, ApiError>;

export interface CreateTokenBalancesOptions {
  readonly tokenId: EntityId;
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly account?: EntityId;
    readonly "account.balance"?: QueryOperator<number>;
  };
  readonly enabled?: boolean;
}

export type CreateTokenBalancesResult = UseQueryResult<ApiResult<TokenDistribution[]>, ApiError>;

export interface CreateTokenNftsOptions {
  readonly tokenId: EntityId;
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly serial_number?: number;
  };
  readonly enabled?: boolean;
}

export type CreateTokenNftsResult = UseQueryResult<ApiResult<PaginatedResponse<Nft>>, ApiError>;

export interface CreateTokenNftOptions {
  readonly tokenId: EntityId;
  readonly serialNumber: number;
  readonly enabled?: boolean;
}

export type CreateTokenNftResult = UseQueryResult<ApiResult<Nft>, ApiError>;

export interface CreateTokenNftTransactionsOptions {
  readonly tokenId: EntityId;
  readonly serialNumber: number;
  readonly params?: PaginationParams;
  readonly enabled?: boolean;
}

export type CreateTokenNftTransactionsResult = UseQueryResult<ApiResult<Transaction[]>, ApiError>;

export interface CreateTokensOptions {
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly "token.id"?: EntityId | QueryOperator<EntityId>;
    readonly type?: "FUNGIBLE_COMMON" | "NON_FUNGIBLE_UNIQUE";
  };
  readonly enabled?: boolean;
}

export type CreateTokensResult = UseQueryResult<ApiResult<TokenInfo[]>, ApiError>;

export interface CreateTokensInfiniteOptions {
  readonly params?: { readonly limit?: number; readonly order?: "asc" | "desc" };
  readonly enabled?: boolean;
}

export type CreateTokensInfiniteResult = UseInfiniteQueryResult<
  ApiResult<PaginatedResponse<TokenInfo>>,
  ApiError
>;

export function createTokenInfo(options: Accessor<CreateTokenInfoOptions>): CreateTokenInfoResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.token.info(network(), opts.tokenId),
      queryFn: async () => {
        return client().token.getInfo(opts.tokenId);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createTokenBalances(
  options: Accessor<CreateTokenBalancesOptions>,
): CreateTokenBalancesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.token.balances(network(), opts.tokenId),
      queryFn: async () => {
        return client().token.getBalances(opts.tokenId, opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createTokenNfts(options: Accessor<CreateTokenNftsOptions>): CreateTokenNftsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.token.nfts(network(), opts.tokenId),
      queryFn: async () => {
        return client().token.getNfts(opts.tokenId, opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createTokenNft(options: Accessor<CreateTokenNftOptions>): CreateTokenNftResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.token.nft(network(), opts.tokenId, opts.serialNumber),
      queryFn: async () => {
        return client().token.getNft(opts.tokenId, opts.serialNumber);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createTokenNftTransactions(
  options: Accessor<CreateTokenNftTransactionsOptions>,
): CreateTokenNftTransactionsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.token.nftTransactions(network(), opts.tokenId, opts.serialNumber),
      queryFn: async () => {
        return client().token.getNftTransactions(opts.tokenId, opts.serialNumber, opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createTokens(
  options: Accessor<CreateTokensOptions> = () => ({}),
): CreateTokensResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.token.list(network()),
      queryFn: async () => {
        return client().token.listPaginated(opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createTokensInfinite(
  options: Accessor<CreateTokensInfiniteOptions>,
): CreateTokensInfiniteResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return createMirrorNodeInfiniteQuery(
    mirrorNodeKeys.token.list(network()),
    options,
    (pageParam, opts) => {
      if (pageParam) {
        return client().token.listPaginatedPageByUrl(pageParam);
      }
      return client().token.listPaginatedPage({
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
