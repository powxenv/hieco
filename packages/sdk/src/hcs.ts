import type { EntityId } from "@hieco/types";
import { TopicMessageQuery } from "@hiero-ledger/sdk";
import type {
  CreateTopicParams,
  DeleteTopicParams,
  SubmitMessageParams,
  TransactionDescriptor,
  TopicMessageData,
  UpdateTopicParams,
  WatchTopicMessagesOptions,
} from "./types/params.ts";
import type {
  MessageReceipt,
  TopicReceipt,
  TransactionReceiptData,
} from "./types/results-shapes.ts";
import type { Result } from "./types/results.ts";
import { ok } from "./types/results.ts";
import { ensureTopicId, ensureTopicSequence } from "./transactions.ts";

export interface HcsNamespace {
  create: ((params: CreateTopicParams) => Promise<Result<TopicReceipt>>) & {
    tx: (params: CreateTopicParams) => TransactionDescriptor;
  };
  update: ((params: UpdateTopicParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: UpdateTopicParams) => TransactionDescriptor;
  };
  delete: ((params: DeleteTopicParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: DeleteTopicParams) => TransactionDescriptor;
  };
  submit: ((params: SubmitMessageParams) => Promise<Result<MessageReceipt>>) & {
    tx: (params: SubmitMessageParams) => TransactionDescriptor;
  };
  watch: (
    topicId: EntityId,
    handler: (message: TopicMessageData) => void,
    options?: WatchTopicMessagesOptions,
  ) => () => void;
}

export function createHcsNamespace(context: {
  readonly submit: (descriptor: TransactionDescriptor) => Promise<Result<TransactionReceiptData>>;
  readonly nativeClient: import("@hiero-ledger/sdk").Client;
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

  const del = async (params: DeleteTopicParams): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "hcs.delete", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  del.tx = (params: DeleteTopicParams): TransactionDescriptor => ({ kind: "hcs.delete", params });

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
  ): (() => void) => {
    const query = new TopicMessageQuery().setTopicId(topicId);
    if (options.startTime !== undefined) query.setStartTime(options.startTime);
    if (options.endTime !== undefined) query.setEndTime(options.endTime);
    if (options.limit !== undefined) query.setLimit(options.limit);

    const errorHandler = options.onError
      ? (message: unknown, error: Error) => {
          void message;
          options.onError?.(error);
        }
      : null;

    const handle = query.subscribe(context.nativeClient, errorHandler, (message) => {
      const data: TopicMessageData = {
        consensusTimestamp: message.consensusTimestamp.toString(),
        contents: message.contents,
        runningHash: message.runningHash,
        sequenceNumber: message.sequenceNumber.toNumber(),
        topicId,
        json: () => {
          const text = new TextDecoder().decode(message.contents);
          try {
            return JSON.parse(text) as unknown;
          } catch {
            return text;
          }
        },
        text: () => new TextDecoder().decode(message.contents),
      };
      handler(data);
    });

    return () => handle.unsubscribe();
  };

  return {
    create,
    update,
    delete: del,
    submit,
    watch,
  };
}
