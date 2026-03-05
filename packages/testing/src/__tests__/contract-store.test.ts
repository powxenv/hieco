import { describe, test, expect, beforeEach } from "@jest/globals";
import { ContractStore } from "../mock/stores/contract.js";

describe("ContractStore", () => {
  let store: ContractStore;

  beforeEach(() => {
    store = new ContractStore();
  });

  describe("create", () => {
    test("creates contract with bytecode", () => {
      const bytecode = "0x6001600055";
      const contract = store.create(bytecode);

      expect(contract.contractId).toBe("0.0.3000");
      expect(contract.bytecode).toBe(bytecode);
      expect(contract.deleted).toBe(false);
    });

    test("creates contract with admin key", () => {
      const bytecode = "0x6001600055";
      const adminKey = "admin-key";
      const contract = store.create(bytecode, adminKey);

      expect(contract.adminKey).toBe(adminKey);
    });

    test("increments contract number", () => {
      const first = store.create("0x6001");
      const second = store.create("0x6002");

      expect(first.contractId).toBe("0.0.3000");
      expect(second.contractId).toBe("0.0.3001");
    });
  });

  describe("recordCall", () => {
    test("records contract call", () => {
      const contract = store.create("0x6001600055");

      store.recordCall(contract.contractId, {
        functionName: "transfer",
        args: ["0x0", "0x1", 100],
        result: "0x01",
        gasUsed: 50000n,
      });

      const calls = store.getCalls(contract.contractId);
      expect(calls).toHaveLength(1);
      expect(calls[0]?.functionName).toBe("transfer");
      expect(calls[0]?.gasUsed).toBe(50000n);
    });

    test("does nothing for non-existent contract", () => {
      store.recordCall("0.0.9999", {
        functionName: "transfer",
        args: [],
        result: "0x",
        gasUsed: 0n,
      });

      expect(store.getCalls("0.0.9999")).toHaveLength(0);
    });

    test("records multiple calls", () => {
      const contract = store.create("0x6001600055");

      store.recordCall(contract.contractId, {
        functionName: "transfer",
        args: ["0x0", "0x1", 100],
        result: "0x01",
        gasUsed: 50000n,
      });

      store.recordCall(contract.contractId, {
        functionName: "balanceOf",
        args: ["0x0"],
        result: "0x64",
        gasUsed: 10000n,
      });

      const calls = store.getCalls(contract.contractId);
      expect(calls).toHaveLength(2);
    });
  });

  describe("getCalls", () => {
    test("returns all calls for contract", () => {
      const contract1 = store.create("0x6001");
      const contract2 = store.create("0x6002");

      store.recordCall(contract1.contractId, {
        functionName: "foo",
        args: [],
        result: "0x",
        gasUsed: 1000n,
      });

      store.recordCall(contract2.contractId, {
        functionName: "bar",
        args: [],
        result: "0x",
        gasUsed: 2000n,
      });

      store.recordCall(contract1.contractId, {
        functionName: "baz",
        args: [],
        result: "0x",
        gasUsed: 3000n,
      });

      expect(store.getCalls(contract1.contractId)).toHaveLength(2);
      expect(store.getCalls(contract2.contractId)).toHaveLength(1);
    });

    test("returns empty array for contract with no calls", () => {
      const contract = store.create("0x6001");

      expect(store.getCalls(contract.contractId)).toEqual([]);
    });
  });

  describe("getCallsByFunction", () => {
    test("filters calls by function name", () => {
      const contract = store.create("0x6001");

      store.recordCall(contract.contractId, {
        functionName: "transfer",
        args: [],
        result: "0x01",
        gasUsed: 1000n,
      });

      store.recordCall(contract.contractId, {
        functionName: "balanceOf",
        args: [],
        result: "0x00",
        gasUsed: 500n,
      });

      store.recordCall(contract.contractId, {
        functionName: "transfer",
        args: [],
        result: "0x01",
        gasUsed: 1500n,
      });

      const transfers = store.getCallsByFunction(contract.contractId, "transfer");
      const balances = store.getCallsByFunction(contract.contractId, "balanceOf");

      expect(transfers).toHaveLength(2);
      expect(transfers[0]?.gasUsed).toBe(1000n);
      expect(transfers[1]?.gasUsed).toBe(1500n);
      expect(balances).toHaveLength(1);
    });
  });

  describe("getAllCalls", () => {
    test("returns all recorded calls", () => {
      const contract1 = store.create("0x6001");
      const contract2 = store.create("0x6002");

      store.recordCall(contract1.contractId, {
        functionName: "foo",
        args: [],
        result: "0x",
        gasUsed: 1000n,
      });

      store.recordCall(contract2.contractId, {
        functionName: "bar",
        args: [],
        result: "0x",
        gasUsed: 2000n,
      });

      const allCalls = store.getAllCalls();

      expect(allCalls).toHaveLength(2);
      expect(allCalls[0]?.functionName).toBe("foo");
      expect(allCalls[1]?.functionName).toBe("bar");
    });

    test("returns empty array when no calls", () => {
      expect(store.getAllCalls()).toEqual([]);
    });
  });

  describe("clearCalls", () => {
    test("clears all recorded calls", () => {
      const contract = store.create("0x6001");

      store.recordCall(contract.contractId, {
        functionName: "foo",
        args: [],
        result: "0x",
        gasUsed: 1000n,
      });

      store.clearCalls();

      expect(store.getAllCalls()).toEqual([]);
      expect(store.getCalls(contract.contractId)).toEqual([]);
    });
  });

  describe("update", () => {
    test("updates contract properties", () => {
      const contract = store.create("0x6001");

      const result = store.update(contract.contractId, { adminKey: "new-key" });

      expect(result).toBe(true);
      expect(store.get(contract.contractId)?.adminKey).toBe("new-key");
    });

    test("returns false for non-existent contract", () => {
      const result = store.update("0.0.9999", { adminKey: "new-key" });
      expect(result).toBe(false);
    });
  });

  describe("delete", () => {
    test("marks contract as deleted", () => {
      const contract = store.create("0x6001");

      const result = store.delete(contract.contractId);

      expect(result).toBe(true);
      expect(store.get(contract.contractId)?.deleted).toBe(true);
    });

    test("returns false for non-existent contract", () => {
      const result = store.delete("0.0.9999");
      expect(result).toBe(false);
    });
  });

  describe("clear", () => {
    test("clears all contracts and resets counter", () => {
      store.create("0x6001");
      store.create("0x6002");

      store.clear();

      expect(store.size).toBe(0);

      const newContract = store.create("0x6003");
      expect(newContract.contractId).toBe("0.0.3000");
    });

    test("clears all calls", () => {
      const contract = store.create("0x6001");
      store.recordCall(contract.contractId, {
        functionName: "foo",
        args: [],
        result: "0x",
        gasUsed: 1000n,
      });

      store.clear();

      expect(store.getAllCalls()).toEqual([]);
    });
  });

  describe("reset", () => {
    test("calls clear", () => {
      store.create("0x6001");

      store.reset();

      expect(store.size).toBe(0);
    });
  });
});
