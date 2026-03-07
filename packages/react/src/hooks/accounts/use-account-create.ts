import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../shared/types";

type Operation = HiecoClient["account"]["create"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseAccountCreateOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useAccountCreate<TContext = unknown>(
  options?: UseAccountCreateOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "account.create",
    createHandle: (variables) => client.account.create(variables),
    createAction: (variables) => client.account.create(variables),
    options,
  });
}
