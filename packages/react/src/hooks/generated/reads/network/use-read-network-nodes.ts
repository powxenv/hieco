import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../../use-hieco-client";
import { useHiecoQuery } from "../../../../internal/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../../internal/types";

type Operation = HiecoClient["reads"]["network"]["nodes"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseReadNetworkNodesOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useReadNetworkNodes<TData = QueryFnData>(
  params?: Arg0,
  options?: UseReadNetworkNodesOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.network.nodes",
    args: [params],
    queryFn: () => client.reads.network.nodes(params).now(),
    options,
  });
}
