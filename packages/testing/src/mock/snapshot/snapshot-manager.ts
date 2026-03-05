import type { Snapshot, EntityId, TopicMessage } from "../../types/hiero.js";
import type { MockHieroClient } from "../client.js";

type CapturedMessagesMap = Map<EntityId, readonly TopicMessage[]>;

export class SnapshotManager {
  capture(client: MockHieroClient): Snapshot {
    const messages = this.#captureMessages(client);

    return {
      accounts: new Map(client.accounts),
      tokens: new Map(client.tokens),
      associations: new Map(client.tokens.associations),
      contracts: new Map(client.contracts),
      topics: new Map(client.topics),
      messages: this.#convertMessagesToSnapshot(messages),
      timestamp: client.time.now(),
    };
  }

  restore(client: MockHieroClient, snapshot: Snapshot): void {
    client.accounts.clear();
    client.tokens.clear();
    client.contracts.clear();
    client.topics.clear();

    for (const [id, state] of snapshot.accounts) {
      client.accounts.set(id, { ...state });
    }

    for (const [id, state] of snapshot.tokens) {
      client.tokens.set(id, { ...state });
    }

    for (const [key, assoc] of snapshot.associations) {
      (client.tokens.associations as Map<typeof key, typeof assoc>).set(key, {
        ...assoc,
      });
    }

    for (const [id, state] of snapshot.contracts) {
      client.contracts.set(id, { ...state });
    }

    for (const [id, state] of snapshot.topics) {
      client.topics.set(id, {
        ...state,
        sequenceNumber: 0n,
        runningHash: new Uint8Array(0),
      });
    }

    this.#restoreMessages(client, snapshot.messages);

    client.time.setTime(snapshot.timestamp);
  }

  #captureMessages(client: MockHieroClient): CapturedMessagesMap {
    const messages: CapturedMessagesMap = new Map();

    for (const topicId of client.topics.keys()) {
      const cloned = client.topics.getMessages(topicId).map((msg) => ({
        ...msg,
        timestamp: new Date(msg.timestamp.getTime()),
        message: new Uint8Array(msg.message),
      }));

      messages.set(topicId, cloned);
    }

    return messages;
  }

  #convertMessagesToSnapshot(messages: CapturedMessagesMap): Snapshot["messages"] {
    const snapshotMessages = new Map<EntityId, readonly TopicMessage[]>();

    for (const [topicId, msgs] of messages) {
      if (msgs.length > 0) {
        snapshotMessages.set(topicId, msgs);
      }
    }

    return snapshotMessages;
  }

  #restoreMessages(client: MockHieroClient, messages: Snapshot["messages"]): void {
    for (const [topicId, msgs] of messages) {
      const topic = client.topics.get(topicId);
      if (!topic) continue;

      for (const msg of msgs) {
        client.time.setTime(msg.timestamp);
        client.topics.submitMessage(topicId, msg.message);
      }
    }
  }
}

export function createSnapshotManager(): SnapshotManager {
  return new SnapshotManager();
}
