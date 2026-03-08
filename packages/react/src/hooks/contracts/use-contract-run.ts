import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoActionMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../shared/types";

type Operation = HiecoClient["contract"]["run"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseContractRunOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useContractRun<TContext = unknown>(
  options?: UseContractRunOptions<TContext>,
): HiecoActionMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "contract.run",
    createHandle: (variables) => client.contract.run(variables),
    createAction: (variables) => client.contract.run(variables),
    variables: "required",
    options,
  });
}
