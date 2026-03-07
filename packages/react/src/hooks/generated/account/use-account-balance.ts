import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../internal/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../internal/types";

type Operation = HiecoClient["account"]["balance"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseAccountBalanceOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useAccountBalance<TData = QueryFnData>(
  accountId?: Arg0,
  options?: UseAccountBalanceOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "account.balance",
    args: [accountId],
    queryFn: () => client.account.balance(accountId).now(),
    options,
  });
}
