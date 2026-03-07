import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../../use-hieco-client";
import { useHiecoQuery } from "../../../../internal/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../../internal/types";

type Operation = HiecoClient["reads"]["blocks"]["get"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseReadBlockOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useReadBlock<TData = QueryFnData>(
  hashOrNumber: Arg0,
  options?: UseReadBlockOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.blocks.get",
    args: [hashOrNumber],
    queryFn: () => client.reads.blocks.get(hashOrNumber).now(),
    options,
  });
}
