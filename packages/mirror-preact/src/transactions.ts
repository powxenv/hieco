import { useQuery, useInfiniteQuery } from "@tanstack/preact-query";
import type {
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseQueryResult,
  UseInfiniteQueryResult,
} from "@tanstack/preact-query";
import type { ApiResult, ApiError, QueryOperator, TimestampFilter } from "@hieco/mirror";
import type { Transaction, TransactionDetails } from "@hieco/mirror";
import type { PaginatedResponse } from "@hieco/mirror";
import { useMirrorNodeClient, useNetwork } from "./context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";

export type { TransactionListParams, TransactionsByAccountParams } from "@hieco/mirror";

export interface UseTransactionOptions extends Omit<
  UseQueryOptions<ApiResult<TransactionDetails>, ApiError>,
  "queryKey" | "queryFn"
> {
  transactionId: string;
}

type UseTransactionResult = UseQueryResult<ApiResult<TransactionDetails>, ApiError>;

export interface UseTransactionsByAccountOptions extends Omit<
  UseQueryOptions<ApiResult<Transaction[]>, ApiError>,
  "queryKey" | "queryFn"
> {
  accountId: string;
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    timestamp?: TimestampFilter;
    transaction_id?: string;
    result?: string;
  };
}

type UseTransactionsByAccountResult = UseQueryResult<ApiResult<Transaction[]>, ApiError>;

export interface UseTransactionsOptions extends Omit<
  UseQueryOptions<ApiResult<Transaction[]>, ApiError>,
  "queryKey" | "queryFn"
> {
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    account?: string;
    "account.id"?: string | QueryOperator<string>;
    transaction_id?: string;
    result?: string;
  };
}

type UseTransactionsResult = UseQueryResult<ApiResult<Transaction[]>, ApiError>;

export interface UseTransactionsInfiniteOptions extends Omit<
  UseInfiniteQueryOptions<ApiResult<PaginatedResponse<Transaction>>, ApiError>,
  "queryKey" | "queryFn" | "getNextPageParam"
> {
  params?: { limit?: number; order?: "asc" | "desc" };
}

type UseTransactionsInfiniteResult = UseInfiniteQueryResult<
  ApiResult<PaginatedResponse<Transaction>>,
  ApiError
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
