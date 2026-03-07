import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../shared/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../shared/types";

type Operation = HiecoClient["reads"]["balances"]["list"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseReadBalancesListOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useReadBalancesList<TData = QueryFnData>(
  params?: Arg0,
  options?: UseReadBalancesListOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.balances.list",
    args: [params],
    queryFn: () => client.reads.balances.list(params).now(),
    options,
  });
}
