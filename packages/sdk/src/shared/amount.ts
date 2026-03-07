export type Amount = number | string | bigint;

export function toAmountString(value: Amount): string {
  return typeof value === "bigint" ? value.toString() : String(value);
}
