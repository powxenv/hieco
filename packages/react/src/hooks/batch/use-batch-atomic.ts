import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoActionMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../shared/types";

type Operation = HiecoClient["batch"]["atomic"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseBatchAtomicOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useBatchAtomic<TContext = unknown>(
  options?: UseBatchAtomicOptions<TContext>,
): HiecoActionMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "batch.atomic",
    createHandle: (variables) => client.batch.atomic(variables),
    createAction: (variables) => client.batch.atomic(variables),
    variables: "required",
    options,
  });
}
