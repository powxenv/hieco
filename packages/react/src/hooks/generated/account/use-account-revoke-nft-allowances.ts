import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoMutation } from "../../../internal/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../../internal/types";

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
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "account.revokeNftAllowances",
    createHandle: (variables) => client.account.revokeNftAllowances(variables),
    createAction: (variables) => client.account.revokeNftAllowances(variables),
    options,
  });
}
