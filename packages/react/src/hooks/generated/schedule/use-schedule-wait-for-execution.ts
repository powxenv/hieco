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

type Operation = HiecoClient["schedule"]["waitForExecution"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;
type Arg1 = OperationArg1<Operation>;

export type UseScheduleWaitForExecutionOptions<TData = QueryFnData> = HiecoQueryOptions<
  QueryFnData,
  TData
>;

export function useScheduleWaitForExecution<TData = QueryFnData>(
  scheduleId: Arg0,
  waitOptions?: Arg1,
  options?: UseScheduleWaitForExecutionOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "schedule.waitForExecution",
    args: [scheduleId, waitOptions],
    queryFn: () => client.schedule.waitForExecution(scheduleId, waitOptions).now(),
    options,
  });
}
