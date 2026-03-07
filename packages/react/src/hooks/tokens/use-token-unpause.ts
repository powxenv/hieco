import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput
} from "../../shared/types";

type Operation = HiecoClient["token"]["unpause"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseTokenUnpauseOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useTokenUnpause<TContext = unknown>(
  options?: UseTokenUnpauseOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "token.unpause",
    createHandle: (variables) => client.token.unpause(variables),
    createAction: (variables) => client.token.unpause(variables),
    options,
  });
}
