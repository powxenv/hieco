import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoMutation } from "../../../internal/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../../internal/types";

type Operation = HiecoClient["token"]["fees"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseTokenFeesOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useTokenFees<TContext = unknown>(
  options?: UseTokenFeesOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "token.fees",
    createHandle: (variables) => client.token.fees(variables),
    createAction: (variables) => client.token.fees(variables),
    options,
  });
}
