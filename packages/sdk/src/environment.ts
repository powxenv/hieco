export type RuntimeEnvironment = "node" | "browser";

export function detectEnvironment(): RuntimeEnvironment {
  if (typeof globalThis.document !== "undefined") {
    return "browser";
  }
  return "node";
}

export function isBrowser(): boolean {
  return detectEnvironment() === "browser";
}

export function isNode(): boolean {
  return detectEnvironment() === "node";
}
