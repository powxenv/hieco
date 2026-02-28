import type { Topic, TopicMessage, ConsensusCustomFees, EntityId } from "@hieco/mirror";
import { state } from "../utils/state.js";
import type { Factory } from "./account.js";

export type TopicFixtureOptions = Partial<
  Pick<
    Topic,
    "topic_id" | "memo" | "auto_renew_account" | "auto_renew_period" | "created_timestamp"
  >
>;

export type TopicMessageFixtureOptions = Partial<
  Pick<
    TopicMessage,
    "topic_id" | "message" | "sequence_number" | "consensus_timestamp" | "payer_account_id"
  >
>;

const nextTopicId = (): EntityId => `0.0.${state.incrementTopic()}` as EntityId;

const createEmptyCustomFees = (): ConsensusCustomFees => ({
  created_timestamp: Date.now().toString(),
  fixed_fees: [],
});

const createTopic = (options: TopicFixtureOptions = {}): Topic => {
  return {
    admin_key: null,
    auto_renew_account: null,
    auto_renew_period: null,
    created_timestamp: options.created_timestamp ?? null,
    custom_fees: createEmptyCustomFees(),
    deleted: false,
    fee_exempt_key_list: [],
    fee_schedule_key: null,
    memo: options.memo ?? "",
    submit_key: null,
    timestamp: Date.now().toString(),
    topic_id: options.topic_id ?? nextTopicId(),
  };
};

const createTopicMessage = (options: TopicMessageFixtureOptions = {}): TopicMessage => {
  return {
    chunk_info: null,
    consensus_timestamp: options.consensus_timestamp ?? Date.now().toString(),
    message: options.message ?? "test message",
    payer_account_id: options.payer_account_id ?? ("0.0.1" as EntityId),
    running_hash: "0x",
    running_hash_version: 2,
    sequence_number: options.sequence_number ?? state.incrementMessage(),
    topic_id: options.topic_id ?? ("0.0.1" as EntityId),
  };
};

export const mockTopic: Factory<Topic, TopicFixtureOptions> = {
  build: (overrides) => createTopic(overrides),
  buildList: (count, overrides) => Array.from({ length: count }, () => createTopic(overrides)),
};

export const mockTopicMessage: Factory<TopicMessage, TopicMessageFixtureOptions> = {
  build: (overrides) => createTopicMessage(overrides),
  buildList: (count, overrides) =>
    Array.from({ length: count }, () => createTopicMessage(overrides)),
};
