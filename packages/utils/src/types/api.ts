export type ApiResult<T, E extends ApiError = ApiError> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

export interface ApiError {
  readonly _tag:
    | "NetworkError"
    | "ValidationError"
    | "NotFoundError"
    | "RateLimitError"
    | "UnknownError";
  readonly message: string;
  readonly status?: number;
  readonly code?: string;
}

export const ApiErrorFactory = {
  network: (message: string, status?: number): ApiError => ({
    _tag: "NetworkError",
    message,
    status,
  }),
  validation: (message: string, code?: string): ApiError => ({
    _tag: "ValidationError",
    message,
    code,
  }),
  notFound: (message: string): ApiError => ({
    _tag: "NotFoundError",
    message,
  }),
  rateLimit: (message: string, retryAfter?: number): ApiError => ({
    _tag: "RateLimitError",
    message,
    code: retryAfter?.toString(),
  }),
  unknown: (message: string, code?: string): ApiError => ({
    _tag: "UnknownError",
    message,
    code,
  }),
};
