import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput
} from "../../shared/types";

type Operation = HiecoClient["file"]["upload"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseFileUploadOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useFileUpload<TContext = unknown>(
  options?: UseFileUploadOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "file.upload",
    createHandle: (variables) => client.file.upload(variables),
    options,
  });
}
