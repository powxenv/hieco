import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../internal/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../internal/types";

type Operation = HiecoClient["token"]["nft"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseTokenNftOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useTokenNft<TData = QueryFnData>(
  nft: Arg0,
  options?: UseTokenNftOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "token.nft",
    args: [nft],
    queryFn: () => client.token.nft(nft).now(),
    options,
  });
}
