import { describe, test, expect } from "bun:test";
import {
  isValidMirrorNodeKey,
  findMethodMapping,
  invalidateQueries,
  prefetchQuery,
} from "../src/mirror/query-helpers";
import type { QueryClient } from "@tanstack/query-core";

type MirrorNodeClientLike = Record<
  | "account"
  | "token"
  | "contract"
  | "transaction"
  | "topic"
  | "schedule"
  | "network"
  | "balance"
  | "block",
  Record<string, unknown>
>;

describe("isValidMirrorNodeKey", () => {
  test("returns true for valid key structure: mirror-node, network, entity", () => {
    const key = ["mirror-node", "mainnet", "account", "info", "0.0.123"];
    expect(isValidMirrorNodeKey(key)).toBe(true);
  });

  test("returns true for valid key with additional elements", () => {
    const key = ["mirror-node", "testnet", "token", "info", "0.0.456", "extra"];
    expect(isValidMirrorNodeKey(key)).toBe(true);
  });

  test("returns true for list query key", () => {
    const key = ["mirror-node", "mainnet", "accounts", "list"];
    expect(isValidMirrorNodeKey(key)).toBe(true);
  });

  test("returns false for non-array", () => {
    expect(isValidMirrorNodeKey("not-an-array")).toBe(false);
    expect(isValidMirrorNodeKey(null)).toBe(false);
    expect(isValidMirrorNodeKey(undefined)).toBe(false);
    expect(isValidMirrorNodeKey({})).toBe(false);
    expect(isValidMirrorNodeKey(123)).toBe(false);
  });

  test("returns false for array with less than 4 elements", () => {
    expect(isValidMirrorNodeKey(["mirror-node", "mainnet", "account"])).toBe(false);
    expect(isValidMirrorNodeKey(["mirror-node", "mainnet"])).toBe(false);
    expect(isValidMirrorNodeKey(["mirror-node"])).toBe(false);
    expect(isValidMirrorNodeKey([])).toBe(false);
  });

  test("returns false when first element is not mirror-node", () => {
    const key = ["not-mirror-node", "mainnet", "account", "info", "0.0.123"];
    expect(isValidMirrorNodeKey(key)).toBe(false);
  });

  test("returns false when network is not a string", () => {
    const key = ["mirror-node", 123, "account", "info", "0.0.123"];
    expect(isValidMirrorNodeKey(key)).toBe(false);
  });

  test("returns false when entity is not a string", () => {
    const key = ["mirror-node", "mainnet", 456, "info", "0.0.123"];
    expect(isValidMirrorNodeKey(key)).toBe(false);
  });

  test("returns false when both network and entity are not strings", () => {
    const key = ["mirror-node", 123, 456, "info", "0.0.123"];
    expect(isValidMirrorNodeKey(key)).toBe(false);
  });

  test("type narrowing works correctly", () => {
    const key = ["mirror-node", "mainnet", "account", "info", "0.0.123"];
    if (isValidMirrorNodeKey(key)) {
      expect(() => key[0].toUpperCase()).not.toThrow();
      expect(() => key[1].toUpperCase()).not.toThrow();
      expect(() => key[2].toUpperCase()).not.toThrow();
    }
  });

  test("handles undefined elements in array", () => {
    const key = ["mirror-node", undefined, "account", "info", "0.0.123"];
    expect(isValidMirrorNodeKey(key)).toBe(false);
  });

  test("handles null elements in array", () => {
    const key = ["mirror-node", null, "account", "info", "0.0.123"];
    expect(isValidMirrorNodeKey(key)).toBe(false);
  });
});

