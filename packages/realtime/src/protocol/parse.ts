import type { ChainIdResponse, SubscribeResponse, UnsubscribeResponse } from "./rpc";
import type { RelayMessage } from "../subscriptions/subscription";

type PendingRequestLookup = {
  readonly hasPendingSubscribe: (requestId: number) => boolean;
  readonly hasPendingUnsubscribe: (requestId: number) => boolean;
  readonly hasPendingChainId: (requestId: number) => boolean;
};

type ValidatedError = {
  readonly code: number;
  readonly message: string;
};

export type ParsedIncomingMessage =
  | {
      readonly kind: "subscription";
      readonly message: RelayMessage;
    }
  | {
      readonly kind: "subscribe-response";
      readonly response: SubscribeResponse;
    }
  | {
      readonly kind: "unsubscribe-response";
      readonly response: UnsubscribeResponse;
    }
  | {
      readonly kind: "chain-id-response";
      readonly response: ChainIdResponse;
    }
  | {
      readonly kind: "error-response";
      readonly requestId: number;
      readonly error: ValidatedError;
    }
  | {
      readonly kind: "ignored";
    }
  | {
      readonly kind: "invalid";
      readonly message: string;
    };

export function parseIncomingMessage(
  value: unknown,
  pendingRequests: PendingRequestLookup,
): ParsedIncomingMessage {
  if (!isRecord(value) || value.jsonrpc !== "2.0") {
    return { kind: "invalid", message: "Invalid JSON-RPC response format" };
  }

  if ("method" in value) {
    return parseSubscriptionMessage(value);
  }

  if (typeof value.id !== "number") {
    return { kind: "invalid", message: "Invalid JSON-RPC response format" };
  }

  return parseRequestResponse(
    {
      ...value,
      id: value.id,
    },
    pendingRequests,
  );
}

function parseSubscriptionMessage(value: Record<string, unknown>): ParsedIncomingMessage {
  if (value.method !== "eth_subscription") {
    return { kind: "invalid", message: "Invalid JSON-RPC response format" };
  }

  if (!isRelayMessage(value.params)) {
    return { kind: "invalid", message: "Invalid relay subscription message" };
  }

  return {
    kind: "subscription",
    message: value.params,
  };
}

function parseRequestResponse(
  value: Record<string, unknown> & { readonly id: number },
  pendingRequests: PendingRequestLookup,
): ParsedIncomingMessage {
  const error = getValidatedError(value.error);
  if ("error" in value && value.error !== undefined && error === null) {
    return { kind: "invalid", message: "Invalid JSON-RPC error payload" };
  }

  if (pendingRequests.hasPendingSubscribe(value.id)) {
    if (typeof value.result === "string") {
      return {
        kind: "subscribe-response",
        response: {
          jsonrpc: "2.0",
          id: value.id,
          result: value.result,
        },
      };
    }

    if (error) {
      return {
        kind: "error-response",
        requestId: value.id,
        error,
      };
    }

    return { kind: "invalid", message: "Invalid subscribe response payload" };
  }

  if (pendingRequests.hasPendingUnsubscribe(value.id)) {
    if (typeof value.result === "boolean") {
      return {
        kind: "unsubscribe-response",
        response: {
          jsonrpc: "2.0",
          id: value.id,
          result: value.result,
        },
      };
    }

    if (error) {
      return {
        kind: "error-response",
        requestId: value.id,
        error,
      };
    }

    return { kind: "invalid", message: "Invalid unsubscribe response payload" };
  }

  if (pendingRequests.hasPendingChainId(value.id)) {
    if (typeof value.result === "string") {
      return {
        kind: "chain-id-response",
        response: {
          jsonrpc: "2.0",
          id: value.id,
          result: value.result,
        },
      };
    }

    if (error) {
      return {
        kind: "error-response",
        requestId: value.id,
        error,
      };
    }

    return { kind: "invalid", message: "Invalid chain ID response payload" };
  }

  if (error) {
    return {
      kind: "ignored",
    };
  }

  return {
    kind: "ignored",
  };
}

function getValidatedError(value: unknown): ValidatedError | null {
  if (!isRecord(value)) {
    return null;
  }

  if (typeof value.code !== "number" || typeof value.message !== "string") {
    return null;
  }

  return {
    code: value.code,
    message: value.message,
  };
}

function isRelayMessage(value: unknown): value is RelayMessage {
  if (!isRecord(value) || typeof value.subscription !== "string") {
    return false;
  }

  return isLogResult(value.result) || isNewHeadsResult(value.result);
}

function isLogResult(value: unknown): boolean {
  return (
    isRecord(value) &&
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
    isRecord(value) &&
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
