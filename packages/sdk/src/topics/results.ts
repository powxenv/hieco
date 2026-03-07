import type { EntityId } from "@hieco/utils";
import type { Topic, TopicMessage } from "@hieco/mirror";
import type { TransactionReceiptData } from "../results/transaction.ts";

export interface TopicReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly topicId: EntityId;
}

export interface MessageReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly topicSequenceNumber: string;
}

export interface TopicInfoData {
  readonly topicId: EntityId;
  readonly topic: Topic;
}

export interface TopicMessagesData {
  readonly topicId: EntityId;
  readonly messages: ReadonlyArray<TopicMessage>;
}
