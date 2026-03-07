import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../../use-hieco-client";
import { useHiecoQuery } from "../../../../internal/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../../internal/types";

type Operation = HiecoClient["reads"]["blocks"]["snapshot"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseReadBlocksSnapshotOptions<TData = QueryFnData> = HiecoQueryOptions<
  QueryFnData,
  TData
>;

export function useReadBlocksSnapshot<TData = QueryFnData>(
  params?: Arg0,
  options?: UseReadBlocksSnapshotOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.blocks.snapshot",
    args: [params],
    queryFn: () => client.reads.blocks.snapshot(params).now(),
    options,
  });
}
