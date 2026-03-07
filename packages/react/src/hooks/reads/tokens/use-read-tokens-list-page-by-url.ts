import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../shared/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationData
} from "../../../shared/types";

type Operation = HiecoClient["reads"]["tokens"]["listPageByUrl"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseReadTokensListPageByUrlOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useReadTokensListPageByUrl<TData = QueryFnData>(
  url: Arg0,
  options?: UseReadTokensListPageByUrlOptions<TData>
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "reads.tokens.listPageByUrl",
    args: [url],
    queryFn: () => client.reads.tokens.listPageByUrl(url).now(),
    options,
  });
}
