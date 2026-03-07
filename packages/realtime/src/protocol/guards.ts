import type {
  JsonRpcResponse,
  SubscribeResponse,
  UnsubscribeResponse,
  ChainIdResponse,
} from "./rpc";
import type { LogResult, NewHeadsResult, RelayMessage } from "../subscriptions/subscription";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLogResult(value: unknown): value is LogResult {
  if (!isObject(value) || !Array.isArray(value.topics)) return false;

  return (
    typeof value.address === "string" &&
    typeof value.blockHash === "string" &&
    typeof value.blockNumber === "string" &&
    typeof value.data === "string" &&
    typeof value.logIndex === "string" &&
    value.topics.every((topic) => typeof topic === "string") &&
    typeof value.transactionHash === "string" &&
    typeof value.transactionIndex === "string"
  );
}

function isNewHeadsResult(value: unknown): value is NewHeadsResult {
  if (!isObject(value)) return false;

  return (
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

export function isJsonRpcResponse(value: unknown): value is JsonRpcResponse {
  return isObject(value) && value.jsonrpc === "2.0";
}

export function isSubscribeResponse(value: unknown): value is SubscribeResponse {
  return (
    isObject(value) &&
    value.jsonrpc === "2.0" &&
    typeof value.id === "number" &&
    typeof value.result === "string"
  );
}

export function isUnsubscribeResponse(value: unknown): value is UnsubscribeResponse {
  return (
    isObject(value) &&
    value.jsonrpc === "2.0" &&
    typeof value.id === "number" &&
    typeof value.result === "boolean"
  );
}

export function isChainIdResponse(value: unknown): value is ChainIdResponse {
  return (
    isObject(value) &&
    value.jsonrpc === "2.0" &&
    typeof value.id === "number" &&
    typeof value.result === "string" &&
    value.result.startsWith("0x")
  );
}

export function isRelayMessage(value: unknown): value is RelayMessage {
  return (
    isObject(value) &&
    typeof value.subscription === "string" &&
    (isLogResult(value.result) || isNewHeadsResult(value.result))
  );
}
