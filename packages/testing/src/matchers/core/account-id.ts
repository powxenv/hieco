import { isValidEntityId } from "@hieco/mirror-shared";
import type { EntityId } from "../../types/hiero.js";

interface EntityIdLike {
  readonly toString: () => string;
}

const hasToStringMethod = (obj: object): obj is EntityIdLike => {
  const desc = Object.getOwnPropertyDescriptor(obj, "toString");
  return desc !== undefined && typeof desc.value === "function";
};

function parseEntityIdString(value: unknown): EntityId | null {
  if (typeof value === "string") {
    return isValidEntityId(value) ? (value as EntityId) : null;
  }

  if (typeof value === "object" && value !== null && hasToStringMethod(value)) {
    const str = value.toString();
    return isValidEntityId(str) ? (str as EntityId) : null;
  }

  return null;
}

function parseEntityIdParts(value: EntityId): readonly [shard: number, realm: number, num: number] {
  const parts = value.split(".").map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0] as const;
}

export function toBeAccountId(received: unknown, expected: EntityId): boolean {
  const receivedStr = parseEntityIdString(received);
  if (!receivedStr) return false;

  return receivedStr === expected;
}

export function toHaveShard(received: unknown, expected: number): boolean {
  const idStr = parseEntityIdString(received);
  if (!idStr) return false;

  const [shard] = parseEntityIdParts(idStr);
  return shard === expected;
}

export function toHaveRealm(received: unknown, expected: number): boolean {
  const idStr = parseEntityIdString(received);
  if (!idStr) return false;

  const [, realm] = parseEntityIdParts(idStr);
  return realm === expected;
}

export function toHaveAccount(received: unknown, expected: number): boolean {
  const idStr = parseEntityIdString(received);
  if (!idStr) return false;

  const [, , num] = parseEntityIdParts(idStr);
  return num === expected;
}

export function toBeAccountIdMessage(received: unknown, expected: EntityId, pass: boolean): string {
  const receivedStr = parseEntityIdString(received) ?? String(received);

  return pass
    ? `expected ${receivedStr} not to be a valid AccountId matching ${expected}`
    : `expected ${receivedStr} to be a valid AccountId matching ${expected}`;
}

export function toHaveShardMessage(received: unknown, expected: number, pass: boolean): string {
  const receivedStr = parseEntityIdString(received) ?? String(received);

  return pass
    ? `expected ${receivedStr} not to have shard ${expected}`
    : `expected ${receivedStr} to have shard ${expected}`;
}

export function toHaveRealmMessage(received: unknown, expected: number, pass: boolean): string {
  const receivedStr = parseEntityIdString(received) ?? String(received);

  return pass
    ? `expected ${receivedStr} not to have realm ${expected}`
    : `expected ${receivedStr} to have realm ${expected}`;
}

export function toHaveAccountMessage(received: unknown, expected: number, pass: boolean): string {
  const receivedStr = parseEntityIdString(received) ?? String(received);

  return pass
    ? `expected ${receivedStr} not to have account ${expected}`
    : `expected ${receivedStr} to have account ${expected}`;
}
