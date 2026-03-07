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

type Operation = HiecoClient["reads"]["accounts"]["allowances"]["crypto"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;
type Arg1 = OperationArg1<Operation>;

export type UseReadAccountCryptoAllowancesOptions<TData = QueryFnData> = HiecoQueryOptions<
  QueryFnData,
  TData
>;

export function useReadAccountCryptoAllowances<TData = QueryFnData>(
  accountId: Arg0,
  params?: Arg1,
  options?: UseReadAccountCryptoAllowancesOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.accounts.allowances.crypto",
    args: [accountId, params],
    queryFn: () => client.reads.accounts.allowances.crypto(accountId, params).now(),
    options,
  });
}
