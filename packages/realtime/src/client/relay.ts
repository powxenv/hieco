import type { ApiResult } from "@hieco/utils";
import type { StreamConfig } from "../types/stream";
import type { RelaySubscription, RelayMessage } from "../types/subscription";
import type { JsonRpcRequest } from "../types/json-rpc";
import { BaseStreamClient } from "./base";
import { SubscriptionManager } from "./subscription-manager";
import { RequestManager } from "./request-manager";
import { isCloseErrorRecoverable } from "../utils/error-mapper";
import { createSubscriptionId } from "../utils/subscription";

export class RelayWebSocketClient extends BaseStreamClient<
  RelayMessage,
  RelaySubscription,
  boolean
> {
  private ws: WebSocket | null = null;
  private requestId: number = 0;
  private readonly subscriptionManager: SubscriptionManager;
  private readonly requestManager: RequestManager;
  private pendingConnect: Promise<ApiResult<null>> | null = null;
  private manualDisconnect = false;

  constructor(config: StreamConfig) {
    super(config);
    this.subscriptionManager = new SubscriptionManager();
    this.requestManager = new RequestManager(
      this.ws,
      this.subscriptionManager,
      this.setState.bind(this),
    );
  }

  async connect(): Promise<ApiResult<null>> {
    if (this.state._tag === "Connected") {
      return { success: true, data: null };
    }

    if (this.pendingConnect) {
      return this.pendingConnect;
    }

    this.setState({ _tag: "Connecting" });
    this.manualDisconnect = false;

    this.pendingConnect = new Promise<ApiResult<null>>((resolve) => {
      let settled = false;

      const settle = (result: ApiResult<null>) => {
        if (settled) {
          return;
        }

        settled = true;
        this.pendingConnect = null;
        resolve(result);
      };

      try {
        const ws = new WebSocket(this.config.endpoint);
        this.ws = ws;
        this.requestManager.setWebSocket(ws);

        ws.onopen = () => {
          this.setState({
            _tag: "Connected",
            connectionId: crypto.randomUUID(),
          });

          if (this.subscriptionManager.tracked.size > 0) {
            this.restoreSubscriptions();
          }

          settle({ success: true, data: null });
        };

        ws.onmessage = (event: MessageEvent) => {
          if (typeof event.data === "string") {
            this.requestManager.handleMessage(event.data);
          }
        };

        ws.onerror = () => {
          this.setState({
            _tag: "Error",
            error: {
              _tag: "NetworkError",
              message: "WebSocket connection error",
            },
          });

          if (this.state._tag !== "Connected") {
            settle({
              success: false,
              error: {
                _tag: "NetworkError",
                message: "WebSocket connection error",
              },
            });
          }
        };

        ws.onclose = (event: CloseEvent) => {
          const wasConnecting = this.state._tag === "Connecting";
          const wasConnected = this.state._tag === "Connected";

          this.ws = null;
          this.requestManager.setWebSocket(null);
          this.setState({ _tag: "Disconnected" });

          if (this.manualDisconnect) {
            this.manualDisconnect = false;
            settle({ success: true, data: null });
            return;
          }

          if (wasConnecting) {
            settle({
              success: false,
              error: {
                _tag:
                  event.code === 4001 || event.code === 4003 ? "RateLimitError" : "NetworkError",
                message: event.reason || `Connection closed with code ${event.code}`,
                ...(event.code ? { code: event.code.toString() } : {}),
              },
            });
            return;
          }

          if (wasConnected) {
            if (isCloseErrorRecoverable(event.code)) {
              this.handleReconnection();
            } else if (event.code === 4001 || event.code === 4003) {
              this.setState({
                _tag: "Error",
                error: {
                  _tag: "RateLimitError",
                  message: event.reason || `Connection closed with code ${event.code}`,
                  code: event.code.toString(),
                },
              });
            } else {
              this.handleReconnection();
            }
          }
        };
      } catch (error) {
        settle({
          success: false,
          error: {
            _tag: "NetworkError",
            message: error instanceof Error ? error.message : "Connection failed",
          },
        });
      }
    });

    return this.pendingConnect;
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
      this.subscriptionManager.subscribe(
        requestId,
        localSubscriptionId,
        subscription,
        callback,
        resolve,
      );
    });
  }

  unsubscribe(subscriptionId: string): Promise<ApiResult<boolean>> {
    const callbacks = this.subscriptionManager.getCallbacks(subscriptionId);
    if (!callbacks) {
      return Promise.resolve({
        success: false,
        error: {
          _tag: "NotFoundError",
          message: "Subscription not found",
        },
      });
    }

    const serverSubscriptionId =
      this.subscriptionManager.getServerSubscriptionIdByLocalId(subscriptionId);
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
      this.subscriptionManager.unsubscribe(requestId, subscriptionId, resolve);

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
      this.manualDisconnect = true;
      this.ws.close();
      this.ws = null;
      this.requestManager.setWebSocket(null);
    }

    this.subscriptionManager.clear();
    this.setState({ _tag: "Disconnected" });
  }

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

        this.subscriptionManager.setChainId(requestId, {
          resolve: (result: ApiResult<string>) => {
            clearTimeout(timeoutId);
            resolve(result);
          },
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
    this.requestManager.sendRequest(request);
  }

  private restoreSubscriptions(): void {
    const tracked = this.subscriptionManager.tracked;

    for (const [localId, subscription] of tracked) {
      const requestId = this.nextRequestId();

      const request: JsonRpcRequest = {
        jsonrpc: "2.0",
        id: requestId,
        method: "eth_subscribe",
        params: [subscription.subscription.type, subscription.subscription.filter],
      };

      this.subscriptionManager.subscribe(
        requestId,
        localId,
        subscription.subscription,
        () => {},
        () => {},
        { isRestoration: true },
      );

      this.sendRequest(request);
    }
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
