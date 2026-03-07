import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput
} from "../../shared/types";

type Operation = HiecoClient["tx"]["submit"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseTransactionSubmitOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useTransactionSubmit<TContext = unknown>(
  options?: UseTransactionSubmitOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "tx.submit",
    createHandle: (variables) => client.tx.submit(variables),
    options,
  });
}
