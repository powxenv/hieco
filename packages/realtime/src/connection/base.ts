import type { ApiResult } from "@hieco/utils";
import type { StreamConfig, StreamState } from "./stream";

export abstract class BaseStreamClient<TMessage, TSubscription, TUnsubscribeResult = null> {
  protected readonly config: StreamConfig;
  protected state: StreamState;
  private readonly stateListeners: Set<(state: StreamState) => void>;

  constructor(config: StreamConfig) {
    this.config = config;
    this.state = { _tag: "Disconnected" };
    this.stateListeners = new Set();
  }

  abstract connect(): Promise<ApiResult<null>>;

  abstract disconnect(): Promise<void>;

  abstract subscribe(
    subscription: TSubscription,
    callback: (message: TMessage) => void,
  ): Promise<ApiResult<string>>;

  abstract unsubscribe(subscriptionId: string): Promise<ApiResult<TUnsubscribeResult>>;

  getState(): StreamState {
    return this.state;
  }

  onStateChange(listener: (state: StreamState) => void): () => void {
    this.stateListeners.add(listener);
    return () => {
      this.stateListeners.delete(listener);
    };
  }

  protected setState(newState: StreamState): void {
    this.state = newState;
    for (const listener of this.stateListeners) {
      listener(newState);
    }
  }
}
