import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type {
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseQueryResult,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type { ApiResult, ApiError, EntityId, QueryOperator } from "../../../types/rest-api";
import type { Schedule } from "../../../types/entities/schedule";
import { useMirrorNodeClient } from "../../../react/hooks";
import { mirrorNodeKeys } from "../query-keys";

export type { ScheduleListParams } from "../../../core/apis/schedule-api";

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
  UseInfiniteQueryOptions<ScheduleQueryFnData<Schedule[]>, ScheduleQueryError>,
  "queryKey" | "queryFn" | "getNextPageParam"
> {
  params?: { limit?: number; order?: "asc" | "desc" };
}

export type UseSchedulesInfiniteResult = UseInfiniteQueryResult<
  ScheduleQueryFnData<Schedule[]>,
  ScheduleQueryError
>;

export function useScheduleInfo(options: UseScheduleInfoOptions): UseScheduleInfoResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.schedule.info(options.scheduleId),
    queryFn: async () => {
      return client.schedule.getInfo(options.scheduleId);
    },
    enabled: options.enabled !== false,
  });
}

export function useSchedules(options: UseSchedulesOptions = {}): UseSchedulesResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.schedule.list(),
    queryFn: async () => {
      return client.schedule.listPaginated(options.params);
    },
  });
}

export function useSchedulesInfinite(
  options: UseSchedulesInfiniteOptions,
): UseSchedulesInfiniteResult {
  const client = useMirrorNodeClient();

  return useInfiniteQuery({
    ...options,
    queryKey: mirrorNodeKeys.schedule.list(),
    queryFn: async () => {
      const params = {
        ...options.params,
        limit: options.params?.limit ?? 25,
      };

      const result = await client.schedule.listPaginated(params);

      return result;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.success || lastPage.data.length === 0) {
        return undefined;
      }
      return lastPage.data.length;
    },
    initialPageParam: 0,
  });
}
