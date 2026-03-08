import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoActionMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../shared/types";

type Operation = HiecoClient["account"]["revokeNftAllowances"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseAccountRevokeNftAllowancesOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useAccountRevokeNftAllowances<TContext = unknown>(
  options?: UseAccountRevokeNftAllowancesOptions<TContext>,
): HiecoActionMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "account.revokeNftAllowances",
    createHandle: (variables) => client.account.revokeNftAllowances(variables),
    createAction: (variables) => client.account.revokeNftAllowances(variables),
    variables: "required",
    options,
  });
}
