import { useQuery } from "@tanstack/solid-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/solid-query";
import type { ApiResult, ApiError, EntityId, QueryOperator } from "@hiecom/mirror-node";
import type { Schedule } from "@hiecom/mirror-node";
import { useMirrorNodeClient, useNetwork } from "../../../solid/hooks";
import { mirrorNodeKeys } from "../query-keys";
import type { Accessor } from "solid-js";

export type { ScheduleListParams } from "@hiecom/mirror-node";

type ScheduleQueryFnData<T> = ApiResult<T>;
type ScheduleQueryError = ApiError;

export interface UseScheduleInfoOptions extends Omit<
  UseQueryOptions<ScheduleQueryFnData<Schedule>, ScheduleQueryError>,
  "queryKey" | "queryFn"
> {
  scheduleId: Accessor<EntityId>;
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
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly "creator.account.id"?: EntityId | QueryOperator<EntityId>;
    readonly "payer.account.id"?: EntityId | QueryOperator<EntityId>;
    readonly schedule_id?: EntityId;
    readonly deleted?: boolean;
  };
}

export type UseSchedulesResult = UseQueryResult<
  ScheduleQueryFnData<Schedule[]>,
  ScheduleQueryError
>;

export interface UseSchedulesInfiniteOptions extends Omit<
  UseQueryOptions<ScheduleQueryFnData<Schedule[]>, ScheduleQueryError>,
  "queryKey" | "queryFn"
> {
  params?: { readonly limit?: number; readonly order?: "asc" | "desc" };
}

export type UseSchedulesInfiniteResult = UseQueryResult<
  ScheduleQueryFnData<Schedule[]>,
  ScheduleQueryError
>;

export function useScheduleInfo(options: UseScheduleInfoOptions): UseScheduleInfoResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.schedule.info(network(), options.scheduleId()),
    queryFn: async () => {
      return client().schedule.getInfo(options.scheduleId());
    },
  }));
}

export function useSchedules(options: UseSchedulesOptions = {}): UseSchedulesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.schedule.list(network()),
    queryFn: async () => {
      return client().schedule.listPaginated(options.params);
    },
  }));
}

export function useSchedulesInfinite(
  options: UseSchedulesInfiniteOptions,
): UseSchedulesInfiniteResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.schedule.list(network()),
    queryFn: async () => {
      const params = {
        ...options.params,
        limit: options.params?.limit ?? 25,
      };

      const result = await client().schedule.listPaginated(params);

      return result;
    },
  }));
}
