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

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!topicId || options?.enabled === false) {
      return;
    }

    const stop = client.topic.watchFrom(topicId, (message) => handlerRef.current(message), options);

    return () => {
      stop();
    };
  }, [client, options, topicId]);
}
