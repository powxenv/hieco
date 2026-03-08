import { describe, expect, test } from "bun:test";
import { RequestManager } from "../src/connection/requests";
import type { StreamState } from "../src/connection/stream";
import { SubscriptionManager } from "../src/subscriptions/manager";
import type { RelayMessage, RelaySubscription } from "../src/subscriptions/subscription";

function createRequestManager() {
  const states: StreamState[] = [];
  const subscriptionManager = new SubscriptionManager();
  const requestManager = new RequestManager(null, subscriptionManager, (state) => {
    states.push(state);
  });

  return {
    requestManager,
    states,
    subscriptionManager,
  };
}

describe("RequestManager", () => {
  test("sets a validation error for malformed JSON", () => {
    const { requestManager, states } = createRequestManager();

    requestManager.handleMessage("{");

    expect(states.at(-1)).toEqual({
      _tag: "Error",
      error: {
        _tag: "ValidationError",
        message: "Failed to parse WebSocket message as JSON",
      },
    });
  });

  test("sets a validation error for malformed error payloads", () => {
    const { requestManager, states, subscriptionManager } = createRequestManager();
    let handledError = 0;
    const originalHandleError = subscriptionManager.handleError.bind(subscriptionManager);

    subscriptionManager.handleError = (requestId, error) => {
      handledError += 1;
      originalHandleError(requestId, error);
    };

    subscriptionManager.setChainId(1, {
      resolve: () => undefined,
    });

    requestManager.handleMessage(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        error: { code: "bad", message: 123 },
      }),
    );

    expect(handledError).toBe(0);
    expect(states.at(-1)).toEqual({
      _tag: "Error",
      error: {
        _tag: "ValidationError",
        message: "Invalid JSON-RPC error payload",
      },
    });
  });

  test("resolves subscribe responses and dispatches validated notifications", () => {
    const { requestManager, subscriptionManager, states } = createRequestManager();
    const messages: RelayMessage[] = [];
    const subscription: RelaySubscription = {
      type: "logs",
      filter: {
        address: "0x1234",
      },
    };
    let subscribeResult:
      | {
          readonly success: true;
          readonly data: string;
        }
      | {
          readonly success: false;
        }
      | undefined;

    subscriptionManager.subscribe(
      1,
      "local-subscription",
      subscription,
      (message) => {
        messages.push(message);
      },
      (result) => {
        subscribeResult = result.success
          ? result
          : {
              success: false,
            };
      },
    );

    requestManager.handleMessage(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        result: "server-subscription",
      }),
    );

    expect(subscribeResult).toEqual({
      success: true,
      data: "local-subscription",
    });
    expect(subscriptionManager.getLocalSubscriptionId("server-subscription")).toBe(
      "local-subscription",
    );

    requestManager.handleMessage(
      JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_subscription",
        params: {
          subscription: "server-subscription",
          result: {
            address: "0x1234",
            blockHash: "0xaaa",
            blockNumber: "0x1",
            data: "0x",
            logIndex: "0x0",
            topics: ["0xabc"],
            transactionHash: "0xbbb",
            transactionIndex: "0x0",
          },
        },
      }),
    );

    expect(messages).toHaveLength(1);
    expect(states).toHaveLength(0);
  });

  test("resolves unsubscribe responses and clears tracked state", () => {
    const { requestManager, subscriptionManager } = createRequestManager();
    let unsubscribeResult:
      | {
          readonly success: true;
          readonly data: boolean;
        }
      | {
          readonly success: false;
        }
      | undefined;

    subscriptionManager.setCallbacks(
      "local-subscription",
      new Set([(message: RelayMessage) => message]),
    );
    subscriptionManager.setServerSubscription("server-subscription", "local-subscription");
    subscriptionManager.unsubscribe(2, "local-subscription", (result) => {
      unsubscribeResult = result.success
        ? result
        : {
            success: false,
          };
    });

    requestManager.handleMessage(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        result: true,
      }),
    );

    expect(unsubscribeResult).toEqual({
      success: true,
      data: true,
    });
    expect(subscriptionManager.getCallbacks("local-subscription")).toBeUndefined();
    expect(subscriptionManager.getLocalSubscriptionId("server-subscription")).toBeNull();
  });

  test("resolves chain ID responses", () => {
    const { requestManager, subscriptionManager } = createRequestManager();
    let chainIdResult:
      | {
          readonly success: true;
          readonly data: string;
        }
      | {
          readonly success: false;
        }
      | undefined;

    subscriptionManager.setChainId(3, {
      resolve: (result) => {
        chainIdResult = result.success
          ? result
          : {
              success: false,
            };
      },
    });

    requestManager.handleMessage(
      JSON.stringify({
        jsonrpc: "2.0",
        id: 3,
        result: "0x128",
      }),
    );

    expect(chainIdResult).toEqual({
      success: true,
      data: "0x128",
    });
  });

  test("sets a validation error for malformed subscription payloads", () => {
    const { requestManager, states } = createRequestManager();

    requestManager.handleMessage(
      JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_subscription",
        params: {
          subscription: "server-subscription",
          result: {
            address: 1,
          },
        },
      }),
    );

    expect(states.at(-1)).toEqual({
      _tag: "Error",
      error: {
        _tag: "ValidationError",
        message: "Invalid relay subscription message",
      },
    });
  });
});
