import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput
} from "../../shared/types";

type Operation = HiecoClient["schedule"]["collect"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseScheduleCollectOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useScheduleCollect<TContext = unknown>(
  options?: UseScheduleCollectOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "schedule.collect",
    createHandle: (variables) => client.schedule.collect(variables),
    options,
  });
}
