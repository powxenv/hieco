import type {
  ApiResult,
  MirrorNodeClient,
  PaginatedResponse,
  PaginationParams,
} from "@hieco/mirror";
import { createError } from "../errors/error.ts";
import type { Result } from "../results/result.ts";
import { err, ok } from "../results/result.ts";
import type { ReadPage } from "./namespace.ts";

export interface ReadsContext {
  readonly mirror: MirrorNodeClient;
}

const defaultLimit = 25;

export function toReadPage<T>(items: ReadonlyArray<T>, next?: string): ReadPage<T> {
  return { items, ...(next ? { next } : {}) };
}

function mapMirrorError(
  context: string,
  error: { readonly message: string; readonly status?: number; readonly code?: string },
) {
  return createError("MIRROR_QUERY_FAILED", context, {
    hint: "Verify mirror node connectivity",
    details: {
      status: error.status ?? "unknown",
      code: error.code ?? "unknown",
    },
  });
}

export function withDefaultLimit<T extends PaginationParams | undefined>(
  params?: T,
): PaginationParams {
  return {
    ...(params ?? {}),
    ...(params?.limit ? {} : { limit: defaultLimit }),
  };
}

export function readSingle<T>(response: ApiResult<T>, errorMessage: string): Result<T> {
  if (!response.success) {
    return err(mapMirrorError(errorMessage, response.error));
  }

  return ok(response.data);
}

export function readList<T>(
  response: ApiResult<ReadonlyArray<T> | T[]>,
  errorMessage: string,
  next?: string,
): Result<ReadPage<T>> {
  if (!response.success) {
    return err(mapMirrorError(errorMessage, response.error));
  }

  return ok(toReadPage(response.data, next));
}

export function readPage<T>(
  response: ApiResult<PaginatedResponse<T>>,
  errorMessage: string,
): Result<ReadPage<T>> {
  if (!response.success) {
    return err(mapMirrorError(errorMessage, response.error));
  }

  const keys = Object.keys(response.data).filter((key) => key !== "links");
  const arrayKey = keys.find((key) => Array.isArray(response.data[key]));
  const items = arrayKey && Array.isArray(response.data[arrayKey]) ? response.data[arrayKey] : [];

  return ok(toReadPage(items, response.data.links?.next));
}
