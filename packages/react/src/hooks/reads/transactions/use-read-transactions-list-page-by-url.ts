import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../shared/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../shared/types";

type Operation = HiecoClient["reads"]["transactions"]["listPageByUrl"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseReadTransactionsListPageByUrlOptions<TData = QueryFnData> = HiecoQueryOptions<
  QueryFnData,
  TData
>;

export function useReadTransactionsListPageByUrl<TData = QueryFnData>(
  url: Arg0,
  options?: UseReadTransactionsListPageByUrlOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.transactions.listPageByUrl",
    args: [url],
    queryFn: () => client.reads.transactions.listPageByUrl(url).now(),
    options,
  });
}
