import type { EntityId } from "@hieco/utils";
import type { TransactionDescriptor } from "../../foundation/params.ts";
import type {
  MessageReceipt,
  TopicInfoData,
  TopicMessagesData,
  TopicReceipt,
  TransactionReceiptData,
} from "../../foundation/results-shapes.ts";
import type { Result } from "../../foundation/results.ts";

export interface HcsNamespace {
  create: ((
    params: import("../../foundation/params.ts").CreateTopicParams,
  ) => Promise<Result<TopicReceipt>>) & {
    tx: (params: import("../../foundation/params.ts").CreateTopicParams) => TransactionDescriptor;
  };
  update: ((
    params: import("../../foundation/params.ts").UpdateTopicParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../../foundation/params.ts").UpdateTopicParams) => TransactionDescriptor;
  };
  delete: ((
    params: import("../../foundation/params.ts").DeleteTopicParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../../foundation/params.ts").DeleteTopicParams) => TransactionDescriptor;
  };
  submit: ((
    params: import("../../foundation/params.ts").SubmitMessageParams,
  ) => Promise<Result<MessageReceipt>>) & {
    tx: (params: import("../../foundation/params.ts").SubmitMessageParams) => TransactionDescriptor;
  };
  watch: (
    topicId: EntityId,
    handler: (message: import("../../foundation/params.ts").TopicMessageData) => void,
    options?: import("../../foundation/params.ts").WatchTopicMessagesOptions,
  ) => () => void;
  watchFrom: (
    topicId: EntityId,
    handler: (message: import("../../foundation/params.ts").TopicMessageData) => void,
    options?: import("../../foundation/params.ts").WatchTopicMessagesFromOptions,
  ) => { readonly stop: () => void };
  submitJson: (
    params: import("../../foundation/params.ts").SubmitJsonMessageParams,
  ) => Promise<Result<import("../../foundation/results-shapes.ts").MessageReceipt>>;
  batchSubmit: (
    params: import("../../foundation/params.ts").BatchSubmitMessagesParams,
  ) => Promise<Result<ReadonlyArray<import("../../foundation/results-shapes.ts").MessageReceipt>>>;
  info: (topicId: EntityId) => Promise<Result<TopicInfoData>>;
  messages: (
    topicId: EntityId,
    params?: import("@hieco/mirror").TopicMessagesParams,
  ) => Promise<Result<TopicMessagesData>>;
}
