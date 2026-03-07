import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoMutation } from "../../../internal/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../../internal/types";

type Operation = HiecoClient["legacy"]["liveHash"]["add"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseLegacyLiveHashAddOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useLegacyLiveHashAdd<TContext = unknown>(
  options?: UseLegacyLiveHashAddOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "legacy.liveHash.add",
    createHandle: (variables) => client.legacy.liveHash.add(variables),
    createAction: (variables) => client.legacy.liveHash.add(variables),
    options,
  });
}
