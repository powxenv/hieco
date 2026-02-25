import { describe, test, expect } from "bun:test";
import { mockBlock, state } from "../src";

describe("mockBlock", () => {
  test("generates valid block with defaults", () => {
    state.reset();
    const block = mockBlock.build();

    expect(block.number).toBe(0);
    expect(block.hash).toBe("mock-block-hash");
    expect(block.gas_used).toBe(0);
  });

  test("accepts custom options", () => {
    const block = mockBlock.build({
      number: 100,
      hash: "custom-hash",
      gas_used: 5000,
    });

    expect(block.number).toBe(100);
    expect(block.hash).toBe("custom-hash");
    expect(block.gas_used).toBe(5000);
  });

  test("generates sequential blocks", () => {
    state.reset();
    const blocks = mockBlock.buildList(3);

    expect(blocks).toHaveLength(3);
    expect(blocks[0]?.number).toBe(0);
    expect(blocks[1]?.number).toBe(1);
    expect(blocks[2]?.number).toBe(2);
  });
});
