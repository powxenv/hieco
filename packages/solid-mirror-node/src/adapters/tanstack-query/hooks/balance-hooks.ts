import { useQuery } from "@tanstack/solid-query";
import type { UseQueryResult } from "@tanstack/solid-query";
import type { ApiResult, ApiError, QueryOperator, Timestamp } from "@hiecom/mirror-node";
import type { BalancesResponse } from "@hiecom/mirror-node";
import type { Accessor } from "solid-js";
import { useMirrorNodeClient, useNetwork } from "../../../solid/hooks";
import { mirrorNodeKeys } from "../query-keys";

export type { BalancesListParams } from "@hiecom/mirror-node";

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
