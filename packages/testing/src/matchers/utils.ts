import type { MatcherHintOptions } from "../types/matcher.js";

export function matcherHint(
  matcherName: string,
  received: unknown,
  expected: unknown,
  options: MatcherHintOptions = {},
): string {
  const { comment = "" } = options;
  const receivedStr = printReceived(received);
  const expectedStr = printExpected(expected);

  let hint = `expect(${receivedStr}).${matcherName}(${expectedStr})`;

  if (comment) {
    hint += ` // ${comment}`;
  }

  return hint;
}

export function printReceived(value: unknown): string {
  return printColor("red", stringify(value));
}

export function printExpected(value: unknown): string {
  return printColor("green", stringify(value));
}

export function stringify(value: unknown, maxDepth = 3): string {
  if (value === null) return "null";
  if (value === undefined) return "undefined";

  switch (typeof value) {
    case "string":
      return `"${value}"`;
    case "number":
    case "boolean":
    case "bigint":
      return String(value);
    case "function":
      return "[Function]";
    case "symbol":
      return value.toString();
  }

  if (value instanceof Uint8Array) {
    const preview = Array.from(value.slice(0, 8))
      .map((b) => `0x${b.toString(16).padStart(2, "0")}`)
      .join(", ");
    const more = value.length > 8 ? ", ..." : "";
    return `Uint8Array[${value.length}] { ${preview}${more} }`;
  }

  if (Array.isArray(value)) {
    return `[${value.map((v) => stringify(v, maxDepth - 1)).join(", ")}]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).slice(0, 5);
    const pairs = entries.map(([k, v]) => `${k}: ${stringify(v, maxDepth - 1)}`);

    if (entries.length >= 5) {
      pairs.push("...");
    }

    return `{ ${pairs.join(", ")} }`;
  }

  return String(value);
}

export function printColor(_color: string, text: string): string {
  return text;
}

export function diff(actual: unknown, expected: unknown): string {
  const actualStr = stringify(actual);
  const expectedStr = stringify(expected);

  if (actualStr === expectedStr) return "";

  return `  - Expected\n  + Received\n\n  - ${expectedStr}\n  + ${actualStr}`;
}

export function getMessage(
  matcherName: string,
  received: unknown,
  expected: unknown,
  pass: boolean,
): string {
  const hint = matcherHint(matcherName, received, expected);
  return pass ? `${hint}\n\nExpected: not ${hint}` : hint;
}
