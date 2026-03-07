import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../shared/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationData
} from "../../../shared/types";

type Operation = HiecoClient["reads"]["topics"]["info"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseReadTopicInfoOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useReadTopicInfo<TData = QueryFnData>(
  topicId: Arg0,
  options?: UseReadTopicInfoOptions<TData>
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.topics.info",
    args: [topicId],
    queryFn: () => client.reads.topics.info(topicId).now(),
    options,
  });
}
