import type { NetworkType, ApiResult, ApiError } from "@hiecom/types";

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

/**
 * Abstract base class for streaming clients.
 * Provides state management, subscription tracking, and connection lifecycle.
 *
 * @template TMessage - The type of messages received from the stream
 * @template TSubscription - The type of subscription configuration
 * @template TUnsubscribeResult - The type of result returned from unsubscribe (default: null)
 */
export abstract class BaseStreamClient<TMessage, TSubscription, TUnsubscribeResult = null> {
  protected readonly config: StreamConfig;
  protected state: StreamState;
  protected subscriptions: Map<string, Set<(message: TMessage) => void>>;

  constructor(config: StreamConfig) {
    this.config = config;
    this.state = { _tag: "Disconnected" };
    this.subscriptions = new Map();
  }

  /**
   * Establishes a connection to the streaming endpoint.
   *
   * @returns Promise resolving to connection result or error
   */
  abstract connect(): Promise<ApiResult<null>>;

  /**
   * Disconnects from the streaming endpoint and cleans up resources.
   *
   * @returns Promise that resolves when disconnected
   */
  abstract disconnect(): Promise<void>;

  /**
   * Subscribes to a stream of messages.
   *
   * @param subscription - The subscription configuration
   * @param callback - Function called when messages are received
   * @returns Promise resolving to subscription ID or error
   */
  abstract subscribe(
    subscription: TSubscription,
    callback: (message: TMessage) => void,
  ): Promise<ApiResult<string>>;

  /**
   * Unsubscribes from a stream.
   *
   * @param subscriptionId - The subscription to unsubscribe from
   * @returns Promise resolving to unsubscribe result or error
   */
  abstract unsubscribe(subscriptionId: string): Promise<ApiResult<TUnsubscribeResult>>;

  /**
   * Gets the current connection state.
   *
   * @returns The current stream state
   */
  getState(): StreamState {
    return this.state;
  }

  /**
   * Protected method to update the connection state.
   *
   * @param newState - The new state to set
   */
  protected setState(newState: StreamState): void {
    this.state = newState;
  }
}
