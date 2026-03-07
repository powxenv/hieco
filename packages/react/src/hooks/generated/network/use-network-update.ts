import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../../use-hieco-client";
import { useHiecoMutation } from "../../../internal/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
} from "../../../internal/types";

type Operation = HiecoClient["net"]["update"];
type MutationData = OperationData<Operation>;
type Variables = void;

export type UseNetworkUpdateOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useNetworkUpdate<TContext = unknown>(
  options?: UseNetworkUpdateOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "net.update",
    createHandle: () => client.net.update(),
    options,
  });
}
