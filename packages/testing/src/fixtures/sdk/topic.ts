import type { MockHieroClient } from "../../mock/client.js";
import type { TopicState, TopicMessage, EntityId } from "../../types/hiero.js";

const TEXT_ENCODER = new TextEncoder();

export class TopicFixture {
  readonly #state: TopicState;
  readonly #client: MockHieroClient;

  constructor(state: TopicState, client: MockHieroClient) {
    this.#state = state;
    this.#client = client;
  }

  get topicId(): EntityId {
    return this.#state.topicId;
  }

  get memo(): string | undefined {
    return this.#state.memo;
  }

  get sequenceNumber(): bigint {
    return this.#state.sequenceNumber;
  }

  get runningHash(): Uint8Array {
    return this.#state.runningHash;
  }

  submitMessage(message: string | Uint8Array): TopicMessage | null {
    const bytes = typeof message === "string" ? TEXT_ENCODER.encode(message) : message;
    return this.#client.topics.submitMessage(this.topicId, bytes);
  }

  getMessages(): readonly TopicMessage[] {
    return this.#client.topics.getMessages(this.topicId);
  }

  getMessage(sequenceNumber: bigint): TopicMessage | undefined {
    return this.#client.topics.getMessage(this.topicId, sequenceNumber);
  }

  update(updates: Partial<Omit<TopicState, "topicId" | "sequenceNumber">>): boolean {
    return this.#client.topics.update(this.topicId, updates);
  }

  delete(): boolean {
    return this.#client.topics.delete(this.topicId);
  }
}

export interface TopicFixtureOptions {
  readonly memo?: string;
  readonly adminKey?: string;
  readonly submitKey?: string;
  readonly autoRenewAccount?: EntityId;
}

export function createTopicFixture(
  client: MockHieroClient,
  options: TopicFixtureOptions = {},
): TopicFixture {
  const state = client.topics.create(options.memo, options.adminKey, options.submitKey);

  if (options.autoRenewAccount) {
    client.topics.update(state.topicId, { autoRenewAccount: options.autoRenewAccount });
  }

  return new TopicFixture(state, client);
}
