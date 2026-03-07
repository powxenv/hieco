import { ApiErrorFactory, type ApiError } from "../types/api";

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
