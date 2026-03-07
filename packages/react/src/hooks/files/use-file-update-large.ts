import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput
} from "../../shared/types";

type Operation = HiecoClient["file"]["updateLarge"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseFileUpdateLargeOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useFileUpdateLarge<TContext = unknown>(
  options?: UseFileUpdateLargeOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "file.updateLarge",
    createHandle: (variables) => client.file.updateLarge(variables),
    options,
  });
}
