import { TopicMessageQuery, Client } from "@hiero-ledger/sdk";
import type { WatchTopicMessagesParams, Unsubscribe } from "../types.ts";

export function watchTopicMessages(
  nativeClient: Client,
  params: WatchTopicMessagesParams,
): Unsubscribe {
  const query = new TopicMessageQuery().setTopicId(params.topicId);

  if (params.startTime !== undefined) query.setStartTime(params.startTime);
  if (params.endTime !== undefined) query.setEndTime(params.endTime);
  if (params.limit !== undefined) query.setLimit(params.limit);

  const onError = params.onError;
  const errorHandler = onError ? (_message: unknown, error: Error) => onError(error) : null;

  const handle = query.subscribe(nativeClient, errorHandler, (message) => {
    params.handler({
      consensusTimestamp: message.consensusTimestamp.toString(),
      contents: message.contents,
      runningHash: message.runningHash,
      sequenceNumber: message.sequenceNumber.toNumber(),
      topicId: params.topicId,
    });
  });

  return () => handle.unsubscribe();
}
