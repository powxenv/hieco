import type { EntityId } from "@hieco/utils";
import type { Amount, FunctionParamsConfig } from "../foundation/params.ts";
import { actionPlan, type ActionPlan } from "./action.ts";

type MaybeArray<T> = T | ReadonlyArray<T>;

function mergeState<T>(target: Partial<T>, patch: Partial<T>): Partial<T> {
  return { ...target, ...patch };
}

export class FluentAction<P extends object, T> {
  readonly #seed: Partial<P> | undefined;
  readonly #createPlan: (params: P) => ActionPlan<T>;
  #state: Partial<P>;

  constructor(input: {
    readonly createPlan: (params: P) => ActionPlan<T>;
    readonly seed?: Partial<P>;
  }) {
    this.#createPlan = input.createPlan;
    this.#seed = input.seed;
    this.#state = input.seed ?? ({} as Partial<P>);
  }

  with(patch: Partial<P>): this {
    this.#state = mergeState(this.#state, patch);
    return this;
  }

  reset(): this {
    this.#state = this.#seed ?? {};
    return this;
  }

  memo(value: string): this {
    return this.with({ memo: value } as unknown as Partial<P>);
  }

  fee(value: Amount): this {
    return this.with({ maxFee: value } as unknown as Partial<P>);
  }

  from(value: EntityId): this {
    return this.with({ from: value } as unknown as Partial<P>);
  }

  to(value: EntityId): this {
    return this.with({ to: value } as unknown as Partial<P>);
  }

  hbar(value: Amount): this {
    return this.with({ hbar: value } as unknown as Partial<P>);
  }

  amount(value: Amount): this {
    return this.with({ amount: value } as unknown as Partial<P>);
  }

  key(value: string | true): this {
    return this.with({ key: value } as unknown as Partial<P>);
  }

  publicKey(value: string): this {
    return this.with({ publicKey: value } as unknown as Partial<P>);
  }

  id(value: EntityId): this {
    return this.with({ id: value } as unknown as Partial<P>);
  }

  token(value: EntityId): this {
    return this.with({ tokenId: value } as unknown as Partial<P>);
  }

  account(value: EntityId): this {
    return this.with({ accountId: value } as unknown as Partial<P>);
  }

  topic(value: EntityId): this {
    return this.with({ topicId: value } as unknown as Partial<P>);
  }

  contract(value: EntityId): this {
    return this.with({ contractId: value } as unknown as Partial<P>);
  }

  file(value: EntityId): this {
    return this.with({ fileId: value } as unknown as Partial<P>);
  }

  schedule(value: EntityId): this {
    return this.with({ scheduleId: value } as unknown as Partial<P>);
  }

  serial(value: number): this {
    return this.with({ serial: value } as unknown as Partial<P>);
  }

  serials(values: ReadonlyArray<number>): this {
    return this.with({ serials: values } as unknown as Partial<P>);
  }

  tokenIds(values: ReadonlyArray<EntityId>): this {
    return this.with({ tokenIds: values } as unknown as Partial<P>);
  }

  owner(value: EntityId): this {
    return this.with({ ownerAccountId: value } as unknown as Partial<P>);
  }

  spender(value: EntityId): this {
    return this.with({ spenderAccountId: value } as unknown as Partial<P>);
  }

  payer(value: EntityId): this {
    return this.with({ payerAccountId: value } as unknown as Partial<P>);
  }

  treasury(value: EntityId): this {
    return this.with({ treasury: value } as unknown as Partial<P>);
  }

  name(value: string): this {
    return this.with({ name: value } as unknown as Partial<P>);
  }

  symbol(value: string): this {
    return this.with({ symbol: value } as unknown as Partial<P>);
  }

  decimals(value: number): this {
    return this.with({ decimals: value } as unknown as Partial<P>);
  }

  supply(value: Amount): this {
    return this.with({ supply: value } as unknown as Partial<P>);
  }

  gas(value: number): this {
    return this.with({ gas: value } as unknown as Partial<P>);
  }

  fn(value: string): this {
    return this.with({ fn: value } as unknown as Partial<P>);
  }

  args(values: ReadonlyArray<unknown>): this {
    return this.with({ args: values } as unknown as Partial<P>);
  }

  typed(values: FunctionParamsConfig): this {
    return this.with({ params: values } as unknown as Partial<P>);
  }

  payable(value: Amount): this {
    return this.with({ payableAmount: value } as unknown as Partial<P>);
  }

  message(value: string | Record<string, unknown> | Uint8Array): this {
    return this.with({ message: value } as unknown as Partial<P>);
  }

  contents(value: Uint8Array | string): this {
    return this.with({ contents: value } as unknown as Partial<P>);
  }

  keys(values: ReadonlyArray<string>): this {
    return this.with({ keys: values } as unknown as Partial<P>);
  }

  value(amount: Amount): this {
    return this.with({ value: amount } as unknown as Partial<P>);
  }

  set<K extends keyof P>(key: K, value: P[K]): this {
    return this.with({ [key]: value } as unknown as Partial<P>);
  }

  push<K extends keyof P>(key: K, value: P[K] extends MaybeArray<infer U> ? U : never): this {
    const current = this.#state[key];
    if (Array.isArray(current)) {
      return this.with({ [key]: [...current, value] } as unknown as Partial<P>);
    }
    return this.with({ [key]: [value] } as unknown as Partial<P>);
  }

  now() {
    return this.#createPlan(this.#params()).now();
  }

  tx() {
    return this.#createPlan(this.#params()).tx();
  }

  queue(params?: {
    readonly adminKey?: string | true;
    readonly payerAccountId?: EntityId;
    readonly expirationTime?: Date;
    readonly waitForExpiry?: boolean;
    readonly memo?: string;
    readonly maxFee?: Amount;
  }) {
    return this.#createPlan(this.#params()).schedule(params ?? {});
  }

  #params(): P {
    return this.#state as P;
  }
}

export function fluentAction<P extends object, T>(input: {
  readonly execute: (params: P) => Promise<T>;
  readonly tx?: (params: P) => import("../foundation/params.ts").TransactionDescriptor;
  readonly schedule?: (
    params: {
      readonly adminKey?: string | true;
      readonly payerAccountId?: EntityId;
      readonly expirationTime?: Date;
      readonly waitForExpiry?: boolean;
      readonly memo?: string;
      readonly maxFee?: Amount;
    },
    descriptor: import("../foundation/params.ts").TransactionDescriptor,
  ) => Promise<
    import("../foundation/results.ts").Result<
      import("../foundation/results-shapes.ts").ScheduleReceipt
    >
  >;
  readonly seed?: Partial<P>;
}): FluentAction<P, T> {
  const seed = input.seed ?? ({} as Partial<P>);
  const descriptor = input.tx;
  const schedule = input.schedule;
  return new FluentAction<P, T>({
    seed,
    createPlan: (params) =>
      actionPlan({
        execute: () => input.execute(params),
        ...(descriptor ? { descriptor: () => descriptor(params) } : {}),
        ...(schedule ? { schedule } : {}),
      }),
  });
}
