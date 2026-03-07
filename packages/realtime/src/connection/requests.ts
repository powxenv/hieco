import type { JsonRpcRequest, JsonRpcResponse } from "../protocol/rpc";
import type { RelayMessage } from "../subscriptions/subscription";
import {
  isJsonRpcResponse,
  isRelayMessage,
  isResponseWithId,
  isSubscribeResponse,
  isUnsubscribeResponse,
  isChainIdResponse,
} from "../protocol/guards";
import type { SubscriptionManager } from "../subscriptions/manager";
import type { StreamState } from "./stream";

export class RequestManager {
  constructor(
    private ws: WebSocket | null,
    private subscriptionManager: SubscriptionManager,
    private setState: (state: StreamState) => void,
  ) {}

  sendRequest(request: JsonRpcRequest): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }
    this.ws.send(JSON.stringify(request));
  }

  handleMessage(data: string): void {
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

      if (this.isSubscriptionMessage(parsed)) {
        this.handleSubscriptionMessage(parsed.params);
        return;
      }

      if (isResponseWithId(parsed)) {
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
    if (isSubscribeResponse(response)) {
      this.handleSubscribeResponse(response);
      return;
    }

    if (isUnsubscribeResponse(response)) {
      this.handleUnsubscribeResponse(response);
      return;
    }

    if (isChainIdResponse(response)) {
      this.handleChainIdResponse(response);
      return;
    }

    if (response.error) {
      this.subscriptionManager.handleError(response);
    }
  }

  private handleSubscriptionMessage(message: RelayMessage): void {
    const localSubscriptionId = this.subscriptionManager.getLocalSubscriptionId(
      message.subscription,
    );
    if (localSubscriptionId) {
      const callbacks = this.subscriptionManager.getCallbacks(localSubscriptionId);
      if (callbacks) {
        for (const callback of callbacks) {
          try {
            callback(message);
          } catch (error) {
            this.setState({
              _tag: "Error",
              error: {
                _tag: "UnknownError",
                message: error instanceof Error ? error.message : "Subscription callback failed",
              },
            });
          }
        }
      }
    }
  }

  private isSubscriptionMessage(response: JsonRpcResponse): response is JsonRpcResponse & {
    readonly method: "eth_subscription";
    readonly params: RelayMessage;
  } {
    return response.method === "eth_subscription" && isRelayMessage(response.params);
  }

  private handleSubscribeResponse(
    response: JsonRpcResponse & { id: number; result: string },
  ): void {
    const pending = this.subscriptionManager.handleSubscribeResponse(response);
    if (!pending) {
      return;
    }

    const callbacks = pending.isRestoration
      ? this.subscriptionManager.tracked.get(pending.localSubscriptionId)?.callbacks
      : new Set([pending.callback]);

    if (callbacks) {
      this.subscriptionManager.setCallbacks(pending.localSubscriptionId, callbacks);
    }

    this.subscriptionManager.setServerSubscription(pending.localSubscriptionId, response.result);

    if (!pending.isRestoration) {
      pending.resolve({ success: true, data: pending.localSubscriptionId });
    }
  }

  private handleUnsubscribeResponse(
    response: JsonRpcResponse & { id: number; result: boolean },
  ): void {
    const pending = this.subscriptionManager.handleUnsubscribeResponse(response);
    if (!pending) {
      return;
    }

    if (!response.result) {
      pending.resolve({
        success: false,
        error: {
          _tag: "UnknownError",
          message: "Unsubscribe failed",
        },
      });
      return;
    }

    this.subscriptionManager.deleteCallbacks(pending.localSubscriptionId);
    this.subscriptionManager.deleteTracked(pending.localSubscriptionId);

    const serverSubscriptionId = this.subscriptionManager.getServerSubscriptionIdByLocalId(
      pending.localSubscriptionId,
    );
    if (serverSubscriptionId) {
      this.subscriptionManager.deleteServerSubscription(serverSubscriptionId);
    }

    pending.resolve({ success: true, data: true });
  }

  private handleChainIdResponse(response: JsonRpcResponse & { id: number; result: string }): void {
    const pending = this.subscriptionManager.handleChainIdResponse(response);
    if (!pending) {
      return;
    }

    pending.resolve({ success: true, data: response.result });
  }

  setWebSocket(ws: WebSocket | null): void {
    this.ws = ws;
  }
}
