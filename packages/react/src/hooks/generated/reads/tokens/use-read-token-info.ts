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

type Operation = HiecoClient["reads"]["tokens"]["info"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;
type Arg1 = OperationArg1<Operation>;

export type UseReadTokenInfoOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useReadTokenInfo<TData = QueryFnData>(
  tokenId: Arg0,
  params?: Arg1,
  options?: UseReadTokenInfoOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.tokens.info",
    args: [tokenId, params],
    queryFn: () => client.reads.tokens.info(tokenId, params).now(),
    options,
  });
}
