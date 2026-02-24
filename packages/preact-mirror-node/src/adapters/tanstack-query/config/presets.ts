import type { UseQueryOptions } from "@tanstack/preact-query";

type QueryPreset = Omit<UseQueryOptions, "queryKey" | "queryFn">;

export const networkDataPreset: QueryPreset = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
};

export const accountDataPreset: QueryPreset = {
  staleTime: 30 * 1000,
  gcTime: 5 * 60 * 1000,
};

export const transactionDataPreset: QueryPreset = {
  staleTime: Infinity,
  gcTime: Infinity,
};

export function pollingPreset(intervalMs: number): QueryPreset {
  return {
    refetchInterval: intervalMs,
    staleTime: 0,
  };
}
