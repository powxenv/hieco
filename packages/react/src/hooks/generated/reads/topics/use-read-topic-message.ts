import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../../use-hieco-client";
import { useHiecoQuery } from "../../../../internal/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationArg1,
  OperationData,
} from "../../../../internal/types";

type Operation = HiecoClient["reads"]["topics"]["message"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;
type Arg1 = OperationArg1<Operation>;

export type UseReadTopicMessageOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useReadTopicMessage<TData = QueryFnData>(
  topicId: Arg0,
  sequenceNumber: Arg1,
  options?: UseReadTopicMessageOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.topics.message",
    args: [topicId, sequenceNumber],
    queryFn: () => client.reads.topics.message(topicId, sequenceNumber).now(),
    options,
  });
}
