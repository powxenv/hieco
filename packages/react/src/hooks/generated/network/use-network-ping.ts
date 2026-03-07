import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../internal/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../internal/types";

type Operation = HiecoClient["net"]["ping"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseNetworkPingOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useNetworkPing<TData = QueryFnData>(
  nodeAccountId: Arg0,
  options?: UseNetworkPingOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "net.ping",
    args: [nodeAccountId],
    queryFn: () => client.net.ping(nodeAccountId).now(),
    options,
  });
}
