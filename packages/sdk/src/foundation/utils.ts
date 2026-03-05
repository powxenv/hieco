import type { Amount } from "./params.ts";
export function toAmountString(value: Amount): string {
  return typeof value === "bigint" ? value.toString() : String(value);
}
