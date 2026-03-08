import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoActionMutationResult,
  OperationData,
  SingleOperationInput,
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
): HiecoActionMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "system.undeleteEntity",
    createHandle: (variables) => client.system.undeleteEntity(variables),
    createAction: (variables) => client.system.undeleteEntity(variables),
    variables: "required",
    options,
  });
}
