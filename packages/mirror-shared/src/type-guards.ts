import type { ApiResult, ApiError } from "@hieco/mirror-js";

export function isSuccess<T>(result: ApiResult<T>): result is { readonly success: true; readonly data: T } {
    return result.success === true;
}

export function isApiError<E extends ApiError>(
    result: ApiResult<unknown, E>,
): result is { readonly success: false; readonly error: E } {
    return result.success === false;
}

export function isNetworkError(error: ApiError): error is ApiError & { readonly _tag: "NetworkError" } {
    return error._tag === "NetworkError";
}

export function isNotFoundError(error: ApiError): error is ApiError & { readonly _tag: "NotFoundError" } {
    return error._tag === "NotFoundError";
}

export function isRateLimitError(error: ApiError): error is ApiError & { readonly _tag: "RateLimitError" } {
    return error._tag === "RateLimitError";
}

export function isValidationError(error: ApiError): error is ApiError & { readonly _tag: "ValidationError" } {
    return error._tag === "ValidationError";
}
