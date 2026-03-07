import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../shared/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationArg1,
  OperationData
} from "../../../shared/types";

type Operation = HiecoClient["reads"]["contracts"]["results"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;
type Arg1 = OperationArg1<Operation>;

export type UseReadContractResultsOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useReadContractResults<TData = QueryFnData>(
  contractId: Arg0,
  params?: Arg1,
  options?: UseReadContractResultsOptions<TData>
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.contracts.results",
    args: [contractId, params],
    queryFn: () => client.reads.contracts.results(contractId, params).now(),
    options,
  });
}
