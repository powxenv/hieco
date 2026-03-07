import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../../use-hieco-client";
import { useHiecoQuery } from "../../../../internal/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../../internal/types";

type Operation = HiecoClient["reads"]["blocks"]["list"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseReadBlocksListOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useReadBlocksList<TData = QueryFnData>(
  params?: Arg0,
  options?: UseReadBlocksListOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.blocks.list",
    args: [params],
    queryFn: () => client.reads.blocks.list(params).now(),
    options,
  });
}
