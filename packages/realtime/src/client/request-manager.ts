import type { JsonRpcRequest, JsonRpcResponse } from "../types/json-rpc";
import type { RelayMessage } from "../types/subscription";
import {
  isJsonRpcResponse,
  isRelayMessage,
  isResponseWithId,
  isSubscribeResponse,
  isUnsubscribeResponse,
  isChainIdResponse,
} from "../utils/type-guards";
import type { SubscriptionManager } from "./subscription-manager";
import type { StreamState } from "../types/stream";

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

      if (parsed.method === "eth_subscription" && isRelayMessage(parsed.params)) {
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
    if (isSubscribeResponse(response)) {
      const pending = this.subscriptionManager.handleSubscribeResponse(response);
      if (pending) {
        const localSubscriptionId = pending.localSubscriptionId;

        if (pending.isRestoration) {
          const tracked = this.subscriptionManager.tracked.get(localSubscriptionId);
          if (tracked) {
            this.subscriptionManager.setCallbacks(localSubscriptionId, tracked.callbacks);
          }
        } else {
          this.subscriptionManager.setCallbacks(localSubscriptionId, new Set([pending.callback]));
        }

        this.subscriptionManager.setServerSubscription(localSubscriptionId, response.result);

        if (!pending.isRestoration) {
          pending.resolve({ success: true, data: localSubscriptionId });
        }
      }
    } else if (isUnsubscribeResponse(response)) {
      const pending = this.subscriptionManager.handleUnsubscribeResponse(response);
      if (pending) {
        if (response.result) {
          this.subscriptionManager.deleteCallbacks(pending.localSubscriptionId);
          this.subscriptionManager.deleteTracked(pending.localSubscriptionId);
          const serverSubscriptionId = this.subscriptionManager.getServerSubscriptionIdByLocalId(
            pending.localSubscriptionId,
          );
          if (serverSubscriptionId) {
            this.subscriptionManager.deleteServerSubscription(serverSubscriptionId);
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
      const pending = this.subscriptionManager.handleChainIdResponse(response);
      if (pending) {
        pending.resolve({ success: true, data: response.result });
      }
    } else if (response.error) {
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

  setWebSocket(ws: WebSocket | null): void {
    this.ws = ws;
  }
}
