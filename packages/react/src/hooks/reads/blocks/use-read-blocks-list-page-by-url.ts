import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../shared/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../shared/types";

type Operation = HiecoClient["reads"]["blocks"]["listPageByUrl"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseReadBlocksListPageByUrlOptions<TData = QueryFnData> = HiecoQueryOptions<
  QueryFnData,
  TData
>;

export function useReadBlocksListPageByUrl<TData = QueryFnData>(
  url: Arg0,
  options?: UseReadBlocksListPageByUrlOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.blocks.listPageByUrl",
    args: [url],
    queryFn: () => client.reads.blocks.listPageByUrl(url).now(),
    options,
  });
}
