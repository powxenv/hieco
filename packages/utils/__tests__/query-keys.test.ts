import { describe, test, expect } from "bun:test";
import { mirrorNodeKeys } from "../src/mirror/query-keys";

describe("mirrorNodeKeys.account", () => {
  test("info returns readonly const array with correct structure", () => {
    const key = mirrorNodeKeys.account.info("mainnet", "0.0.123");
    expect(key).toEqual(["mirror-node", "mainnet", "account", "info", "0.0.123"]);
  });

  test("info first element is mirror-node", () => {
    const key = mirrorNodeKeys.account.info("testnet", "0.0.456");
    expect(key[0]).toBe("mirror-node");
  });

  test("info second element is network parameter", () => {
    const key = mirrorNodeKeys.account.info("previewnet", "0.0.789");
    expect(key[1]).toBe("previewnet");
  });

  test("info contains correct entity type", () => {
    const key = mirrorNodeKeys.account.info("mainnet", "0.0.123");
    expect(key[2]).toBe("account");
  });

  test("info contains correct resource path", () => {
    const key = mirrorNodeKeys.account.info("mainnet", "0.0.123");
    expect(key[3]).toBe("info");
  });

  test("info includes ID parameter in correct position", () => {
    const key = mirrorNodeKeys.account.info("mainnet", "0.0.123");
    expect(key[4]).toBe("0.0.123");
  });

  test("balances returns correct structure", () => {
    const key = mirrorNodeKeys.account.balances("mainnet", "0.0.123");
    expect(key).toEqual(["mirror-node", "mainnet", "account", "balances", "0.0.123"]);
    expect(key[3]).toBe("balances");
  });

  test("tokens returns correct structure", () => {
    const key = mirrorNodeKeys.account.tokens("testnet", "0.0.456");
    expect(key).toEqual(["mirror-node", "testnet", "account", "tokens", "0.0.456"]);
    expect(key[3]).toBe("tokens");
  });

  test("nfts returns correct structure", () => {
    const key = mirrorNodeKeys.account.nfts("mainnet", "0.0.789");
    expect(key).toEqual(["mirror-node", "mainnet", "account", "nfts", "0.0.789"]);
    expect(key[3]).toBe("nfts");
  });

  test("stakingRewards returns correct structure", () => {
    const key = mirrorNodeKeys.account.stakingRewards("mainnet", "0.0.123");
    expect(key).toEqual(["mirror-node", "mainnet", "account", "rewards", "0.0.123"]);
    expect(key[3]).toBe("rewards");
  });

  test("cryptoAllowances returns correct structure", () => {
    const key = mirrorNodeKeys.account.cryptoAllowances("mainnet", "0.0.123");
    expect(key).toEqual(["mirror-node", "mainnet", "account", "allowances", "crypto", "0.0.123"]);
    expect(key[3]).toBe("allowances");
    expect(key[4]).toBe("crypto");
  });

  test("tokenAllowances returns correct structure", () => {
    const key = mirrorNodeKeys.account.tokenAllowances("mainnet", "0.0.123");
    expect(key).toEqual(["mirror-node", "mainnet", "account", "allowances", "token", "0.0.123"]);
    expect(key[3]).toBe("allowances");
    expect(key[4]).toBe("token");
  });

  test("nftAllowances returns correct structure", () => {
    const key = mirrorNodeKeys.account.nftAllowances("mainnet", "0.0.123");
    expect(key).toEqual(["mirror-node", "mainnet", "account", "allowances", "nft", "0.0.123"]);
    expect(key[3]).toBe("allowances");
    expect(key[4]).toBe("nft");
  });

  test("outstandingAirdrops returns correct structure", () => {
    const key = mirrorNodeKeys.account.outstandingAirdrops("mainnet", "0.0.123");
    expect(key).toEqual([
      "mirror-node",
      "mainnet",
      "account",
      "airdrops",
      "outstanding",
      "0.0.123",
    ]);
    expect(key[3]).toBe("airdrops");
    expect(key[4]).toBe("outstanding");
  });

  test("pendingAirdrops returns correct structure", () => {
    const key = mirrorNodeKeys.account.pendingAirdrops("mainnet", "0.0.123");
    expect(key).toEqual(["mirror-node", "mainnet", "account", "airdrops", "pending", "0.0.123"]);
    expect(key[3]).toBe("airdrops");
    expect(key[4]).toBe("pending");
  });

  test("list returns correct structure", () => {
    const key = mirrorNodeKeys.account.list("mainnet");
    expect(key).toEqual(["mirror-node", "mainnet", "accounts", "list"]);
    expect(key[2]).toBe("accounts");
  });
});

