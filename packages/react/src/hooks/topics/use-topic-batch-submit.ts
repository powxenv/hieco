import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput
} from "../../shared/types";

type Operation = HiecoClient["topic"]["batchSubmit"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseTopicBatchSubmitOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useTopicBatchSubmit<TContext = unknown>(
  options?: UseTopicBatchSubmitOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "topic.batchSubmit",
    createHandle: (variables) => client.topic.batchSubmit(variables),
    options,
  });
}
