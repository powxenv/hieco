import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type {
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseQueryResult,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { ApiResult, ApiError, PaginationParams } from "@hieco/mirror";
import type { Topic, TopicMessage } from "@hieco/mirror";
import type { PaginatedResponse } from "@hieco/mirror";
import { useMirrorNodeClient, useNetwork } from "./context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";

export type { TopicMessagesParams } from "@hieco/mirror";

export interface UseTopicInfoOptions extends Omit<
  UseQueryOptions<ApiResult<Topic>, ApiError>,
  "queryKey" | "queryFn"
> {
  topicId: string;
}

type UseTopicInfoResult = UseQueryResult<ApiResult<Topic>, ApiError>;

export interface UseTopicMessagesOptions extends Omit<
  UseQueryOptions<ApiResult<TopicMessage[]>, ApiError>,
  "queryKey" | "queryFn"
> {
  topicId: string;
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    encoding?: "base64" | "utf-8";
    transaction_id?: string;
  };
}

type UseTopicMessagesResult = UseQueryResult<ApiResult<TopicMessage[]>, ApiError>;

export interface UseTopicMessageOptions extends Omit<
  UseQueryOptions<ApiResult<TopicMessage>, ApiError>,
  "queryKey" | "queryFn"
> {
  topicId: string;
  sequenceNumber: number;
}

type UseTopicMessageResult = UseQueryResult<ApiResult<TopicMessage>, ApiError>;

export interface UseTopicsOptions extends Omit<
  UseQueryOptions<ApiResult<Topic[]>, ApiError>,
  "queryKey" | "queryFn"
> {
  params?: PaginationParams;
}

type UseTopicsResult = UseQueryResult<ApiResult<Topic[]>, ApiError>;

export interface UseTopicsInfiniteOptions extends Omit<
  UseInfiniteQueryOptions<ApiResult<PaginatedResponse<Topic>>, ApiError>,
  "queryKey" | "queryFn" | "getNextPageParam"
> {
  params?: { limit?: number; order?: "asc" | "desc" };
}

type UseTopicsInfiniteResult = UseInfiniteQueryResult<
  ApiResult<PaginatedResponse<Topic>>,
  ApiError
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
  UseQueryOptions<ApiResult<TopicMessage>, ApiError>,
  "queryKey" | "queryFn"
> {
  timestamp: string;
}

type UseTopicMessageByTimestampResult = UseQueryResult<ApiResult<TopicMessage>, ApiError>;

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
