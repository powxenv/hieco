import { useEffect } from "react";
import type { TopicMessageData, WatchTopicMessagesOptions } from "@hieco/sdk";
import type { EntityId } from "@hieco/utils";
import { useHiecoClient } from "./use-hieco-client";
import { useLatestRef } from "../shared/use-latest-ref";

export interface UseTopicWatchOptions extends WatchTopicMessagesOptions {
  readonly enabled?: boolean;
}

export function useTopicWatch(
  topicId: EntityId | undefined,
  handler: (message: TopicMessageData) => void,
  options?: UseTopicWatchOptions,
): void {
  const client = useHiecoClient();
  const latestHandler = useLatestRef(handler);
  const latestOptions = useLatestRef(options);
  const startTimeMs = options?.startTime?.getTime();
  const endTimeMs = options?.endTime?.getTime();

  useEffect(() => {
    if (!topicId || options?.enabled === false) {
      return;
    }

    const currentOptions = latestOptions.current;
    const stop = client.topic.watch(
      topicId,
      (message) => latestHandler.current(message),
      currentOptions
        ? {
            ...(currentOptions.startTime ? { startTime: currentOptions.startTime } : {}),
            ...(currentOptions.endTime ? { endTime: currentOptions.endTime } : {}),
            ...(currentOptions.limit !== undefined ? { limit: currentOptions.limit } : {}),
            ...(currentOptions.onError
              ? { onError: (error: Error) => latestOptions.current?.onError?.(error) }
              : {}),
          }
        : undefined,
    );

    return () => {
      stop();
    };
  }, [
    client,
    endTimeMs,
    latestHandler,
    latestOptions,
    options?.enabled,
    options?.limit,
    startTimeMs,
    topicId,
  ]);
}
