import type { MatcherResult } from "../types/matcher.js";
import type { EntityId } from "../types/hiero.js";
import {
  toBeHbar,
  toBeAccountId,
  toHaveShard,
  toHaveRealm,
  toHaveAccount,
  toHaveStatus,
  toSucceed,
  toSucceedWith,
  toBeValidTx,
  toBeHieroError,
  toFailWith,
  toHaveTokenBalance,
  toBeToken,
  toHaveEmitted,
  toBeAssociated,
  toBeEntityId,
} from "../matchers/core/index.js";
import { expect } from "vitest";

declare module "vitest" {
  interface Assertion {
    toBeHbar(expected: number | bigint | string | { toBigNumber: () => unknown }): unknown;
    toBeAccountId(expected: EntityId): unknown;
    toHaveShard(expected: number): unknown;
    toHaveRealm(expected: number): unknown;
    toHaveAccount(expected: number): unknown;
    toHaveStatus(expected: string): unknown;
    toSucceed(): unknown;
    toSucceedWith(expected: Record<string, unknown>): unknown;
    toBeValidTx(): unknown;
    toBeHieroError(expected: string | number): unknown;
    toFailWith(expected: string | number | { status: string; message?: string }): unknown;
    toHaveTokenBalance(tokenId: string, balance: bigint | number): unknown;
    toBeToken(expected: { name?: string; symbol?: string; decimals?: number }): unknown;
    toHaveEmitted(expected: { name?: string; topics?: readonly unknown[]; data?: string }): unknown;
    toBeAssociated(tokenId: string): unknown;
    toBeEntityId(expected: EntityId): unknown;
  }
}

const ENTITY_ID_PART = /^\d{1,10}$/;

type TypeGuard<T> = (value: unknown) => value is T;

const isString: TypeGuard<string> = (value): value is string => typeof value === "string";

const isNumber: TypeGuard<number> = (value): value is number => typeof value === "number";

const isBigInt: TypeGuard<bigint> = (value): value is bigint => typeof value === "bigint";

const isObject = <T extends object>(value: unknown, check: (obj: object) => boolean): value is T =>
  typeof value === "object" && value !== null && !Array.isArray(value) && check(value);

const hasStringProperty = (obj: object, key: PropertyKey): boolean => {
  const desc = Object.getOwnPropertyDescriptor(obj, key);
  return desc !== undefined && typeof desc.value === "string";
};

const hasNumberProperty = (obj: object, key: PropertyKey): boolean => {
  const desc = Object.getOwnPropertyDescriptor(obj, key);
  return desc !== undefined && typeof desc.value === "number";
};

const hasFunctionProperty = (obj: object, key: PropertyKey): boolean => {
  const desc = Object.getOwnPropertyDescriptor(obj, key);
  return desc !== undefined && typeof desc.value === "function";
};

const hasObjectProperty = (obj: object, key: PropertyKey): boolean =>
  Object.prototype.hasOwnProperty.call(obj, key);

const hasArrayProperty = (obj: object, key: PropertyKey): boolean => {
  const desc = Object.getOwnPropertyDescriptor(obj, key);
  return desc !== undefined && Array.isArray(desc.value);
};

const isHbarLike: TypeGuard<{ toBigNumber: () => unknown }> = (
  value,
): value is { toBigNumber: () => unknown } =>
  isObject<{ toBigNumber: () => unknown }>(value, (v) => hasFunctionProperty(v, "toBigNumber"));

type HbarValue = number | bigint | string | { toBigNumber: () => unknown };

const isHbarValue: TypeGuard<HbarValue> = (value): value is HbarValue =>
  isNumber(value) || isBigInt(value) || isString(value) || isHbarLike(value);

const isValidEntityId: TypeGuard<EntityId> = (value): value is EntityId => {
  if (!isString(value)) return false;
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [shard, realm, num] = parts;
  return (
    shard !== undefined &&
    realm !== undefined &&
    num !== undefined &&
    ENTITY_ID_PART.test(shard) &&
    ENTITY_ID_PART.test(realm) &&
    ENTITY_ID_PART.test(num)
  );
};

