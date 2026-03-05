import { describe, test, expect } from "@jest/globals";
import { createTestKit } from "../mock/testkit.js";

describe("snapshot topic determinism", () => {
  test("restores topic messages with original timestamps and content", () => {
    const kit = createTestKit();
    kit.client.freezeTime(new Date("2024-01-01T00:00:00.000Z"));

    const topic = kit.fixtures.topic({ memo: "m" });
    const first = topic.submitMessage("hello");
    expect(first).not.toBeNull();

    kit.client.advanceTime(250);
    const second = topic.submitMessage(new Uint8Array([1, 2, 3]));
    expect(second).not.toBeNull();

    const snapshot = kit.snapshot();

    kit.client.advanceTime(5000);
    topic.submitMessage("after");
    topic.update({ memo: "changed" });

    kit.restore(snapshot);

    const restored = kit.client.topics.get(topic.topicId);
    expect(restored?.memo).toBe("m");
    expect(restored?.sequenceNumber).toBe(2n);

    const messages = kit.client.topics.getMessages(topic.topicId);
    expect(messages).toHaveLength(2);

    expect(messages[0]?.timestamp.toISOString()).toBe("2024-01-01T00:00:00.000Z");
    expect(new TextDecoder().decode(messages[0]?.message)).toBe("hello");

    expect(messages[1]?.timestamp.toISOString()).toBe("2024-01-01T00:00:00.250Z");
    expect(messages[1]?.message).toEqual(new Uint8Array([1, 2, 3]));
  });
});
