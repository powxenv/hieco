import { describe, expect, test } from "bun:test";
import BigNumber from "bignumber.js";
import { buildParamsFromAbi, decodeReturn, resolveAbiFunction } from "./abi";

function createReader(
  overrides: Partial<Parameters<typeof decodeReturn>[0]> = {},
): Parameters<typeof decodeReturn>[0] {
  return {
    raw: new Uint8Array([1, 2, 3]),
    getString: () => "hello",
    getBool: () => true,
    getAddress: () => "0x1234",
    getBytes32: () => new Uint8Array(32).fill(7),
    getInt8: () => -8,
    getInt16: () => -16,
    getInt32: () => -32,
    getInt64: () => new BigNumber(-64),
    getInt256: () => new BigNumber(-256),
    getUint8: () => 8,
    getUint16: () => 16,
    getUint32: () => 32,
    getUint64: () => new BigNumber(64),
    getUint256: () => new BigNumber(256),
    ...overrides,
  };
}

describe("contract ABI helpers", () => {
  test("resolves ABI functions by name", () => {
    const abi = {
      functions: [
        { name: "setGreeting", inputs: ["string"] },
        { name: "isReady", outputs: "bool" as const },
      ],
    };

    const result = resolveAbiFunction(abi, "isReady");

    expect(result.ok).toBe(true);
    if (!result.ok) {
      throw new Error("Expected ABI lookup to succeed");
    }
    expect(result.value).toEqual({ name: "isReady", outputs: "bool" });
  });

  test("returns a typed error when the ABI function is missing", () => {
    const result = resolveAbiFunction({ functions: [] }, "missing");

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Expected ABI lookup to fail");
    }
    expect(result.error.code).toBe("CONTRACT_ARGUMENT_MISMATCH");
    expect(result.error.message).toContain("Function not found in ABI");
  });

  test("builds function params from ABI inputs", () => {
    const result = buildParamsFromAbi(
      {
        name: "transfer",
        inputs: ["address", "uint256"],
      },
      ["0x1234", 10n],
    );

    expect(result).toEqual({
      ok: true,
      value: {
        types: ["address", "uint256"],
        values: ["0x1234", 10n],
      },
    });
  });

  test("rejects ABI params when the argument count does not match", () => {
    const result = buildParamsFromAbi(
      {
        name: "transfer",
        inputs: ["address", "uint256"],
      },
      ["0x1234"],
    );

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Expected ABI param build to fail");
    }
    expect(result.error.message).toContain("Expected 2 arguments but got 1");
  });

  test("decodes supported return types", () => {
    expect(decodeReturn(createReader(), "string")).toEqual({ ok: true, value: "hello" });
    expect(decodeReturn(createReader(), "bool")).toEqual({ ok: true, value: true });
    expect(decodeReturn(createReader(), "bytes")).toEqual({
      ok: true,
      value: new Uint8Array([1, 2, 3]),
    });

    const uint64 = decodeReturn(createReader(), "uint64");

    expect(uint64.ok).toBe(true);
    if (!uint64.ok) {
      throw new Error("Expected uint64 decode to succeed");
    }
    expect(uint64.value).toBeInstanceOf(BigNumber);
    if (!(uint64.value instanceof BigNumber)) {
      throw new Error("Expected uint64 value to be a BigNumber");
    }
    expect(uint64.value.toString()).toBe("64");
  });

  test("returns a contract mismatch error when decoding throws", () => {
    const result = decodeReturn(
      createReader({
        getString: () => {
          throw new Error("bad string payload");
        },
      }),
      "string",
    );

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Expected decode to fail");
    }
    expect(result.error.code).toBe("CONTRACT_ARGUMENT_MISMATCH");
    expect(result.error.message).toBe("bad string payload");
  });
});
