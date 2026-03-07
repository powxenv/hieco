import { describe, expect, test } from "bun:test";
import { isValidEntityId } from "../src/mirror/entity";

describe("isValidEntityId", () => {
  test("accepts well-formed ids", () => {
    expect(isValidEntityId("0.0.123")).toBe(true);
    expect(isValidEntityId("123.456.789")).toBe(true);
    expect(isValidEntityId("9999999999.9999999999.9999999999")).toBe(true);
  });

  test("rejects malformed ids", () => {
    expect(isValidEntityId("")).toBe(false);
    expect(isValidEntityId("0.0")).toBe(false);
    expect(isValidEntityId("0.0.123.456")).toBe(false);
    expect(isValidEntityId("0.0.-1")).toBe(false);
    expect(isValidEntityId("a.b.c")).toBe(false);
    expect(isValidEntityId("10000000000.0.0")).toBe(false);
  });
});
