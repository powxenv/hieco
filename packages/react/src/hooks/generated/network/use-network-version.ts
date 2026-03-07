import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../internal/use-hieco-query";
import type { HiecoQueryOptions, OperationData } from "../../../internal/types";

type Operation = HiecoClient["net"]["version"];
type QueryFnData = OperationData<Operation>;

export type UseNetworkVersionOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useNetworkVersion<TData = QueryFnData>(
  options?: UseNetworkVersionOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "net.version",
    args: [],
    queryFn: () => client.net.version().now(),
    options,
  });
}
