import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput
} from "../../shared/types";

type Operation = HiecoClient["system"]["undeleteEntity"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseSystemUndeleteEntityOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useSystemUndeleteEntity<TContext = unknown>(
  options?: UseSystemUndeleteEntityOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "system.undeleteEntity",
    createHandle: (variables) => client.system.undeleteEntity(variables),
    createAction: (variables) => client.system.undeleteEntity(variables),
    options,
  });
}
