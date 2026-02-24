import { useQuery } from "@tanstack/solid-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/solid-query";
import type { ApiResult, ApiError, EntityId, PaginationParams } from "@hiecom/mirror-node";
import type { Topic, TopicMessage } from "@hiecom/mirror-node";
import { useMirrorNodeClient, useNetwork } from "../../../solid/hooks";
import { mirrorNodeKeys } from "../query-keys";
import type { Accessor } from "solid-js";

export type { TopicMessagesParams } from "@hiecom/mirror-node";

type TopicQueryFnData<T> = ApiResult<T>;
type TopicQueryError = ApiError;

export interface UseTopicInfoOptions extends Omit<
  UseQueryOptions<TopicQueryFnData<Topic>, TopicQueryError>,
  "queryKey" | "queryFn"
> {
  topicId: Accessor<EntityId>;
}

export type UseTopicInfoResult = UseQueryResult<TopicQueryFnData<Topic>, TopicQueryError>;

export interface UseTopicMessagesOptions extends Omit<
  UseQueryOptions<TopicQueryFnData<TopicMessage[]>, TopicQueryError>,
  "queryKey" | "queryFn"
> {
  topicId: Accessor<EntityId>;
  params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly encoding?: "base64" | "utf-8";
    readonly transaction_id?: string;
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
  topicId: Accessor<EntityId>;
  sequenceNumber: Accessor<number>;
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
  UseQueryOptions<TopicQueryFnData<Topic[]>, TopicQueryError>,
  "queryKey" | "queryFn"
> {
  params?: { readonly limit?: number; readonly order?: "asc" | "desc" };
}

export type UseTopicsInfiniteResult = UseQueryResult<TopicQueryFnData<Topic[]>, TopicQueryError>;

export interface UseTopicMessageByTimestampOptions extends Omit<
  UseQueryOptions<TopicQueryFnData<TopicMessage>, TopicQueryError>,
  "queryKey" | "queryFn"
> {
  timestamp: Accessor<string>;
}

export type UseTopicMessageByTimestampResult = UseQueryResult<
  TopicQueryFnData<TopicMessage>,
  TopicQueryError
>;

export function useTopicInfo(options: UseTopicInfoOptions): UseTopicInfoResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.topic.info(network(), options.topicId()),
    queryFn: async () => {
      return client().topic.getInfo(options.topicId());
    },
  }));
}

export function useTopicMessages(options: UseTopicMessagesOptions): UseTopicMessagesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.topic.messages(network(), options.topicId()),
    queryFn: async () => {
      return client().topic.getMessages(options.topicId(), options.params);
    },
  }));
}

export function useTopicMessage(options: UseTopicMessageOptions): UseTopicMessageResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.topic.message(network(), options.topicId(), options.sequenceNumber()),
    queryFn: async () => {
      return client().topic.getMessage(options.topicId(), options.sequenceNumber());
    },
  }));
}

export function useTopics(options: UseTopicsOptions = {}): UseTopicsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.topic.list(network()),
    queryFn: async () => {
      return client().topic.listPaginated(options.params);
    },
  }));
}

export function useTopicsInfinite(options: UseTopicsInfiniteOptions): UseTopicsInfiniteResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.topic.list(network()),
    queryFn: async () => {
      const params = {
        ...options.params,
        limit: options.params?.limit ?? 25,
      };

      const result = await client().topic.listPaginated(params);

      return result;
    },
  }));
}

export function useTopicMessageByTimestamp(
  options: UseTopicMessageByTimestampOptions,
): UseTopicMessageByTimestampResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.topic.messageByTimestamp(network(), options.timestamp()),
    queryFn: async () => {
      return client().topic.getMessageByTimestamp(options.timestamp());
    },
  }));
}
