import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput
} from "../../shared/types";

type Operation = HiecoClient["account"]["send"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseAccountSendOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useAccountSend<TContext = unknown>(
  options?: UseAccountSendOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "account.send",
    createHandle: (variables) => client.account.send(variables),
    createAction: (variables) => client.account.send(variables),
    options,
  });
}
