import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoQuery } from "../../shared/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../shared/types";

type Operation = HiecoClient["legacy"]["liveHash"]["get"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseLegacyLiveHashGetOptions<TData = QueryFnData> = HiecoQueryOptions<
  QueryFnData,
  TData
>;

export function useLegacyLiveHashGet<TData = QueryFnData>(
  params: Arg0,
  options?: UseLegacyLiveHashGetOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "legacy.liveHash.get",
    args: [params],
    queryFn: () => client.legacy.liveHash.get(params).now(),
    options,
  });
}
