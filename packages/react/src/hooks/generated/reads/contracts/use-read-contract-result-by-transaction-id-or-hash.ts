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

type Operation = HiecoClient["reads"]["contracts"]["resultByTransactionIdOrHash"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;
type Arg1 = OperationArg1<Operation>;

export type UseReadContractResultByTransactionIdOrHashOptions<TData = QueryFnData> =
  HiecoQueryOptions<QueryFnData, TData>;

export function useReadContractResultByTransactionIdOrHash<TData = QueryFnData>(
  transactionIdOrHash: Arg0,
  params?: Arg1,
  options?: UseReadContractResultByTransactionIdOrHashOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.contracts.resultByTransactionIdOrHash",
    args: [transactionIdOrHash, params],
    queryFn: () =>
      client.reads.contracts.resultByTransactionIdOrHash(transactionIdOrHash, params).now(),
    options,
  });
}
