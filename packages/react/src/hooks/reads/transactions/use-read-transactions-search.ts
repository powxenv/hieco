import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../shared/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationData
} from "../../../shared/types";

type Operation = HiecoClient["reads"]["transactions"]["search"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseReadTransactionsSearchOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useReadTransactionsSearch<TData = QueryFnData>(
  params?: Arg0,
  options?: UseReadTransactionsSearchOptions<TData>
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.transactions.search",
    args: [params],
    queryFn: () => client.reads.transactions.search(params).now(),
    options,
  });
}
