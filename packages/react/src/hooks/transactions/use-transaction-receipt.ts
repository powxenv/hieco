import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoQuery } from "../../shared/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationArg1,
  OperationData
} from "../../shared/types";

type Operation = HiecoClient["tx"]["receipt"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;
type Arg1 = OperationArg1<Operation>;

export type UseTransactionReceiptOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useTransactionReceipt<TData = QueryFnData>(
  transactionId: Arg0,
  receiptOptions?: Arg1,
  options?: UseTransactionReceiptOptions<TData>
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "tx.receipt",
    args: [transactionId, receiptOptions],
    queryFn: () => client.tx.receipt(transactionId, receiptOptions).now(),
    options,
  });
}
