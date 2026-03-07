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

type Operation = HiecoClient["topic"]["messages"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;
type Arg1 = OperationArg1<Operation>;

export type UseTopicMessagesOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useTopicMessages<TData = QueryFnData>(
  topicId: Arg0,
  params?: Arg1,
  options?: UseTopicMessagesOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "topic.messages",
    args: [topicId, params],
    queryFn: () => client.topic.messages(topicId, params).now(),
    options,
  });
}
