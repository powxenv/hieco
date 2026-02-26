import type { ApiError } from "@hiecom/types";

export interface RelaySubscription {
  readonly type: "logs" | "newHeads";
  readonly filter: {
    readonly address?: string | readonly string[];
    readonly topics?: readonly (string | readonly string[] | null)[];
  };
}

export interface LogResult {
  readonly address: string;
  readonly blockHash: string;
  readonly blockNumber: string;
  readonly data: string;
  readonly logIndex: string;
  readonly topics: readonly string[];
  readonly transactionHash: string;
  readonly transactionIndex: string;
}

export interface NewHeadsResult {
  readonly hash: string;
  readonly parentHash: string;
  readonly sha3Uncles: string;
  readonly logsBloom: string;
  readonly transactionsRoot: string;
  readonly stateRoot: string;
  readonly receiptsRoot: string;
  readonly number: string;
  readonly gasLimit: string;
  readonly gasUsed: string;
  readonly timestamp: string;
  readonly extraData: string;
  readonly difficulty: string;
  readonly miner: string;
  readonly nonce: string;
  readonly size?: string;
  readonly totalDifficulty?: string;
  readonly mixHash?: string;
}

export interface RelayMessage {
  readonly subscription: string;
  readonly result: LogResult | NewHeadsResult;
}

export interface JsonRpcRequest {
  readonly jsonrpc: "2.0";
  readonly id: number;
  readonly method: "eth_subscribe" | "eth_unsubscribe" | "eth_chainId";
  readonly params: unknown[];
}

export interface JsonRpcResponse {
  readonly jsonrpc: "2.0";
  readonly id?: number;
  readonly result?: unknown;
  readonly error?: {
    readonly code: number;
    readonly message: string;
  };
  readonly method?: string;
  readonly params?: RelayMessage;
}

export type SubscribeResponse = {
  readonly jsonrpc: "2.0";
  readonly id: number;
  readonly result: string;
};

export type UnsubscribeResponse = {
  readonly jsonrpc: "2.0";
  readonly id: number;
  readonly result: boolean;
};

export type ChainIdResponse = {
  readonly jsonrpc: "2.0";
  readonly id: number;
  readonly result: string;
};

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

export type JsonRpcErrorCode =
  | -32700
  | -32600
  | -32601
  | -32602
  | -32603
  | -32608
  | 4001
  | 4002
  | 4003;

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

export function isCloseErrorRecoverable(code: number): boolean {
  return code === 4002;
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
