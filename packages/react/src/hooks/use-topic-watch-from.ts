import { useEffect, useRef } from "react";
import type { TopicMessageData, WatchTopicMessagesFromOptions } from "@hieco/sdk";
import type { EntityId } from "@hieco/utils";
import { useHiecoClient } from "./use-hieco-client";

export interface UseTopicWatchFromOptions extends WatchTopicMessagesFromOptions {
  readonly enabled?: boolean;
}

export function useTopicWatchFrom(
  topicId: EntityId | undefined,
  handler: (message: TopicMessageData) => void,
  options?: UseTopicWatchFromOptions,
): void {
  const client = useHiecoClient();
  const handlerRef = useRef(handler);
  const optionsRef = useRef(options);

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
    const stop = client.topic.watchFrom(
      topicId,
      (message) => handlerRef.current(message),
      currentOptions
        ? {
            ...(currentOptions.sinceSequence !== undefined
              ? { sinceSequence: currentOptions.sinceSequence }
              : {}),
            ...(currentOptions.sinceTimestamp
              ? { sinceTimestamp: currentOptions.sinceTimestamp }
              : {}),
            ...(currentOptions.resume !== undefined ? { resume: currentOptions.resume } : {}),
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
  }, [
    client,
    options?.enabled,
    options?.limit,
    options?.resume,
    options?.sinceSequence,
    options?.sinceTimestamp,
    topicId,
  ]);
}
