import { useQuery } from "@tanstack/solid-query";
import type { UseQueryResult, UseInfiniteQueryResult } from "@tanstack/solid-query";
import type { ApiResult, ApiError, PaginationParams } from "@hieco/mirror";
import type { PaginatedResponse, Topic, TopicMessage } from "@hieco/mirror";
import type { Accessor } from "solid-js";
import { useMirrorNodeClient, useNetwork } from "./context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";
import { createMirrorNodeInfiniteQuery } from "./shared/infinite";

export type { TopicMessagesParams } from "@hieco/mirror";

export interface CreateTopicInfoOptions {
  readonly topicId: string;
  readonly enabled?: boolean;
}

type CreateTopicInfoResult = UseQueryResult<ApiResult<Topic>, ApiError>;

export interface CreateTopicMessagesOptions {
  readonly topicId: string;
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly encoding?: "base64" | "utf-8";
    readonly transaction_id?: string;
  };
  readonly enabled?: boolean;
}

type CreateTopicMessagesResult = UseQueryResult<ApiResult<TopicMessage[]>, ApiError>;

export interface CreateTopicMessageOptions {
  readonly topicId: string;
  readonly sequenceNumber: number;
  readonly enabled?: boolean;
}

type CreateTopicMessageResult = UseQueryResult<ApiResult<TopicMessage>, ApiError>;

export interface CreateTopicsOptions {
  readonly params?: PaginationParams;
  readonly enabled?: boolean;
}

type CreateTopicsResult = UseQueryResult<ApiResult<Topic[]>, ApiError>;

export interface CreateTopicsInfiniteOptions {
  readonly params?: { readonly limit?: number; readonly order?: "asc" | "desc" };
  readonly enabled?: boolean;
}

type CreateTopicsInfiniteResult = UseInfiniteQueryResult<
  ApiResult<PaginatedResponse<Topic>>,
  ApiError
>;

export function createTopicInfo(options: Accessor<CreateTopicInfoOptions>): CreateTopicInfoResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.topic.info(network(), opts.topicId),
      queryFn: async () => {
        return client().topic.getInfo(opts.topicId);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createTopicMessages(
  options: Accessor<CreateTopicMessagesOptions>,
): CreateTopicMessagesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.topic.messages(network(), opts.topicId),
      queryFn: async () => {
        return client().topic.getMessages(opts.topicId, opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createTopicMessage(
  options: Accessor<CreateTopicMessageOptions>,
): CreateTopicMessageResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.topic.message(network(), opts.topicId, opts.sequenceNumber),
      queryFn: async () => {
        return client().topic.getMessage(opts.topicId, opts.sequenceNumber);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createTopics(
  options: Accessor<CreateTopicsOptions> = () => ({}),
): CreateTopicsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.topic.list(network()),
      queryFn: async () => {
        return client().topic.listPaginated(opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createTopicsInfinite(
  options: Accessor<CreateTopicsInfiniteOptions>,
): CreateTopicsInfiniteResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return createMirrorNodeInfiniteQuery(
    mirrorNodeKeys.topic.list(network()),
    options,
    (pageParam, opts) => {
      if (pageParam) {
        return client().topic.listPaginatedPageByUrl(pageParam);
      }
      return client().topic.listPaginatedPage({
        ...opts.params,
        limit: opts.params?.limit ?? 25,
      });
    },
    (lastPage) => {
      if (!lastPage.success) return undefined;
      return lastPage.data.links.next ?? undefined;
    },
  );
}

export interface CreateTopicMessageByTimestampOptions {
  readonly timestamp: string;
  readonly enabled?: boolean;
}

type CreateTopicMessageByTimestampResult = UseQueryResult<ApiResult<TopicMessage>, ApiError>;

export function createTopicMessageByTimestamp(
  options: Accessor<CreateTopicMessageByTimestampOptions>,
): CreateTopicMessageByTimestampResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.topic.messageByTimestamp(network(), opts.timestamp),
      queryFn: async () => {
        return client().topic.getMessageByTimestamp(opts.timestamp);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}
