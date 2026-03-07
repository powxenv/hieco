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

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!topicId || options?.enabled === false) {
      return;
    }

    const stop = client.topic.watch(topicId, (message) => handlerRef.current(message), options);

    return () => {
      stop();
    };
  }, [client, options, topicId]);
}
