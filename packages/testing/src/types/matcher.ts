export const enum MatcherPassStatus {
  PASS = "pass",
  FAIL = "fail",
}

export interface MatcherResult {
  pass: boolean;
  message: () => string;
}

export interface MatcherContext {
  readonly isNot: boolean;
  readonly promise: boolean;
}

export type MatcherFunction<TReceived, TExpected = TReceived> = (
  received: TReceived,
  expected: TExpected,
  context: MatcherContext,
) => MatcherResult | Promise<MatcherResult>;

export type AsyncMatcherFunction<TReceived, TExpected = TReceived> = (
  received: TReceived,
  expected: TExpected,
  context: MatcherContext,
) => Promise<MatcherResult>;

export interface MatcherHintOptions {
  readonly comment?: string;
  readonly isDirectExpectCall?: boolean;
}

export interface MatcherUtils {
  readonly diff: (actual: unknown, expected: unknown) => string;
  readonly stringify: (value: unknown, maxDepth?: number) => string;
  readonly printReceived: (value: unknown) => string;
  readonly printExpected: (value: unknown) => string;
  readonly printWithType: (
    name: string,
    value: unknown,
    print: (value: unknown) => string,
  ) => string;
  readonly matcherHint: (
    matcherName: string,
    received: unknown,
    expected: unknown,
    options?: MatcherHintOptions,
  ) => string;
}

export type JestLikeExtend = {
  extend: (matchers: Record<string, MatcherFunction<unknown, unknown>>) => void;
};

export type VitestLikeExtend = {
  extend: (matchers: Record<string, MatcherFunction<unknown, unknown>>) => void;
};

export const enum FrameworkKind {
  JEST = "jest",
  VITEST = "vitest",
}

export interface FrameworkMatchers {
  readonly toBeHbar?: MatcherFunction<unknown, HbarValueInput>;
  readonly toBeAccountId?: MatcherFunction<unknown, string>;
  readonly toHaveShard?: MatcherFunction<unknown, number>;
  readonly toHaveRealm?: MatcherFunction<unknown, number>;
  readonly toHaveAccount?: MatcherFunction<unknown, number>;
  readonly toHaveStatus?: MatcherFunction<unknown, StatusValueInput>;
  readonly toSucceed?: MatcherFunction<unknown>;
  readonly toSucceedWith?: MatcherFunction<unknown, Record<string, unknown>>;
  readonly toBeValidTx?: MatcherFunction<unknown>;
  readonly toBeHieroError?: MatcherFunction<unknown, ErrorCodeInput>;
  readonly toFailWith?: MatcherFunction<unknown, ErrorInput>;
  readonly toHaveTokenBalance?: MatcherFunction<unknown, TokenBalanceInput>;
  readonly toBeToken?: MatcherFunction<unknown, TokenInfoInput>;
  readonly toHaveEmitted?: MatcherFunction<unknown, EventInfoInput>;
  readonly toBeAssociated?: MatcherFunction<unknown, string>;
  readonly toBeEntityId?: MatcherFunction<unknown, string>;
}

export type HbarValueInput = number | bigint | string;

export type StatusValueInput = string | { readonly _kind: unique symbol; status: string };

export type ErrorCodeInput = string | number;

export interface ErrorInput {
  readonly status: string;
  readonly message?: string;
}

export interface TokenBalanceInput {
  readonly tokenId: string;
  readonly balance: bigint | number;
}

export interface TokenInfoInput {
  readonly name?: string;
  readonly symbol?: string;
  readonly decimals?: number;
}

export interface EventInfoInput {
  readonly name?: string;
  readonly topics?: readonly unknown[];
  readonly data?: string;
}
