import { useQuery, useInfiniteQuery } from "@tanstack/solid-query";
import type { UseQueryResult, UseInfiniteQueryResult } from "@tanstack/solid-query";
import type { ApiResult, ApiError, EntityId, PaginationParams } from "@hiecom/mirror-node";
import type { PaginatedResponse } from "@hiecom/mirror-node";
import type { Accessor } from "solid-js";
import { useMirrorNodeClient, useNetwork } from "../../../solid/hooks";
import { mirrorNodeKeys } from "../query-keys";

export type { TopicMessagesParams } from "@hiecom/mirror-node";

export interface CreateTopicInfoOptions {
  readonly topicId: EntityId;
  readonly enabled?: boolean;
}

export type CreateTopicInfoResult = UseQueryResult<ApiResult<any>, ApiError>;

export interface CreateTopicMessagesOptions {
  readonly topicId: EntityId;
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly encoding?: "base64" | "utf-8";
    readonly transaction_id?: string;
  };
  readonly enabled?: boolean;
}

export type CreateTopicMessagesResult = UseQueryResult<ApiResult<any>, ApiError>;

export interface CreateTopicMessageOptions {
  readonly topicId: EntityId;
  readonly sequenceNumber: number;
  readonly enabled?: boolean;
}

export type CreateTopicMessageResult = UseQueryResult<ApiResult<any>, ApiError>;

export interface CreateTopicsOptions {
  readonly params?: PaginationParams;
  readonly enabled?: boolean;
}

export type CreateTopicsResult = UseQueryResult<ApiResult<any>, ApiError>;

export interface CreateTopicsInfiniteOptions {
  readonly params?: { readonly limit?: number; readonly order?: "asc" | "desc" };
  readonly enabled?: boolean;
}

export type CreateTopicsInfiniteResult = UseInfiniteQueryResult<
  ApiResult<PaginatedResponse<any>>,
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

  return useInfiniteQuery<
    ApiResult<PaginatedResponse<any>>,
    ApiError,
    ApiResult<PaginatedResponse<any>>,
    readonly ["mirror-node", string, "topics", "list"],
    string | undefined
  >(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.topic.list(network()),
      queryFn: async ({ pageParam }) => {
        if (pageParam) {
          return client().topic.listPaginatedPageByUrl(pageParam);
        }
        return client().topic.listPaginatedPage({
          ...opts.params,
          limit: opts.params?.limit ?? 25,
        });
      },
      getNextPageParam: (lastPage) => {
        if (!lastPage.success) return undefined;
        return lastPage.data.links.next ?? undefined;
      },
      initialPageParam: undefined,
    };
  });
}

export interface CreateTopicMessageByTimestampOptions {
  readonly timestamp: string;
  readonly enabled?: boolean;
}

export type CreateTopicMessageByTimestampResult = UseQueryResult<ApiResult<any>, ApiError>;

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
