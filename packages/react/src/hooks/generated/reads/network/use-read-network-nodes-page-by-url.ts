import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../../use-hieco-client";
import { useHiecoQuery } from "../../../../internal/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../../internal/types";

type Operation = HiecoClient["reads"]["network"]["nodesPageByUrl"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseReadNetworkNodesPageByUrlOptions<TData = QueryFnData> = HiecoQueryOptions<
  QueryFnData,
  TData
>;

export function useReadNetworkNodesPageByUrl<TData = QueryFnData>(
  url: Arg0,
  options?: UseReadNetworkNodesPageByUrlOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.network.nodesPageByUrl",
    args: [url],
    queryFn: () => client.reads.network.nodesPageByUrl(url).now(),
    options,
  });
}
