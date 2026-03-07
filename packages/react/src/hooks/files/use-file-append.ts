import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput
} from "../../shared/types";

type Operation = HiecoClient["file"]["append"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseFileAppendOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useFileAppend<TContext = unknown>(
  options?: UseFileAppendOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "file.append",
    createHandle: (variables) => client.file.append(variables),
    createAction: (variables) => client.file.append(variables),
    options,
  });
}
