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
import { err, ok } from "../../foundation/results.ts";
import { ensureTopicId, ensureTopicSequence } from "../transactions/api.ts";
import { createError } from "../../foundation/errors.ts";
import type {
  BatchSubmitMessagesParams,
  CreateTopicParams,
  DeleteTopicParams,
  SubmitJsonMessageParams,
  SubmitMessageParams,
  TopicMessageData,
  UpdateTopicParams,
  WatchTopicMessagesFromOptions,
  WatchTopicMessagesOptions,
} from "../../foundation/params.ts";
import type { HcsNamespace, TopicWatchHandle } from "./namespace.ts";

interface MirrorFailureShape {
  readonly message: string;
  readonly status?: string | number;
  readonly code?: string | number;
}

interface TopicMessageShape {
  readonly consensusTimestamp: string;
  readonly contents: Uint8Array;
  readonly runningHash: Uint8Array;
  readonly sequenceNumber: number;
  readonly topicId: string;
}

interface SubmitMessageOptions {
  readonly maxChunks: number | undefined;
  readonly chunkSize: number | undefined;
  readonly memo: string | undefined;
  readonly maxFee: SubmitMessageParams["maxFee"] | undefined;
}

type SupportedTopicMessage = string | Uint8Array | Record<string, unknown>;

const topicMessageDecoder = new TextDecoder();

function readTopicMessageText(contents: Uint8Array): string {
  return topicMessageDecoder.decode(contents);
}

