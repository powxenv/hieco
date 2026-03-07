import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../shared/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationArg1,
  OperationData,
} from "../../../shared/types";

type Operation = HiecoClient["reads"]["contracts"]["state"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;
type Arg1 = OperationArg1<Operation>;

export type UseReadContractStateOptions<TData = QueryFnData> = HiecoQueryOptions<
  QueryFnData,
  TData
>;

export function useReadContractState<TData = QueryFnData>(
  contractId: Arg0,
  params?: Arg1,
  options?: UseReadContractStateOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.contracts.state",
    args: [contractId, params],
    queryFn: () => client.reads.contracts.state(contractId, params).now(),
    options,
  });
}
