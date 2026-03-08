import { useQuery, useInfiniteQuery } from "@tanstack/preact-query";
import type {
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseQueryResult,
  UseInfiniteQueryResult,
} from "@tanstack/preact-query";
import type { ApiResult, ApiError, QueryOperator } from "@hieco/mirror";
import type { Schedule } from "@hieco/mirror";
import type { PaginatedResponse } from "@hieco/mirror";
import { useMirrorNodeClient, useNetwork } from "./context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";

export type { ScheduleListParams } from "@hieco/mirror";

export interface UseScheduleInfoOptions extends Omit<
  UseQueryOptions<ApiResult<Schedule>, ApiError>,
  "queryKey" | "queryFn"
> {
  scheduleId: string;
}

type UseScheduleInfoResult = UseQueryResult<ApiResult<Schedule>, ApiError>;

export interface UseSchedulesOptions extends Omit<
  UseQueryOptions<ApiResult<Schedule[]>, ApiError>,
  "queryKey" | "queryFn"
> {
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    "creator.account.id"?: string | QueryOperator<string>;
    "payer.account.id"?: string | QueryOperator<string>;
    schedule_id?: string;
    deleted?: boolean;
  };
}

type UseSchedulesResult = UseQueryResult<ApiResult<Schedule[]>, ApiError>;

export interface UseSchedulesInfiniteOptions extends Omit<
  UseInfiniteQueryOptions<ApiResult<PaginatedResponse<Schedule>>, ApiError>,
  "queryKey" | "queryFn" | "getNextPageParam"
> {
  params?: { limit?: number; order?: "asc" | "desc" };
}

type UseSchedulesInfiniteResult = UseInfiniteQueryResult<
  ApiResult<PaginatedResponse<Schedule>>,
  ApiError
>;

export function useScheduleInfo(options: UseScheduleInfoOptions): UseScheduleInfoResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.schedule.info(network, options.scheduleId),
    queryFn: async () => {
      return client.schedule.getInfo(options.scheduleId);
    },
    enabled: options.enabled !== false,
  });
}

export function useSchedules(options: UseSchedulesOptions = {}): UseSchedulesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.schedule.list(network),
    queryFn: async () => {
      return client.schedule.listPaginated(options.params);
    },
  });
}

export function useSchedulesInfinite(
  options: UseSchedulesInfiniteOptions,
): UseSchedulesInfiniteResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useInfiniteQuery({
    ...options,
    queryKey: mirrorNodeKeys.schedule.list(network),
    queryFn: async ({ pageParam }) => {
      if (typeof pageParam === "string") {
        return client.schedule.listPaginatedPageByUrl(pageParam);
      }
      return client.schedule.listPaginatedPage({
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
