import { describe, test, expect, beforeEach } from "@jest/globals";
import { TopicStore } from "../mock/stores/topic.js";

describe("TopicStore", () => {
  let store: TopicStore;
  let nowMs: number;

  beforeEach(() => {
    nowMs = Date.parse("2024-01-01T00:00:00.000Z");
    store = new TopicStore(() => new Date(nowMs));
  });

  describe("create", () => {
    test("creates topic with defaults", () => {
      const topic = store.create();

      expect(topic.topicId).toBe("0.0.4000");
      expect(topic.memo).toBeUndefined();
      expect(topic.sequenceNumber).toBe(0n);
      expect(topic.deleted).toBe(false);
    });

    test("creates topic with memo", () => {
      const topic = store.create("my topic");

      expect(topic.memo).toBe("my topic");
    });

    test("creates topic with admin key", () => {
      const topic = store.create(undefined, "admin-key");

      expect(topic.adminKey).toBe("admin-key");
    });

    test("creates topic with submit key", () => {
      const topic = store.create(undefined, undefined, "submit-key");

      expect(topic.submitKey).toBe("submit-key");
    });

    test("creates topic with all parameters", () => {
      const topic = store.create("test memo", "admin-key", "submit-key");

      expect(topic.memo).toBe("test memo");
      expect(topic.adminKey).toBe("admin-key");
      expect(topic.submitKey).toBe("submit-key");
    });

    test("increments topic number", () => {
      const first = store.create();
      const second = store.create();

      expect(first.topicId).toBe("0.0.4000");
      expect(second.topicId).toBe("0.0.4001");
    });
  });

  describe("submitMessage", () => {
    test("submits message to topic", () => {
      const topic = store.create();
      const message = new TextEncoder().encode("hello");

      const result = store.submitMessage(topic.topicId, message);

      expect(result).not.toBeNull();
      expect(result?.sequenceNumber).toBe(1n);
      expect(result?.message).toEqual(message);
      expect(result?.topicId).toBe(topic.topicId);
      expect(result?.timestamp.toISOString()).toBe("2024-01-01T00:00:00.000Z");
    });

    test("increments sequence number", () => {
      const topic = store.create();
      const message = new Uint8Array([1, 2, 3]);

      store.submitMessage(topic.topicId, message);
      const second = store.submitMessage(topic.topicId, message);
      const third = store.submitMessage(topic.topicId, message);

      expect(second?.sequenceNumber).toBe(2n);
      expect(third?.sequenceNumber).toBe(3n);
    });

    test("updates running hash", () => {
      const topic = store.create();

      store.submitMessage(topic.topicId, new Uint8Array([1, 2]));
      store.submitMessage(topic.topicId, new Uint8Array([3, 4]));

      const updated = store.get(topic.topicId);
      expect(updated?.runningHash).not.toEqual(new Uint8Array(0));
    });

    test("returns null for non-existent topic", () => {
      const result = store.submitMessage("0.0.9999", new Uint8Array([1]));

      expect(result).toBeNull();
    });

    test("returns null for deleted topic", () => {
      const topic = store.create();
      store.delete(topic.topicId);

      const result = store.submitMessage(topic.topicId, new Uint8Array([1]));

      expect(result).toBeNull();
    });
  });

  describe("getMessages", () => {
    test("returns all messages for topic", () => {
      const topic = store.create();

      store.submitMessage(topic.topicId, new Uint8Array([1]));
      store.submitMessage(topic.topicId, new Uint8Array([2]));
      store.submitMessage(topic.topicId, new Uint8Array([3]));

      const messages = store.getMessages(topic.topicId);

      expect(messages).toHaveLength(3);
      expect(messages[0]?.sequenceNumber).toBe(1n);
      expect(messages[1]?.sequenceNumber).toBe(2n);
      expect(messages[2]?.sequenceNumber).toBe(3n);
    });

    test("returns empty array for topic with no messages", () => {
      const topic = store.create();

      expect(store.getMessages(topic.topicId)).toEqual([]);
    });

    test("returns empty array for non-existent topic", () => {
      expect(store.getMessages("0.0.9999")).toEqual([]);
    });
  });

  describe("getMessage", () => {
    test("returns message by sequence number", () => {
      const topic = store.create();

      store.submitMessage(topic.topicId, new Uint8Array([1]));
      store.submitMessage(topic.topicId, new Uint8Array([2]));
      store.submitMessage(topic.topicId, new Uint8Array([3]));

      const first = store.getMessage(topic.topicId, 1n);
      const second = store.getMessage(topic.topicId, 2n);
      const third = store.getMessage(topic.topicId, 3n);

      expect(first?.message).toEqual(new Uint8Array([1]));
      expect(second?.message).toEqual(new Uint8Array([2]));
      expect(third?.message).toEqual(new Uint8Array([3]));
    });

    test("returns undefined for non-existent sequence number", () => {
      const topic = store.create();

      expect(store.getMessage(topic.topicId, 5n)).toBeUndefined();
    });

    test("returns undefined for non-existent topic", () => {
      expect(store.getMessage("0.0.9999", 1n)).toBeUndefined();
    });
  });

  describe("update", () => {
    test("updates topic properties", () => {
      const topic = store.create("old memo");

      const result = store.update(topic.topicId, { memo: "new memo" });

      expect(result).toBe(true);
      expect(store.get(topic.topicId)?.memo).toBe("new memo");
    });

    test("can update admin key", () => {
      const topic = store.create();

      store.update(topic.topicId, { adminKey: "new-admin-key" });

      expect(store.get(topic.topicId)?.adminKey).toBe("new-admin-key");
    });

    test("can update submit key", () => {
      const topic = store.create();

      store.update(topic.topicId, { submitKey: "new-submit-key" });

      expect(store.get(topic.topicId)?.submitKey).toBe("new-submit-key");
    });

    test("returns false for non-existent topic", () => {
      const result = store.update("0.0.9999", { memo: "new memo" });
      expect(result).toBe(false);
    });
  });

  describe("delete", () => {
    test("marks topic as deleted", () => {
      const topic = store.create();

      const result = store.delete(topic.topicId);

      expect(result).toBe(true);
      expect(store.get(topic.topicId)?.deleted).toBe(true);
    });

    test("returns false for non-existent topic", () => {
      const result = store.delete("0.0.9999");
      expect(result).toBe(false);
    });
  });

  describe("clear", () => {
    test("clears all topics and messages", () => {
      const topic = store.create();
      store.submitMessage(topic.topicId, new Uint8Array([1]));

      store.clear();

      expect(store.size).toBe(0);
      expect(store.getMessages(topic.topicId)).toEqual([]);

      const newTopic = store.create();
      expect(newTopic.topicId).toBe("0.0.4000");
    });
  });

  describe("reset", () => {
    test("calls clear", () => {
      store.create();

      store.reset();

      expect(store.size).toBe(0);
    });
  });
});
