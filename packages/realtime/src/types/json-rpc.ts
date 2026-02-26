import type { RelayMessage } from "./subscription";

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
