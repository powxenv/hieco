import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../../use-hieco-client";
import { useHiecoQuery } from "../../../../internal/use-hieco-query";
import type { HiecoQueryOptions, OperationData } from "../../../../internal/types";

type Operation = HiecoClient["reads"]["network"]["stake"];
type QueryFnData = OperationData<Operation>;

export type UseReadNetworkStakeOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useReadNetworkStake<TData = QueryFnData>(
  options?: UseReadNetworkStakeOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.network.stake",
    args: [],
    queryFn: () => client.reads.network.stake().now(),
    options,
  });
}
