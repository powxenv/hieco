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

export function toBeEntityId(received: unknown, expected: EntityId): boolean {
  const receivedStr = parseEntityIdString(received);
  return receivedStr === expected;
}

export function toBeEntityIdMessage(received: unknown, expected: EntityId, pass: boolean): string {
  const receivedStr = parseEntityIdString(received) ?? String(received);

  return pass
    ? `expected ${receivedStr} not to be a valid EntityId matching ${expected}`
    : `expected ${receivedStr} to be a valid EntityId matching ${expected}`;
}
