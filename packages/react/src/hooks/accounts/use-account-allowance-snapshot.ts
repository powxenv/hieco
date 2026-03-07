import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoQuery } from "../../shared/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationData
} from "../../shared/types";

type Operation = HiecoClient["account"]["allowanceSnapshot"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseAccountAllowanceSnapshotOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useAccountAllowanceSnapshot<TData = QueryFnData>(
  accountId: Arg0,
  options?: UseAccountAllowanceSnapshotOptions<TData>
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "account.allowanceSnapshot",
    args: [accountId],
    queryFn: () => client.account.allowanceSnapshot(accountId).now(),
    options,
  });
}
