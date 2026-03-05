import type { ErrorCode, ErrorDetails, HieroErrorShape } from "./types/errors.ts";
import type { Result } from "./types/results.ts";

export class HieroError extends Error implements HieroErrorShape {
  readonly code: ErrorCode;
  readonly hint?: string;
  readonly transactionId?: string;
  readonly details?: ErrorDetails;

  constructor(shape: HieroErrorShape) {
    super(shape.message);
    this.code = shape.code;
    if (shape.hint !== undefined) this.hint = shape.hint;
    if (shape.transactionId !== undefined) this.transactionId = shape.transactionId;
    if (shape.details !== undefined) this.details = shape.details;
    this.name = "HieroError";
    Object.setPrototypeOf(this, HieroError.prototype);
  }

  toShape(): HieroErrorShape {
    return {
      code: this.code,
      message: this.message,
      ...(this.hint !== undefined ? { hint: this.hint } : {}),
      ...(this.transactionId !== undefined ? { transactionId: this.transactionId } : {}),
      ...(this.details !== undefined ? { details: this.details } : {}),
    };
  }
}

export function createError(
  code: ErrorCode,
  message: string,
  options: {
    readonly hint?: string;
    readonly transactionId?: string;
    readonly details?: ErrorDetails;
  } = {},
): HieroErrorShape {
  return {
    code,
    message,
    ...(options.hint !== undefined ? { hint: options.hint } : {}),
    ...(options.transactionId !== undefined ? { transactionId: options.transactionId } : {}),
    ...(options.details !== undefined ? { details: options.details } : {}),
  };
}

export function toHieroError(error: HieroErrorShape): HieroError {
  return new HieroError(error);
}

export function isHieroError(value: unknown): value is HieroError {
  return value instanceof HieroError;
}

export function unwrap<T>(result: Result<T>): T {
  if (result.ok) return result.value;
  throw toHieroError(result.error);
}
