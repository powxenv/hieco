import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../shared/types";

type Operation = HiecoClient["contract"]["executeTyped"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseContractExecuteTypedOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useContractExecuteTyped<TContext = unknown>(
  options?: UseContractExecuteTypedOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "contract.executeTyped",
    createHandle: (variables) => client.contract.executeTyped(variables),
    createAction: (variables) => client.contract.executeTyped(variables),
    options,
  });
}
