import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput
} from "../../shared/types";

type Operation = HiecoClient["account"]["allowances"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseAccountAllowancesOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useAccountAllowances<TContext = unknown>(
  options?: UseAccountAllowancesOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "account.allowances",
    createHandle: (variables) => client.account.allowances(variables),
    createAction: (variables) => client.account.allowances(variables),
    options,
  });
}
