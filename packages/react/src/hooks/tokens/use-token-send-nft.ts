import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput
} from "../../shared/types";

type Operation = HiecoClient["token"]["sendNft"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseTokenSendNftOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useTokenSendNft<TContext = unknown>(
  options?: UseTokenSendNftOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "token.sendNft",
    createHandle: (variables) => client.token.sendNft(variables),
    createAction: (variables) => client.token.sendNft(variables),
    options,
  });
}
