import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoActionMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../shared/types";

type Operation = HiecoClient["system"]["freeze"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseSystemFreezeOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useSystemFreeze<TContext = unknown>(
  options?: UseSystemFreezeOptions<TContext>,
): HiecoActionMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "system.freeze",
    createHandle: (variables) => client.system.freeze(variables),
    createAction: (variables) => client.system.freeze(variables),
    variables: "required",
    options,
  });
}
