import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  OperationArg0,
  OperationArg1
} from "../../shared/types";

type Operation = HiecoClient["schedule"]["sign"];
type MutationData = OperationData<Operation>;
type Variables = {
  readonly scheduleId: OperationArg0<Operation>;
  readonly params?: OperationArg1<Operation>;
};

export type UseScheduleSignOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useScheduleSign<TContext = unknown>(
  options?: UseScheduleSignOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "schedule.sign",
    createHandle: (variables) => client.schedule.sign(variables.scheduleId, variables.params),
    options,
  });
}
