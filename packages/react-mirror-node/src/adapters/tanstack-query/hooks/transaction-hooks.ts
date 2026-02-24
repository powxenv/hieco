import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type {
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseQueryResult,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { ApiResult, ApiError, EntityId, QueryOperator, Timestamp } from "@hiecom/mirror-node";
import type { Transaction, TransactionDetails } from "@hiecom/mirror-node";
import { useMirrorNodeClient } from "../../../react/hooks";
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
  UseInfiniteQueryOptions<TransactionQueryFnData<Transaction[]>, TransactionQueryError>,
  "queryKey" | "queryFn" | "getNextPageParam"
> {
  params?: { limit?: number; order?: "asc" | "desc" };
}

export type UseTransactionsInfiniteResult = UseInfiniteQueryResult<
  TransactionQueryFnData<Transaction[]>,
  TransactionQueryError
>;

export function useTransaction(options: UseTransactionOptions): UseTransactionResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.transaction.info(options.transactionId),
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

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.transaction.byAccount(options.accountId),
    queryFn: async () => {
      return client.transaction.listByAccount(options.accountId, options.params);
    },
    enabled: options.enabled !== false,
  });
}

export function useTransactions(options: UseTransactionsOptions = {}): UseTransactionsResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.transaction.list(),
    queryFn: async () => {
      return client.transaction.listPaginated(options.params);
    },
  });
}

export function useTransactionsInfinite(
  options: UseTransactionsInfiniteOptions,
): UseTransactionsInfiniteResult {
  const client = useMirrorNodeClient();

  return useInfiniteQuery({
    ...options,
    queryKey: mirrorNodeKeys.transaction.list(),
    queryFn: async () => {
      const params = {
        ...options.params,
        limit: options.params?.limit ?? 25,
      };

      const result = await client.transaction.listPaginated(params);

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
