import { BaseStreamClient } from "./base-stream-client";
import type {
  RelaySubscription,
  RelayMessage,
  JsonRpcRequest,
  JsonRpcResponse,
} from "./types/relay-types";
import {
  isJsonRpcResponse,
  isSubscribeResponse,
  isUnsubscribeResponse,
  isChainIdResponse,
  mapJsonRpcErrorCode,
  isCloseErrorRecoverable,
} from "./types/relay-types";
import { createSubscriptionId } from "./types/common-types";
import type { ApiResult } from "@hiecom/types";

interface PendingSubscribe {
  resolve: (result: ApiResult<string>) => void;
  callback: (message: RelayMessage) => void;
  localSubscriptionId?: string;
  isRestoration?: boolean;
}

interface PendingUnsubscribe {
  resolve: (result: ApiResult<boolean>) => void;
  localSubscriptionId: string;
}

interface PendingChainId {
  resolve: (result: ApiResult<string>) => void;
}

interface TrackedSubscription {
  subscription: RelaySubscription;
  callbacks: Set<(message: RelayMessage) => void>;
}

function isResponseWithId(response: JsonRpcResponse): response is JsonRpcResponse & { id: number } {
  return typeof response.id === "number";
}

export class RelayWebSocketClient extends BaseStreamClient<
  RelayMessage,
  RelaySubscription,
  boolean
