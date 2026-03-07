import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput
} from "../../shared/types";

type Operation = HiecoClient["node"]["update"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseNodeUpdateOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useNodeUpdate<TContext = unknown>(
  options?: UseNodeUpdateOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "node.update",
    createHandle: (variables) => client.node.update(variables),
    createAction: (variables) => client.node.update(variables),
    options,
  });
}
