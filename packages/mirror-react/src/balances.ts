import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { ApiResult, ApiError, QueryOperator } from "@hieco/mirror";
import type { BalancesResponse } from "@hieco/mirror";
import { useMirrorNodeClient, useNetwork } from "./context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";

export type { BalancesListParams } from "@hieco/mirror";

export interface UseBalancesOptions extends Omit<
  UseQueryOptions<ApiResult<BalancesResponse>, ApiError>,
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

type UseBalancesResult = UseQueryResult<ApiResult<BalancesResponse>, ApiError>;

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