function readTopicMessageJson(contents: Uint8Array): unknown {
  const text = readTopicMessageText(contents);

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function createTopicMessageData(fields: TopicMessageShape): TopicMessageData {
  return {
    consensusTimestamp: fields.consensusTimestamp,
    contents: fields.contents,
    runningHash: fields.runningHash,
    sequenceNumber: fields.sequenceNumber,
    topicId: fields.topicId,
    json: () => readTopicMessageJson(fields.contents),
    text: () => readTopicMessageText(fields.contents),
  };
}

function createTopicWatchHandle(stop: () => void): TopicWatchHandle {
  return Object.assign(
    (): void => {
      stop();
    },
    { stop },
  );
}

function applyTopicWatchOptions(
  query: TopicMessageQuery,
  options: WatchTopicMessagesOptions,
): TopicMessageQuery {
  if (options.startTime !== undefined) {
    query.setStartTime(options.startTime);
  }

  if (options.endTime !== undefined) {
    query.setEndTime(options.endTime);
  }

  if (options.limit !== undefined) {
    query.setLimit(options.limit);
  }

  return query;
}

function createTopicWatchErrorHandler(
  onError: WatchTopicMessagesOptions["onError"],
): ((message: import("@hiero-ledger/sdk").TopicMessage | null, error: Error) => void) | null {
  if (!onError) {
    return null;
  }

  return (_message, error) => {
    onError(error);
  };
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (Array.isArray(value)) {
    return false;
  }

  return Object.prototype.toString.call(value) === "[object Object]";
}

function normalizeMessage(value: unknown): Result<SupportedTopicMessage> {
  if (typeof value === "string") {
    return ok(value);
  }

  if (value instanceof Uint8Array) {
    return ok(value);
  }

  if (isPlainRecord(value)) {
    return ok(value);
  }

  return err(
    createError("UNEXPECTED_ERROR", "Unsupported message payload", {
      hint: "Provide string, Uint8Array, or plain object",
    }),
  );
}

function decodeBase64(value: string): Uint8Array {
  if (typeof atob === "function") {
    const bytes = atob(value);
    const result = new Uint8Array(bytes.length);

    for (let index = 0; index < bytes.length; index += 1) {
      result[index] = bytes.charCodeAt(index);
    }

    return result;
  }

  if (typeof Buffer !== "undefined") {
    return Uint8Array.from(Buffer.from(value, "base64"));
  }

  return new Uint8Array();
}

function createMirrorTopicMessage(message: import("@hieco/mirror").TopicMessage): TopicMessageData {
  const contents = message.message ? decodeBase64(message.message) : new Uint8Array();
  const runningHash = message.running_hash ? decodeBase64(message.running_hash) : new Uint8Array();

  return createTopicMessageData({
    consensusTimestamp: message.consensus_timestamp,
    contents,
    runningHash,
    sequenceNumber: message.sequence_number,
    topicId: message.topic_id,
  });
}

function createSubmitMessageParams(
  topicId: EntityId,
  message: SupportedTopicMessage,
  options: SubmitMessageOptions,
): SubmitMessageParams {
  return {
    topicId,
    message,
    ...(options.maxChunks !== undefined ? { maxChunks: options.maxChunks } : {}),
    ...(options.chunkSize !== undefined ? { chunkSize: options.chunkSize } : {}),
    ...(options.memo ? { memo: options.memo } : {}),
    ...(options.maxFee !== undefined ? { maxFee: options.maxFee } : {}),
  };
}

function createMirrorQueryFailure<T>(operation: string, error: MirrorFailureShape): Result<T> {
  return err(
    createError("MIRROR_QUERY_FAILED", `Mirror ${operation} failed: ${error.message}`, {
      hint: "Verify mirror node connectivity",
      details: {
        status: error.status ?? "unknown",
        code: error.code ?? "unknown",
      },
    }),
  );
}

export function createHcsNamespace(context: {
  readonly submit: (descriptor: TransactionDescriptor) => Promise<Result<TransactionReceiptData>>;
  readonly nativeClient: import("@hiero-ledger/sdk").Client;
  readonly mirror: import("@hieco/mirror").MirrorNodeClient;
}): HcsNamespace {
  const create = async (params: CreateTopicParams): Promise<Result<TopicReceipt>> => {
    const result = await context.submit({ kind: "hcs.create", params });
    if (!result.ok) {
      return result;
    }

    const topicId = ensureTopicId(result);
    if (!topicId.ok) {
      return topicId;
    }

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
    if (!result.ok) {
      return result;
    }

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
    if (!result.ok) {
      return result;
    }

    return ok(result.value);
  };

  deleteTopic.tx = (params: DeleteTopicParams): TransactionDescriptor => ({
    kind: "hcs.delete",
    params,
  });

  const submit = async (params: SubmitMessageParams): Promise<Result<MessageReceipt>> => {
    const result = await context.submit({ kind: "hcs.submit", params });
    if (!result.ok) {
      return result;
    }

    const sequence = ensureTopicSequence(result);
    if (!sequence.ok) {
      return sequence;
    }

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
    const query = applyTopicWatchOptions(new TopicMessageQuery().setTopicId(topicId), options);
    const errorHandler = createTopicWatchErrorHandler(options.onError);
    const subscription = query.subscribe(context.nativeClient, errorHandler, (message) => {
      if (!message) {
        return;
      }

      handler(
        createTopicMessageData({
          consensusTimestamp: message.consensusTimestamp.toString(),
          contents: message.contents,
          runningHash: message.runningHash,
          sequenceNumber: message.sequenceNumber.toNumber(),
          topicId,
        }),
      );
    });

    return createTopicWatchHandle(() => subscription.unsubscribe());
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

    const scheduleNextPoll = (): void => {
      if (!active || options.resume === false) {
        return;
      }

      timeoutId = setTimeout(() => {
        void poll();
      }, 500);
    };

    const poll = async (): Promise<void> => {
      if (!active) {
        return;
      }

      const result = await context.mirror.topic.getMessages(topicId, {
        ...(options.limit !== undefined ? { limit: options.limit } : {}),
        ...(cursorSequence !== undefined ? { sequencenumber: cursorSequence } : {}),
        ...(cursorTimestamp !== undefined ? { timestamp: cursorTimestamp } : {}),
        order: "asc",
      });

      if (!result.success) {
        options.onError?.(new Error(result.error.message));
        scheduleNextPoll();
        return;
      }

      for (const message of result.data) {
        handler(createMirrorTopicMessage(message));
        cursorSequence = message.sequence_number + 1;
        cursorTimestamp = message.consensus_timestamp;
      }

      scheduleNextPoll();
    };

    void poll();

    return createTopicWatchHandle(() => {
      active = false;

      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
    });
  };

  const submitJson = async (params: SubmitJsonMessageParams): Promise<Result<MessageReceipt>> => {
    const normalized = normalizeMessage(params.data);
    if (!normalized.ok) {
      return normalized;
    }

    return submit(
      createSubmitMessageParams(params.topicId, normalized.value, {
        maxChunks: params.maxChunks,
        chunkSize: params.chunkSize,
        memo: params.memo,
        maxFee: params.maxFee,
      }),
    );
  };

  const batchSubmit = async (
    params: BatchSubmitMessagesParams,
  ): Promise<Result<ReadonlyArray<MessageReceipt>>> => {
    const concurrency = Math.max(1, params.concurrency ?? 1);
    const receipts: MessageReceipt[] = new Array(params.messages.length);
    let index = 0;

    const submitNext = async (): Promise<Result<void>> => {
      const currentIndex = index;
      if (currentIndex >= params.messages.length) {
        return ok(undefined);
      }

      index += 1;
      const message = params.messages[currentIndex];
      if (message === undefined) {
        return submitNext();
      }

      const normalized = normalizeMessage(message);
      if (!normalized.ok) {
        return normalized;
      }

      const receipt = await submit(
        createSubmitMessageParams(params.topicId, normalized.value, {
          maxChunks: params.maxChunks,
          chunkSize: params.chunkSize,
          memo: params.memo,
          maxFee: params.maxFee,
        }),
      );
      if (!receipt.ok) {
        return receipt;
      }

      receipts[currentIndex] = receipt.value;
      return submitNext();
    };

    const workers = Array.from({ length: concurrency }, () => submitNext());
    const results = await Promise.all(workers);
    const failure = results.find((result) => !result.ok);

    if (failure && !failure.ok) {
      return failure;
    }

    const compactReceipts = receipts.filter(
      (receipt): receipt is MessageReceipt => receipt !== undefined,
    );
    return ok(compactReceipts);
  };

  const info = async (topicId: EntityId): Promise<Result<TopicInfoData>> => {
    const result = await context.mirror.topic.getInfo(topicId);
    if (!result.success) {
      return createMirrorQueryFailure("topic.getInfo", result.error);
    }

    return ok({ topicId, topic: result.data });
  };

  const messages = async (
    topicId: EntityId,
    params?: import("@hieco/mirror").TopicMessagesParams,
  ): Promise<Result<TopicMessagesData>> => {
    const result = await context.mirror.topic.getMessages(topicId, params);
    if (!result.success) {
      return createMirrorQueryFailure("topic.getMessages", result.error);
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
