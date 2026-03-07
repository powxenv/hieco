import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoQuery } from "../../shared/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../shared/types";

type Operation = HiecoClient["contract"]["estimateGas"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseContractEstimateGasOptions<TData = QueryFnData> = HiecoQueryOptions<
  QueryFnData,
  TData
>;

export function useContractEstimateGas<TData = QueryFnData>(
  params: Arg0,
  options?: UseContractEstimateGasOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "contract.estimateGas",
    args: [params],
    queryFn: () => client.contract.estimateGas(params).now(),
    options,
  });
}
