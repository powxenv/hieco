import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoMutation } from "../../../internal/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../../internal/types";

type Operation = HiecoClient["token"]["delete"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseTokenDeleteOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useTokenDelete<TContext = unknown>(
  options?: UseTokenDeleteOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "token.delete",
    createHandle: (variables) => client.token.delete(variables),
    createAction: (variables) => client.token.delete(variables),
    options,
  });
}