const isStringRecord: TypeGuard<Record<string, unknown>> = (
  value,
): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isErrorSpec: TypeGuard<{ status: string; message?: string }> = (
  value,
): value is { status: string; message?: string } =>
  isObject<{ status: string; message?: string }>(value, (v) => hasStringProperty(v, "status"));

type ErrorSpecValue = string | number | { status: string; message?: string };

const isErrorSpecValue: TypeGuard<ErrorSpecValue> = (value): value is ErrorSpecValue =>
  isString(value) || isNumber(value) || isErrorSpec(value);

const isTokenSpec: TypeGuard<{ name?: string; symbol?: string; decimals?: number }> = (
  value,
): value is { name?: string; symbol?: string; decimals?: number } =>
  isObject<{ name?: string; symbol?: string; decimals?: number }>(value, (v) => {
    if (hasObjectProperty(v, "name") && !hasStringProperty(v, "name")) return false;
    if (hasObjectProperty(v, "symbol") && !hasStringProperty(v, "symbol")) return false;
    if (hasObjectProperty(v, "decimals") && !hasNumberProperty(v, "decimals")) return false;
    return true;
  });

const isEventSpec: TypeGuard<{ name?: string; topics?: readonly unknown[]; data?: string }> = (
  value,
): value is { name?: string; topics?: readonly unknown[]; data?: string } =>
  isObject<{ name?: string; topics?: readonly unknown[]; data?: string }>(value, (v) => {
    if (hasObjectProperty(v, "name") && !hasStringProperty(v, "name")) return false;
    if (hasObjectProperty(v, "data") && !hasStringProperty(v, "data")) return false;
    if (hasObjectProperty(v, "topics") && !hasArrayProperty(v, "topics")) return false;
    return true;
  });

type MatcherFn = (this: { isNot: boolean }, received: unknown, expected: unknown) => MatcherResult;

type MultiParamMatcherFn = (
  this: { isNot: boolean },
  received: unknown,
  tokenId: string,
  balance: bigint | number,
) => MatcherResult;

type SingleParamMatcherFn = (
  this: { isNot: boolean },
  received: unknown,
  tokenId: string,
) => MatcherResult;

type NoParamMatcherFn = (this: { isNot: boolean }, received: unknown) => MatcherResult;

const invalid = (message: string): MatcherResult => ({
  pass: false,
  message: () => message,
});

const result = (
  pass: boolean,
  name: string,
  received: unknown,
  expected?: unknown,
): MatcherResult => ({
  pass,
  message: () => {
    const parts = [name, JSON.stringify(received)];
    if (expected !== undefined) parts.push(JSON.stringify(expected));
    return parts.join(" ");
  },
});

const toBeHbarMatcher: MatcherFn = (received, expected) => {
  if (!isHbarValue(expected)) {
    return invalid(`Expected must be a valid Hbar value (number, bigint, string, or Hbar object)`);
  }

  let expectedPrimitive: number | bigint | string;
  if (isHbarLike(expected)) {
    const bn = expected.toBigNumber();
    expectedPrimitive = typeof bn === "string" ? bn : String(bn);
  } else {
    expectedPrimitive = expected;
  }

  const pass = toBeHbar(received, expectedPrimitive);
  return result(pass, "Hbar", received, expected);
};

const toBeAccountIdMatcher: MatcherFn = (received, expected) => {
  if (!isValidEntityId(expected)) {
    return invalid(`Expected must be a valid EntityId (format: shard.realm.num)`);
  }
  const pass = toBeAccountId(received, expected);
  return result(pass, "AccountId", received, expected);
};

const toHaveShardMatcher: MatcherFn = (received, expected) => {
  if (!isNumber(expected)) {
    return invalid(`Expected shard must be a number`);
  }
  const pass = toHaveShard(received, expected);
  return result(pass, "shard", received, expected);
};

const toHaveRealmMatcher: MatcherFn = (received, expected) => {
  if (!isNumber(expected)) {
    return invalid(`Expected realm must be a number`);
  }
  const pass = toHaveRealm(received, expected);
  return result(pass, "realm", received, expected);
};

const toHaveAccountMatcher: MatcherFn = (received, expected) => {
  if (!isNumber(expected)) {
    return invalid(`Expected account must be a number`);
  }
  const pass = toHaveAccount(received, expected);
  return result(pass, "account", received, expected);
};

