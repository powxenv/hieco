import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../shared/types";

type Operation = HiecoClient["system"]["deleteEntity"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseSystemDeleteEntityOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useSystemDeleteEntity<TContext = unknown>(
  options?: UseSystemDeleteEntityOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "system.deleteEntity",
    createHandle: (variables) => client.system.deleteEntity(variables),
    createAction: (variables) => client.system.deleteEntity(variables),
    options,
  });
}