describe("mirrorNodeKeys.token", () => {
  test("info returns correct structure", () => {
    const key = mirrorNodeKeys.token.info("mainnet", "0.0.123");
    expect(key).toEqual(["mirror-node", "mainnet", "token", "info", "0.0.123"]);
  });

  test("balances returns correct structure", () => {
    const key = mirrorNodeKeys.token.balances("mainnet", "0.0.123");
    expect(key).toEqual(["mirror-node", "mainnet", "token", "balances", "0.0.123"]);
  });

  test("nfts returns correct structure", () => {
    const key = mirrorNodeKeys.token.nfts("mainnet", "0.0.123");
    expect(key).toEqual(["mirror-node", "mainnet", "token", "nfts", "0.0.123"]);
  });

  test("nft returns correct structure with serialNumber", () => {
    const key = mirrorNodeKeys.token.nft("mainnet", "0.0.123", 456);
    expect(key).toEqual(["mirror-node", "mainnet", "token", "nft", "0.0.123", 456]);
    expect(key[5]).toBe(456);
  });

  test("nftTransactions returns correct structure with serialNumber", () => {
    const key = mirrorNodeKeys.token.nftTransactions("mainnet", "0.0.123", 789);
    expect(key).toEqual(["mirror-node", "mainnet", "token", "nft", "transactions", "0.0.123", 789]);
    expect(key[3]).toBe("nft");
    expect(key[4]).toBe("transactions");
  });

  test("list returns correct structure", () => {
    const key = mirrorNodeKeys.token.list("mainnet");
    expect(key).toEqual(["mirror-node", "mainnet", "tokens", "list"]);
  });
});

describe("mirrorNodeKeys.contract", () => {
  test("info returns correct structure", () => {
    const key = mirrorNodeKeys.contract.info("mainnet", "0.0.123");
    expect(key).toEqual(["mirror-node", "mainnet", "contract", "info", "0.0.123"]);
  });

  test("results returns correct structure", () => {
    const key = mirrorNodeKeys.contract.results("mainnet", "0.0.123");
    expect(key).toEqual(["mirror-node", "mainnet", "contract", "results", "0.0.123"]);
  });

  test("result returns correct structure with timestamp", () => {
    const key = mirrorNodeKeys.contract.result("mainnet", "0.0.123", "1234567890");
    expect(key).toEqual(["mirror-node", "mainnet", "contract", "result", "0.0.123", "1234567890"]);
    expect(key[5]).toBe("1234567890");
  });

  test("state returns correct structure", () => {
    const key = mirrorNodeKeys.contract.state("mainnet", "0.0.123");
    expect(key).toEqual(["mirror-node", "mainnet", "contract", "state", "0.0.123"]);
  });

  test("logs returns correct structure", () => {
    const key = mirrorNodeKeys.contract.logs("mainnet", "0.0.123");
    expect(key).toEqual(["mirror-node", "mainnet", "contract", "logs", "0.0.123"]);
  });

  test("allResults returns correct structure", () => {
    const key = mirrorNodeKeys.contract.allResults("mainnet");
    expect(key).toEqual(["mirror-node", "mainnet", "contract", "results", "all"]);
    expect(key[4]).toBe("all");
  });

  test("resultByTx returns correct structure with txHash", () => {
    const key = mirrorNodeKeys.contract.resultByTx("mainnet", "0xabc123");
    expect(key).toEqual(["mirror-node", "mainnet", "contract", "results", "byTx", "0xabc123"]);
    expect(key[4]).toBe("byTx");
    expect(key[5]).toBe("0xabc123");
  });

  test("resultActions returns correct structure with txHash", () => {
    const key = mirrorNodeKeys.contract.resultActions("mainnet", "0xdef456");
    expect(key).toEqual(["mirror-node", "mainnet", "contract", "results", "actions", "0xdef456"]);
    expect(key[4]).toBe("actions");
  });

  test("resultOpcodes returns correct structure with txHash", () => {
    const key = mirrorNodeKeys.contract.resultOpcodes("mainnet", "0xghi789");
    expect(key).toEqual(["mirror-node", "mainnet", "contract", "results", "opcodes", "0xghi789"]);
    expect(key[4]).toBe("opcodes");
  });

  test("allLogs returns correct structure", () => {
    const key = mirrorNodeKeys.contract.allLogs("mainnet");
    expect(key).toEqual(["mirror-node", "mainnet", "contract", "results", "logs", "all"]);
  });

  test("call returns correct structure", () => {
    const key = mirrorNodeKeys.contract.call("mainnet");
    expect(key).toEqual(["mirror-node", "mainnet", "contract", "call"]);
  });

  test("list returns correct structure", () => {
    const key = mirrorNodeKeys.contract.list("mainnet");
    expect(key).toEqual(["mirror-node", "mainnet", "contracts", "list"]);
  });
});

describe("mirrorNodeKeys.transaction", () => {
  test("info returns correct structure", () => {
    const key = mirrorNodeKeys.transaction.info("mainnet", "0.0.123");
    expect(key).toEqual(["mirror-node", "mainnet", "transaction", "info", "0.0.123"]);
  });

  test("byAccount returns correct structure", () => {
    const key = mirrorNodeKeys.transaction.byAccount("mainnet", "0.0.456");
    expect(key).toEqual(["mirror-node", "mainnet", "transaction", "account", "0.0.456"]);
    expect(key[3]).toBe("account");
  });

  test("list returns correct structure", () => {
    const key = mirrorNodeKeys.transaction.list("mainnet");
    expect(key).toEqual(["mirror-node", "mainnet", "transactions", "list"]);
  });
});

