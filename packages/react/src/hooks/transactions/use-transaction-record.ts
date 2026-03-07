import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoQuery } from "../../shared/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../shared/types";

type Operation = HiecoClient["tx"]["record"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseTransactionRecordOptions<TData = QueryFnData> = HiecoQueryOptions<
  QueryFnData,
  TData
>;

export function useTransactionRecord<TData = QueryFnData>(
  transactionId: Arg0,
  options?: UseTransactionRecordOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "tx.record",
    args: [transactionId],
    queryFn: () => client.tx.record(transactionId).now(),
    options,
  });
}