describe("findMethodMapping", () => {
  test("returns mapping for valid account info key", () => {
    const key = ["mirror-node", "mainnet", "account", "info", "0.0.123"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.apiProperty).toBe("account");
    expect(result?.mapping.methodName).toBe("getInfo");
    expect(result?.mapping.entityName).toBe("account");
    expect(result?.args).toEqual(["0.0.123"]);
  });

  test("returns mapping for valid token info key", () => {
    const key = ["mirror-node", "testnet", "token", "info", "0.0.456"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.apiProperty).toBe("token");
    expect(result?.mapping.methodName).toBe("getInfo");
    expect(result?.mapping.entityName).toBe("token");
  });

  test("returns mapping for valid contract results key", () => {
    const key = ["mirror-node", "previewnet", "contract", "results", "0.0.789"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.apiProperty).toBe("contract");
    expect(result?.mapping.methodName).toBe("getResults");
    expect(result?.mapping.entityName).toBe("contract");
  });

  test("returns mapping with args extracted for account balances", () => {
    const key = ["mirror-node", "mainnet", "account", "balances", "0.0.123"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.args).toEqual(["0.0.123"]);
  });

  test("returns mapping with args for contract result with timestamp", () => {
    const key = ["mirror-node", "mainnet", "contract", "result", "0.0.123", "1234567890"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.methodName).toBe("getResult");
    expect(result?.args).toEqual(["0.0.123", "1234567890"]);
  });

  test("returns mapping for token nft with serial number", () => {
    const key = ["mirror-node", "mainnet", "token", "nft", "0.0.123", 456];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.methodName).toBe("getNft");
    expect(result?.args).toEqual(["0.0.123", 456]);
  });

  test("returns mapping for topic message with sequence number", () => {
    const key = ["mirror-node", "mainnet", "topic", "message", "0.0.123", 456];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.methodName).toBe("getMessage");
    expect(result?.args).toEqual(["0.0.123", 456]);
  });

  test("returns null for invalid key structure", () => {
    const invalidKeys = [
      "not-an-array",
      ["mirror-node", "mainnet", "account"],
      ["not-mirror-node", "mainnet", "account", "info"],
      null,
      undefined,
      [],
    ];

    for (const key of invalidKeys) {
      expect(findMethodMapping(key as unknown[])).toBeNull();
    }
  });

  test("returns null for unknown entity type", () => {
    const key = ["mirror-node", "mainnet", "unknown-entity", "info", "0.0.123"];
    const result = findMethodMapping(key);

    expect(result).toBeNull();
  });

  test("returns null for mismatched resource path", () => {
    const key = ["mirror-node", "mainnet", "account", "unknown-resource", "0.0.123"];
    const result = findMethodMapping(key);

    expect(result).toBeNull();
  });

  test("returns mapping for account crypto allowances", () => {
    const key = ["mirror-node", "mainnet", "account", "allowances", "crypto", "0.0.123"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.methodName).toBe("getCryptoAllowances");
    expect(result?.args).toEqual(["0.0.123"]);
  });

  test("returns mapping for network exchange rate", () => {
    const key = ["mirror-node", "mainnet", "network", "exchange-rate"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.apiProperty).toBe("network");
    expect(result?.mapping.methodName).toBe("getExchangeRate");
    expect(result?.mapping.entityName).toBe("network");
  });

  test("returns mapping for block info", () => {
    const key = ["mirror-node", "mainnet", "block", "info", "123456"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.apiProperty).toBe("block");
    expect(result?.mapping.methodName).toBe("getBlock");
    expect(result?.mapping.entityName).toBe("block");
  });

  test("returns mapping for transaction by account", () => {
    const key = ["mirror-node", "mainnet", "transaction", "account", "0.0.123"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.methodName).toBe("listByAccount");
    expect(result?.args).toEqual(["0.0.123"]);
  });

  test("returns mapping for contract resultByTx", () => {
    const key = ["mirror-node", "mainnet", "contract", "results", "byTx", "0xabc123"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.apiProperty).toBe("contract");
    expect(result?.mapping.entityName).toBe("contract");
  });

  test("returns mapping for topic message by timestamp", () => {
    const key = ["mirror-node", "mainnet", "topic", "message", "byTimestamp", "1234567890"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.apiProperty).toBe("topic");
    expect(result?.mapping.entityName).toBe("topic");
  });

  test("returns mapping for contract all results", () => {
    const key = ["mirror-node", "mainnet", "contract", "results", "all"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.apiProperty).toBe("contract");
    expect(result?.mapping.entityName).toBe("contract");
  });

  test("returns mapping for contract result actions", () => {
    const key = ["mirror-node", "mainnet", "contract", "results", "actions", "0xabc123"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.apiProperty).toBe("contract");
    expect(result?.mapping.entityName).toBe("contract");
  });

  test("returns mapping for contract result opcodes", () => {
    const key = ["mirror-node", "mainnet", "contract", "results", "opcodes", "0xdef456"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.apiProperty).toBe("contract");
    expect(result?.mapping.entityName).toBe("contract");
  });

  test("returns mapping for contract all logs", () => {
    const key = ["mirror-node", "mainnet", "contract", "results", "logs", "all"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.apiProperty).toBe("contract");
    expect(result?.mapping.entityName).toBe("contract");
  });

  test("returns mapping for account outstanding airdrops", () => {
    const key = ["mirror-node", "mainnet", "account", "airdrops", "outstanding", "0.0.123"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.methodName).toBe("getOutstandingAirdrops");
    expect(result?.args).toEqual(["0.0.123"]);
  });

  test("returns mapping for account pending airdrops", () => {
    const key = ["mirror-node", "mainnet", "account", "airdrops", "pending", "0.0.123"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.methodName).toBe("getPendingAirdrops");
    expect(result?.args).toEqual(["0.0.123"]);
  });

  test("handles plural entity name: accounts list", () => {
    const key = ["mirror-node", "mainnet", "accounts", "list"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.apiProperty).toBe("account");
    expect(result?.mapping.entityName).toBe("account");
  });

  test("handles plural entity name: tokens list", () => {
    const key = ["mirror-node", "mainnet", "tokens", "list"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.apiProperty).toBe("token");
    expect(result?.mapping.entityName).toBe("token");
  });

  test("handles plural entity name: contracts list", () => {
    const key = ["mirror-node", "mainnet", "contracts", "list"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.apiProperty).toBe("contract");
    expect(result?.mapping.entityName).toBe("contract");
  });

  test("handles plural entity name: transactions list", () => {
    const key = ["mirror-node", "mainnet", "transactions", "list"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.apiProperty).toBe("transaction");
    expect(result?.mapping.entityName).toBe("transaction");
  });

  test("handles plural entity name: topics list", () => {
    const key = ["mirror-node", "mainnet", "topics", "list"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.apiProperty).toBe("topic");
    expect(result?.mapping.entityName).toBe("topic");
  });

  test("handles plural entity name: schedules list", () => {
    const key = ["mirror-node", "mainnet", "schedules", "list"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.apiProperty).toBe("schedule");
    expect(result?.mapping.entityName).toBe("schedule");
  });

  test("handles plural entity name: balances list", () => {
    const key = ["mirror-node", "mainnet", "balances", "list"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.apiProperty).toBe("balance");
    expect(result?.mapping.entityName).toBe("balance");
  });

  test("handles plural entity name: blocks list", () => {
    const key = ["mirror-node", "mainnet", "blocks", "list"];
    const result = findMethodMapping(key);

    expect(result).not.toBeNull();
    expect(result?.mapping.apiProperty).toBe("block");
    expect(result?.mapping.entityName).toBe("block");
  });
});

