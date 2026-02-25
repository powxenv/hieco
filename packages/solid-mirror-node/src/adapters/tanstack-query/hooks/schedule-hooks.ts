import { useQuery } from "@tanstack/solid-query";
import type { UseQueryResult, UseInfiniteQueryResult } from "@tanstack/solid-query";
import type { ApiResult, ApiError, EntityId, QueryOperator } from "@hiecom/mirror-node";
import type { Schedule } from "@hiecom/mirror-node";
import type { PaginatedResponse } from "@hiecom/mirror-node";
import type { Accessor } from "solid-js";
import { useMirrorNodeClient, useNetwork } from "../../../solid/hooks";
import { mirrorNodeKeys } from "../query-keys";
import { createMirrorNodeInfiniteQuery } from "../utils";

export type { ScheduleListParams } from "@hiecom/mirror-node";

export interface CreateScheduleInfoOptions {
  readonly scheduleId: EntityId;
  readonly enabled?: boolean;
}

export type CreateScheduleInfoResult = UseQueryResult<ApiResult<Schedule>, ApiError>;

export interface CreateSchedulesOptions {
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly "creator.account.id"?: EntityId | QueryOperator<EntityId>;
    readonly "payer.account.id"?: EntityId | QueryOperator<EntityId>;
    readonly schedule_id?: EntityId;
    readonly deleted?: boolean;
  };
  readonly enabled?: boolean;
}

export type CreateSchedulesResult = UseQueryResult<ApiResult<Schedule[]>, ApiError>;

export interface CreateSchedulesInfiniteOptions {
  readonly params?: { readonly limit?: number; readonly order?: "asc" | "desc" };
  readonly enabled?: boolean;
}

export type CreateSchedulesInfiniteResult = UseInfiniteQueryResult<
  ApiResult<PaginatedResponse<Schedule>>,
  ApiError
>;

export function createScheduleInfo(
  options: Accessor<CreateScheduleInfoOptions>,
): CreateScheduleInfoResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.schedule.info(network(), opts.scheduleId),
      queryFn: async () => {
        return client().schedule.getInfo(opts.scheduleId);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createSchedules(
  options: Accessor<CreateSchedulesOptions> = () => ({}),
): CreateSchedulesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.schedule.list(network()),
      queryFn: async () => {
        return client().schedule.listPaginated(opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createSchedulesInfinite(
  options: Accessor<CreateSchedulesInfiniteOptions>,
): CreateSchedulesInfiniteResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return createMirrorNodeInfiniteQuery(
    mirrorNodeKeys.schedule.list(network()),
    options,
    (pageParam, opts) => {
      if (pageParam) {
        return client().schedule.listPaginatedPageByUrl(pageParam);
      }
      return client().schedule.listPaginatedPage({
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
