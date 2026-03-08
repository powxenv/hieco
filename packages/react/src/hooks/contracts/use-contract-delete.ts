import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoActionMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../shared/types";

type Operation = HiecoClient["contract"]["delete"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseContractDeleteOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useContractDelete<TContext = unknown>(
  options?: UseContractDeleteOptions<TContext>,
): HiecoActionMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "contract.delete",
    createHandle: (variables) => client.contract.delete(variables),
    createAction: (variables) => client.contract.delete(variables),
    variables: "required",
    options,
  });
}
