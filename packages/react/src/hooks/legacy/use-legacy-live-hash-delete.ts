import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoActionMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../shared/types";

type Operation = HiecoClient["legacy"]["liveHash"]["delete"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseLegacyLiveHashDeleteOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useLegacyLiveHashDelete<TContext = unknown>(
  options?: UseLegacyLiveHashDeleteOptions<TContext>,
): HiecoActionMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "legacy.liveHash.delete",
    createHandle: (variables) => client.legacy.liveHash.delete(variables),
    createAction: (variables) => client.legacy.liveHash.delete(variables),
    variables: "required",
    options,
  });
}