describe("mirrorNodeKeys.topic", () => {
  test("info returns correct structure", () => {
    const key = mirrorNodeKeys.topic.info("mainnet", "0.0.123");
    expect(key).toEqual(["mirror-node", "mainnet", "topic", "info", "0.0.123"]);
  });

  test("messages returns correct structure", () => {
    const key = mirrorNodeKeys.topic.messages("mainnet", "0.0.123");
    expect(key).toEqual(["mirror-node", "mainnet", "topic", "messages", "0.0.123"]);
  });

  test("message returns correct structure with sequenceNumber", () => {
    const key = mirrorNodeKeys.topic.message("mainnet", "0.0.123", 456);
    expect(key).toEqual(["mirror-node", "mainnet", "topic", "message", "0.0.123", 456]);
    expect(key[5]).toBe(456);
  });

  test("messageByTimestamp returns correct structure with timestamp", () => {
    const key = mirrorNodeKeys.topic.messageByTimestamp("mainnet", "1234567890");
    expect(key).toEqual([
      "mirror-node",
      "mainnet",
      "topic",
      "message",
      "byTimestamp",
      "1234567890",
    ]);
    expect(key[4]).toBe("byTimestamp");
    expect(key[5]).toBe("1234567890");
  });

  test("list returns correct structure", () => {
    const key = mirrorNodeKeys.topic.list("mainnet");
    expect(key).toEqual(["mirror-node", "mainnet", "topics", "list"]);
  });
});

describe("mirrorNodeKeys.schedule", () => {
  test("info returns correct structure", () => {
    const key = mirrorNodeKeys.schedule.info("mainnet", "0.0.123");
    expect(key).toEqual(["mirror-node", "mainnet", "schedule", "info", "0.0.123"]);
  });

  test("list returns correct structure", () => {
    const key = mirrorNodeKeys.schedule.list("mainnet");
    expect(key).toEqual(["mirror-node", "mainnet", "schedules", "list"]);
  });
});

describe("mirrorNodeKeys.network", () => {
  test("exchangeRate returns correct structure", () => {
    const key = mirrorNodeKeys.network.exchangeRate("mainnet");
    expect(key).toEqual(["mirror-node", "mainnet", "network", "exchange-rate"]);
  });

  test("fees returns correct structure", () => {
    const key = mirrorNodeKeys.network.fees("mainnet");
    expect(key).toEqual(["mirror-node", "mainnet", "network", "fees"]);
  });

  test("nodes returns correct structure", () => {
    const key = mirrorNodeKeys.network.nodes("mainnet");
    expect(key).toEqual(["mirror-node", "mainnet", "network", "nodes"]);
  });

  test("stake returns correct structure", () => {
    const key = mirrorNodeKeys.network.stake("mainnet");
    expect(key).toEqual(["mirror-node", "mainnet", "network", "stake"]);
  });

  test("supply returns correct structure", () => {
    const key = mirrorNodeKeys.network.supply("mainnet");
    expect(key).toEqual(["mirror-node", "mainnet", "network", "supply"]);
  });
});

describe("mirrorNodeKeys.balance", () => {
  test("list returns correct structure", () => {
    const key = mirrorNodeKeys.balance.list("mainnet");
    expect(key).toEqual(["mirror-node", "mainnet", "balances", "list"]);
  });
});

describe("mirrorNodeKeys.block", () => {
  test("list returns correct structure", () => {
    const key = mirrorNodeKeys.block.list("mainnet");
    expect(key).toEqual(["mirror-node", "mainnet", "blocks", "list"]);
  });

  test("info returns correct structure with hashOrNumber", () => {
    const key = mirrorNodeKeys.block.info("mainnet", "123456");
    expect(key).toEqual(["mirror-node", "mainnet", "block", "info", "123456"]);
  });
});

describe("query keys type inference", () => {
  test("const assertion works for all keys", () => {
    const key = mirrorNodeKeys.account.info("mainnet", "0.0.123");
    expect(key).toEqual(["mirror-node", "mainnet", "account", "info", "0.0.123"]);
  });

  test("keys are readonly arrays", () => {
    const accountKey = mirrorNodeKeys.account.info("mainnet", "0.0.123");
    const tokenKey = mirrorNodeKeys.token.info("mainnet", "0.0.123");
    const contractKey = mirrorNodeKeys.contract.info("mainnet", "0.0.123");

    expect(Array.isArray(accountKey)).toBe(true);
    expect(Array.isArray(tokenKey)).toBe(true);
    expect(Array.isArray(contractKey)).toBe(true);
  });
});