const toHaveStatusMatcher: MatcherFn = (received, expected) => {
  if (!isString(expected)) {
    return invalid(`Expected status must be a string`);
  }
  const pass = toHaveStatus(received, expected);
  return result(pass, "Status", received, expected);
};

const toSucceedMatcher: NoParamMatcherFn = (received) => {
  const pass = toSucceed(received);
  return result(pass, "success", received);
};

const toSucceedWithMatcher: MatcherFn = (received, expected) => {
  if (!isStringRecord(expected)) {
    return invalid(`Expected receipt must be an object`);
  }
  const pass = toSucceedWith(received, expected);
  return result(pass, "receipt", received, expected);
};

const toBeValidTxMatcher: NoParamMatcherFn = (received) => {
  const pass = toBeValidTx(received);
  return result(pass, "valid transaction", received);
};

const toBeHieroErrorMatcher: MatcherFn = (received, expected) => {
  if (!isString(expected) && !isNumber(expected)) {
    return invalid(`Expected error code must be a string or number`);
  }
  const pass = toBeHieroError(received, expected);
  return result(pass, "error code", received, expected);
};

const toFailWithMatcher: MatcherFn = (received, expected) => {
  if (!isErrorSpecValue(expected)) {
    return invalid(`Expected error spec must be a string, number, or { status, message? }`);
  }
  const pass = toFailWith(received, expected);
  return result(pass, "error spec", received, expected);
};

const toHaveTokenBalanceMatcher: MultiParamMatcherFn = (received, tokenId, balance) => {
  if (!isString(tokenId)) {
    return invalid(`tokenId must be a string`);
  }
  if (!isNumber(balance) && !isBigInt(balance)) {
    return invalid(`balance must be a number or bigint`);
  }
  const pass = toHaveTokenBalance(received, tokenId, balance);
  return result(pass, "token balance", received, { tokenId, balance });
};

const toBeTokenMatcher: MatcherFn = (received, expected) => {
  if (!isTokenSpec(expected)) {
    return invalid(`Expected token spec must be { name?, symbol?, decimals? }`);
  }
  const pass = toBeToken(received, expected);
  return result(pass, "token", received, expected);
};

const toHaveEmittedMatcher: MatcherFn = (received, expected) => {
  if (!isEventSpec(expected)) {
    return invalid(`Expected event spec must be { name?, topics?, data? }`);
  }
  const pass = toHaveEmitted(received, expected);
  return result(pass, "event", received, expected);
};

const toBeAssociatedMatcher: SingleParamMatcherFn = (received, tokenId) => {
  if (!isString(tokenId)) {
    return invalid(`tokenId must be a string`);
  }
  const pass = toBeAssociated(received, tokenId);
  return result(pass, "association", received, { tokenId });
};

const toBeEntityIdMatcher: MatcherFn = (received, expected) => {
  if (!isValidEntityId(expected)) {
    return invalid(`Expected must be a valid EntityId (format: shard.realm.num)`);
  }
  const pass = toBeEntityId(received, expected);
  return result(pass, "EntityId", received, expected);
};

const matchers = {
  toBeHbar: toBeHbarMatcher,
  toBeAccountId: toBeAccountIdMatcher,
  toHaveShard: toHaveShardMatcher,
  toHaveRealm: toHaveRealmMatcher,
  toHaveAccount: toHaveAccountMatcher,
  toHaveStatus: toHaveStatusMatcher,
  toSucceed: toSucceedMatcher,
  toSucceedWith: toSucceedWithMatcher,
  toBeValidTx: toBeValidTxMatcher,
  toBeHieroError: toBeHieroErrorMatcher,
  toFailWith: toFailWithMatcher,
  toHaveTokenBalance: toHaveTokenBalanceMatcher,
  toBeToken: toBeTokenMatcher,
  toHaveEmitted: toHaveEmittedMatcher,
  toBeAssociated: toBeAssociatedMatcher,
  toBeEntityId: toBeEntityIdMatcher,
};

export const setupVitestMatchers = (): void => expect.extend(matchers);

export default setupVitestMatchers;
