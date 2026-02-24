import { useQuery } from "@tanstack/solid-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/solid-query";
import type { ApiResult, ApiError, QueryOperator, Timestamp } from "@hiecom/mirror-node";
import type { BalancesResponse } from "@hiecom/mirror-node";
import { useMirrorNodeClient, useNetwork } from "../../../solid/hooks";
import { mirrorNodeKeys } from "../query-keys";

export type { BalancesListParams } from "@hiecom/mirror-node";

type BalanceQueryFnData<T> = ApiResult<T>;
type BalanceQueryError = ApiError;

export interface UseBalancesOptions extends Omit<
  UseQueryOptions<BalanceQueryFnData<BalancesResponse>, BalanceQueryError>,
  "queryKey" | "queryFn"
> {
  params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly account?: string;
    readonly "account.balance"?: QueryOperator<number>;
    readonly public_key?: string;
    readonly timestamp?: Timestamp;
  };
}

export type UseBalancesResult = UseQueryResult<
  BalanceQueryFnData<BalancesResponse>,
  BalanceQueryError
>;

export function useBalances(options: UseBalancesOptions = {}): UseBalancesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.balance.list(network()),
    queryFn: async () => {
      return client().balance.getBalances(options.params);
    },
  }));
}
