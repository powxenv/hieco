import type { HieroError, HiecoClient } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoQuery } from "../../shared/use-hieco-query";
import type {
  HiecoQueryOptions,
  OperationArg0,
  OperationData
} from "../../shared/types";

type Operation = HiecoClient["file"]["info"];
type QueryFnData = OperationData<Operation>;
type Arg0 = OperationArg0<Operation>;

export type UseFileInfoOptions<TData = QueryFnData> = HiecoQueryOptions<QueryFnData, TData>;

export function useFileInfo<TData = QueryFnData>(
  fileId: Arg0,
  options?: UseFileInfoOptions<TData>
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "file.info",
    args: [fileId],
    queryFn: () => client.file.info(fileId).now(),
    options,
  });
}
