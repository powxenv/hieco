import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoQuery } from "../../shared/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationData
} from "../../shared/types";

type Operation = HiecoClient["schedule"]["info"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseScheduleInfoOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useScheduleInfo<TData = QueryFnData>(
  scheduleId: Arg0,
  options?: UseScheduleInfoOptions<TData>
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "schedule.info",
    args: [scheduleId],
    queryFn: () => client.schedule.info(scheduleId).now(),
    options,
  });
}
