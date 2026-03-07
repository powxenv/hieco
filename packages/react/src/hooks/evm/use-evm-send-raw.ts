import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../shared/types";

type Operation = HiecoClient["evm"]["sendRaw"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseEvmSendRawOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useEvmSendRaw<TContext = unknown>(
  options?: UseEvmSendRawOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "evm.sendRaw",
    createHandle: (variables) => client.evm.sendRaw(variables),
    createAction: (variables) => client.evm.sendRaw(variables),
    options,
  });
}
