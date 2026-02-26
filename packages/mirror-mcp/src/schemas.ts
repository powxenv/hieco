import { z } from "zod";
import { LIMITS } from "./constants";
import { entityIdRegex, timestampRegex, evmAddressRegex, hex64Regex, txIdRegex } from "./constants";

export const entityIdSchema = z
  .string()
  .regex(entityIdRegex, "Entity ID must be in format 0.0.123");

export const timestampSchema = z
  .string()
  .regex(timestampRegex, "Timestamp must be ISO 8601 format (e.g., 2024-01-01T00:00:00Z)")
  .optional();

export const evmAddressSchema = z
  .string()
  .regex(evmAddressRegex, "EVM address must be 0x-prefixed 40-character hex");

export const hex64Schema = z
  .string()
  .regex(hex64Regex, "Must be 64-character hex string prefixed with 0x")
  .optional();

export const txIdSchema = z
  .string()
  .regex(txIdRegex, "Transaction ID format: 0.0.123@timestamp.nonce");

export const limitSchema = z
  .number()
  .int("Limit must be an integer")
  .min(LIMITS.MIN_LIMIT, "Minimum 1")
  .max(LIMITS.MAX_LIMIT, "Maximum 1000")
  .optional();

export const serialNumberSchema = z
  .number()
  .int("Serial number must be an integer")
  .min(0, "Must be non-negative")
  .optional();

export const nodeIdSchema = z
  .number()
  .int("Node ID must be an integer")
  .min(0, "Must be non-negative")
  .max(LIMITS.MAX_NODE_ID, "Node ID too large")
  .optional();

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function toApiParams<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[camelToSnake(key)] = value;
    }
  }
  return result;
}

export * from "./constants";
