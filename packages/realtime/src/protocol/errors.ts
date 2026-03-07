import type { ApiError } from "@hieco/utils";
import type { JsonRpcErrorCode } from "./rpc";

export function isJsonRpcErrorCode(code: number): code is JsonRpcErrorCode {
  return (
    code === -32700 ||
    code === -32600 ||
    code === -32601 ||
    code === -32602 ||
    code === -32603 ||
    code === -32608 ||
    code === 4001 ||
    code === 4002 ||
    code === 4003
  );
}

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
