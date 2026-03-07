import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../../use-hieco-client";
import { useHiecoQuery } from "../../../../internal/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationArg1,
  OperationData,
} from "../../../../internal/types";

type Operation = HiecoClient["reads"]["accounts"]["allowances"]["token"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;
type Arg1 = OperationArg1<Operation>;

export type UseReadAccountTokenAllowancesOptions<TData = QueryFnData> = HiecoQueryOptions<
  QueryFnData,
  TData
>;

export function useReadAccountTokenAllowances<TData = QueryFnData>(
  accountId: Arg0,
  params?: Arg1,
  options?: UseReadAccountTokenAllowancesOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.accounts.allowances.token",
    args: [accountId, params],
    queryFn: () => client.reads.accounts.allowances.token(accountId, params).now(),
    options,
  });
}
