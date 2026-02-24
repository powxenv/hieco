import { useQuery } from "@tanstack/solid-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/solid-query";
import type { ApiResult, ApiError, EntityId, QueryOperator, Timestamp } from "@hiecom/mirror-node";
import type { Transaction, TransactionDetails } from "@hiecom/mirror-node";
import { useMirrorNodeClient, useNetwork } from "../../../solid/hooks";
import { mirrorNodeKeys } from "../query-keys";
import type { Accessor } from "solid-js";

export type { TransactionListParams, TransactionsByAccountParams } from "@hiecom/mirror-node";

type TransactionQueryFnData<T> = ApiResult<T>;
type TransactionQueryError = ApiError;

export interface UseTransactionOptions extends Omit<
  UseQueryOptions<TransactionQueryFnData<TransactionDetails>, TransactionQueryError>,
  "queryKey" | "queryFn"
> {
  transactionId: Accessor<string>;
}

export type UseTransactionResult = UseQueryResult<
  TransactionQueryFnData<TransactionDetails>,
  TransactionQueryError
>;

export interface UseTransactionsByAccountOptions extends Omit<
  UseQueryOptions<TransactionQueryFnData<Transaction[]>, TransactionQueryError>,
  "queryKey" | "queryFn"
> {
  accountId: Accessor<EntityId>;
  params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly timestamp?: Timestamp | { from?: Timestamp; to?: Timestamp };
    readonly transaction_id?: string;
    readonly result?: string;
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
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly account?: EntityId;
    readonly "account.id"?: EntityId | QueryOperator<EntityId>;
    readonly transaction_id?: string;
    readonly result?: string;
  };
}

export type UseTransactionsResult = UseQueryResult<
  TransactionQueryFnData<Transaction[]>,
  TransactionQueryError
>;

export interface UseTransactionsInfiniteOptions extends Omit<
  UseQueryOptions<TransactionQueryFnData<Transaction[]>, TransactionQueryError>,
  "queryKey" | "queryFn"
> {
  params?: { readonly limit?: number; readonly order?: "asc" | "desc" };
}

export type UseTransactionsInfiniteResult = UseQueryResult<
  TransactionQueryFnData<Transaction[]>,
  TransactionQueryError
>;

export function useTransaction(options: UseTransactionOptions): UseTransactionResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.transaction.info(network(), options.transactionId()),
    queryFn: async () => {
      return client().transaction.getById(options.transactionId());
    },
  }));
}

export function useTransactionsByAccount(
  options: UseTransactionsByAccountOptions,
): UseTransactionsByAccountResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.transaction.byAccount(network(), options.accountId()),
    queryFn: async () => {
      return client().transaction.listByAccount(options.accountId(), options.params);
    },
  }));
}

export function useTransactions(options: UseTransactionsOptions = {}): UseTransactionsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.transaction.list(network()),
    queryFn: async () => {
      return client().transaction.listPaginated(options.params);
    },
  }));
}

export function useTransactionsInfinite(
  options: UseTransactionsInfiniteOptions,
): UseTransactionsInfiniteResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.transaction.list(network()),
    queryFn: async () => {
      const params = {
        ...options.params,
        limit: options.params?.limit ?? 25,
      };

      const result = await client().transaction.listPaginated(params);

      return result;
    },
  }));
}
