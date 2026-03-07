import type { HiecoClient, HieroError } from "@hieco/sdk";
import type { UseQueryResult } from "@tanstack/react-query";
import { useHiecoClient } from "./use-hieco-client";
import { useHiecoQuery } from "../internal/use-hieco-query";
import type { HiecoQueryOptions } from "../internal/types";

type FileId = Parameters<HiecoClient["file"]["json"]>[0];

export interface FileJsonData<TJson> {
  readonly fileId: FileId;
  readonly json: TJson;
}

export type UseFileJsonOptions<TJson, TData = FileJsonData<TJson>> = HiecoQueryOptions<
  FileJsonData<TJson>,
  TData
>;

export function useFileJson<TJson = unknown, TData = FileJsonData<TJson>>(
  fileId: FileId,
  options?: UseFileJsonOptions<TJson, TData>,
): UseQueryResult<TData, HieroError> {
  const client = useHiecoClient();

  return useHiecoQuery({
    operationName: "file.json",
    args: [fileId],
    queryFn: () => client.file.json<TJson>(fileId).now(),
    options,
  });
}
