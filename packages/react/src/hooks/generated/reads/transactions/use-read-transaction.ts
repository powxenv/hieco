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

type Operation = HiecoClient["reads"]["transactions"]["get"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;
type Arg1 = OperationArg1<Operation>;

export type UseReadTransactionOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useReadTransaction<TData = QueryFnData>(
  transactionId: Arg0,
  params?: Arg1,
  options?: UseReadTransactionOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.transactions.get",
    args: [transactionId, params],
    queryFn: () => client.reads.transactions.get(transactionId, params).now(),
    options,
  });
}
