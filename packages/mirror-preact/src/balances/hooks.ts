import { useQuery } from "@tanstack/preact-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/preact-query";
import type { ApiResult, ApiError, QueryOperator } from "@hieco/mirror";
import type { BalancesResponse } from "@hieco/mirror";
import { useMirrorNodeClient, useNetwork } from "../context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";

export type { BalancesListParams } from "@hieco/mirror";

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
    timestamp?: string;
  };
}

export type UseBalancesResult = UseQueryResult<
  BalanceQueryFnData<BalancesResponse>,
  BalanceQueryError
>;

export function useBalances(options: UseBalancesOptions = {}): UseBalancesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.balance.list(network),
    queryFn: async () => {
      return client.balance.getBalances(options.params);
    },
  });
}
