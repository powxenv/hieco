import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../../use-hieco-client";
import { useHiecoQuery } from "../../../../internal/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../../internal/types";

type Operation = HiecoClient["reads"]["topics"]["messageByTimestamp"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseReadTopicMessageByTimestampOptions<TData = QueryFnData> = HiecoQueryOptions<
  QueryFnData,
  TData
>;

export function useReadTopicMessageByTimestamp<TData = QueryFnData>(
  timestamp: Arg0,
  options?: UseReadTopicMessageByTimestampOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.topics.messageByTimestamp",
    args: [timestamp],
    queryFn: () => client.reads.topics.messageByTimestamp(timestamp).now(),
    options,
  });
}
