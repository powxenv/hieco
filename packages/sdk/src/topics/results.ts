import type { Topic, TopicMessage } from "@hieco/mirror";
import type { TransactionReceiptData } from "../results/transaction.ts";

export interface TopicReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly topicId: string;
}

export interface MessageReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly topicSequenceNumber: string;
}

export interface TopicInfoData {
  readonly topicId: string;
  readonly topic: Topic;
}

export interface TopicMessagesData {
  readonly topicId: string;
  readonly messages: ReadonlyArray<TopicMessage>;
}
