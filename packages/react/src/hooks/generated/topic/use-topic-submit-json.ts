import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoMutation } from "../../../internal/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../../internal/types";

type Operation = HiecoClient["topic"]["submitJson"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseTopicSubmitJsonOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useTopicSubmitJson<TContext = unknown>(
  options?: UseTopicSubmitJsonOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "topic.submitJson",
    createHandle: (variables) => client.topic.submitJson(variables),
    options,
  });
}
