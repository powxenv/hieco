import { ApiErrorFactory, type ApiResult, type ApiError } from "../types/api";

export function isSuccess<T>(
  result: ApiResult<T>,
): result is { readonly success: true; readonly data: T } {
  return result.success === true;
}

export function isApiError<E extends ApiError>(
  result: ApiResult<unknown, E>,
): result is { readonly success: false; readonly error: E } {
  return result.success === false;
}

export function isNetworkError(
  error: ApiError,
): error is ApiError & { readonly _tag: "NetworkError" } {
  return error._tag === "NetworkError";
}

export function isNotFoundError(
  error: ApiError,
): error is ApiError & { readonly _tag: "NotFoundError" } {
  return error._tag === "NotFoundError";
}

export function isRateLimitError(
  error: ApiError,
): error is ApiError & { readonly _tag: "RateLimitError" } {
  return error._tag === "RateLimitError";
}

export function isValidationError(
  error: ApiError,
): error is ApiError & { readonly _tag: "ValidationError" } {
  return error._tag === "ValidationError";
}

export function toApiError(error: unknown): ApiError {
  if (typeof error === "object" && error !== null && "_tag" in error && "message" in error) {
    const tag = error._tag;
    const message = error.message;

    if (typeof message === "string") {
      switch (tag) {
        case "NetworkError":
        case "ValidationError":
        case "NotFoundError":
        case "RateLimitError":
        case "UnknownError": {
          const status =
            "status" in error && typeof error.status === "number" ? error.status : undefined;
          const code = "code" in error && typeof error.code === "string" ? error.code : undefined;

          return {
            _tag: tag,
            message,
            ...(status !== undefined ? { status } : {}),
            ...(code !== undefined ? { code } : {}),
          };
        }
      }
    }
  }

  return ApiErrorFactory.unknown(error instanceof Error ? error.message : "Unknown error occurred");
}
