import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../../use-hieco-client";
import { useHiecoQuery } from "../../../../internal/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../../internal/types";

type Operation = HiecoClient["reads"]["schedules"]["listPageByUrl"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseReadSchedulesListPageByUrlOptions<TData = QueryFnData> = HiecoQueryOptions<
  QueryFnData,
  TData
>;

export function useReadSchedulesListPageByUrl<TData = QueryFnData>(
  url: Arg0,
  options?: UseReadSchedulesListPageByUrlOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.schedules.listPageByUrl",
    args: [url],
    queryFn: () => client.reads.schedules.listPageByUrl(url).now(),
    options,
  });
}