> {
  private ws: WebSocket | null = null;
  private requestId: number = 0;
  private pendingSubscribes: Map<number, PendingSubscribe> = new Map();
  private pendingUnsubscribes: Map<number, PendingUnsubscribe> = new Map();
  private pendingChainIds: Map<number, PendingChainId> = new Map();
  private serverToLocalSubscriptions: Map<string, string> = new Map();
  private trackedSubscriptions: Map<string, TrackedSubscription> = new Map();
  private isRestoringSubscriptions: boolean = false;

  async connect(): Promise<ApiResult<null>> {
    if (this.state._tag === "Connected") {
      return { success: true, data: null };
    }

    this.setState({ _tag: "Connecting" });

    try {
      this.ws = new WebSocket(this.config.endpoint);

      this.ws.onopen = () => {
        this.setState({
          _tag: "Connected",
          connectionId: crypto.randomUUID(),
        });

        if (this.trackedSubscriptions.size > 0 && !this.isRestoringSubscriptions) {
          this.restoreSubscriptions();
        }
      };

      this.ws.onmessage = (event: MessageEvent) => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = () => {
        this.setState({
          _tag: "Error",
          error: {
            _tag: "NetworkError",
            message: "WebSocket connection error",
          },
        });
      };

      this.ws.onclose = (event: CloseEvent) => {
        const wasConnected = this.state._tag === "Connected";
        this.setState({ _tag: "Disconnected" });

        const closeCode = event.code;
        if (wasConnected) {
          if (isCloseErrorRecoverable(closeCode)) {
            this.handleReconnection();
          } else if (closeCode === 4001 || closeCode === 4003) {
            this.setState({
              _tag: "Error",
              error: {
                _tag: "RateLimitError",
                message: event.reason || `Connection closed with code ${closeCode}`,
                code: closeCode.toString(),
              },
            });
          } else {
            this.handleReconnection();
          }
        }
      };

      return { success: true, data: null };
    } catch (error) {
      return {
        success: false,
        error: {
          _tag: "NetworkError",
          message: error instanceof Error ? error.message : "Connection failed",
        },
      };
    }
  }

  subscribe(
    subscription: RelaySubscription,
    callback: (message: RelayMessage) => void,
  ): Promise<ApiResult<string>> {
    if (this.state._tag !== "Connected") {
      return Promise.resolve({
        success: false,
        error: {
          _tag: "NetworkError",
          message: "Not connected",
        },
      });
    }

    return new Promise<ApiResult<string>>((resolve) => {
      const requestId = this.nextRequestId();
      const localSubscriptionId = createSubscriptionId(crypto.randomUUID());

      const request: JsonRpcRequest = {
        jsonrpc: "2.0",
        id: requestId,
        method: "eth_subscribe",
        params: [subscription.type, subscription.filter],
      };

      this.sendRequest(request);

      const existing = this.trackedSubscriptions.get(localSubscriptionId);
      if (existing) {
        existing.callbacks.add(callback);
      } else {
        this.trackedSubscriptions.set(localSubscriptionId, {
          subscription,
          callbacks: new Set([callback]),
        });
      }

      this.pendingSubscribes.set(requestId, {
        resolve,
        callback,
        localSubscriptionId,
      });
    });
  }

  unsubscribe(subscriptionId: string): Promise<ApiResult<boolean>> {
    const callbacks = this.subscriptions.get(subscriptionId);
    if (!callbacks) {
      return Promise.resolve({
        success: false,
        error: {
          _tag: "NotFoundError",
          message: "Subscription not found",
        },
      });
    }

    const serverSubscriptionId = this.getServerSubscriptionId(subscriptionId);
    if (!serverSubscriptionId) {
      return Promise.resolve({
        success: false,
        error: {
          _tag: "NotFoundError",
          message: "Server subscription ID not found",
        },
      });
    }

    return new Promise<ApiResult<boolean>>((resolve) => {
      const requestId = this.nextRequestId();
      this.pendingUnsubscribes.set(requestId, { resolve, localSubscriptionId: subscriptionId });

      const request: JsonRpcRequest = {
        jsonrpc: "2.0",
        id: requestId,
        method: "eth_unsubscribe",
        params: [serverSubscriptionId],
      };

      this.sendRequest(request);
    });
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
    this.serverToLocalSubscriptions.clear();
    this.trackedSubscriptions.clear();
    this.pendingSubscribes.clear();
    this.pendingUnsubscribes.clear();
    this.pendingChainIds.clear();
    this.setState({ _tag: "Disconnected" });
  }

  /**
   * Gets the chain ID for the current network.
   *
   * @returns Promise resolving to chain ID result or error
   */
  async getChainId(): Promise<ApiResult<string>> {
    if (this.state._tag !== "Connected") {
      return {
        success: false,
        error: {
          _tag: "NetworkError",
          message: "Not connected",
        },
      };
    }

    return new Promise<ApiResult<string>>((resolve) => {
      const requestId = this.nextRequestId();

      const request: JsonRpcRequest = {
        jsonrpc: "2.0",
        id: requestId,
        method: "eth_chainId",
        params: [],
      };

      try {
        this.sendRequest(request);

        const timeoutId = setTimeout(() => {
          resolve({
            success: false,
            error: {
              _tag: "NetworkError",
              message: "Chain ID request timed out",
            },
          });
        }, 5000);

        this.pendingSubscribes.set(requestId, {
          resolve: (result: ApiResult<string>) => {
            clearTimeout(timeoutId);
            resolve(result);
          },
          callback: () => {},
        });
      } catch {
        resolve({
          success: false,
          error: {
            _tag: "NetworkError",
            message: "Failed to send chain ID request",
          },
        });
      }
    });
  }

  private sendRequest(request: JsonRpcRequest): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }
    this.ws.send(JSON.stringify(request));
  }

  private handleMessage(data: string): void {
    try {
      const parsed = JSON.parse(data);

      if (!isJsonRpcResponse(parsed)) {
        this.setState({
          _tag: "Error",
          error: {
            _tag: "ValidationError",
            message: "Invalid JSON-RPC response format",
          },
        });
        return;
      }

      if (parsed.method === "eth_subscription" && parsed.params) {
        this.handleSubscriptionMessage(parsed.params);
      } else if (isResponseWithId(parsed)) {
        this.handleRequestResponse(parsed);
      }
    } catch {
      this.setState({
        _tag: "Error",
        error: {
          _tag: "ValidationError",
          message: "Failed to parse WebSocket message as JSON",
        },
      });
    }
  }

  private handleRequestResponse(response: JsonRpcResponse & { id: number }): void {
    const id = response.id;

    if (isSubscribeResponse(response)) {
      const pending = this.pendingSubscribes.get(id);
      if (pending) {
        this.pendingSubscribes.delete(id);
        const localSubscriptionId =
          pending.localSubscriptionId ?? createSubscriptionId(response.result);

        if (pending.isRestoration) {
          const tracked = this.trackedSubscriptions.get(localSubscriptionId);
          if (tracked) {
            this.subscriptions.set(localSubscriptionId, tracked.callbacks);
          }
        } else {
          this.subscriptions.set(localSubscriptionId, new Set([pending.callback]));
        }

        this.serverToLocalSubscriptions.set(response.result, localSubscriptionId);

        if (!pending.isRestoration) {
          pending.resolve({ success: true, data: localSubscriptionId });
        }
      }
    } else if (isUnsubscribeResponse(response)) {
      const pending = this.pendingUnsubscribes.get(id);
      if (pending) {
        this.pendingUnsubscribes.delete(id);
        if (response.result) {
          this.subscriptions.delete(pending.localSubscriptionId);
          this.trackedSubscriptions.delete(pending.localSubscriptionId);
          const serverSubscriptionId = this.getServerSubscriptionId(pending.localSubscriptionId);
          if (serverSubscriptionId) {
            this.serverToLocalSubscriptions.delete(serverSubscriptionId);
          }
          pending.resolve({ success: true, data: true });
        } else {
          pending.resolve({
            success: false,
            error: {
              _tag: "UnknownError",
              message: "Unsubscribe failed",
            },
          });
        }
      }
    } else if (isChainIdResponse(response)) {
      const pending = this.pendingChainIds.get(id);
      if (pending) {
        this.pendingChainIds.delete(id);
        pending.resolve({ success: true, data: response.result });
      }
    } else if (response.error) {
      const errorTag = mapJsonRpcErrorCode(response.error.code);
      const subscribePending = this.pendingSubscribes.get(id);
      if (subscribePending) {
        this.pendingSubscribes.delete(id);
        subscribePending.resolve({
          success: false,
          error: {
            _tag: errorTag,
            message: response.error.message,
            code: response.error.code.toString(),
          },
        });
      }

      const unsubscribePending = this.pendingUnsubscribes.get(id);
      if (unsubscribePending) {
        this.pendingUnsubscribes.delete(id);
        unsubscribePending.resolve({
          success: false,
          error: {
            _tag: errorTag,
            message: response.error.message,
            code: response.error.code.toString(),
          },
        });
      }

      const chainIdPending = this.pendingChainIds.get(id);
      if (chainIdPending) {
        this.pendingChainIds.delete(id);
        chainIdPending.resolve({
          success: false,
          error: {
            _tag: errorTag,
            message: response.error.message,
            code: response.error.code.toString(),
          },
        });
      }
    }
  }

  private handleSubscriptionMessage(message: RelayMessage): void {
    const localSubscriptionId = this.serverToLocalSubscriptions.get(message.subscription);
    if (localSubscriptionId) {
      const callbacks = this.subscriptions.get(localSubscriptionId);
      if (callbacks) {
        callbacks.forEach((callback) => callback(message));
      }
    }
  }

  private getServerSubscriptionId(localSubscriptionId: string): string | null {
    for (const [serverId, localId] of this.serverToLocalSubscriptions) {
      if (localId === localSubscriptionId) {
        return serverId;
      }
    }
    return null;
  }

  private restoreSubscriptions(): void {
    if (this.isRestoringSubscriptions || this.trackedSubscriptions.size === 0) {
      return;
    }

    this.isRestoringSubscriptions = true;

    const subscriptionsToRestore = Array.from(this.trackedSubscriptions.entries());

    subscriptionsToRestore.forEach(([localId, tracked]) => {
      const requestId = this.nextRequestId();

      const request: JsonRpcRequest = {
        jsonrpc: "2.0",
        id: requestId,
        method: "eth_subscribe",
        params: [tracked.subscription.type, tracked.subscription.filter],
      };

      const pendingSubscribe: PendingSubscribe = {
        resolve: () => {},
        callback: () => {},
        localSubscriptionId: localId,
        isRestoration: true,
      };

      this.pendingSubscribes.set(requestId, pendingSubscribe);
      this.sendRequest(request);
    });

    this.isRestoringSubscriptions = false;
  }

  private handleReconnection(): void {
    const {
      maxAttempts = 5,
      initialDelay = 1000,
      maxDelay = 30000,
      backoffMultiplier = 2,
    } = this.config.reconnection ?? {};

    let attempt = 0;
    let delay = initialDelay;

    const reconnect = async (): Promise<void> => {
      if (attempt >= maxAttempts) {
        this.setState({
          _tag: "Error",
          error: {
            _tag: "NetworkError",
            message: "Max reconnection attempts reached",
          },
        });
        return;
      }

      attempt += 1;
      const result = await this.connect();

      if (!result.success && this.state._tag === "Disconnected") {
        delay = Math.min(delay * backoffMultiplier, maxDelay);
        setTimeout(reconnect, delay);
      }
    };

    reconnect();
  }

  private nextRequestId(): number {
    return ++this.requestId;
  }
}
