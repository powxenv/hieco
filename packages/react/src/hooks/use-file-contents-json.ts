import type { HiecoClient, HieroError } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "./use-hieco-client";
import { useHiecoQuery } from "../shared/use-hieco-query";
import type { HiecoQueryOptions } from "../shared/types";

type FileId = Parameters<HiecoClient["file"]["contentsJson"]>[0];

export interface FileContentsJsonData<TJson> {
  readonly fileId: FileId;
  readonly json: TJson;
}

export type UseFileContentsJsonOptions<
  TJson,
  TData = FileContentsJsonData<TJson>,
> = HiecoQueryOptions<FileContentsJsonData<TJson>, TData>;

export function useFileContentsJson<TJson = unknown, TData = FileContentsJsonData<TJson>>(
  fileId: FileId,
  options?: UseFileContentsJsonOptions<TJson, TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "file.contentsJson",
    args: [fileId],
    queryFn: () => client.file.contentsJson<TJson>(fileId).now(),
    options,
  });
}