describe("invalidateQueries", () => {
  test("calls invalidateQueries with exactKey", async () => {
    let capturedOptions: unknown = null;
    const mockQueryClient = {
      invalidateQueries: async (options: unknown) => {
        capturedOptions = options;
      },
    } as unknown as QueryClient;

    const exactKey = ["mirror-node", "mainnet", "account", "info", "0.0.123"];
    await invalidateQueries(mockQueryClient, { exactKey });

    expect(capturedOptions).toEqual({ queryKey: exactKey });
  });

  test("predicate filters by entity type at key index 2", async () => {
    let capturedPredicate: ((query: { queryKey: unknown[] }) => boolean) | undefined;
    const mockQueryClient = {
      invalidateQueries: async (options: unknown) => {
        const opts = options as { predicate?: (query: { queryKey: unknown[] }) => boolean };
        capturedPredicate = opts.predicate;
      },
    } as unknown as QueryClient;

    await invalidateQueries(mockQueryClient, { entityType: "account" });

    expect(capturedPredicate).toBeDefined();
    const testQuery = { queryKey: ["mirror-node", "mainnet", "account", "info", "0.0.123"] };
    expect(capturedPredicate?.(testQuery)).toBe(true);
  });

  test("predicate filters by entity type and resourceId when provided", async () => {
    let capturedPredicate: ((query: { queryKey: unknown[] }) => boolean) | undefined;
    const mockQueryClient = {
      invalidateQueries: async (options: unknown) => {
        const opts = options as { predicate?: (query: { queryKey: unknown[] }) => boolean };
        capturedPredicate = opts.predicate;
      },
    } as unknown as QueryClient;

    await invalidateQueries(mockQueryClient, { entityType: "account", resourceId: "0.0.123" });

    expect(capturedPredicate).toBeDefined();
    const matchingQuery = {
      queryKey: ["mirror-node", "mainnet", "account", "info", "0.0.123"],
    };
    const nonMatchingQuery = {
      queryKey: ["mirror-node", "mainnet", "account", "info", "0.0.456"],
    };
    expect(capturedPredicate?.(matchingQuery)).toBe(true);
    expect(capturedPredicate?.(nonMatchingQuery)).toBe(false);
  });

  test("predicate returns false for different entity type", async () => {
    let capturedPredicate: ((query: { queryKey: unknown[] }) => boolean) | undefined;
    const mockQueryClient = {
      invalidateQueries: async (options: unknown) => {
        const opts = options as { predicate?: (query: { queryKey: unknown[] }) => boolean };
        capturedPredicate = opts.predicate;
      },
    } as unknown as QueryClient;

    await invalidateQueries(mockQueryClient, { entityType: "account" });

    const tokenQuery = { queryKey: ["mirror-node", "testnet", "token", "info", "0.0.123"] };
    expect(capturedPredicate?.(tokenQuery)).toBe(false);
  });
});

describe("prefetchQuery", () => {
  test("throws error for invalid query key", () => {
    const mockQueryClient = {
      prefetchQuery: async () => {},
    } as unknown as QueryClient;

    const mockClient = {} as unknown as MirrorNodeClientLike;
    const invalidKey = ["invalid", "key"];

    expect(prefetchQuery(mockQueryClient, mockClient, invalidKey)).rejects.toThrow(
      "Cannot find mapping for query key",
    );
  });

  test("throws error for unknown entity type", () => {
    const mockQueryClient = {
      prefetchQuery: async () => {},
    } as unknown as QueryClient;

    const mockClient = {} as unknown as MirrorNodeClientLike;
    const unknownEntityKey = ["mirror-node", "mainnet", "unknown", "info", "0.0.123"];

    expect(prefetchQuery(mockQueryClient, mockClient, unknownEntityKey)).rejects.toThrow(
      "Cannot find mapping for query key",
    );
  });
});
