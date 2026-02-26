import type {
  JsonRpcResponse,
  SubscribeResponse,
  UnsubscribeResponse,
  ChainIdResponse,
} from "../types/json-rpc";

export function isResponseWithId(
  response: JsonRpcResponse,
): response is JsonRpcResponse & { id: number } {
  return typeof response.id === "number";
}

export function isJsonRpcResponse(value: unknown): value is JsonRpcResponse {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return v.jsonrpc === "2.0";
}

export function isSubscribeResponse(value: unknown): value is SubscribeResponse {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return v.jsonrpc === "2.0" && typeof v.id === "number" && typeof v.result === "string";
}

export function isUnsubscribeResponse(value: unknown): value is UnsubscribeResponse {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return v.jsonrpc === "2.0" && typeof v.id === "number" && typeof v.result === "boolean";
}

export function isChainIdResponse(value: unknown): value is ChainIdResponse {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v.jsonrpc === "2.0" &&
    typeof v.id === "number" &&
    typeof v.result === "string" &&
    (v.result === "0x127" ||
      v.result === "0x128" ||
      v.result === "0x129" ||
      v.result.startsWith("0x"))
  );
}
