import type { Amount, TransactionDescriptor } from "./types/params.ts";
export function toAmountString(value: Amount): string {
  return typeof value === "bigint" ? value.toString() : String(value);
}

export function resolveTransactionInput(input: TransactionDescriptor): TransactionDescriptor {
  return input;
}
