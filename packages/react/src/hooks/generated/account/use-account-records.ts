import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../internal/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../internal/types";

type Operation = HiecoClient["account"]["records"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseAccountRecordsOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useAccountRecords<TData = QueryFnData>(
  accountId?: Arg0,
  options?: UseAccountRecordsOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "account.records",
    args: [accountId],
    queryFn: () => client.account.records(accountId).now(),
    options,
  });
}
