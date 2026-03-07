import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoQuery } from "../../../internal/use-hieco-query";
import type { HiecoQueryOptions, OperationArg0, OperationData } from "../../../internal/types";

type Operation = HiecoClient["file"]["text"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseFileTextOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useFileText<TData = QueryFnData>(
  fileId: Arg0,
  options?: UseFileTextOptions<TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "file.text",
    args: [fileId],
    queryFn: () => client.file.text(fileId).now(),
    options,
  });
}
