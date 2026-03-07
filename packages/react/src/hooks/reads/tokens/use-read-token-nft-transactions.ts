import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../shared/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationArg1,
  OperationArg2,
  OperationData,
} from "../../../shared/types";

type Operation = HiecoClient["reads"]["tokens"]["nftTransactions"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;
type Arg1 = OperationArg1<Operation>;
type Arg2 = OperationArg2<Operation>;

export type UseReadTokenNftTransactionsOptions<TData = QueryFnData> = HiecoQueryOptions<
  QueryFnData,
  TData
>;

export function useReadTokenNftTransactions<TData = QueryFnData>(
  tokenId: Arg0,
  serial: Arg1,
  params?: Arg2,
  options?: UseReadTokenNftTransactionsOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.tokens.nftTransactions",
    args: [tokenId, serial, params],
    queryFn: () => client.reads.tokens.nftTransactions(tokenId, serial, params).now(),
    options,
  });
}
