import { describe, test, expect } from "bun:test";
import { mockExchangeRate, mockNetworkNode, mockNetworkSupply } from "../src/fixtures";

describe("mockExchangeRate", () => {
  test("generates valid exchange rate with defaults", () => {
    const rate = mockExchangeRate.build();

    expect(rate.current_rate.cent_equality).toBe(12000);
    expect(rate.current_rate.hbar_equality).toBe(1);
    expect(rate.next_rate.cent_equality).toBe(12000);
    expect(rate.next_rate.hbar_equality).toBe(1);
  });

  test("accepts custom options", () => {
    const rate = mockExchangeRate.build({
      centEquivalent: 15000,
      hbarEquivalent: 1,
      nextCentEquivalent: 16000,
    });

    expect(rate.current_rate.cent_equality).toBe(15000);
    expect(rate.next_rate.cent_equality).toBe(16000);
  });
});

describe("mockNetworkNode", () => {
  test("generates valid network node with defaults", () => {
    const node = mockNetworkNode.build();

    expect(node.node_id).toBe(0);
    expect(node.node_account_id).toBe("0.0.3");
    expect(node.service_endpoints).toHaveLength(0);
  });

  test("accepts custom options", () => {
    const node = mockNetworkNode.build({
      node_id: 5,
      node_account_id: "0.0.10" as const,
      stake: 1000000,
    });

    expect(node.node_id).toBe(5);
    expect(node.node_account_id).toBe("0.0.10");
    expect(node.stake).toBe(1000000);
  });
});

describe("mockNetworkSupply", () => {
  test("generates valid network supply with defaults", () => {
    const supply = mockNetworkSupply.build();

    expect(supply.total_supply).toBe(500000000000);
    expect(supply.released_supply).toBe(50000000000);
  });

  test("accepts custom options", () => {
    const supply = mockNetworkSupply.build({
      totalSupply: 300000000000,
      releasedSupply: 35000000000,
    });

    expect(supply.total_supply).toBe(300000000000);
    expect(supply.released_supply).toBe(35000000000);
  });
});
