import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../shared/types";

type Operation = HiecoClient["token"]["unfreeze"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseTokenUnfreezeOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useTokenUnfreeze<TContext = unknown>(
  options?: UseTokenUnfreezeOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "token.unfreeze",
    createHandle: (variables) => client.token.unfreeze(variables),
    createAction: (variables) => client.token.unfreeze(variables),
    options,
  });
}
