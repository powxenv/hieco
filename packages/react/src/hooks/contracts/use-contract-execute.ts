import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput
} from "../../shared/types";

type Operation = HiecoClient["contract"]["execute"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseContractExecuteOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useContractExecute<TContext = unknown>(
  options?: UseContractExecuteOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "contract.execute",
    createHandle: (variables) => client.contract.execute(variables),
    createAction: (variables) => client.contract.execute(variables),
    options,
  });
}
