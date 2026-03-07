import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoQuery } from "../../shared/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationData
} from "../../shared/types";

type Operation = HiecoClient["topic"]["info"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseTopicInfoOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useTopicInfo<TData = QueryFnData>(
  topicId: Arg0,
  options?: UseTopicInfoOptions<TData>
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "topic.info",
    args: [topicId],
    queryFn: () => client.topic.info(topicId).now(),
    options,
  });
}
