import { describe, test, expect, beforeEach } from "@jest/globals";
import { Hbar } from "@hiero-ledger/sdk";
import { createTestKit } from "../mock/testkit.js";

describe("TestKit", () => {
  describe("createTestKit", () => {
    test("creates test kit with client", () => {
      const testKit = createTestKit();

      expect(testKit.client).toBeDefined();
      expect(testKit.client.accounts).toBeDefined();
      expect(testKit.client.tokens).toBeDefined();
      expect(testKit.client.contracts).toBeDefined();
      expect(testKit.client.topics).toBeDefined();
    });

    test("creates test kit with fixtures", () => {
      const testKit = createTestKit();

      expect(testKit.fixtures).toBeDefined();
      expect(typeof testKit.fixtures.account).toBe("function");
      expect(typeof testKit.fixtures.accounts).toBe("function");
      expect(typeof testKit.fixtures.token).toBe("function");
    });

    test("creates test kit with snapshot function", () => {
      const testKit = createTestKit();

      expect(typeof testKit.snapshot).toBe("function");
    });

    test("creates test kit with restore function", () => {
      const testKit = createTestKit();

      expect(typeof testKit.restore).toBe("function");
    });

    test("creates test kit with reset function", () => {
      const testKit = createTestKit();

      expect(typeof testKit.reset).toBe("function");
    });
  });

  describe("fixtures", () => {
    let testKit: ReturnType<typeof createTestKit>;

    beforeEach(() => {
      testKit = createTestKit();
    });

    test("account fixture creates account with default balance", () => {
      const account = testKit.fixtures.account();

      expect(account.accountId).toBeDefined();
      expect(account.balance.toBigNumber().toNumber()).toBe(1000);
    });

    test("account fixture creates account with custom balance", () => {
      const account = testKit.fixtures.account(new Hbar(5));

      expect(account.balance.toBigNumber().toNumber()).toBe(5);
    });

    test("accounts fixture creates multiple accounts", () => {
      const accounts = testKit.fixtures.accounts(5);

      expect(accounts).toHaveLength(5);
      expect(accounts[0]?.accountId).toBeDefined();
    });

    test("token fixture creates token with defaults", () => {
      const account = testKit.fixtures.account();
      const token = testKit.fixtures.token({
        name: "Test Token",
        symbol: "TT",
        decimals: 8,
        initialSupply: 1000n,
        treasury: account.accountId,
      });

      expect(token.tokenId).toBeDefined();
      expect(token.name).toBe("Test Token");
      expect(token.symbol).toBe("TT");
      expect(token.decimals).toBe(8);
    });

    test("token fixture creates token with custom values", () => {
      const account = testKit.fixtures.account();
      const token = testKit.fixtures.token({
        name: "Custom Token",
        symbol: "CT",
        decimals: 6,
        initialSupply: 500_000n,
        treasury: account.accountId,
      });

      expect(token.name).toBe("Custom Token");
      expect(token.symbol).toBe("CT");
      expect(token.decimals).toBe(6);
      expect(token.totalSupply).toBe(500_000n);
    });

    test("contract fixture creates contract", () => {
      const contract = testKit.fixtures.contract({
        bytecode: "0x6001600055",
      });

      expect(contract.contractId).toBeDefined();
      expect(contract.bytecode).toBe("0x6001600055");
    });

    test("topic fixture creates topic", () => {
      const topic = testKit.fixtures.topic({
        memo: "test memo",
      });

      expect(topic.topicId).toBeDefined();
      expect(topic.memo).toBe("test memo");
    });
  });

  describe("snapshot and restore", () => {
    let testKit: ReturnType<typeof createTestKit>;

    beforeEach(() => {
      testKit = createTestKit();
    });

    test("snapshot captures current state", () => {
      testKit.fixtures.account(new Hbar(10));

      const snapshot = testKit.snapshot();

      expect(snapshot.accounts.size).toBe(1);
    });

    test("snapshot includes accounts", () => {
      const account = testKit.fixtures.account(new Hbar(5));

      const snapshot = testKit.snapshot();

      expect(snapshot.accounts.size).toBe(1);
      const captured = snapshot.accounts.get(account.accountId);
      expect(captured?.balance.toBigNumber().toNumber()).toBe(5);
    });

    test("snapshot includes tokens", () => {
      const account = testKit.fixtures.account();
      testKit.fixtures.token({
        name: "Test",
        symbol: "T",
        decimals: 8,
        initialSupply: 1000n,
        treasury: account.accountId,
      });

      const snapshot = testKit.snapshot();

      expect(snapshot.tokens.size).toBe(1);
    });

    test("restore brings back previous state", () => {
      const account = testKit.fixtures.account(new Hbar(10));

      const snapshot = testKit.snapshot();

      testKit.client.accounts.setBalance(account.accountId, new Hbar(0));

      testKit.restore(snapshot);

      expect(testKit.client.accounts.getBalance(account.accountId)?.toBigNumber().toNumber()).toBe(
        10,
      );
    });

    test("restore clears accounts added after snapshot", () => {
      const snapshot = testKit.snapshot();

      testKit.fixtures.account(new Hbar(10));

      testKit.restore(snapshot);

      expect(testKit.client.accounts.size).toBe(0);
    });

    test("can snapshot and restore multiple times", () => {
      const account = testKit.fixtures.account(new Hbar(10));

      const snapshot1 = testKit.snapshot();

      testKit.client.accounts.setBalance(account.accountId, new Hbar(5));
      const snapshot2 = testKit.snapshot();

      testKit.restore(snapshot1);
      expect(testKit.client.accounts.getBalance(account.accountId)?.toBigNumber().toNumber()).toBe(
        10,
      );

      testKit.restore(snapshot2);
      expect(testKit.client.accounts.getBalance(account.accountId)?.toBigNumber().toNumber()).toBe(
        5,
      );
    });
  });

  describe("reset", () => {
    let testKit: ReturnType<typeof createTestKit>;

    beforeEach(() => {
      testKit = createTestKit();
    });

    test("reset clears all state", () => {
      testKit.fixtures.account(new Hbar(10));
      testKit.fixtures.account(new Hbar(20));

      testKit.reset();

      expect(testKit.client.accounts.size).toBe(0);
    });

    test("reset allows starting fresh", () => {
      testKit.fixtures.account(new Hbar(10));
      testKit.reset();

      const account = testKit.fixtures.account(new Hbar(5));

      expect(account.accountId).toBe("0.0.1000");
    });

    test("reset clears tokens", () => {
      const account = testKit.fixtures.account();
      testKit.fixtures.token({
        name: "Test",
        symbol: "T",
        decimals: 8,
        initialSupply: 1000n,
        treasury: account.accountId,
      });

      testKit.reset();

      expect(testKit.client.tokens.size).toBe(0);
    });

    test("reset clears contracts", () => {
      testKit.fixtures.contract({ bytecode: "0x6001" });

      testKit.reset();

      expect(testKit.client.contracts.size).toBe(0);
    });

    test("reset clears topics", () => {
      testKit.fixtures.topic({ memo: "test" });

      testKit.reset();

      expect(testKit.client.topics.size).toBe(0);
    });

    test("reset clears time overrides", () => {
      testKit.client.setTime(new Date("2024-01-01T00:00:00Z"));
      testKit.client.freezeTime();

      testKit.reset();

      expect(testKit.client.time.isFrozen).toBe(false);
      expect(testKit.client.time.offset).toBe(0);
    });
  });

  describe("integration", () => {
    test("full workflow: create, snapshot, modify, restore", () => {
      const testKit = createTestKit();

      const account1 = testKit.fixtures.account(new Hbar(10));
      const account2 = testKit.fixtures.account(new Hbar(5));

      const snapshot = testKit.snapshot();

      testKit.client.accounts.transferBalance(account1.accountId, account2.accountId, new Hbar(2));

      expect(testKit.client.accounts.getBalance(account1.accountId)?.toBigNumber().toNumber()).toBe(
        8,
      );
      expect(testKit.client.accounts.getBalance(account2.accountId)?.toBigNumber().toNumber()).toBe(
        7,
      );

      testKit.restore(snapshot);

      expect(testKit.client.accounts.getBalance(account1.accountId)?.toBigNumber().toNumber()).toBe(
        10,
      );
      expect(testKit.client.accounts.getBalance(account2.accountId)?.toBigNumber().toNumber()).toBe(
        5,
      );
    });

    test("token workflow with fixtures", () => {
      const testKit = createTestKit();

      const account = testKit.fixtures.account(new Hbar(10));
      const token = testKit.fixtures.token({
        name: "Test",
        symbol: "T",
        decimals: 8,
        initialSupply: 10_000n,
        treasury: account.accountId,
      });

      expect(token.totalSupply).toBe(10_000n);

      const associated = testKit.client.tokens.associate(token.tokenId, account.accountId);
      expect(associated).toBe(false);
    });
  });
});
