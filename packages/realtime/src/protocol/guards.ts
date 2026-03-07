import type {
  JsonRpcResponse,
  SubscribeResponse,
  UnsubscribeResponse,
  ChainIdResponse,
} from "./rpc";
import type { LogResult, NewHeadsResult, RelayMessage } from "../subscriptions/subscription";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isLogResult(value: unknown): value is LogResult {
  if (!isRecord(value)) return false;

  return (
    typeof value.address === "string" &&
    typeof value.blockHash === "string" &&
    typeof value.blockNumber === "string" &&
    typeof value.data === "string" &&
    typeof value.logIndex === "string" &&
    isStringArray(value.topics) &&
    typeof value.transactionHash === "string" &&
    typeof value.transactionIndex === "string"
  );
}

function isNewHeadsResult(value: unknown): value is NewHeadsResult {
  if (!isRecord(value)) return false;

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

export function isResponseWithId(
  response: JsonRpcResponse,
): response is JsonRpcResponse & { id: number } {
  return typeof response.id === "number";
}

export function isJsonRpcResponse(value: unknown): value is JsonRpcResponse {
  if (!isRecord(value)) return false;
  const v = value;
  return v.jsonrpc === "2.0";
}

export function isSubscribeResponse(value: unknown): value is SubscribeResponse {
  if (!isRecord(value)) return false;
  const v = value;
  return v.jsonrpc === "2.0" && typeof v.id === "number" && typeof v.result === "string";
}

export function isUnsubscribeResponse(value: unknown): value is UnsubscribeResponse {
  if (!isRecord(value)) return false;
  const v = value;
  return v.jsonrpc === "2.0" && typeof v.id === "number" && typeof v.result === "boolean";
}

export function isChainIdResponse(value: unknown): value is ChainIdResponse {
  if (!isRecord(value)) return false;
  const v = value;
  return (
    v.jsonrpc === "2.0" &&
    typeof v.id === "number" &&
    typeof v.result === "string" &&
    (v.result === "0x127" ||
      v.result === "0x128" ||
      v.result === "0x129" ||
      v.result.startsWith("0x"))
  );
}

export function isRelayMessage(value: unknown): value is RelayMessage {
  if (!isRecord(value)) return false;

  return (
    typeof value.subscription === "string" &&
    (isLogResult(value.result) || isNewHeadsResult(value.result))
  );
}
