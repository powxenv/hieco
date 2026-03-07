import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../internal/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../internal/types";

type Operation = HiecoClient["contract"]["simulate"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseContractSimulateOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useContractSimulate<TData = QueryFnData>(
  params: Arg0,
  options?: UseContractSimulateOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "contract.simulate",
    args: [params],
    queryFn: () => client.contract.simulate(params).now(),
    options,
  });
}
