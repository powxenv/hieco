import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../shared/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationData
} from "../../../shared/types";

type Operation = HiecoClient["reads"]["network"]["fees"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseReadNetworkFeesOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useReadNetworkFees<TData = QueryFnData>(
  params?: Arg0,
  options?: UseReadNetworkFeesOptions<TData>
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.network.fees",
    args: [params],
    queryFn: () => client.reads.network.fees(params).now(),
    options,
  });
}
