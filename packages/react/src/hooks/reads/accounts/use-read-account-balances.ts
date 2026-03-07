import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../shared/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../shared/types";

type Operation = HiecoClient["reads"]["accounts"]["balances"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseReadAccountBalancesOptions<TData = QueryFnData> = HiecoQueryOptions<
  QueryFnData,
  TData
>;

export function useReadAccountBalances<TData = QueryFnData>(
  accountId: Arg0,
  options?: UseReadAccountBalancesOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.accounts.balances",
    args: [accountId],
    queryFn: () => client.reads.accounts.balances(accountId).now(),
    options,
  });
}
