import { useQuery, useInfiniteQuery } from "@tanstack/preact-query";
import type {
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseQueryResult,
  UseInfiniteQueryResult,
} from "@tanstack/preact-query";
import type { ApiResult, ApiError, EntityId, QueryOperator } from "@hieco/mirror";
import type { Schedule } from "@hieco/mirror";
import type { PaginatedResponse } from "@hieco/mirror";
import { useMirrorNodeClient, useNetwork } from "../context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";

export type { ScheduleListParams } from "@hieco/mirror";

type ScheduleQueryFnData<T> = ApiResult<T>;
type ScheduleQueryError = ApiError;

export interface UseScheduleInfoOptions extends Omit<
  UseQueryOptions<ScheduleQueryFnData<Schedule>, ScheduleQueryError>,
  "queryKey" | "queryFn"
> {
  scheduleId: EntityId;
}

export type UseScheduleInfoResult = UseQueryResult<
  ScheduleQueryFnData<Schedule>,
  ScheduleQueryError
>;

export interface UseSchedulesOptions extends Omit<
  UseQueryOptions<ScheduleQueryFnData<Schedule[]>, ScheduleQueryError>,
  "queryKey" | "queryFn"
> {
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    "creator.account.id"?: EntityId | QueryOperator<EntityId>;
    "payer.account.id"?: EntityId | QueryOperator<EntityId>;
    schedule_id?: EntityId;
    deleted?: boolean;
  };
}

export type UseSchedulesResult = UseQueryResult<
  ScheduleQueryFnData<Schedule[]>,
  ScheduleQueryError
>;

export interface UseSchedulesInfiniteOptions extends Omit<
  UseInfiniteQueryOptions<ScheduleQueryFnData<PaginatedResponse<Schedule>>, ScheduleQueryError>,
  "queryKey" | "queryFn" | "getNextPageParam"
> {
  params?: { limit?: number; order?: "asc" | "desc" };
}

export type UseSchedulesInfiniteResult = UseInfiniteQueryResult<
  ScheduleQueryFnData<PaginatedResponse<Schedule>>,
  ScheduleQueryError
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
