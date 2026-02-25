import { useQuery } from "@tanstack/solid-query";
import type { UseQueryResult, UseInfiniteQueryResult } from "@tanstack/solid-query";
import type { ApiResult, ApiError, EntityId, QueryOperator, Timestamp } from "@hiecom/mirror-node";
import type { PaginatedResponse } from "@hiecom/mirror-node";
import type { Accessor } from "solid-js";
import { useMirrorNodeClient, useNetwork } from "../../../solid/hooks";
import { mirrorNodeKeys } from "../query-keys";
import { createMirrorNodeInfiniteQuery } from "../utils";

export type { TransactionListParams, TransactionsByAccountParams } from "@hiecom/mirror-node";

export interface CreateTransactionOptions {
  readonly transactionId: string;
  readonly enabled?: boolean;
}

export type CreateTransactionResult = UseQueryResult<ApiResult<any>, ApiError>;

export interface CreateTransactionsByAccountOptions {
  readonly accountId: EntityId;
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly timestamp?: Timestamp | { readonly from?: Timestamp; readonly to?: Timestamp };
    readonly transaction_id?: string;
    readonly result?: string;
  };
  readonly enabled?: boolean;
}

export type CreateTransactionsByAccountResult = UseQueryResult<ApiResult<any>, ApiError>;

export interface CreateTransactionsOptions {
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly account?: EntityId;
    readonly "account.id"?: EntityId | QueryOperator<EntityId>;
    readonly transaction_id?: string;
    readonly result?: string;
  };
  readonly enabled?: boolean;
}

export type CreateTransactionsResult = UseQueryResult<ApiResult<any>, ApiError>;

export interface CreateTransactionsInfiniteOptions {
  readonly params?: { readonly limit?: number; readonly order?: "asc" | "desc" };
  readonly enabled?: boolean;
}

export type CreateTransactionsInfiniteResult = UseInfiniteQueryResult<
  ApiResult<PaginatedResponse<any>>,
  ApiError
>;

export function createTransaction(
  options: Accessor<CreateTransactionOptions>,
): CreateTransactionResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.transaction.info(network(), opts.transactionId),
      queryFn: async () => {
        return client().transaction.getById(opts.transactionId);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createTransactionsByAccount(
  options: Accessor<CreateTransactionsByAccountOptions>,
): CreateTransactionsByAccountResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.transaction.byAccount(network(), opts.accountId),
      queryFn: async () => {
        return client().transaction.listByAccount(opts.accountId, opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createTransactions(
  options: Accessor<CreateTransactionsOptions> = () => ({}),
): CreateTransactionsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.transaction.list(network()),
      queryFn: async () => {
        return client().transaction.listPaginated(opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createTransactionsInfinite(
  options: Accessor<CreateTransactionsInfiniteOptions>,
): CreateTransactionsInfiniteResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return createMirrorNodeInfiniteQuery(
    mirrorNodeKeys.transaction.list(network()),
    options,
    (pageParam, opts) => {
      if (pageParam) {
        return client().transaction.listPaginatedPageByUrl(pageParam);
      }
      return client().transaction.listPaginatedPage({
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
