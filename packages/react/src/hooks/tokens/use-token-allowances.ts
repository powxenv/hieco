import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoQuery } from "../../shared/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationArg1,
  OperationData,
} from "../../shared/types";

type Operation = HiecoClient["token"]["allowances"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;
type Arg1 = OperationArg1<Operation>;

export type UseTokenAllowancesOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useTokenAllowances<TData = QueryFnData>(
  accountId: Arg0,
  params?: Arg1,
  options?: UseTokenAllowancesOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "token.allowances",
    args: [accountId, params],
    queryFn: () => client.token.allowances(accountId, params).now(),
    options,
  });
}
