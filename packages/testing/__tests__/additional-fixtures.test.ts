import { describe, test, expect } from "bun:test";
import { mockContract, mockTopic, mockTopicMessage, mockSchedule } from "../src/fixtures";

describe("mockContract", () => {
  test("generates valid contract with defaults", () => {
    const contract = mockContract.build();

    expect(contract.contract_id).toMatch(/^0\.0\.\d+$/);
    expect(contract.evm_address).toBe("0x0000000000000000000000000000000000000000");
    expect(contract.deleted).toBe(false);
  });

  test("accepts custom options", () => {
    const contract = mockContract.build({
      contract_id: "0.0.9999" as const,
      evm_address: "0xabcd",
      memo: "Test contract",
    });

    expect(contract.contract_id).toBe("0.0.9999");
    expect(contract.evm_address).toBe("0xabcd");
    expect(contract.memo).toBe("Test contract");
  });

  test("generates list of contracts", () => {
    const contracts = mockContract.buildList(5);

    expect(contracts).toHaveLength(5);
    contracts.forEach((contract) => {
      expect(contract.contract_id).toMatch(/^0\.0\.\d+$/);
    });
  });
});

describe("mockTopic", () => {
  test("generates valid topic with defaults", () => {
    const topic = mockTopic.build();

    expect(topic.topic_id).toMatch(/^0\.0\.\d+$/);
    expect(topic.deleted).toBe(false);
  });

  test("accepts custom options", () => {
    const topic = mockTopic.build({
      topic_id: "0.0.8888" as const,
      memo: "Test topic",
    });

    expect(topic.topic_id).toBe("0.0.8888");
    expect(topic.memo).toBe("Test topic");
  });

  test("generates list of topics", () => {
    const topics = mockTopic.buildList(10);

    expect(topics).toHaveLength(10);
    topics.forEach((topic) => {
      expect(topic.topic_id).toMatch(/^0\.0\.\d+$/);
    });
  });
});

describe("mockTopicMessage", () => {
  test("generates valid message with defaults", () => {
    const message = mockTopicMessage.build();

    expect(message.topic_id).toBe("0.0.1");
    expect(message.message).toBe("test message");
    expect(message.sequence_number).toBeGreaterThanOrEqual(0);
  });

  test("accepts custom options", () => {
    const message = mockTopicMessage.build({
      topic_id: "0.0.7777" as const,
      message: "Hello world",
      sequence_number: 10,
      payer_account_id: "0.0.2" as const,
    });

    expect(message.topic_id).toBe("0.0.7777");
    expect(message.message).toBe("Hello world");
    expect(message.sequence_number).toBe(10);
    expect(message.payer_account_id).toBe("0.0.2");
  });

  test("generates list of messages", () => {
    const messages = mockTopicMessage.buildList(8);

    expect(messages).toHaveLength(8);
    messages.forEach((message) => {
      expect(message.message).toBeTruthy();
    });
  });
});

describe("mockSchedule", () => {
  test("generates valid schedule with defaults", () => {
    const schedule = mockSchedule.build();

    expect(schedule.schedule_id).toMatch(/^0\.0\.\d+$/);
    expect(schedule.transaction_body).toBe("0x");
    expect(schedule.signatures).toHaveLength(0);
  });

  test("accepts custom options", () => {
    const signatures = [
      {
        consensus_timestamp: Date.now().toString(),
        public_key_prefix: "abc",
        signature: "signature1",
        type: "ED25519" as const,
      },
    ] as const;

    const schedule = mockSchedule.build({
      schedule_id: "0.0.6666" as const,
      memo: "Test schedule",
      signatures,
      transaction_body: "0xabcd",
    });

    expect(schedule.schedule_id).toBe("0.0.6666");
    expect(schedule.memo).toBe("Test schedule");
    expect(schedule.signatures).toHaveLength(1);
    expect(schedule.transaction_body).toBe("0xabcd");
  });

  test("generates list of schedules", () => {
    const schedules = mockSchedule.buildList(3);

    expect(schedules).toHaveLength(3);
    schedules.forEach((schedule) => {
      expect(schedule.schedule_id).toMatch(/^0\.0\.\d+$/);
    });
  });
});
