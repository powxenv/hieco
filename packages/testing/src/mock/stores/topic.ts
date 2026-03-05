import type { TopicState, TopicMessage, EntityId } from "../../types/hiero.js";

const INITIAL_TOPIC_NUM = 4000;
const EMPTY_HASH = new Uint8Array(0);

type TopicId = EntityId;

export class TopicStore extends Map<TopicId, TopicState> {
  #messages: Map<TopicId, TopicMessage[]>;
  #nextTopicNum: number;
  readonly #now: () => Date;

  constructor(now: () => Date = () => new Date()) {
    super();
    this.#messages = new Map();
    this.#nextTopicNum = INITIAL_TOPIC_NUM;
    this.#now = now;
  }

  create(memo?: string, adminKey?: string, submitKey?: string): TopicState {
    const topicId = `0.0.${this.#nextTopicNum++}` as TopicId;

    const state: TopicState = {
      topicId,
      memo,
      adminKey,
      submitKey,
      runningHash: EMPTY_HASH,
      sequenceNumber: 0n,
      deleted: false,
    };

    this.set(topicId, state);
    this.#messages.set(topicId, []);

    return state;
  }

  submitMessage(topicId: TopicId, message: Uint8Array): TopicMessage | null {
    const topic = this.get(topicId);
    if (!topic || topic.deleted) return null;

    const sequenceNumber = topic.sequenceNumber + 1n;

    const topicMessage: TopicMessage = {
      topicId,
      sequenceNumber,
      message,
      timestamp: this.#now(),
    };

    const updated: TopicState = {
      ...topic,
      sequenceNumber,
      runningHash: this.#computeHash(topic.runningHash, message),
    };

    this.set(topicId, updated);

    const messages = this.#messages.get(topicId);
    if (messages) {
      messages.push(topicMessage);
    }

    return topicMessage;
  }

  getMessages(topicId: TopicId): readonly TopicMessage[] {
    return this.#messages.get(topicId) ?? [];
  }

  getMessage(topicId: TopicId, sequenceNumber: bigint): TopicMessage | undefined {
    const messages = this.#messages.get(topicId);
    if (!messages) return undefined;

    return messages.find((msg) => msg.sequenceNumber === sequenceNumber);
  }

  update(
    topicId: TopicId,
    updates: Partial<Omit<TopicState, "topicId" | "sequenceNumber">>,
  ): boolean {
    const topic = this.get(topicId);
    if (!topic) return false;

    const updated: TopicState = {
      ...topic,
      ...updates,
    };

    this.set(topicId, updated);
    return true;
  }

  override delete(topicId: TopicId): boolean {
    const topic = this.get(topicId);
    if (!topic) return false;

    const updated: TopicState = { ...topic, deleted: true };
    this.set(topicId, updated);
    return true;
  }

  override clear(): void {
    super.clear();
    this.#messages.clear();
    this.#nextTopicNum = INITIAL_TOPIC_NUM;
  }

  reset(): void {
    this.clear();
  }

  override set(topicId: TopicId, state: TopicState): this {
    if (!this.#messages.has(topicId)) {
      this.#messages.set(topicId, []);
    }
    return super.set(topicId, state);
  }

  #computeHash(prevHash: Uint8Array, message: Uint8Array): Uint8Array {
    const combined = new Uint8Array(prevHash.length + message.length);
    combined.set(prevHash);
    combined.set(message, prevHash.length);

    let hash = 0n;
    for (let i = 0; i < combined.length; i++) {
      const byte = combined[i]!;
      hash = (hash * 31n + BigInt(byte)) & 0xffffffffn;
    }

    const bytes = new Uint8Array(4);
    for (let i = 0; i < 4; i++) {
      bytes[3 - i] = Number((hash >> BigInt(8 * i)) & 0xffn);
    }

    return bytes;
  }
}

export function createTopicStore(): TopicStore {
  return new TopicStore();
}
