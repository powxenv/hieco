import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput,
} from "../../shared/types";

type Operation = HiecoClient["util"]["random"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseUtilRandomOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useUtilRandom<TContext = unknown>(
  options?: UseUtilRandomOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "util.random",
    createHandle: (variables) => client.util.random(variables),
    createAction: (variables) => client.util.random(variables),
    options,
  });
}
