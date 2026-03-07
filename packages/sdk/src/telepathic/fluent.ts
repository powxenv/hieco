import type { EntityId } from "@hieco/utils";
import type { Amount, FunctionParamsConfig } from "../shared/params.ts";
import { actionPlan, type ActionPlan } from "./action.ts";

type MaybeArray<T> = T | ReadonlyArray<T>;

export class FluentAction<P extends object, T> {
  readonly #seed: Readonly<Record<string, unknown>> | undefined;
  readonly #createPlan: (params: P) => ActionPlan<T>;
  #state: Record<string, unknown>;

  constructor(input: {
    readonly createPlan: (params: P) => ActionPlan<T>;
    readonly seed?: Partial<P>;
  }) {
    this.#createPlan = input.createPlan;
    this.#seed = input.seed ? { ...input.seed } : undefined;
    this.#state = input.seed ? { ...input.seed } : {};
  }

  with(patch: Partial<P>): this {
    this.#state = { ...this.#state, ...patch };
    return this;
  }

  reset(): this {
    this.#state = this.#seed ? { ...this.#seed } : {};
    return this;
  }

  memo(value: string): this {
    return this.#setField("memo", value);
  }

  fee(value: Amount): this {
    return this.#setField("maxFee", value);
  }

  from(value: EntityId): this {
    return this.#setField("from", value);
  }

  to(value: EntityId): this {
    return this.#setField("to", value);
  }

  hbar(value: Amount): this {
    return this.#setField("hbar", value);
  }

  amount(value: Amount): this {
    return this.#setField("amount", value);
  }

  key(value: string | true): this {
    return this.#setField("key", value);
  }

  publicKey(value: string): this {
    return this.#setField("publicKey", value);
  }

  id(value: EntityId): this {
    return this.#setField("id", value);
  }

  token(value: EntityId): this {
    return this.#setField("tokenId", value);
  }

  account(value: EntityId): this {
    return this.#setField("accountId", value);
  }

  topic(value: EntityId): this {
    return this.#setField("topicId", value);
  }

  contract(value: EntityId): this {
    return this.#setField("contractId", value);
  }

  file(value: EntityId): this {
    return this.#setField("fileId", value);
  }

  schedule(value: EntityId): this {
    return this.#setField("scheduleId", value);
  }

  serial(value: number): this {
    return this.#setField("serial", value);
  }

  serials(values: ReadonlyArray<number>): this {
    return this.#setField("serials", values);
  }

  tokenIds(values: ReadonlyArray<EntityId>): this {
    return this.#setField("tokenIds", values);
  }

  owner(value: EntityId): this {
    return this.#setField("ownerAccountId", value);
  }

  spender(value: EntityId): this {
    return this.#setField("spenderAccountId", value);
  }

  payer(value: EntityId): this {
    return this.#setField("payerAccountId", value);
  }

  treasury(value: EntityId): this {
    return this.#setField("treasury", value);
  }

  name(value: string): this {
    return this.#setField("name", value);
  }

  symbol(value: string): this {
    return this.#setField("symbol", value);
  }

  decimals(value: number): this {
    return this.#setField("decimals", value);
  }

  supply(value: Amount): this {
    return this.#setField("supply", value);
  }

  gas(value: number): this {
    return this.#setField("gas", value);
  }

  fn(value: string): this {
    return this.#setField("fn", value);
  }

  args(values: ReadonlyArray<unknown>): this {
    return this.#setField("args", values);
  }

  typed(values: FunctionParamsConfig): this {
    return this.#setField("params", values);
  }

  payable(value: Amount): this {
    return this.#setField("payableAmount", value);
  }

  message(value: string | Record<string, unknown> | Uint8Array): this {
    return this.#setField("message", value);
  }

  contents(value: Uint8Array | string): this {
    return this.#setField("contents", value);
  }

  keys(values: ReadonlyArray<string>): this {
    return this.#setField("keys", values);
  }

  value(amount: Amount): this {
    return this.#setField("value", amount);
  }

  set<K extends Extract<keyof P, string>>(key: K, value: P[K]): this {
    return this.#setField(key, value);
  }

  push<K extends Extract<keyof P, string>>(
    key: K,
    value: P[K] extends MaybeArray<infer U> ? U : never,
  ): this {
    const current = this.#state[key];
    if (Array.isArray(current)) {
      return this.#setField(key, [...current, value]);
    }
    return this.#setField(key, [value]);
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

  #setField(key: string, value: unknown): this {
    this.#state = { ...this.#state, [key]: value };
    return this;
  }
}

export function fluentAction<P extends object, T>(input: {
  readonly execute: (params: P) => Promise<T>;
  readonly tx?: (params: P) => import("../shared/params.ts").TransactionDescriptor;
  readonly schedule?: (
    params: {
      readonly adminKey?: string | true;
      readonly payerAccountId?: EntityId;
      readonly expirationTime?: Date;
      readonly waitForExpiry?: boolean;
      readonly memo?: string;
      readonly maxFee?: Amount;
    },
    descriptor: import("../shared/params.ts").TransactionDescriptor,
  ) => Promise<
    import("../results/result.ts").Result<import("../results/shapes.ts").ScheduleReceipt>
  >;
  readonly seed?: Partial<P>;
}): FluentAction<P, T> {
  const seed = input.seed ?? {};
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
