import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoMutation } from "../../../internal/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../../internal/types";

type Operation = HiecoClient["contract"]["update"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseContractUpdateOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useContractUpdate<TContext = unknown>(
  options?: UseContractUpdateOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "contract.update",
    createHandle: (variables) => client.contract.update(variables),
    createAction: (variables) => client.contract.update(variables),
    options,
  });
}
