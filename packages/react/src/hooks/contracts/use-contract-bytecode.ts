import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoQuery } from "../../shared/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../shared/types";

type Operation = HiecoClient["contract"]["bytecode"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseContractBytecodeOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useContractBytecode<TData = QueryFnData>(
  contractId: Arg0,
  options?: UseContractBytecodeOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "contract.bytecode",
    args: [contractId],
    queryFn: () => client.contract.bytecode(contractId).now(),
    options,
  });
}
