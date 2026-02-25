import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type {
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseQueryResult,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { ApiResult, ApiError, EntityId, PaginationParams } from "@hiecom/mirror-js";
import type { Topic, TopicMessage } from "@hiecom/mirror-js";
import type { PaginatedResponse } from "@hiecom/mirror-js";
import { useMirrorNodeClient, useNetwork } from "../context-hooks";
import { mirrorNodeKeys } from "@hiecom/mirror-shared";

export type { TopicMessagesParams } from "@hiecom/mirror-js";

type TopicQueryFnData<T> = ApiResult<T>;
type TopicQueryError = ApiError;

export interface UseTopicInfoOptions extends Omit<
  UseQueryOptions<TopicQueryFnData<Topic>, TopicQueryError>,
  "queryKey" | "queryFn"
> {
  topicId: EntityId;
}

export type UseTopicInfoResult = UseQueryResult<TopicQueryFnData<Topic>, TopicQueryError>;

export interface UseTopicMessagesOptions extends Omit<
  UseQueryOptions<TopicQueryFnData<TopicMessage[]>, TopicQueryError>,
  "queryKey" | "queryFn"
> {
  topicId: EntityId;
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    encoding?: "base64" | "utf-8";
    transaction_id?: string;
  };
}

export type UseTopicMessagesResult = UseQueryResult<
  TopicQueryFnData<TopicMessage[]>,
  TopicQueryError
>;

export interface UseTopicMessageOptions extends Omit<
  UseQueryOptions<TopicQueryFnData<TopicMessage>, TopicQueryError>,
  "queryKey" | "queryFn"
> {
  topicId: EntityId;
  sequenceNumber: number;
}

export type UseTopicMessageResult = UseQueryResult<TopicQueryFnData<TopicMessage>, TopicQueryError>;

export interface UseTopicsOptions extends Omit<
  UseQueryOptions<TopicQueryFnData<Topic[]>, TopicQueryError>,
  "queryKey" | "queryFn"
> {
  params?: PaginationParams;
}

export type UseTopicsResult = UseQueryResult<TopicQueryFnData<Topic[]>, TopicQueryError>;

export interface UseTopicsInfiniteOptions extends Omit<
  UseInfiniteQueryOptions<TopicQueryFnData<PaginatedResponse<Topic>>, TopicQueryError>,
  "queryKey" | "queryFn" | "getNextPageParam"
> {
  params?: { limit?: number; order?: "asc" | "desc" };
}

export type UseTopicsInfiniteResult = UseInfiniteQueryResult<
  TopicQueryFnData<PaginatedResponse<Topic>>,
  TopicQueryError
>;

export function useTopicInfo(options: UseTopicInfoOptions): UseTopicInfoResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.topic.info(network, options.topicId),
    queryFn: async () => {
      return client.topic.getInfo(options.topicId);
    },
  });
}

export function useTopicMessages(options: UseTopicMessagesOptions): UseTopicMessagesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.topic.messages(network, options.topicId),
    queryFn: async () => {
      return client.topic.getMessages(options.topicId, options.params);
    },
  });
}

export function useTopicMessage(options: UseTopicMessageOptions): UseTopicMessageResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.topic.message(network, options.topicId, options.sequenceNumber),
    queryFn: async () => {
      return client.topic.getMessage(options.topicId, options.sequenceNumber);
    },
  });
}

export function useTopics(options: UseTopicsOptions = {}): UseTopicsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.topic.list(network),
    queryFn: async () => {
      return client.topic.listPaginated(options.params);
    },
  });
}

export function useTopicsInfinite(options: UseTopicsInfiniteOptions): UseTopicsInfiniteResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useInfiniteQuery({
    ...options,
    queryKey: mirrorNodeKeys.topic.list(network),
    queryFn: async ({ pageParam }) => {
      if (typeof pageParam === "string") {
        return client.topic.listPaginatedPageByUrl(pageParam);
      }
      return client.topic.listPaginatedPage({
        ...options.params,
        limit: options.params?.limit ?? 25,
      });
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.success) return undefined;
      return lastPage.data.links.next ?? undefined;
    },
    initialPageParam: null,
  });
}

export interface UseTopicMessageByTimestampOptions extends Omit<
  UseQueryOptions<TopicQueryFnData<TopicMessage>, TopicQueryError>,
  "queryKey" | "queryFn"
> {
  timestamp: string;
}

export type UseTopicMessageByTimestampResult = UseQueryResult<
  TopicQueryFnData<TopicMessage>,
  TopicQueryError
>;

export function useTopicMessageByTimestamp(
  options: UseTopicMessageByTimestampOptions,
): UseTopicMessageByTimestampResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.topic.messageByTimestamp(network, options.timestamp),
    queryFn: async () => {
      return client.topic.getMessageByTimestamp(options.timestamp);
    },
  });
}
