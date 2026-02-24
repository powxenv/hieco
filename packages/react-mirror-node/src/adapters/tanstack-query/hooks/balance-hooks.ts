import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { ApiResult, ApiError, QueryOperator, Timestamp } from "@hiecom/mirror-node";
import type { BalancesResponse } from "@hiecom/mirror-node";
import { useMirrorNodeClient, useNetwork } from "../../../react/hooks";
import { mirrorNodeKeys } from "../query-keys";

export type { BalancesListParams } from "@hiecom/mirror-node";

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
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.balance.list(network),
    queryFn: async () => {
      return client.balance.getBalances(options.params);
    },
  });
}
