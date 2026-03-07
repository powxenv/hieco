import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoQuery } from "../../shared/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../shared/types";

type Operation = HiecoClient["file"]["contentsText"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseFileContentsTextOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useFileContentsText<TData = QueryFnData>(
  fileId: Arg0,
  options?: UseFileContentsTextOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "file.contentsText",
    args: [fileId],
    queryFn: () => client.file.contentsText(fileId).now(),
    options,
  });
}
