import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput
} from "../../shared/types";

type Operation = HiecoClient["token"]["dissociate"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseTokenDissociateOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useTokenDissociate<TContext = unknown>(
  options?: UseTokenDissociateOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "token.dissociate",
    createHandle: (variables) => client.token.dissociate(variables),
    createAction: (variables) => client.token.dissociate(variables),
    options,
  });
}
