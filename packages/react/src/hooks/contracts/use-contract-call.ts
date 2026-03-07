import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoQuery } from "../../shared/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationData
} from "../../shared/types";

type Operation = HiecoClient["contract"]["call"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseContractCallOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useContractCall<TData = QueryFnData>(
  params: Arg0,
  options?: UseContractCallOptions<TData>
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "contract.call",
    args: [params],
    queryFn: () => client.contract.call(params).now(),
    options,
  });
}
