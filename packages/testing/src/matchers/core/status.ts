import type { Status } from "@hiero-ledger/sdk";

const SUCCESS_STATUS_PATTERNS = ["OK", "SUCCESS"] as const;
const STATUS_SEPARATOR = ".";

interface StatusLike {
  readonly toString: () => string;
}

const hasToStringMethod = (obj: object): obj is StatusLike => {
  const desc = Object.getOwnPropertyDescriptor(obj, "toString");
  return desc !== undefined && typeof desc.value === "function";
};

function isStatusLike(value: unknown): value is StatusLike {
  return typeof value === "object" && value !== null && hasToStringMethod(value);
}

function parseStatusString(value: unknown): string | null {
  if (typeof value === "string") return value.toUpperCase();

  if (isStatusLike(value)) {
    return value.toString().toUpperCase();
  }

  if (typeof value === "object" && value !== null) {
    const obj = value as Partial<Record<PropertyKey, unknown>>;
    const { status } = obj;

    if (status === undefined) return null;

    if (typeof status === "string") {
      return status.toUpperCase();
    }

    if (isStatusLike(status)) {
      return status.toString().toUpperCase();
    }
  }

  return null;
}

export function toHaveStatus(received: unknown, expected: string | Status): boolean {
  const receivedStr = parseStatusString(received);
  const expectedStr = parseStatusString(expected);

  if (!receivedStr || !expectedStr) return false;

  if (receivedStr === expectedStr) return true;

  const parts = expectedStr.split(STATUS_SEPARATOR);
  const lastPart = parts.at(-1);
  if (!lastPart) return false;
  return receivedStr.endsWith(lastPart);
}

export function toSucceed(received: unknown): boolean {
  const statusStr = parseStatusString(received);
  if (!statusStr) return false;

  return SUCCESS_STATUS_PATTERNS.some((pattern) => {
    const parts = statusStr.split(STATUS_SEPARATOR);
    const lastPart = parts[parts.length - 1];
    return lastPart === pattern;
  });
}

export function toSucceedWith(received: unknown, expected: Record<string, unknown>): boolean {
  if (!toSucceed(received)) return false;

  if (typeof received !== "object" || received === null) return false;

  for (const [key, expectedValue] of Object.entries(expected)) {
    const receivedValue = (received as Record<string, unknown>)[key];

    if (receivedValue === undefined) return false;

    const receivedStr = String(receivedValue);
    const expectedStr = String(expectedValue);

    if (receivedStr !== expectedStr && !receivedStr.includes(expectedStr)) {
      return false;
    }
  }

  return true;
}

export function toHaveStatusMessage(
  received: unknown,
  expected: string | Status,
  pass: boolean,
): string {
  const receivedStr = parseStatusString(received) ?? String(received);
  const expectedStr = parseStatusString(expected) ?? String(expected);

  return pass
    ? `expected status not to be ${expectedStr}`
    : `expected status to be ${expectedStr}, but got ${receivedStr}`;
}

export function toSucceedMessage(received: unknown, pass: boolean): string {
  const receivedStr = parseStatusString(received) ?? String(received);

  return pass
    ? `expected transaction not to succeed, but got status ${receivedStr}`
    : `expected transaction to succeed, but got status ${receivedStr}`;
}

export function toSucceedWithMessage(
  received: unknown,
  expected: Record<string, unknown>,
  pass: boolean,
): string {
  const receivedStr = parseStatusString(received) ?? String(received);

  if (pass) {
    return `expected transaction not to succeed with ${JSON.stringify(expected)}`;
  }

  return `expected transaction to succeed with ${JSON.stringify(expected)}, but got status ${receivedStr}`;
}
