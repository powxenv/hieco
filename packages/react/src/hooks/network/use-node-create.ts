import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../shared/types";

type Operation = HiecoClient["node"]["create"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseNodeCreateOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useNodeCreate<TContext = unknown>(
  options?: UseNodeCreateOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "node.create",
    createHandle: (variables) => client.node.create(variables),
    createAction: (variables) => client.node.create(variables),
    options,
  });
}
