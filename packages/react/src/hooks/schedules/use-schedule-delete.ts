import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  OperationArg0,
  OperationArg1,
} from "../../shared/types";

type Operation = HiecoClient["schedule"]["delete"];
type MutationData = OperationData<Operation>;
type Variables = {
  readonly scheduleId: OperationArg0<Operation>;
  readonly params?: OperationArg1<Operation>;
};

export type UseScheduleDeleteOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useScheduleDelete<TContext = unknown>(
  options?: UseScheduleDeleteOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "schedule.delete",
    createHandle: (variables) => client.schedule.delete(variables.scheduleId, variables.params),
    variables: "required",
    options,
  });
}
