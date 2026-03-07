import type { JsonRpcRequest, JsonRpcResponse } from "../protocol/rpc";
import type { RelayMessage } from "../subscriptions/subscription";
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

      if (!isJsonRpcEnvelope(parsed)) {
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
        return;
      }

      if (typeof parsed.id === "number") {
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

  private handleRequestResponse(response: JsonRpcResponse): void {
    if (
      typeof response.id === "number" &&
      this.subscriptionManager.hasPendingSubscribe(response.id) &&
      typeof response.result === "string"
    ) {
      this.handleSubscribeResponse({
        ...response,
        id: response.id,
        result: response.result,
      });
      return;
    }

    if (
      typeof response.id === "number" &&
      this.subscriptionManager.hasPendingUnsubscribe(response.id) &&
      typeof response.result === "boolean"
    ) {
      this.handleUnsubscribeResponse({
        ...response,
        id: response.id,
        result: response.result,
      });
      return;
    }

    if (
      typeof response.id === "number" &&
      this.subscriptionManager.hasPendingChainId(response.id) &&
      typeof response.result === "string"
    ) {
      this.handleChainIdResponse({
        ...response,
        id: response.id,
        result: response.result,
      });
      return;
    }

    if (response.error && typeof response.id === "number") {
      this.subscriptionManager.handleError(response.id, response.error);
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

  setWebSocket(ws: WebSocket | null): void {
    this.ws = ws;
  }
}

function isJsonRpcEnvelope(value: unknown): value is JsonRpcResponse {
  return isObject(value) && value.jsonrpc === "2.0";
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLogResult(value: unknown): boolean {
  return (
    isObject(value) &&
    typeof value.address === "string" &&
    typeof value.blockHash === "string" &&
    typeof value.blockNumber === "string" &&
    typeof value.data === "string" &&
    typeof value.logIndex === "string" &&
    Array.isArray(value.topics) &&
    value.topics.every((topic) => typeof topic === "string") &&
    typeof value.transactionHash === "string" &&
    typeof value.transactionIndex === "string"
  );
}

function isNewHeadsResult(value: unknown): boolean {
  return (
    isObject(value) &&
    typeof value.hash === "string" &&
    typeof value.parentHash === "string" &&
    typeof value.sha3Uncles === "string" &&
    typeof value.logsBloom === "string" &&
    typeof value.transactionsRoot === "string" &&
    typeof value.stateRoot === "string" &&
    typeof value.receiptsRoot === "string" &&
    typeof value.number === "string" &&
    typeof value.gasLimit === "string" &&
    typeof value.gasUsed === "string" &&
    typeof value.timestamp === "string" &&
    typeof value.extraData === "string" &&
    typeof value.difficulty === "string" &&
    typeof value.miner === "string" &&
    typeof value.nonce === "string"
  );
}

function isRelayMessage(value: unknown): value is RelayMessage {
  return (
    isObject(value) &&
    typeof value.subscription === "string" &&
    (isLogResult(value.result) || isNewHeadsResult(value.result))
  );
}
