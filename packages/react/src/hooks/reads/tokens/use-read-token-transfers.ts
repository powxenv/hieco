import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../shared/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationArg1,
  OperationData
} from "../../../shared/types";

type Operation = HiecoClient["reads"]["tokens"]["transfers"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;
type Arg1 = OperationArg1<Operation>;

export type UseReadTokenTransfersOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useReadTokenTransfers<TData = QueryFnData>(
  tokenId: Arg0,
  params?: Arg1,
  options?: UseReadTokenTransfersOptions<TData>
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.tokens.transfers",
    args: [tokenId, params],
    queryFn: () => client.reads.tokens.transfers(tokenId, params).now(),
    options,
  });
}
