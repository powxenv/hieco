import { describe, test, expect, beforeEach } from "@jest/globals";
import { Hbar } from "@hiero-ledger/sdk";
import { AccountStore } from "../mock/stores/account.js";

describe("AccountStore", () => {
  let store: AccountStore;

  beforeEach(() => {
    store = new AccountStore();
  });

  describe("create", () => {
    test("creates account with initial balance", () => {
      const balance = new Hbar(10);
      const account = store.create(balance);

      expect(account.accountId).toBe("0.0.1000");
      expect(account.balance.toBigNumber().toNumber()).toBe(10);
      expect(account.deleted).toBe(false);
    });

    test("creates account with key", () => {
      const balance = new Hbar(5);
      const key = "302e300506032b6570032100";
      const account = store.create(balance, key);

      expect(account.key).toBe(key);
    });

    test("increments account number", () => {
      const first = store.create(new Hbar(10));
      const second = store.create(new Hbar(20));

      expect(first.accountId).toBe("0.0.1000");
      expect(second.accountId).toBe("0.0.1001");
    });

    test("stores account in map", () => {
      const account = store.create(new Hbar(10));

      expect(store.get(account.accountId)).toEqual(account);
    });
  });

  describe("getBalance", () => {
    test("returns balance for existing account", () => {
      const balance = new Hbar(50);
      const account = store.create(balance);

      const retrieved = store.getBalance(account.accountId);
      expect(retrieved?.toBigNumber().toNumber()).toBe(50);
    });

    test("returns undefined for non-existent account", () => {
      expect(store.getBalance("0.0.9999" as const)).toBeUndefined();
    });
  });

  describe("setBalance", () => {
    test("sets balance for existing account", () => {
      const account = store.create(new Hbar(10));
      const newBalance = new Hbar(50);

      const result = store.setBalance(account.accountId, newBalance);

      expect(result).toBe(true);
      expect(store.getBalance(account.accountId)?.toBigNumber().toNumber()).toBe(50);
    });

    test("returns false for non-existent account", () => {
      const result = store.setBalance("0.0.9999" as const, new Hbar(10));
      expect(result).toBe(false);
    });
  });

  describe("adjustBalance", () => {
    test("increases balance with positive delta", () => {
      const account = store.create(new Hbar(10));

      const newBalance = store.adjustBalance(account.accountId, 100_000_000n); // +1 Hbar

      expect(newBalance?.toBigNumber().toNumber()).toBe(11);
    });

    test("decreases balance with negative delta", () => {
      const account = store.create(new Hbar(10));

      const newBalance = store.adjustBalance(account.accountId, -50_000_000n); // -0.5 Hbar

      expect(newBalance?.toBigNumber().toNumber()).toBe(9.5);
    });

    test("returns null for non-existent account", () => {
      const result = store.adjustBalance("0.0.9999" as const, 100n);
      expect(result).toBeNull();
    });
  });

  describe("transferBalance", () => {
    test("transfers balance between accounts", () => {
      const from = store.create(new Hbar(100));
      const to = store.create(new Hbar(50));

      const result = store.transferBalance(from.accountId, to.accountId, new Hbar(20));

      expect(result.success).toBe(true);
      expect(result.fromBalance?.toBigNumber().toNumber()).toBe(80);
      expect(result.toBalance?.toBigNumber().toNumber()).toBe(70);
    });

    test("fails when insufficient balance", () => {
      const from = store.create(new Hbar(10));
      const to = store.create(new Hbar(50));

      const result = store.transferBalance(from.accountId, to.accountId, new Hbar(20));

      expect(result.success).toBe(false);
      expect(result.fromBalance?.toBigNumber().toNumber()).toBe(10);
      expect(result.toBalance?.toBigNumber().toNumber()).toBe(50);
    });

    test("fails when from account does not exist", () => {
      const to = store.create(new Hbar(50));

      const result = store.transferBalance("0.0.9999" as const, to.accountId, new Hbar(10));

      expect(result.success).toBe(false);
      expect(result.fromBalance).toBeNull();
    });

    test("fails when to account does not exist", () => {
      const from = store.create(new Hbar(100));

      const result = store.transferBalance(from.accountId, "0.0.9999" as const, new Hbar(10));

      expect(result.success).toBe(false);
      expect(result.toBalance).toBeNull();
    });
  });

  describe("delete", () => {
    test("marks account as deleted", () => {
      const account = store.create(new Hbar(10));

      const result = store.delete(account.accountId);

      expect(result).toBe(true);
      expect(store.isDeleted(account.accountId)).toBe(true);
    });

    test("returns false for non-existent account", () => {
      const result = store.delete("0.0.9999" as const);
      expect(result).toBe(false);
    });
  });

  describe("isDeleted", () => {
    test("returns false for non-existent account", () => {
      expect(store.isDeleted("0.0.9999" as const)).toBe(false);
    });
  });

  describe("clear", () => {
    test("clears all accounts and resets counter", () => {
      store.create(new Hbar(10));
      store.create(new Hbar(20));

      store.clear();

      expect(store.size).toBe(0);

      const newAccount = store.create(new Hbar(5));
      expect(newAccount.accountId).toBe("0.0.1000");
    });
  });

  describe("reset", () => {
    test("calls clear", () => {
      store.create(new Hbar(10));

      store.reset();

      expect(store.size).toBe(0);
    });
  });
});
