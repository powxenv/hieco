import { describe, test, expect, beforeEach } from "@jest/globals";
import { Hbar } from "@hiero-ledger/sdk";
import { MockHieroClient } from "../mock/client.js";
import { SnapshotManager } from "../mock/snapshot/snapshot-manager.js";

describe("SnapshotManager", () => {
  let client: MockHieroClient;
  let snapshotManager: SnapshotManager;

  beforeEach(() => {
    client = new MockHieroClient();
    snapshotManager = new SnapshotManager();
  });

  describe("capture", () => {
    test("captures empty state", () => {
      const snapshot = snapshotManager.capture(client);

      expect(snapshot.accounts).toBeInstanceOf(Map);
      expect(snapshot.accounts.size).toBe(0);

      expect(snapshot.tokens).toBeInstanceOf(Map);
      expect(snapshot.tokens.size).toBe(0);

      expect(snapshot.contracts).toBeInstanceOf(Map);
      expect(snapshot.contracts.size).toBe(0);

      expect(snapshot.topics).toBeInstanceOf(Map);
      expect(snapshot.topics.size).toBe(0);
    });

    test("captures account state", () => {
      const account = client.accounts.create(Hbar.fromTinybars(1000));

      const snapshot = snapshotManager.capture(client);

      expect(snapshot.accounts.size).toBe(1);
      const capturedAccount = snapshot.accounts.get(account.accountId);
      expect(capturedAccount).toEqual(account);
    });

    test("captures token state", () => {
      const token = client.tokens.createToken({
        name: "Test Token",
        symbol: "TT",
        decimals: 8,
        initialSupply: 1_000_000n,
        treasury: "0.0.1000",
      });

      const snapshot = snapshotManager.capture(client);

      expect(snapshot.tokens.size).toBe(1);
      const capturedToken = snapshot.tokens.get(token.tokenId);
      expect(capturedToken).toEqual(token);
    });

    test("captures token associations", () => {
      const token = client.tokens.createToken({
        name: "Test",
        symbol: "T",
        decimals: 8,
        initialSupply: 1000n,
        treasury: "0.0.1000",
      });

      client.tokens.associate("0.0.1001", token.tokenId);
      client.tokens.setBalance("0.0.1001", token.tokenId, 500n);

      const snapshot = snapshotManager.capture(client);

      expect(snapshot.associations.size).toBe(1);
      const key = `0.0.1001:${token.tokenId}`;
      const association = snapshot.associations.get(key);
      expect(association?.balance).toBe(500n);
    });

    test("captures contract state", () => {
      const contract = client.contracts.create("0x6001600055", "admin-key");

      client.contracts.recordCall(contract.contractId, {
        functionName: "transfer",
        args: [],
        result: "0x01",
        gasUsed: 50000n,
      });

      const snapshot = snapshotManager.capture(client);

      expect(snapshot.contracts.size).toBe(1);
      const capturedContract = snapshot.contracts.get(contract.contractId);
      expect(capturedContract?.bytecode).toBe("0x6001600055");
    });

    test("captures topic state", () => {
      const topic = client.topics.create("test memo");

      client.topics.submitMessage(topic.topicId, new Uint8Array([1, 2, 3]));

      const snapshot = snapshotManager.capture(client);

      expect(snapshot.topics.size).toBe(1);
      expect(snapshot.messages.size).toBe(1);
    });

    test("captures timestamp", () => {
      const testTime = new Date("2024-01-01T00:00:00Z");
      client.time.setTime(testTime);

      const snapshot = snapshotManager.capture(client);

      expect(snapshot.timestamp.getTime()).toBe(testTime.getTime());
    });

    test("creates independent copies of maps", () => {
      const account = client.accounts.create(new Hbar(1));
      const snapshot = snapshotManager.capture(client);

      client.accounts.setBalance(account.accountId, new Hbar(0.5));

      const capturedAccount = snapshot.accounts.get(account.accountId);
      expect(capturedAccount?.balance.toBigNumber().toNumber()).toBe(1);
    });
  });

  describe("restore", () => {
    test("restores empty state", () => {
      client.accounts.create(new Hbar(1));

      const snapshot = snapshotManager.capture(client);
      client.accounts.create(new Hbar(2));

      snapshotManager.restore(client, snapshot);

      expect(client.accounts.size).toBe(1);
      expect(client.accounts.getBalance("0.0.1000")?.toBigNumber().toNumber()).toBe(1);
    });

    test("restores account state", () => {
      const account = client.accounts.create(new Hbar(1));

      const snapshot = snapshotManager.capture(client);
      client.accounts.setBalance(account.accountId, new Hbar(0));

      snapshotManager.restore(client, snapshot);

      expect(client.accounts.getBalance(account.accountId)?.toBigNumber().toNumber()).toBe(1);
    });

    test("restores token state", () => {
      const token = client.tokens.createToken({
        name: "Test Token",
        symbol: "TT",
        decimals: 8,
        initialSupply: 1_000_000n,
        treasury: "0.0.1000",
      });

      const snapshot = snapshotManager.capture(client);
      client.tokens.mint(token.tokenId, 5000n);

      snapshotManager.restore(client, snapshot);

      const restoredToken = client.tokens.get(token.tokenId);
      expect(restoredToken?.totalSupply).toBe(1_000_000n);
    });

    test("restores token associations", () => {
      const token = client.tokens.createToken({
        name: "Test",
        symbol: "T",
        decimals: 8,
        initialSupply: 1000n,
        treasury: "0.0.1000",
      });

      client.tokens.associate("0.0.1001", token.tokenId);
      client.tokens.setBalance("0.0.1001", token.tokenId, 500n);

      const snapshot = snapshotManager.capture(client);
      client.tokens.setBalance("0.0.1001", token.tokenId, 1000n);

      snapshotManager.restore(client, snapshot);

      expect(client.tokens.getBalance("0.0.1001", token.tokenId)).toBe(500n);
    });

    test("restores contract state", () => {
      const contract = client.contracts.create("0x6001");

      const snapshot = snapshotManager.capture(client);
      client.contracts.recordCall(contract.contractId, {
        functionName: "foo",
        args: [],
        result: "0x",
        gasUsed: 1000n,
      });

      snapshotManager.restore(client, snapshot);

      expect(client.contracts.getCalls(contract.contractId)).toHaveLength(0);
    });

    test("restores topic state", () => {
      const topic = client.topics.create("memo");
      client.topics.submitMessage(topic.topicId, new Uint8Array([1]));

      const snapshot = snapshotManager.capture(client);
      client.topics.submitMessage(topic.topicId, new Uint8Array([2]));

      snapshotManager.restore(client, snapshot);

      const restoredTopic = client.topics.get(topic.topicId);
      expect(restoredTopic?.sequenceNumber).toBe(1n);
    });

    test("restores timestamp", () => {
      const testTime = new Date("2024-01-01T00:00:00Z");
      client.time.setTime(testTime);

      const snapshot = snapshotManager.capture(client);
      client.time.advance(10000);

      snapshotManager.restore(client, snapshot);

      expect(client.time.now().toISOString()).toBe(testTime.toISOString());
    });

    test("clears state added after snapshot", () => {
      const snapshot = snapshotManager.capture(client);

      client.accounts.create(Hbar.fromTinybars(1000));
      client.tokens.createToken({
        name: "New",
        symbol: "N",
        decimals: 8,
        initialSupply: 100n,
        treasury: "0.0.1000",
      });

      snapshotManager.restore(client, snapshot);

      expect(client.accounts.size).toBe(0);
      expect(client.tokens.size).toBe(0);
    });

    test("handles multiple snapshot/restore cycles", () => {
      client.accounts.create(new Hbar(10));

      const snapshot1 = snapshotManager.capture(client);
      client.accounts.setBalance("0.0.1000", new Hbar(5));

      const snapshot2 = snapshotManager.capture(client);
      snapshotManager.restore(client, snapshot1);

      expect(client.accounts.getBalance("0.0.1000")?.toBigNumber().toNumber()).toBe(10);

      snapshotManager.restore(client, snapshot2);

      expect(client.accounts.getBalance("0.0.1000")?.toBigNumber().toNumber()).toBe(5);
    });
  });
});
