import type { ApiError, ApiResult } from "@hieco/utils";
import type { StreamConfig } from "./stream";
import type { JsonRpcRequest } from "../protocol/rpc";
import type { RelayMessage, RelaySubscription } from "../subscriptions/subscription";
import { BaseStreamClient } from "./base";
import { RequestManager } from "./requests";
import { SubscriptionManager } from "../subscriptions/manager";
import { createSubscriptionId } from "../subscriptions/ids";

type ConnectSettler = (result: ApiResult<null>) => void;

export class RelayWebSocketClient extends BaseStreamClient<
  RelayMessage,
  RelaySubscription,
  boolean
> {
  private ws: WebSocket | null = null;
  private requestId = 0;
  private readonly subscriptionManager = new SubscriptionManager();
  private readonly requestManager = new RequestManager(
    this.ws,
    this.subscriptionManager,
    this.setState.bind(this),
  );
  private pendingConnect: Promise<ApiResult<null>> | null = null;
  private manualDisconnect = false;

  constructor(config: StreamConfig) {
    super(config);
  }

  async connect(): Promise<ApiResult<null>> {
    if (this.state._tag === "Connected") {
      return this.createSuccessResult(null);
    }

    if (this.pendingConnect) {
      return this.pendingConnect;
    }

    this.setState({ _tag: "Connecting" });
    this.manualDisconnect = false;
    this.pendingConnect = this.openWebSocket();

    return this.pendingConnect;
  }

  subscribe(
    subscription: RelaySubscription,
    callback: (message: RelayMessage) => void,
  ): Promise<ApiResult<string>> {
    if (this.state._tag !== "Connected") {
      return Promise.resolve(this.createNetworkErrorResult("Not connected"));
    }

    return new Promise<ApiResult<string>>((resolve) => {
      const requestId = this.nextRequestId();
      const localSubscriptionId = createSubscriptionId(crypto.randomUUID());
      const request = this.createRequest("eth_subscribe", requestId, [
        subscription.type,
        subscription.filter,
      ]);

      try {
        this.sendRequest(request);
      } catch {
        resolve(this.createNetworkErrorResult("Failed to send subscribe request"));
        return;
      }

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
      return Promise.resolve(this.createNotFoundErrorResult("Subscription not found"));
    }

    const serverSubscriptionId =
      this.subscriptionManager.getServerSubscriptionIdByLocalId(subscriptionId);
    if (!serverSubscriptionId) {
      return Promise.resolve(this.createNotFoundErrorResult("Server subscription ID not found"));
    }

    return new Promise<ApiResult<boolean>>((resolve) => {
      const requestId = this.nextRequestId();
      const request = this.createRequest("eth_unsubscribe", requestId, [serverSubscriptionId]);

      try {
        this.sendRequest(request);
      } catch {
        resolve(this.createNetworkErrorResult("Failed to send unsubscribe request"));
        return;
      }

      this.subscriptionManager.unsubscribe(requestId, subscriptionId, resolve);
    });
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.manualDisconnect = true;
      this.ws.close();
      this.clearSocket();
    }

    this.subscriptionManager.clear();
    this.setState({ _tag: "Disconnected" });
  }

  async getChainId(): Promise<ApiResult<string>> {
    if (this.state._tag !== "Connected") {
      return this.createNetworkErrorResult("Not connected");
    }

    return new Promise<ApiResult<string>>((resolve) => {
      const requestId = this.nextRequestId();
      const request = this.createRequest("eth_chainId", requestId, []);

      try {
        this.sendRequest(request);
      } catch {
        resolve(this.createNetworkErrorResult("Failed to send chain ID request"));
        return;
      }

      const timeoutId = setTimeout(() => {
        resolve(this.createNetworkErrorResult("Chain ID request timed out"));
      }, 5000);

      this.subscriptionManager.setChainId(requestId, {
        resolve: (result: ApiResult<string>) => {
          clearTimeout(timeoutId);
          resolve(result);
        },
      });
    });
  }

  private openWebSocket(): Promise<ApiResult<null>> {
    return new Promise<ApiResult<null>>((resolve) => {
      const settle = this.createConnectSettler(resolve);

      try {
        const ws = new WebSocket(this.config.endpoint);
        this.attachWebSocket(ws, settle);
      } catch (error) {
        settle(
          this.createNetworkErrorResult(
            error instanceof Error ? error.message : "Connection failed",
          ),
        );
      }
    });
  }

  private createConnectSettler(resolve: ConnectSettler): ConnectSettler {
    let settled = false;

    return (result) => {
      if (settled) {
        return;
      }

      settled = true;
      this.pendingConnect = null;
      resolve(result);
    };
  }

  private attachWebSocket(ws: WebSocket, settle: ConnectSettler): void {
    this.ws = ws;
    this.requestManager.setWebSocket(ws);

    ws.onopen = () => {
      this.handleSocketOpen(settle);
    };

    ws.onmessage = (event: MessageEvent) => {
      if (typeof event.data === "string") {
        this.requestManager.handleMessage(event.data);
      }
    };

    ws.onerror = () => {
      this.handleSocketError(settle);
    };

    ws.onclose = (event: CloseEvent) => {
      this.handleSocketClose(event, settle);
    };
  }

  private handleSocketOpen(settle: ConnectSettler): void {
    this.setState({
      _tag: "Connected",
      connectionId: crypto.randomUUID(),
    });

    if (this.subscriptionManager.tracked.size > 0) {
      this.restoreSubscriptions();
    }

    settle(this.createSuccessResult(null));
  }

  private handleSocketError(settle: ConnectSettler): void {
    const wasConnected = this.state._tag === "Connected";
    const error = this.createNetworkError("WebSocket connection error");

    this.setState({ _tag: "Error", error });

    if (!wasConnected) {
      settle({ success: false, error });
    }
  }

  private handleSocketClose(event: CloseEvent, settle: ConnectSettler): void {
    const wasConnecting = this.state._tag === "Connecting";
    const wasConnected = this.state._tag === "Connected";

    this.clearSocket();
    this.setState({ _tag: "Disconnected" });

    if (this.consumeManualDisconnect()) {
      settle(this.createSuccessResult(null));
      return;
    }

    if (wasConnecting) {
      settle(this.createCloseFailureResult(event));
      return;
    }

    if (!wasConnected) {
      return;
    }

    if (event.code === 4001 || event.code === 4003) {
      this.setState({
        _tag: "Error",
        error: this.createRateLimitCloseError(event),
      });
      return;
    }

    this.handleReconnection();
  }

  private clearSocket(): void {
    this.ws = null;
    this.requestManager.setWebSocket(null);
  }

  private consumeManualDisconnect(): boolean {
    if (!this.manualDisconnect) {
      return false;
    }

    this.manualDisconnect = false;
    return true;
  }

  private createRequest(
    method: JsonRpcRequest["method"],
    id: number,
    params: JsonRpcRequest["params"],
  ): JsonRpcRequest {
    return {
      jsonrpc: "2.0",
      id,
      method,
      params,
    };
  }

  private sendRequest(request: JsonRpcRequest): void {
    this.requestManager.sendRequest(request);
  }

  private restoreSubscriptions(): void {
    for (const [localId, trackedSubscription] of this.subscriptionManager.tracked) {
      const requestId = this.nextRequestId();
      const request = this.createRequest("eth_subscribe", requestId, [
        trackedSubscription.subscription.type,
        trackedSubscription.subscription.filter,
      ]);

      this.subscriptionManager.subscribe(
        requestId,
        localId,
        trackedSubscription.subscription,
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
          error: this.createNetworkError("Max reconnection attempts reached"),
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

    void reconnect();
  }

  private createSuccessResult<T>(data: T): ApiResult<T> {
    return { success: true, data };
  }

  private createNetworkError(message: string, code?: string): ApiError {
    return {
      _tag: "NetworkError",
      message,
      ...(code ? { code } : {}),
    };
  }

  private createRateLimitCloseError(event: CloseEvent): ApiError {
    return {
      _tag: "RateLimitError",
      message: event.reason || `Connection closed with code ${event.code}`,
      code: event.code.toString(),
    };
  }

  private createCloseFailureResult(event: CloseEvent): ApiResult<null> {
    if (event.code === 4001 || event.code === 4003) {
      return {
        success: false,
        error: this.createRateLimitCloseError(event),
      };
    }

    return {
      success: false,
      error: this.createNetworkError(
        event.reason || `Connection closed with code ${event.code}`,
        event.code ? event.code.toString() : undefined,
      ),
    };
  }

  private createNetworkErrorResult<T>(message: string, code?: string): ApiResult<T> {
    return {
      success: false,
      error: this.createNetworkError(message, code),
    };
  }

  private createNotFoundErrorResult<T>(message: string): ApiResult<T> {
    return {
      success: false,
      error: {
        _tag: "NotFoundError",
        message,
      },
    };
  }

  private nextRequestId(): number {
    this.requestId += 1;
    return this.requestId;
  }
}
