import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput
} from "../../shared/types";

type Operation = HiecoClient["file"]["create"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseFileCreateOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useFileCreate<TContext = unknown>(
  options?: UseFileCreateOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "file.create",
    createHandle: (variables) => client.file.create(variables),
    createAction: (variables) => client.file.create(variables),
    options,
  });
}
