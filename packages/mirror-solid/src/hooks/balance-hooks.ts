import { useQuery } from "@tanstack/solid-query";
import type { UseQueryResult } from "@tanstack/solid-query";
import type { ApiResult, ApiError, QueryOperator, Timestamp } from "@hieco/mirror";
import type { BalancesResponse } from "@hieco/mirror";
import type { Accessor } from "solid-js";
import { useMirrorNodeClient, useNetwork } from "../context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";

export type { BalancesListParams } from "@hieco/mirror";

export interface CreateBalancesOptions {
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly account?: string;
    readonly "account.balance"?: QueryOperator<number>;
    readonly public_key?: string;
    readonly timestamp?: Timestamp;
  };
  readonly enabled?: boolean;
}

export type CreateBalancesResult = UseQueryResult<ApiResult<BalancesResponse>, ApiError>;

export function createBalances(
  options: Accessor<CreateBalancesOptions> = () => ({}),
): CreateBalancesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.balance.list(network()),
      queryFn: async () => {
        return client().balance.getBalances(opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}
