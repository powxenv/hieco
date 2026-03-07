import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../internal/use-hieco-query";
import type { HiecoQueryOptions, OperationData } from "../../../internal/types";

type Operation = HiecoClient["net"]["pingAll"];
type QueryFnData = OperationData<Operation>;

export type UseNetworkPingAllOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useNetworkPingAll<TData = QueryFnData>(
  options?: UseNetworkPingAllOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "net.pingAll",
    args: [],
    queryFn: () => client.net.pingAll().now(),
    options,
  });
}
