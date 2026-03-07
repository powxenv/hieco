import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../internal/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../internal/types";

type Operation = HiecoClient["file"]["contents"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseFileContentsOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useFileContents<TData = QueryFnData>(
  fileId: Arg0,
  options?: UseFileContentsOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "file.contents",
    args: [fileId],
    queryFn: () => client.file.contents(fileId).now(),
    options,
  });
}
