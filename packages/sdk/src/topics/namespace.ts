import type { EntityId } from "@hieco/utils";
import type { TransactionDescriptor } from "../shared/params.ts";
import type {
  MessageReceipt,
  TopicInfoData,
  TopicMessagesData,
  TopicReceipt,
  TransactionReceiptData,
} from "../results/shapes.ts";
import type { Result } from "../results/result.ts";
import type { TopicWatchHandle } from "./types.ts";

export interface TopicsNamespace {
  create: ((
    params: import("../shared/params.ts").CreateTopicParams,
  ) => Promise<Result<TopicReceipt>>) & {
    tx: (params: import("../shared/params.ts").CreateTopicParams) => TransactionDescriptor;
  };
  update: ((
    params: import("../shared/params.ts").UpdateTopicParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").UpdateTopicParams) => TransactionDescriptor;
  };
  delete: ((
    params: import("../shared/params.ts").DeleteTopicParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").DeleteTopicParams) => TransactionDescriptor;
  };
  submit: ((
    params: import("../shared/params.ts").SubmitMessageParams,
  ) => Promise<Result<MessageReceipt>>) & {
    tx: (params: import("../shared/params.ts").SubmitMessageParams) => TransactionDescriptor;
  };
  watch: (
    topicId: EntityId,
    handler: (message: import("../shared/params.ts").TopicMessageData) => void,
    options?: import("../shared/params.ts").WatchTopicMessagesOptions,
  ) => TopicWatchHandle;
  watchFrom: (
    topicId: EntityId,
    handler: (message: import("../shared/params.ts").TopicMessageData) => void,
    options?: import("../shared/params.ts").WatchTopicMessagesFromOptions,
  ) => TopicWatchHandle;
  submitJson: (
    params: import("../shared/params.ts").SubmitJsonMessageParams,
  ) => Promise<Result<import("../results/shapes.ts").MessageReceipt>>;
  batchSubmit: (
    params: import("../shared/params.ts").BatchSubmitMessagesParams,
  ) => Promise<Result<ReadonlyArray<import("../results/shapes.ts").MessageReceipt>>>;
  info: (topicId: EntityId) => Promise<Result<TopicInfoData>>;
  messages: (
    topicId: EntityId,
    params?: import("@hieco/mirror").TopicMessagesParams,
  ) => Promise<Result<TopicMessagesData>>;
}
