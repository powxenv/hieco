import { createError, toHieroError, unwrap } from "@hieco/sdk";
import { useMutation } from "@tanstack/react-query";
import { useHiecoContext } from "../hooks/use-hieco-context";
import { createHiecoMutationKey } from "./query-keys";
import type {
  ActionHandle,
  HiecoMutationOptions,
  HiecoMutationResult,
  QueryHandle,
  QueueParams,
} from "./types";

function invokeHandle<TVariables, TData>(
  createHandle: (variables: TVariables) => QueryHandle<TData>,
  variables: TVariables,
) {
  return createHandle(variables);
}

export function useHiecoMutation<TData, TVariables = void, TContext = unknown>(input: {
  readonly operationName: string;
  readonly createHandle: (variables: TVariables) => QueryHandle<TData>;
  readonly createAction?: (variables: TVariables) => ActionHandle<TData>;
  readonly options?: HiecoMutationOptions<TData, TVariables, TContext>;
}): HiecoMutationResult<TData, TVariables, TContext> {
  const { clientKey } = useHiecoContext();

  const mutation = useMutation({
    ...input.options,
    mutationKey: createHiecoMutationKey(clientKey, input.operationName),
    mutationFn: async (variables: TVariables) =>
      unwrap(await invokeHandle(input.createHandle, variables).now()),
  });

  const buildTx = (variables?: TVariables) => {
    if (!input.createAction) {
      return {
        ok: false as const,
        error: createError(
          "UNEXPECTED_ERROR",
          `Transaction descriptor is unavailable for ${input.operationName}`,
        ),
      };
    }

    return input.createAction(variables as TVariables).tx();
  };

  const queue = (variables?: TVariables, params?: QueueParams) => {
    if (!input.createAction) {
      return Promise.reject(
        toHieroError(
          createError("UNEXPECTED_ERROR", `Scheduling is unavailable for ${input.operationName}`),
        ),
      );
    }

    return input
      .createAction(variables as TVariables)
      .queue(params)
      .then(unwrap);
  };

  return {
    ...mutation,
    buildTx,
    queue,
  };
}
