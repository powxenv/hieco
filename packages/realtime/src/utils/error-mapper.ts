import type { ApiError } from "@hiecom/types";
import type { JsonRpcErrorCode } from "../types/json-rpc";

export function mapJsonRpcErrorCode(code: JsonRpcErrorCode): ApiError["_tag"] {
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

export function isCloseErrorRecoverable(code: number): boolean {
  return code === 4002;
}
