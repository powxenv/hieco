import { describe, expect, test } from "bun:test";
import { parseIncomingMessage } from "./parse";

function createPendingLookup(
  input: {
    readonly subscribe?: readonly number[];
    readonly unsubscribe?: readonly number[];
    readonly chainId?: readonly number[];
  } = {},
): Parameters<typeof parseIncomingMessage>[1] {
  const subscribe = new Set(input.subscribe ?? []);
  const unsubscribe = new Set(input.unsubscribe ?? []);
  const chainId = new Set(input.chainId ?? []);

  return {
    hasPendingSubscribe: (requestId) => subscribe.has(requestId),
    hasPendingUnsubscribe: (requestId) => unsubscribe.has(requestId),
    hasPendingChainId: (requestId) => chainId.has(requestId),
  };
}

const logResult = {
  address: "0x1234",
  blockHash: "0xblock",
  blockNumber: "0x1",
  data: "0xdeadbeef",
  logIndex: "0x0",
  topics: ["0xtopic"],
  transactionHash: "0xtx",
  transactionIndex: "0x0",
} as const;

describe("incoming relay message parser", () => {
  test("rejects invalid JSON-RPC envelopes", () => {
    expect(parseIncomingMessage({ jsonrpc: "1.0" }, createPendingLookup())).toEqual({
      kind: "invalid",
      message: "Invalid JSON-RPC response format",
    });
  });

  test("parses subscription payloads", () => {
    expect(
      parseIncomingMessage(
        {
          jsonrpc: "2.0",
          method: "eth_subscription",
          params: {
            subscription: "sub-1",
            result: logResult,
          },
        },
        createPendingLookup(),
      ),
    ).toEqual({
      kind: "subscription",
      message: {
        subscription: "sub-1",
        result: logResult,
      },
    });
  });

  test("parses subscribe responses for pending subscribe requests", () => {
    expect(
      parseIncomingMessage(
        {
          jsonrpc: "2.0",
          id: 1,
          result: "server-subscription-id",
        },
        createPendingLookup({ subscribe: [1] }),
      ),
    ).toEqual({
      kind: "subscribe-response",
      response: {
        jsonrpc: "2.0",
        id: 1,
        result: "server-subscription-id",
      },
    });
  });

  test("parses unsubscribe and chain id responses", () => {
    expect(
      parseIncomingMessage(
        {
          jsonrpc: "2.0",
          id: 2,
          result: true,
        },
        createPendingLookup({ unsubscribe: [2] }),
      ),
    ).toEqual({
      kind: "unsubscribe-response",
      response: {
        jsonrpc: "2.0",
        id: 2,
        result: true,
      },
    });

    expect(
      parseIncomingMessage(
        {
          jsonrpc: "2.0",
          id: 3,
          result: "0x128",
        },
        createPendingLookup({ chainId: [3] }),
      ),
    ).toEqual({
      kind: "chain-id-response",
      response: {
        jsonrpc: "2.0",
        id: 3,
        result: "0x128",
      },
    });
  });

  test("maps structured errors for pending requests", () => {
    expect(
      parseIncomingMessage(
        {
          jsonrpc: "2.0",
          id: 4,
          error: {
            code: -32602,
            message: "Invalid params",
          },
        },
        createPendingLookup({ subscribe: [4] }),
      ),
    ).toEqual({
      kind: "error-response",
      requestId: 4,
      error: {
        code: -32602,
        message: "Invalid params",
      },
    });
  });

  test("rejects malformed error payloads", () => {
    expect(
      parseIncomingMessage(
        {
          jsonrpc: "2.0",
          id: 5,
          error: {
            code: "bad-code",
            message: "Invalid params",
          },
        },
        createPendingLookup({ subscribe: [5] }),
      ),
    ).toEqual({
      kind: "invalid",
      message: "Invalid JSON-RPC error payload",
    });
  });

  test("ignores unrelated responses", () => {
    expect(
      parseIncomingMessage(
        {
          jsonrpc: "2.0",
          id: 6,
          result: "ignored",
        },
        createPendingLookup(),
      ),
    ).toEqual({ kind: "ignored" });
  });
});
