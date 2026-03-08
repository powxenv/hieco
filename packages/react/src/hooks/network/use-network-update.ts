import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type { HiecoMutationOptions, HiecoMutationResult, OperationData } from "../../shared/types";

type Operation = HiecoClient["net"]["update"];
type MutationData = OperationData<Operation>;

export type UseNetworkUpdateOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  void,
  TContext
>;

export function useNetworkUpdate<TContext = unknown>(
  options?: UseNetworkUpdateOptions<TContext>,
): HiecoMutationResult<MutationData, void, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "net.update",
    createHandle: () => client.net.update(),
    variables: "none",
    options,
  });
}
