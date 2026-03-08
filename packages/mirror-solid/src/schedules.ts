import { useQuery } from "@tanstack/solid-query";
import type { UseQueryResult, UseInfiniteQueryResult } from "@tanstack/solid-query";
import type { ApiResult, ApiError, QueryOperator } from "@hieco/mirror";
import type { Schedule } from "@hieco/mirror";
import type { PaginatedResponse } from "@hieco/mirror";
import type { Accessor } from "solid-js";
import { useMirrorNodeClient, useNetwork } from "./context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";
import { createMirrorNodeInfiniteQuery } from "./shared/infinite";

export type { ScheduleListParams } from "@hieco/mirror";

export interface CreateScheduleInfoOptions {
  readonly scheduleId: string;
  readonly enabled?: boolean;
}

type CreateScheduleInfoResult = UseQueryResult<ApiResult<Schedule>, ApiError>;

export interface CreateSchedulesOptions {
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly "creator.account.id"?: string | QueryOperator<string>;
    readonly "payer.account.id"?: string | QueryOperator<string>;
    readonly schedule_id?: string;
    readonly deleted?: boolean;
  };
  readonly enabled?: boolean;
}

type CreateSchedulesResult = UseQueryResult<ApiResult<Schedule[]>, ApiError>;

export interface CreateSchedulesInfiniteOptions {
  readonly params?: { readonly limit?: number; readonly order?: "asc" | "desc" };
  readonly enabled?: boolean;
}

type CreateSchedulesInfiniteResult = UseInfiniteQueryResult<
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
