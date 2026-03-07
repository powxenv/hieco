import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoMutation } from "../../../internal/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../../internal/types";

type Operation = HiecoClient["schedule"]["collectSignatures"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseScheduleCollectSignaturesOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useScheduleCollectSignatures<TContext = unknown>(
  options?: UseScheduleCollectSignaturesOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "schedule.collectSignatures",
    createHandle: (variables) => client.schedule.collectSignatures(variables),
    options,
  });
}
