import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../shared/types";

type Operation = HiecoClient["schedule"]["createIdempotent"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseScheduleCreateIdempotentOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useScheduleCreateIdempotent<TContext = unknown>(
  options?: UseScheduleCreateIdempotentOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "schedule.createIdempotent",
    createHandle: (variables) => client.schedule.createIdempotent(variables),
    variables: "required",
    options,
  });
}
