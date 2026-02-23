import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { ApiResult, ApiError, QueryOperator, Timestamp } from "../../../types/rest-api";
import type { BalancesResponse } from "../../../types/entities/network";
import { useMirrorNodeClient } from "../../../react/hooks";
import { mirrorNodeKeys } from "../query-keys";

export type { BalancesListParams } from "../../../core/apis/balance-api";

type BalanceQueryFnData<T> = ApiResult<T>;
type BalanceQueryError = ApiError;

export interface UseBalancesOptions extends Omit<
  UseQueryOptions<BalanceQueryFnData<BalancesResponse>, BalanceQueryError>,
  "queryKey" | "queryFn"
> {
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    account?: string;
    "account.balance"?: QueryOperator<number>;
    public_key?: string;
    timestamp?: Timestamp;
  };
}

export type UseBalancesResult = UseQueryResult<
  BalanceQueryFnData<BalancesResponse>,
  BalanceQueryError
>;

export function useBalances(options: UseBalancesOptions = {}): UseBalancesResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.balance.list(),
    queryFn: async () => {
      return client.balance.getBalances(options.params);
    },
  });
}
