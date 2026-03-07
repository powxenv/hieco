import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../shared/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../shared/types";

type Operation = HiecoClient["reads"]["contracts"]["logsAll"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseReadContractsLogsAllOptions<TData = QueryFnData> = HiecoQueryOptions<
  QueryFnData,
  TData
>;

export function useReadContractsLogsAll<TData = QueryFnData>(
  params?: Arg0,
  options?: UseReadContractsLogsAllOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.contracts.logsAll",
    args: [params],
    queryFn: () => client.reads.contracts.logsAll(params).now(),
    options,
  });
}
