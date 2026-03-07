import { useEffect, useRef } from "react";
import type { TopicMessageData, WatchTopicMessagesOptions } from "@hieco/sdk";
import type { EntityId } from "@hieco/utils";
import { useHiecoClient } from "./use-hieco-client";

export interface UseTopicWatchOptions extends WatchTopicMessagesOptions {
  readonly enabled?: boolean;
}

export function useTopicWatch(
  topicId: EntityId | undefined,
  handler: (message: TopicMessageData) => void,
  options?: UseTopicWatchOptions,
): void {
  const client = useHiecoClient();
  const handlerRef = useRef(handler);
  const optionsRef = useRef(options);
  const startTimeMs = options?.startTime?.getTime();
  const endTimeMs = options?.endTime?.getTime();

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    if (!topicId || options?.enabled === false) {
      return;
    }

    const currentOptions = optionsRef.current;
    const stop = client.topic.watch(
      topicId,
      (message) => handlerRef.current(message),
      currentOptions
        ? {
            ...(currentOptions.startTime ? { startTime: currentOptions.startTime } : {}),
            ...(currentOptions.endTime ? { endTime: currentOptions.endTime } : {}),
            ...(currentOptions.limit !== undefined ? { limit: currentOptions.limit } : {}),
            ...(currentOptions.onError
              ? { onError: (error: Error) => optionsRef.current?.onError?.(error) }
              : {}),
          }
        : undefined,
    );

    return () => {
      stop();
    };
  }, [client, endTimeMs, options?.enabled, options?.limit, startTimeMs, topicId]);
}
