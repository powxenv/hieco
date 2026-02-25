import { useQuery, useInfiniteQuery } from "@tanstack/preact-query";
import type {
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseQueryResult,
  UseInfiniteQueryResult,
} from "@tanstack/preact-query";
import type { ApiResult, ApiError, EntityId, QueryOperator, Timestamp } from "@hiecom/mirror-node";
import type { Transaction, TransactionDetails } from "@hiecom/mirror-node";
import type { PaginatedResponse } from "@hiecom/mirror-node";
import { useMirrorNodeClient, useNetwork } from "../../../preact/hooks";
import { mirrorNodeKeys } from "../query-keys";

export type { TransactionListParams, TransactionsByAccountParams } from "@hiecom/mirror-node";

type TransactionQueryFnData<T> = ApiResult<T>;
type TransactionQueryError = ApiError;

export interface UseTransactionOptions extends Omit<
  UseQueryOptions<TransactionQueryFnData<TransactionDetails>, TransactionQueryError>,
  "queryKey" | "queryFn"
> {
  transactionId: string;
}

export type UseTransactionResult = UseQueryResult<
  TransactionQueryFnData<TransactionDetails>,
  TransactionQueryError
>;

export interface UseTransactionsByAccountOptions extends Omit<
  UseQueryOptions<TransactionQueryFnData<Transaction[]>, TransactionQueryError>,
  "queryKey" | "queryFn"
> {
  accountId: EntityId;
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    timestamp?: Timestamp | { from?: Timestamp; to?: Timestamp };
    transaction_id?: string;
    result?: string;
  };
}

export type UseTransactionsByAccountResult = UseQueryResult<
  TransactionQueryFnData<Transaction[]>,
  TransactionQueryError
>;

export interface UseTransactionsOptions extends Omit<
  UseQueryOptions<TransactionQueryFnData<Transaction[]>, TransactionQueryError>,
  "queryKey" | "queryFn"
> {
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    account?: EntityId;
    "account.id"?: EntityId | QueryOperator<EntityId>;
    transaction_id?: string;
    result?: string;
  };
}

export type UseTransactionsResult = UseQueryResult<
  TransactionQueryFnData<Transaction[]>,
  TransactionQueryError
>;

export interface UseTransactionsInfiniteOptions extends Omit<
  UseInfiniteQueryOptions<
    TransactionQueryFnData<PaginatedResponse<Transaction>>,
    TransactionQueryError
  >,
  "queryKey" | "queryFn" | "getNextPageParam"
> {
  params?: { limit?: number; order?: "asc" | "desc" };
}

export type UseTransactionsInfiniteResult = UseInfiniteQueryResult<
  TransactionQueryFnData<PaginatedResponse<Transaction>>,
  TransactionQueryError
>;

export function useTransaction(options: UseTransactionOptions): UseTransactionResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.transaction.info(network, options.transactionId),
    queryFn: async () => {
      return client.transaction.getById(options.transactionId);
    },
    enabled: options.enabled !== false,
  });
}

export function useTransactionsByAccount(
  options: UseTransactionsByAccountOptions,
): UseTransactionsByAccountResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.transaction.byAccount(network, options.accountId),
    queryFn: async () => {
      return client.transaction.listByAccount(options.accountId, options.params);
    },
    enabled: options.enabled !== false,
  });
}

export function useTransactions(options: UseTransactionsOptions = {}): UseTransactionsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.transaction.list(network),
    queryFn: async () => {
      return client.transaction.listPaginated(options.params);
    },
  });
}

export function useTransactionsInfinite(
  options: UseTransactionsInfiniteOptions,
): UseTransactionsInfiniteResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useInfiniteQuery({
    ...options,
    queryKey: mirrorNodeKeys.transaction.list(network),
    queryFn: async ({ pageParam }) => {
      if (typeof pageParam === "string") {
        return client.transaction.listPaginatedPageByUrl(pageParam);
      }
      return client.transaction.listPaginatedPage({
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
