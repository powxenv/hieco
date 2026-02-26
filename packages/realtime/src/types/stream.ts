import type { NetworkType, ApiError } from "@hiecom/types";

export type StreamState =
  | { readonly _tag: "Disconnected" }
  | { readonly _tag: "Connecting" }
  | { readonly _tag: "Connected"; readonly connectionId: string }
  | { readonly _tag: "Error"; readonly error: ApiError };

export interface StreamConfig {
  readonly network: NetworkType;
  readonly endpoint: string;
  readonly reconnection?: {
    readonly maxAttempts: number;
    readonly initialDelay: number;
    readonly maxDelay: number;
    readonly backoffMultiplier: number;
  };
}
