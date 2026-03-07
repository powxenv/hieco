import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../shared/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationData
} from "../../../shared/types";

type Operation = HiecoClient["reads"]["contracts"]["resultsAll"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseReadContractsResultsAllOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useReadContractsResultsAll<TData = QueryFnData>(
  params?: Arg0,
  options?: UseReadContractsResultsAllOptions<TData>
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.contracts.resultsAll",
    args: [params],
    queryFn: () => client.reads.contracts.resultsAll(params).now(),
    options,
  });
}
