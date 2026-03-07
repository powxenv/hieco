import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../shared/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationData
} from "../../../shared/types";

type Operation = HiecoClient["reads"]["network"]["supply"];
type QueryFnData = OperationData<Operation>;

export type UseReadNetworkSupplyOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useReadNetworkSupply<TData = QueryFnData>(
  options?: UseReadNetworkSupplyOptions<TData>
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.network.supply",
    args: [],
    queryFn: () => client.reads.network.supply().now(),
    options,
  });
}
