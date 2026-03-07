import type {
  HieroError,
  HiecoClient,
  Result,
  TransactionDescriptor,
  ScheduleReceipt,
} from "@hieco/sdk";
import type {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";

export type HiecoQueryOptions<TQueryFnData, TData = TQueryFnData> = Omit<
  UseQueryOptions<TQueryFnData, HieroError, TData>,
  "queryKey" | "queryFn"
>;

export type HiecoMutationOptions<TData, TVariables = void, TContext = unknown> = Omit<
  UseMutationOptions<TData, HieroError, TVariables, TContext>,
  "mutationFn" | "mutationKey"
>;

export type HiecoMutationResult<TData, TVariables = void, TContext = unknown> = UseMutationResult<
  TData,
  HieroError,
  TVariables,
  TContext
> & {
  readonly buildTx: (variables?: TVariables) => Result<TransactionDescriptor>;
  readonly queue: (variables?: TVariables, params?: QueueParams) => Promise<ScheduleReceipt>;
};

export type HiecoQueryResult<TData> = UseQueryResult<TData, HieroError>;

export type QueryHandle<TData> = {
  readonly now: () => Promise<Result<TData>>;
};

export type ActionHandle<TData> = QueryHandle<TData> & {
  readonly tx: () => Result<TransactionDescriptor>;
  readonly queue: (params?: QueueParams) => Promise<Result<ScheduleReceipt>>;
};

export type OperationArgs<TOperation> = TOperation extends (
  ...args: infer TArgs
) => QueryHandle<unknown>
  ? TArgs
  : never;

export type OperationData<TOperation> = TOperation extends (
  ...args: infer TArgs
) => QueryHandle<infer TData>
  ? TArgs extends ReadonlyArray<unknown>
    ? TData
    : never
  : never;

export type OperationArg0<TOperation> =
  OperationArgs<TOperation> extends [infer TArg0, ...ReadonlyArray<unknown>] ? TArg0 : never;

export type OperationArg1<TOperation> =
  OperationArgs<TOperation> extends [unknown, infer TArg1, ...ReadonlyArray<unknown>]
    ? TArg1
    : never;

export type OperationArg2<TOperation> =
  OperationArgs<TOperation> extends [unknown, unknown, infer TArg2, ...ReadonlyArray<unknown>]
    ? TArg2
    : never;

export type SingleOperationInput<TOperation> =
  OperationArgs<TOperation> extends []
    ? void
    : OperationArgs<TOperation> extends [infer TInput]
      ? TInput
      : never;

export interface QueueParams {
  readonly adminKey?: string | true;
  readonly payerAccountId?: string;
  readonly expirationTime?: Date;
  readonly waitForExpiry?: boolean;
  readonly memo?: string;
  readonly maxFee?: string | number | bigint;
}

export interface HiecoScope {
  readonly client: HiecoClient;
  readonly clientKey: string;
}
