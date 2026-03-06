import type {
  ErrorClassification,
  ErrorCode,
  ErrorDetails,
  ErrorKind,
  HieroErrorShape,
} from "./errors-types.ts";
import type { Result } from "./results.ts";

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

function toErrorMessage(value: unknown): string {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return "Unknown error";
  }
}

function detectStatus(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  if ("status" in value && typeof value.status === "string") return value.status;
  if ("status" in value && typeof value.status === "number") return String(value.status);
  return undefined;
}

const RETRYABLE_STATUSES = new Set([
  "BUSY",
  "PLATFORM_NOT_ACTIVE",
  "PLATFORM_TRANSACTION_NOT_CREATED",
  "TRANSACTION_EXPIRED",
]);

function inferKind(code: ErrorCode | undefined): ErrorKind {
  if (!code) return "unknown";
  if (code.startsWith("CONFIG_")) return "config";
  if (code.startsWith("SIGNER_")) return "signer";
  if (code.startsWith("MIRROR_")) return "mirror";
  if (code.startsWith("NETWORK_")) return "network";
  if (code.startsWith("CONTRACT_")) return "contract";
  if (code.startsWith("SCHEDULE_")) return "schedule";
  if (code.startsWith("FILE_")) return "file";
  if (code.startsWith("TX_")) return "transaction";
  if (code.startsWith("HEDERA_")) return "hedera";
  if (code === "UNEXPECTED_ERROR") return "unexpected";
  return "unknown";
}

export function classifyError(error: unknown): ErrorClassification {
  if (isHieroError(error)) {
    const status =
      typeof error.details?.status === "string"
        ? error.details.status
        : typeof error.details?.status === "number"
          ? String(error.details.status)
          : detectStatus(error);
    const retryable = status ? RETRYABLE_STATUSES.has(status) : false;
    return {
      kind: inferKind(error.code),
      code: error.code,
      ...(status ? { status } : {}),
      retryable,
      message: error.message,
      ...(error.hint ? { hint: error.hint } : {}),
      ...(error.transactionId ? { transactionId: error.transactionId } : {}),
    };
  }

  if (typeof error === "object" && error && "code" in error && "message" in error) {
    const maybeCode = (error as { readonly code?: unknown }).code;
    const code = typeof maybeCode === "string" ? (maybeCode as ErrorCode) : undefined;
    const status = detectStatus(error);
    const retryable = status ? RETRYABLE_STATUSES.has(status) : false;
    return {
      kind: inferKind(code),
      ...(code ? { code } : {}),
      ...(status ? { status } : {}),
      retryable,
      message: toErrorMessage(error),
    };
  }

  return {
    kind: "unknown",
    retryable: false,
    message: toErrorMessage(error),
  };
}

export function formatError(error: unknown): string {
  const classification = classifyError(error);
  const code = classification.code ? ` (${classification.code})` : "";
  const status = classification.status ? ` [status: ${classification.status}]` : "";
  const hint = classification.hint ? ` Hint: ${classification.hint}` : "";
  return `${classification.message}${code}${status}${hint}`;
}
