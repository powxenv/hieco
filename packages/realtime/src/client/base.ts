import type { ApiResult } from "@hiecom/types";
import type { StreamConfig, StreamState } from "../types/stream";

export abstract class BaseStreamClient<TMessage, TSubscription, TUnsubscribeResult = null> {
  protected readonly config: StreamConfig;
  protected state: StreamState;
  protected subscriptions: Map<string, Set<(message: TMessage) => void>>;

  constructor(config: StreamConfig) {
    this.config = config;
    this.state = { _tag: "Disconnected" };
    this.subscriptions = new Map();
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

  protected setState(newState: StreamState): void {
    this.state = newState;
  }
}
