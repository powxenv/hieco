import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../internal/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../internal/types";

type Operation = HiecoClient["token"]["info"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseTokenInfoOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useTokenInfo<TData = QueryFnData>(
  tokenId: Arg0,
  options?: UseTokenInfoOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "token.info",
    args: [tokenId],
    queryFn: () => client.token.info(tokenId).now(),
    options,
  });
}
