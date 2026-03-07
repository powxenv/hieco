import type { ApiError } from "@hieco/utils";

export function mapJsonRpcErrorCode(code: number): ApiError["_tag"] {
  switch (code) {
    case -32602:
      return "ValidationError";
    case -32600:
    case -32601:
      return "ValidationError";
    case -32608:
      return "RateLimitError";
    case -32603:
    default:
      return "UnknownError";
  }
}
