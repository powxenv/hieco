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

type Operation = HiecoClient["account"]["infoFlow"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;
type Arg1 = OperationArg1<Operation>;

export type UseAccountInfoFlowOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useAccountInfoFlow<TData = QueryFnData>(
  accountId: Arg0,
  flowOptions?: Arg1,
  options?: UseAccountInfoFlowOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "account.infoFlow",
    args: [accountId, flowOptions],
    queryFn: () => client.account.infoFlow(accountId, flowOptions).now(),
    options,
  });
}
