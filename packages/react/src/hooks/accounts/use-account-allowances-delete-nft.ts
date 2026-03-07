import type { HiecoClient } from "@hieco/sdk";
import { useHiecoClient } from "../use-hieco-client";
import { useHiecoMutation } from "../../shared/use-hieco-mutation";
import type {
  HiecoMutationOptions,
  HiecoMutationResult,
  OperationData,
  SingleOperationInput
} from "../../shared/types";

type Operation = HiecoClient["account"]["allowancesDeleteNft"];
type MutationData = OperationData<Operation>;
type Variables = SingleOperationInput<Operation>;

export type UseAccountAllowancesDeleteNftOptions<TContext = unknown> = HiecoMutationOptions<
  MutationData,
  Variables,
  TContext
>;

export function useAccountAllowancesDeleteNft<TContext = unknown>(
  options?: UseAccountAllowancesDeleteNftOptions<TContext>,
): HiecoMutationResult<MutationData, Variables, TContext> {
  const client = useHiecoClient();

  return useHiecoMutation({
    operationName: "account.allowancesDeleteNft",
    createHandle: (variables) => client.account.allowancesDeleteNft(variables),
    createAction: (variables) => client.account.allowancesDeleteNft(variables),
    options,
  });
}
