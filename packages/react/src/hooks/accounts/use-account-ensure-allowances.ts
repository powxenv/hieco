import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../shared/types";

type Operation = HiecoClient["account"]["ensureAllowances"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseAccountEnsureAllowancesOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useAccountEnsureAllowances<TContext = unknown>(
  options?: UseAccountEnsureAllowancesOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "account.ensureAllowances",
    createHandle: (variables) => client.account.ensureAllowances(variables),
    options,
  });
}
