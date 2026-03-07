import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../shared/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../shared/types";

type Operation = HiecoClient["reads"]["balances"]["listPageByUrl"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseReadBalancesListPageByUrlOptions<TData = QueryFnData> = HiecoQueryOptions<
  QueryFnData,
  TData
>;

export function useReadBalancesListPageByUrl<TData = QueryFnData>(
  url: Arg0,
  options?: UseReadBalancesListPageByUrlOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.balances.listPageByUrl",
    args: [url],
    queryFn: () => client.reads.balances.listPageByUrl(url).now(),
    options,
  });
}
