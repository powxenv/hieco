import type { JsonRpcRequest, JsonRpcResponse } from "../protocol/rpc";
import type { RelayMessage } from "../subscriptions/subscription";
import type { SubscriptionManager } from "../subscriptions/manager";
import type { StreamState } from "./stream";
import { parseIncomingMessage } from "../protocol/parse";

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
      const parsed = parseIncomingMessage(JSON.parse(data), this.subscriptionManager);

      switch (parsed.kind) {
        case "subscription":
          this.handleSubscriptionMessage(parsed.message);
          return;
        case "subscribe-response":
          this.handleSubscribeResponse(parsed.response);
          return;
        case "unsubscribe-response":
          this.handleUnsubscribeResponse(parsed.response);
          return;
        case "chain-id-response":
          this.handleChainIdResponse(parsed.response);
          return;
        case "error-response":
          this.subscriptionManager.handleError(parsed.requestId, parsed.error);
          return;
        case "invalid":
          this.setValidationError(parsed.message);
          return;
        case "ignored":
          return;
      }
    } catch {
      this.setValidationError("Failed to parse WebSocket message as JSON");
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

  private handleSubscribeResponse(
    response: JsonRpcResponse & { id: number; result: string },
  ): void {
    const pending = this.subscriptionManager.handleSubscribeResponse(response.id);
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
    const pending = this.subscriptionManager.handleUnsubscribeResponse(response.id);
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
    const pending = this.subscriptionManager.handleChainIdResponse(response.id);
    if (!pending) {
      return;
    }

    pending.resolve({ success: true, data: response.result });
  }

  private setValidationError(message: string): void {
    this.setState({
      _tag: "Error",
      error: {
        _tag: "ValidationError",
        message,
      },
    });
  }

  setWebSocket(ws: WebSocket | null): void {
    this.ws = ws;
  }
}
