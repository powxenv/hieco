import { unwrap } from "@hieco/sdk";
import { useQuery } from "@tanstack/react-query";
import { useHiecoContext } from "../hooks/use-hieco-context";
import { createHiecoQueryKey } from "./keys";
import type { HiecoQueryOptions, HiecoQueryResult } from "./types";

export function useHiecoQuery<TQueryFnData, TData = TQueryFnData>(input: {
  readonly operationName: string;
  readonly args: ReadonlyArray<unknown>;
  readonly queryFn: () => Promise<import("@hieco/sdk").Result<TQueryFnData>>;
  readonly options?: HiecoQueryOptions<TQueryFnData, TData>;
}): HiecoQueryResult<TData> {
  const { clientKey } = useHiecoContext();

  return useQuery({
    ...input.options,
    queryKey: createHiecoQueryKey(clientKey, input.operationName, input.args),
    queryFn: async () => unwrap(await input.queryFn()),
  });
}
