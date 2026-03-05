import type { HbarValueInput } from "../../types/matcher.js";

interface HbarLike {
  readonly toBigNumber: () => { toString: () => string };
}

const hasToBigNumberMethod = (obj: object): obj is HbarLike => {
  return typeof (obj as HbarLike).toBigNumber === "function";
};

function isHbarLike(value: unknown): value is HbarLike {
  return typeof value === "object" && value !== null && hasToBigNumberMethod(value);
}

function parseHbarInput(input: HbarValueInput): bigint | null {
  if (typeof input === "bigint") return input;
  if (typeof input === "number") {
    const tinybars = Math.floor(input * 100_000_000);
    return BigInt(tinybars);
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    const numericValue = Number.parseFloat(trimmed);
    if (Number.isNaN(numericValue)) return null;
    const tinybars = Math.floor(numericValue * 100_000_000);
    return BigInt(tinybars);
  }
  return null;
}

export function toBeHbar(received: unknown, expected: HbarValueInput): boolean {
  if (!isHbarLike(received)) return false;

  const expectedValue = parseHbarInput(expected);
  if (expectedValue === null) return false;

  const receivedValue = BigInt(received.toBigNumber().toString());
  return receivedValue === expectedValue;
}

export function toBeHbarMessage(
  received: unknown,
  expected: HbarValueInput,
  pass: boolean,
): string {
  const receivedStr = isHbarLike(received) ? received.toString() : String(received);
  const expectedStr = String(expected);

  return pass
    ? `expected ${receivedStr} not to equal ${expectedStr} Hbar`
    : `expected ${receivedStr} to equal ${expectedStr} Hbar`;
}
