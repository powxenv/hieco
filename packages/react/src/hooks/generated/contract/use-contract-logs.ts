import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../internal/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationArg1,
  OperationData,
} from "../../../internal/types";

type Operation = HiecoClient["contract"]["logs"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;
type Arg1 = OperationArg1<Operation>;

export type UseContractLogsOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useContractLogs<TData = QueryFnData>(
  contractId: Arg0,
  params?: Arg1,
  options?: UseContractLogsOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "contract.logs",
    args: [contractId, params],
    queryFn: () => client.contract.logs(contractId, params).now(),
    options,
  });
}
