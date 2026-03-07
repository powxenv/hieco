import type { Amount } from "../shared/amount.ts";
import type { CustomFixedFeeParams } from "../tokens/types.ts";

export interface CreateTopicParams {
  readonly adminKey?: string | true;
  readonly submitKey?: string | true;
  readonly feeScheduleKey?: string | true;
  readonly autoRenewAccountId?: string;
  readonly autoRenewPeriodSeconds?: number;
  readonly customFees?: ReadonlyArray<CustomFixedFeeParams>;
  readonly feeExemptKeys?: ReadonlyArray<string>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface UpdateTopicParams {
  readonly topicId: string;
  readonly adminKey?: string | true;
  readonly submitKey?: string | true;
  readonly feeScheduleKey?: string | true;
  readonly autoRenewAccountId?: string;
  readonly autoRenewPeriodSeconds?: number;
  readonly expirationTime?: Date;
  readonly customFees?: ReadonlyArray<CustomFixedFeeParams>;
  readonly feeExemptKeys?: ReadonlyArray<string>;
  readonly clearAdminKey?: boolean;
  readonly clearSubmitKey?: boolean;
  readonly clearAutoRenewAccountId?: boolean;
  readonly clearFeeScheduleKey?: boolean;
  readonly clearFeeExemptKeys?: boolean;
  readonly clearCustomFees?: boolean;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface DeleteTopicParams {
  readonly topicId: string;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface SubmitMessageParams {
  readonly topicId: string;
  readonly message: string | Record<string, unknown> | Uint8Array;
  readonly maxChunks?: number;
  readonly chunkSize?: number;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface WatchTopicMessagesOptions {
  readonly startTime?: Date;
  readonly endTime?: Date;
  readonly limit?: number;
  readonly onError?: (error: Error) => void;
}

export interface WatchTopicMessagesFromOptions {
  readonly sinceSequence?: number;
  readonly sinceTimestamp?: string;
  readonly resume?: boolean;
  readonly limit?: number;
  readonly onError?: (error: Error) => void;
}

export interface SubmitJsonMessageParams {
  readonly topicId: string;
  readonly data: unknown;
  readonly maxChunks?: number;
  readonly chunkSize?: number;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface BatchSubmitMessagesParams {
  readonly topicId: string;
  readonly messages: ReadonlyArray<Uint8Array | string | Record<string, unknown>>;
  readonly concurrency?: number;
  readonly maxChunks?: number;
  readonly chunkSize?: number;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface TopicMessageData {
  readonly consensusTimestamp: string;
  readonly contents: Uint8Array;
  readonly runningHash: Uint8Array;
  readonly sequenceNumber: number;
  readonly topicId: string;
  readonly json: () => unknown;
  readonly text: () => string;
}
