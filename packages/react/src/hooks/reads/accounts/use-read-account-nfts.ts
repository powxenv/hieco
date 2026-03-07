import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../shared/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationArg1,
  OperationData,
} from "../../../shared/types";

type Operation = HiecoClient["reads"]["accounts"]["nfts"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;
type Arg1 = OperationArg1<Operation>;

export type UseReadAccountNftsOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useReadAccountNfts<TData = QueryFnData>(
  accountId: Arg0,
  params?: Arg1,
  options?: UseReadAccountNftsOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.accounts.nfts",
    args: [accountId, params],
    queryFn: () => client.reads.accounts.nfts(accountId, params).now(),
    options,
  });
}
