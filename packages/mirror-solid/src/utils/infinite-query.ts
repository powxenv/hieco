import { useInfiniteQuery } from "@tanstack/solid-query";
import type { UseInfiniteQueryResult } from "@tanstack/solid-query";
import type { ApiResult, ApiError, PaginatedResponse } from "@hieco/mirror-js";
import type { Accessor } from "solid-js";

type MirrorNodeListQueryKey = readonly ["mirror-node", string, string, "list"];

export function createMirrorNodeInfiniteQuery<T, TOptions>(
  queryKey: MirrorNodeListQueryKey,
  options: Accessor<TOptions>,
  queryFn: (
    pageParam: string | undefined,
    opts: TOptions,
  ) => Promise<ApiResult<PaginatedResponse<T>>>,
  getNextPageParam: (lastPage: ApiResult<PaginatedResponse<T>>) => string | undefined,
): UseInfiniteQueryResult<ApiResult<PaginatedResponse<T>>, ApiError> {
  return useInfiniteQuery<
    ApiResult<PaginatedResponse<T>>,
    ApiError,
    ApiResult<PaginatedResponse<T>>,
    MirrorNodeListQueryKey,
    string | undefined
  >(() => ({
    queryKey,
    queryFn: async ({ pageParam }) => queryFn(pageParam, options()),
    getNextPageParam,
    initialPageParam: undefined,
  }));
}
