import { unwrap } from "@hieco/sdk";
import type { HieroError } from "@hieco/sdk";
import { useMutation } from "@tanstack/react-query";
import { useHiecoContext } from "../hooks/use-hieco-context";
import { createHiecoMutationKey } from "./keys";
import type {
  ActionHandle,
  HiecoActionMutationResult,
  HiecoMutationOptions,
  HiecoMutationResult,
  QueueParams,
  QueryHandle,
} from "./types";

type BaseMutationInput<TData, TVariables, TContext> = {
  readonly operationName: string;
  readonly options?: HiecoMutationOptions<TData, TVariables, TContext>;
};

type PlainMutationInputWithVariables<TData, TVariables, TContext> = BaseMutationInput<
  TData,
  TVariables,
  TContext
> & {
  readonly createHandle: (variables: TVariables) => QueryHandle<TData>;
  readonly createAction?: undefined;
  readonly variables: "required";
};

type PlainMutationInputWithoutVariables<TData, TContext> = BaseMutationInput<
  TData,
  void,
  TContext
> & {
  readonly createHandle: () => QueryHandle<TData>;
  readonly createAction?: undefined;
  readonly variables: "none";
};

type ActionMutationInputWithVariables<TData, TVariables, TContext> = BaseMutationInput<
  TData,
  TVariables,
  TContext
> & {
  readonly createAction: (variables: TVariables) => ActionHandle<TData>;
  readonly createHandle: (variables: TVariables) => QueryHandle<TData>;
  readonly variables: "required";
};

type ActionMutationInputWithoutVariables<TData, TContext> = BaseMutationInput<
  TData,
  void,
  TContext
> & {
  readonly createAction: () => ActionHandle<TData>;
  readonly createHandle: () => QueryHandle<TData>;
  readonly variables: "none";
};

export function useHiecoMutation<TData, TContext = unknown>(
  input: PlainMutationInputWithoutVariables<TData, TContext>,
): HiecoMutationResult<TData, void, TContext>;
export function useHiecoMutation<TData, TVariables, TContext = unknown>(
  input: PlainMutationInputWithVariables<TData, TVariables, TContext>,
): HiecoMutationResult<TData, TVariables, TContext>;
export function useHiecoMutation<TData, TContext = unknown>(
  input: ActionMutationInputWithoutVariables<TData, TContext>,
): HiecoActionMutationResult<TData, void, TContext>;
export function useHiecoMutation<TData, TVariables, TContext = unknown>(
  input: ActionMutationInputWithVariables<TData, TVariables, TContext>,
): HiecoActionMutationResult<TData, TVariables, TContext>;
export function useHiecoMutation<TData, TVariables, TContext = unknown>(
  input:
    | PlainMutationInputWithoutVariables<TData, TContext>
    | PlainMutationInputWithVariables<TData, TVariables, TContext>
    | ActionMutationInputWithoutVariables<TData, TContext>
    | ActionMutationInputWithVariables<TData, TVariables, TContext>,
):
  | HiecoMutationResult<TData, void, TContext>
  | HiecoMutationResult<TData, TVariables, TContext>
  | HiecoActionMutationResult<TData, void, TContext>
  | HiecoActionMutationResult<TData, TVariables, TContext> {
  const { clientKey } = useHiecoContext();

  if (input.variables === "none") {
    const mutation = useMutation<TData, HieroError, void, TContext>({
      ...input.options,
      mutationKey: createHiecoMutationKey(clientKey, input.operationName),
      mutationFn: async () => unwrap(await input.createHandle().now()),
    });

    if (!input.createAction) {
      return mutation;
    }

    return {
      ...mutation,
      buildTx: () => input.createAction().tx(),
      queue: (params?: QueueParams) => input.createAction().queue(params).then(unwrap),
    };
  }

  const mutation = useMutation<TData, HieroError, TVariables, TContext>({
    ...input.options,
    mutationKey: createHiecoMutationKey(clientKey, input.operationName),
    mutationFn: async (variables) => unwrap(await input.createHandle(variables).now()),
  });

  if (!input.createAction) {
    return mutation;
  }

  return {
    ...mutation,
    buildTx: (variables: TVariables) => input.createAction(variables).tx(),
    queue: (variables: TVariables, params?: QueueParams) =>
      input.createAction(variables).queue(params).then(unwrap),
  };
}
