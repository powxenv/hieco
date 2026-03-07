import type { EntityId } from "@hieco/utils";
import { TopicMessageQuery } from "@hiero-ledger/sdk";
import type { TransactionDescriptor } from "../../foundation/params.ts";
import type {
  MessageReceipt,
  TopicInfoData,
  TopicMessagesData,
  TopicReceipt,
  TransactionReceiptData,
} from "../../foundation/results-shapes.ts";
import type { Result } from "../../foundation/results.ts";
import { ok } from "../../foundation/results.ts";
import { ensureTopicId, ensureTopicSequence } from "../transactions/api.ts";
import { err } from "../../foundation/results.ts";
import { createError } from "../../foundation/errors.ts";
import type {
  CreateTopicParams,
  DeleteTopicParams,
  BatchSubmitMessagesParams,
  SubmitMessageParams,
  SubmitJsonMessageParams,
  TopicMessageData,
  UpdateTopicParams,
  WatchTopicMessagesOptions,
  WatchTopicMessagesFromOptions,
} from "../../foundation/params.ts";
import type { HcsNamespace, TopicWatchHandle } from "./namespace.ts";

export function createHcsNamespace(context: {
  readonly submit: (descriptor: TransactionDescriptor) => Promise<Result<TransactionReceiptData>>;
  readonly nativeClient: import("@hiero-ledger/sdk").Client;
  readonly mirror: import("@hieco/mirror").MirrorNodeClient;
}): HcsNamespace {
  const create = async (params: CreateTopicParams): Promise<Result<TopicReceipt>> => {
    const result = await context.submit({ kind: "hcs.create", params });
    if (!result.ok) return result;
    const topicId = ensureTopicId(result);
    if (!topicId.ok) return topicId;
    return ok({
      receipt: result.value,
      transactionId: result.value.transactionId,
      topicId: topicId.value,
    });
  };

  create.tx = (params: CreateTopicParams): TransactionDescriptor => ({
    kind: "hcs.create",
    params,
  });

  const update = async (params: UpdateTopicParams): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "hcs.update", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  update.tx = (params: UpdateTopicParams): TransactionDescriptor => ({
    kind: "hcs.update",
    params,
  });

  const deleteTopic = async (
    params: DeleteTopicParams,
  ): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "hcs.delete", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  deleteTopic.tx = (params: DeleteTopicParams): TransactionDescriptor => ({
    kind: "hcs.delete",
    params,
  });

  const submit = async (params: SubmitMessageParams): Promise<Result<MessageReceipt>> => {
    const result = await context.submit({ kind: "hcs.submit", params });
    if (!result.ok) return result;
    const sequence = ensureTopicSequence(result);
    if (!sequence.ok) return sequence;
    return ok({
      receipt: result.value,
      transactionId: result.value.transactionId,
      topicSequenceNumber: sequence.value,
    });
  };

  submit.tx = (params: SubmitMessageParams): TransactionDescriptor => ({
    kind: "hcs.submit",
    params,
  });

  const watch = (
    topicId: EntityId,
    handler: (message: TopicMessageData) => void,
    options: WatchTopicMessagesOptions = {},
  ): TopicWatchHandle => {
    const query = new TopicMessageQuery().setTopicId(topicId);
    if (options.startTime !== undefined) query.setStartTime(options.startTime);
    if (options.endTime !== undefined) query.setEndTime(options.endTime);
    if (options.limit !== undefined) query.setLimit(options.limit);

    const errorHandler = options.onError
      ? (message: import("@hiero-ledger/sdk").TopicMessage | null, error: Error) => {
          void message;
          options.onError?.(error);
        }
      : null;

    const handle = query.subscribe(context.nativeClient, errorHandler, (message) => {
      if (!message) return;
      const data: TopicMessageData = {
        consensusTimestamp: message.consensusTimestamp.toString(),
        contents: message.contents,
        runningHash: message.runningHash,
        sequenceNumber: message.sequenceNumber.toNumber(),
        topicId,
        json: () => {
          const text = new TextDecoder().decode(message.contents);
          try {
            return JSON.parse(text);
          } catch {
            return text;
          }
        },
        text: () => new TextDecoder().decode(message.contents),
      };
      handler(data);
    });

    const stop = () => handle.unsubscribe();
    const callable: TopicWatchHandle = Object.assign(() => stop(), { stop });
    Object.defineProperty(callable, "stop", {
      value: stop,
      enumerable: true,
      configurable: false,
      writable: false,
    });
    return callable;
  };

  const isRecord = (value: unknown): value is Record<string, unknown> => {
    if (typeof value !== "object" || value === null) return false;
    if (Array.isArray(value)) return false;
    return Object.prototype.toString.call(value) === "[object Object]";
  };

  const normalizeMessage = (
    value: unknown,
  ): Result<string | Record<string, unknown> | Uint8Array> => {
    if (typeof value === "string") return ok(value);
    if (value instanceof Uint8Array) return ok(value);
    if (isRecord(value)) return ok(value);
    return err(
      createError("UNEXPECTED_ERROR", "Unsupported message payload", {
        hint: "Provide string, Uint8Array, or plain object",
      }),
    );
  };

  const decodeBase64 = (value: string): Uint8Array => {
    if (typeof atob === "function") {
      const bytes = atob(value);
      const result = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i += 1) {
        result[i] = bytes.charCodeAt(i);
      }
      return result;
    }
    if (typeof Buffer !== "undefined") {
      return Uint8Array.from(Buffer.from(value, "base64"));
    }
    return new Uint8Array();
  };

  const decodeMessage = (message: import("@hieco/mirror").TopicMessage): TopicMessageData => {
    const contents = message.message ? decodeBase64(message.message) : new Uint8Array();
    const runningHash = message.running_hash
      ? decodeBase64(message.running_hash)
      : new Uint8Array();
    return {
      consensusTimestamp: message.consensus_timestamp,
      contents,
      runningHash,
      sequenceNumber: message.sequence_number,
      topicId: message.topic_id,
      json: () => {
        const text = new TextDecoder().decode(contents);
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      },
      text: () => new TextDecoder().decode(contents),
    };
  };

  const watchFrom = (
    topicId: EntityId,
    handler: (message: TopicMessageData) => void,
    options: WatchTopicMessagesFromOptions = {},
  ): TopicWatchHandle => {
    let active = true;
    let cursorSequence = options.sinceSequence;
    let cursorTimestamp = options.sinceTimestamp;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const scheduleNextPoll = () => {
      if (!active || options.resume === false) {
        return;
      }

      timeoutId = setTimeout(() => {
        void poll();
      }, 500);
    };

    const poll = async (): Promise<void> => {
      if (!active) return;
      const params: import("@hieco/mirror").TopicMessagesParams = {
        ...(options.limit ? { limit: options.limit } : {}),
        ...(cursorSequence !== undefined ? { sequencenumber: cursorSequence } : {}),
        ...(cursorTimestamp !== undefined ? { timestamp: cursorTimestamp } : {}),
        order: "asc",
      };
      const result = await context.mirror.topic.getMessages(topicId, params);
      if (!result.success) {
        options.onError?.(new Error(result.error.message));
        scheduleNextPoll();
        return;
      }
      for (const message of result.data) {
        handler(decodeMessage(message));
        cursorSequence = message.sequence_number + 1;
        cursorTimestamp = message.consensus_timestamp;
      }
      scheduleNextPoll();
    };

    void poll();

    const stop = () => {
      active = false;
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    };
    const callable: TopicWatchHandle = Object.assign(() => stop(), { stop });
    Object.defineProperty(callable, "stop", {
      value: stop,
      enumerable: true,
      configurable: false,
      writable: false,
    });
    return callable;
  };

  const submitJson = async (params: SubmitJsonMessageParams): Promise<Result<MessageReceipt>> => {
    const normalized = normalizeMessage(params.data);
    if (!normalized.ok) return normalized;
    return submit({
      topicId: params.topicId,
      message: normalized.value,
      ...(params.maxChunks !== undefined ? { maxChunks: params.maxChunks } : {}),
      ...(params.chunkSize !== undefined ? { chunkSize: params.chunkSize } : {}),
      ...(params.memo ? { memo: params.memo } : {}),
      ...(params.maxFee !== undefined ? { maxFee: params.maxFee } : {}),
    });
  };

  const batchSubmit = async (
    params: BatchSubmitMessagesParams,
  ): Promise<Result<ReadonlyArray<MessageReceipt>>> => {
    const concurrency = Math.max(1, params.concurrency ?? 1);
    const receipts: MessageReceipt[] = new Array(params.messages.length);
    let index = 0;

    const submitNext = async (): Promise<Result<void>> => {
      const currentIndex = index;
      if (currentIndex >= params.messages.length) return ok(undefined);
      const current = params.messages[currentIndex];
      index += 1;
      if (!current) return submitNext();
      const normalized = normalizeMessage(current);
      if (!normalized.ok) return normalized;
      const receipt = await submit({
        topicId: params.topicId,
        message: normalized.value,
        ...(params.maxChunks !== undefined ? { maxChunks: params.maxChunks } : {}),
        ...(params.chunkSize !== undefined ? { chunkSize: params.chunkSize } : {}),
        ...(params.memo ? { memo: params.memo } : {}),
        ...(params.maxFee !== undefined ? { maxFee: params.maxFee } : {}),
      });
      if (!receipt.ok) return receipt;
      receipts[currentIndex] = receipt.value;
      return submitNext();
    };

    const workers: Promise<Result<void>>[] = [];
    for (let i = 0; i < concurrency; i += 1) {
      workers.push(submitNext());
    }

    const results = await Promise.all(workers);
    const failure = results.find((r) => !r.ok);
    if (failure && !failure.ok) return failure;
    const compact: MessageReceipt[] = [];
    for (const receipt of receipts) {
      if (receipt) compact.push(receipt);
    }
    return ok(compact);
  };

  const info = async (topicId: EntityId): Promise<Result<TopicInfoData>> => {
    const result = await context.mirror.topic.getInfo(topicId);
    if (!result.success) {
      return err(
        createError("MIRROR_QUERY_FAILED", `Mirror topic.getInfo failed: ${result.error.message}`, {
          hint: "Verify mirror node connectivity",
          details: {
            status: result.error.status ?? "unknown",
            code: result.error.code ?? "unknown",
          },
        }),
      );
    }
    return ok({ topicId, topic: result.data });
  };

  const messages = async (
    topicId: EntityId,
    params?: import("@hieco/mirror").TopicMessagesParams,
  ): Promise<Result<TopicMessagesData>> => {
    const result = await context.mirror.topic.getMessages(topicId, params);
    if (!result.success) {
      return err(
        createError(
          "MIRROR_QUERY_FAILED",
          `Mirror topic.getMessages failed: ${result.error.message}`,
          {
            hint: "Verify mirror node connectivity",
            details: {
              status: result.error.status ?? "unknown",
              code: result.error.code ?? "unknown",
            },
          },
        ),
      );
    }
    return ok({ topicId, messages: result.data });
  };

  return {
    create,
    update,
    delete: deleteTopic,
    submit,
    watch,
    watchFrom,
    submitJson,
    batchSubmit,
    info,
    messages,
  };
}
