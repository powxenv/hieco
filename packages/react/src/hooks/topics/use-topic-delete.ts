import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoActionMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../shared/types";

type Operation = HiecoClient["topic"]["delete"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseTopicDeleteOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useTopicDelete<TContext = unknown>(
  options?: UseTopicDeleteOptions<TContext>,
): HiecoActionMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "topic.delete",
    createHandle: (variables) => client.topic.delete(variables),
    createAction: (variables) => client.topic.delete(variables),
    variables: "required",
    options,
  });
}
