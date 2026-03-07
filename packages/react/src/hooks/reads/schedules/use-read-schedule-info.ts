import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../shared/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationData
} from "../../../shared/types";

type Operation = HiecoClient["reads"]["schedules"]["info"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseReadScheduleInfoOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useReadScheduleInfo<TData = QueryFnData>(
  scheduleId: Arg0,
  options?: UseReadScheduleInfoOptions<TData>
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.schedules.info",
    args: [scheduleId],
    queryFn: () => client.reads.schedules.info(scheduleId).now(),
    options,
  });
}
