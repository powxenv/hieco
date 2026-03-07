import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../../use-hieco-client";
import { useHiecoQuery } from "../../../../internal/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../../internal/types";

type Operation = HiecoClient["reads"]["contracts"]["call"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseReadContractCallOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useReadContractCall<TData = QueryFnData>(
  params: Arg0,
  options?: UseReadContractCallOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.contracts.call",
    args: [params],
    queryFn: () => client.reads.contracts.call(params).now(),
    options,
  });
}
