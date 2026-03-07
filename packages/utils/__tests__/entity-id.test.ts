import { describe, test, expect } from "bun:test";
import {
  isValidEntityId,
  parseEntityId,
  assertEntityId,
  formatEntityId,
  parseEntityIdParts,
  asEntityId,
} from "../src/mirror/entity";
import type { EntityId } from "../src/types/entity";

describe("isValidEntityId", () => {
  describe("happy path - valid formats", () => {
    test("returns true for valid format: 0.0.123", () => {
      expect(isValidEntityId("0.0.123")).toBe(true);
    });

    test("returns true for max boundary: 9999999999.9999999999.9999999999", () => {
      expect(isValidEntityId("9999999999.9999999999.9999999999")).toBe(true);
    });

    test("returns true for single digit parts", () => {
      expect(isValidEntityId("1.2.3")).toBe(true);
    });

    test("returns true for varying length parts", () => {
      expect(isValidEntityId("123.4567.89012")).toBe(true);
    });

    test("returns true for all zeros", () => {
      expect(isValidEntityId("0.0.0")).toBe(true);
    });

    test("returns true for large valid numbers", () => {
      expect(isValidEntityId("999999999.999999999.999999999")).toBe(true);
    });

    test("returns true for real Hedera account IDs", () => {
      expect(isValidEntityId("0.0.1001")).toBe(true);
      expect(isValidEntityId("0.0.1002")).toBe(true);
      expect(isValidEntityId("0.0.1003")).toBe(true);
    });
  });

  describe("null and undefined inputs", () => {
    test("returns false for null", () => {
      expect(isValidEntityId(null as unknown as string)).toBe(false);
    });

    test("returns false for undefined", () => {
      expect(isValidEntityId(undefined as unknown as string)).toBe(false);
    });
  });

  describe("empty and whitespace inputs", () => {
    test("returns false for empty string", () => {
      expect(isValidEntityId("")).toBe(false);
    });

    test("returns false for whitespace only", () => {
      expect(isValidEntityId("   ")).toBe(false);
    });

    test("returns false for tab characters", () => {
      expect(isValidEntityId("\t\t\t")).toBe(false);
    });

    test("returns false for newline characters", () => {
      expect(isValidEntityId("\n\n\n")).toBe(false);
    });

    test("returns false for mixed whitespace", () => {
      expect(isValidEntityId(" \t\n\r")).toBe(false);
    });
  });

  describe("malformed formats", () => {
    test("returns false for missing first part: .0.123", () => {
      expect(isValidEntityId(".0.123")).toBe(false);
    });

    test("returns false for missing middle part: 0..123", () => {
      expect(isValidEntityId("0..123")).toBe(false);
    });

    test("returns false for missing last part: 0.0.", () => {
      expect(isValidEntityId("0.0.")).toBe(false);
    });

    test("returns false for extra parts: 0.0.123.456", () => {
      expect(isValidEntityId("0.0.123.456")).toBe(false);
    });

    test("returns false for missing dots: 0 0 123", () => {
      expect(isValidEntityId("0 0 123")).toBe(false);
    });

    test("returns false for wrong separator: 0-0-123", () => {
      expect(isValidEntityId("0-0-123")).toBe(false);
    });

    test("returns false for comma separator: 0,0,123", () => {
      expect(isValidEntityId("0,0,123")).toBe(false);
    });

    test("returns false for spaces around dots: 0 . 0 . 123", () => {
      expect(isValidEntityId("0 . 0 . 123")).toBe(false);
    });

    test("returns false for trailing dot: 0.0.123.", () => {
      expect(isValidEntityId("0.0.123.")).toBe(false);
    });

    test("returns false for leading dot: .0.0.123", () => {
      expect(isValidEntityId(".0.0.123")).toBe(false);
    });

    test("returns false for dots only: ...", () => {
      expect(isValidEntityId("...")).toBe(false);
    });

    test("returns false for single number", () => {
      expect(isValidEntityId("123")).toBe(false);
    });

    test("returns false for two parts only", () => {
      expect(isValidEntityId("0.123")).toBe(false);
    });
  });

  describe("non-numeric inputs", () => {
    test("returns false for non-numeric parts: a.b.c", () => {
      expect(isValidEntityId("a.b.c")).toBe(false);
    });

    test("returns false for mixed alphanumeric: 0.0.abc", () => {
      expect(isValidEntityId("0.0.abc")).toBe(false);
    });

    test("returns false for hex format: 0x0.0x0.0x123", () => {
      expect(isValidEntityId("0x0.0x0.0x123")).toBe(false);
    });

    test("returns false for scientific notation: 1e1.2e2.3e3", () => {
      expect(isValidEntityId("1e1.2e2.3e3")).toBe(false);
    });

    test("returns false for roman numerals: I.II.III", () => {
      expect(isValidEntityId("I.II.III")).toBe(false);
    });

    test("returns false for words: one.two.three", () => {
      expect(isValidEntityId("one.two.three")).toBe(false);
    });
  });

  describe("negative numbers", () => {
    test("returns false for negative numbers: -1.0.0", () => {
      expect(isValidEntityId("-1.0.0")).toBe(false);
    });

    test("returns false for negative in middle: 0.-1.0", () => {
      expect(isValidEntityId("0.-1.0")).toBe(false);
    });

    test("returns false for negative in last: 0.0.-1", () => {
      expect(isValidEntityId("0.0.-1")).toBe(false);
    });

    test("returns false for all negative: -1.-2.-3", () => {
      expect(isValidEntityId("-1.-2.-3")).toBe(false);
    });
  });

  describe("overflow and boundary violations", () => {
    test("returns false for overflow in first part: 10000000000.0.0", () => {
      expect(isValidEntityId("10000000000.0.0")).toBe(false);
    });

    test("returns false for overflow in second part: 0.10000000000.0", () => {
      expect(isValidEntityId("0.10000000000.0")).toBe(false);
    });

    test("returns false for overflow in third part: 0.0.10000000000", () => {
      expect(isValidEntityId("0.0.10000000000")).toBe(false);
    });

    test("returns false for number with more than 10 digits", () => {
      expect(isValidEntityId("12345678901.0.0")).toBe(false);
      expect(isValidEntityId("0.12345678901.0")).toBe(false);
      expect(isValidEntityId("0.0.12345678901")).toBe(false);
    });

    test("returns false for maximum safe integer overflow", () => {
      const maxSafe = Number.MAX_SAFE_INTEGER.toString();
      const parts = maxSafe.split("");
      expect(isValidEntityId(`${parts.slice(0, 10).join("")}.0.0`)).toBe(true);
      expect(isValidEntityId(`${parts.slice(0, 11).join("")}.0.0`)).toBe(false);
    });
  });

  describe("special characters and malicious inputs", () => {
    test("returns false for SQL injection attempt", () => {
      expect(isValidEntityId("0'; DROP TABLE users; --.0.123")).toBe(false);
    });

    test("returns false for XSS attempt", () => {
      expect(isValidEntityId("<script>.0.123")).toBe(false);
    });

    test("returns false for path traversal attempt", () => {
      const pathTraversal = "../../etc/passwd";
      expect(isValidEntityId(pathTraversal)).toBe(false);
    });

    test("returns false for null byte injection", () => {
      expect(isValidEntityId("0.0\x00.123")).toBe(false);
    });

    test("returns false for emoji in ID", () => {
      expect(isValidEntityId("0.0.\ud83d\ude31")).toBe(false);
    });

    test("returns false for unicode characters", () => {
      expect(isValidEntityId("\u7f51\u7edc.\u9519\u8bef.\u6d4b\u8bd5")).toBe(false);
    });

    test("returns false for right-to-left override", () => {
      expect(isValidEntityId("\u202e0.0.123")).toBe(false);
    });

    test("returns false for zero-width characters", () => {
      expect(isValidEntityId("\u200b0.0.123")).toBe(false);
    });

    test("returns false for control characters", () => {
      expect(isValidEntityId("0.\n0.123")).toBe(false);
      expect(isValidEntityId("0.\r0.123")).toBe(false);
      expect(isValidEntityId("0.\t0.123")).toBe(false);
    });

    test("returns false for special regex characters", () => {
      expect(isValidEntityId("0.*.0.123")).toBe(false);
      expect(isValidEntityId("0.+.0.123")).toBe(false);
      expect(isValidEntityId("0.?.0.123")).toBe(false);
      expect(isValidEntityId("0.^0.123")).toBe(false);
      expect(isValidEntityId("0.$.0.123")).toBe(false);
    });
  });

  describe("decimal and floating point inputs", () => {
    test("returns false for decimal in first part: 1.5.0.0", () => {
      expect(isValidEntityId("1.5.0.0")).toBe(false);
    });

    test("returns false for decimal in second part: 0.2.5.0", () => {
      expect(isValidEntityId("0.2.5.0")).toBe(false);
    });

    test("returns false for decimal in third part: 0.0.3.5", () => {
      expect(isValidEntityId("0.0.3.5")).toBe(false);
    });

    test("returns false for numbers with leading zeros: 01.02.03", () => {
      expect(isValidEntityId("01.02.03")).toBe(true);
    });

    test("returns false for numbers with trailing dot: 0.0.123.", () => {
      expect(isValidEntityId("0.0.123.")).toBe(false);
    });

    test("returns false for exponent notation: 1e2.0.0", () => {
      expect(isValidEntityId("1e2.0.0")).toBe(false);
    });

    test("returns false for infinity: Infinity.0.0", () => {
      expect(isValidEntityId("Infinity.0.0")).toBe(false);
    });

    test("returns false for NaN: NaN.0.0", () => {
      expect(isValidEntityId("NaN.0.0")).toBe(false);
    });
  });

  describe("edge cases with zeros", () => {
    test("returns true for single zero: 0.0.0", () => {
      expect(isValidEntityId("0.0.0")).toBe(true);
    });

    test("returns true for zeros with leading zeros: 00.00.000", () => {
      expect(isValidEntityId("00.00.000")).toBe(true);
    });

    test("returns true for zeros interspersed: 0.000.0", () => {
      expect(isValidEntityId("0.000.0")).toBe(true);
    });

    test("returns false for octal notation: 0o123.0.0", () => {
      expect(isValidEntityId("0o123.0.0")).toBe(false);
    });

    test("returns false for binary notation: 0b101.0.0", () => {
      expect(isValidEntityId("0b101.0.0")).toBe(false);
    });
  });

  describe("contract ID format (account-num)", () => {
    test("returns false for contract format with dash", () => {
      expect(isValidEntityId("0.0.123-456")).toBe(false);
    });

    test("returns false for multiple dashes", () => {
      expect(isValidEntityId("0.0.123-456-789")).toBe(false);
    });
  });

  describe("type narrowing", () => {
    test("type narrowing works correctly for valid ID", () => {
      const value = "0.0.123" as string;
      if (isValidEntityId(value)) {
        const entityId: EntityId = value;
        expect(entityId).toStrictEqual("0.0.123");
      }
    });

    test("type narrowing excludes invalid ID", () => {
      const value = "invalid" as string;
      if (isValidEntityId(value)) {
        const entityId: EntityId = value;
        expect(entityId as unknown as string).toStrictEqual("invalid");
      } else {
        expect(value).toStrictEqual("invalid");
      }
    });
  });
});

describe("parseEntityId", () => {
  describe("happy path - valid inputs", () => {
    test("returns EntityId for valid input", () => {
      const result = parseEntityId("0.0.123");
      expect(result).toStrictEqual("0.0.123");
    });

    test("returns EntityId type for valid input", () => {
      const result = parseEntityId("123.456.789");
      if (result !== null) {
        const entityId: EntityId = result;
        expect(entityId).toStrictEqual("123.456.789");
      }
    });

    test("returns EntityId for max boundary", () => {
      const result = parseEntityId("9999999999.9999999999.9999999999");
      expect(result).toStrictEqual("9999999999.9999999999.9999999999");
    });

    test("returns EntityId for all zeros", () => {
      const result = parseEntityId("0.0.0");
      expect(result).toStrictEqual("0.0.0");
    });
  });

  describe("null and invalid inputs", () => {
    test("returns null for empty string", () => {
      expect(parseEntityId("")).toBeNull();
    });

    test("returns null for invalid format: .0.123", () => {
      expect(parseEntityId(".0.123")).toBeNull();
    });

    test("returns null for invalid format: 0..123", () => {
      expect(parseEntityId("0..123")).toBeNull();
    });

    test("returns null for extra parts: 0.0.123.456", () => {
      expect(parseEntityId("0.0.123.456")).toBeNull();
    });

    test("returns null for non-numeric parts: a.b.c", () => {
      expect(parseEntityId("a.b.c")).toBeNull();
    });

    test("returns null for negative numbers: -1.0.0", () => {
      expect(parseEntityId("-1.0.0")).toBeNull();
    });

    test("returns null for overflow: 10000000000.0.0", () => {
      expect(parseEntityId("10000000000.0.0")).toBeNull();
    });

    test("returns null for null input", () => {
      expect(parseEntityId(null as unknown as string)).toBeNull();
    });

    test("returns null for undefined input", () => {
      expect(parseEntityId(undefined as unknown as string)).toBeNull();
    });
  });

  describe("malicious inputs", () => {
    test("returns null for SQL injection attempt", () => {
      expect(parseEntityId("0'; DROP TABLE users; --.0.123")).toBeNull();
    });

    test("returns null for XSS attempt", () => {
      expect(parseEntityId("<script>.0.123")).toBeNull();
    });

    test("returns null for null byte injection", () => {
      expect(parseEntityId("0.0\x00.123")).toBeNull();
    });

    test("returns null for emoji", () => {
      expect(parseEntityId("0.0.\ud83d\ude31")).toBeNull();
    });

    test("returns null for unicode", () => {
      expect(parseEntityId("\u7f51\u7edc.\u9519\u8bef.\u6d4b\u8bd5")).toBeNull();
    });
  });

  describe("decimal and floating point", () => {
    test("returns null for decimal format: 1.5.0.0", () => {
      expect(parseEntityId("1.5.0.0")).toBeNull();
    });

    test("returns null for scientific notation", () => {
      expect(parseEntityId("1e2.0.0")).toBeNull();
    });

    test("returns null for NaN string", () => {
      expect(parseEntityId("NaN.0.0")).toBeNull();
    });

    test("returns null for Infinity string", () => {
      expect(parseEntityId("Infinity.0.0")).toBeNull();
    });
  });

  describe("type narrowing", () => {
    test("type narrowing works correctly for valid ID", () => {
      const result = parseEntityId("0.0.123");
      if (result !== null) {
        expect(result.startsWith).toBeDefined();
        expect(result.split).toBeDefined();
      }
    });

    test("type narrowing returns null for invalid", () => {
      const result = parseEntityId("invalid");
      expect(result).toBeNull();
    });
  });

  describe("return value guarantees", () => {
    test("returns exact string for valid input", () => {
      const input = "123.456.789";
      const result = parseEntityId(input);
      expect(result).toBe(input);
    });

    test("returns null with same reference", () => {
      expect(parseEntityId("invalid")).toBe(null);
    });
  });
});

describe("assertEntityId", () => {
  describe("happy path - valid inputs", () => {
    test("does not throw for valid EntityId: 0.0.123", () => {
      expect(() => assertEntityId("0.0.123")).not.toThrow();
    });

    test("does not throw for valid EntityId: 123.456.789", () => {
      expect(() => assertEntityId("123.456.789")).not.toThrow();
    });

    test("does not throw for max boundary", () => {
      expect(() => assertEntityId("9999999999.9999999999.9999999999")).not.toThrow();
    });

    test("does not throw for all zeros", () => {
      expect(() => assertEntityId("0.0.0")).not.toThrow();
    });
  });

  describe("error cases - invalid inputs", () => {
    test("throws Error for invalid format: .0.123", () => {
      expect(() => assertEntityId(".0.123")).toThrow("Invalid EntityId format");
    });

    test("throws Error for invalid format: 0..123", () => {
      expect(() => assertEntityId("0..123")).toThrow("Invalid EntityId format");
    });

    test("throws Error for extra parts: 0.0.123.456", () => {
      expect(() => assertEntityId("0.0.123.456")).toThrow("Invalid EntityId format");
    });

    test("throws Error for non-numeric: a.b.c", () => {
      expect(() => assertEntityId("a.b.c")).toThrow("Invalid EntityId format");
    });

    test("throws Error for negative numbers", () => {
      expect(() => assertEntityId("-1.0.0")).toThrow("Invalid EntityId format");
    });

    test("throws Error for overflow", () => {
      expect(() => assertEntityId("10000000000.0.0")).toThrow("Invalid EntityId format");
    });

    test("throws Error for empty string", () => {
      expect(() => assertEntityId("")).toThrow("Invalid EntityId format");
    });

    test("throws Error for null", () => {
      expect(() => assertEntityId(null as unknown as string)).toThrow("Invalid EntityId format");
    });

    test("throws Error for undefined", () => {
      expect(() => assertEntityId(undefined as unknown as string)).toThrow(
        "Invalid EntityId format",
      );
    });
  });

  describe("malicious inputs", () => {
    test("throws Error for SQL injection attempt", () => {
      expect(() => assertEntityId("0'; DROP TABLE users; --.0.123")).toThrow(
        "Invalid EntityId format",
      );
    });

    test("throws Error for XSS attempt", () => {
      expect(() => assertEntityId("<script>.0.123")).toThrow("Invalid EntityId format");
    });

    test("throws Error for null byte injection", () => {
      expect(() => assertEntityId("0.0\x00.123")).toThrow("Invalid EntityId format");
    });

    test("throws Error for emoji", () => {
      expect(() => assertEntityId("0.0.\ud83d\ude31")).toThrow("Invalid EntityId format");
    });
  });

  describe("error message format", () => {
    test("error message includes input value", () => {
      expect(() => assertEntityId("invalid")).toThrow("invalid");
    });

    test("error message includes expected format", () => {
      expect(() => assertEntityId("bad")).toThrow('Expected format: "shard.realm.num"');
    });

    test("error message is descriptive", () => {
      try {
        assertEntityId("not-an-id");
      } catch (e) {
        expect((e as Error).message).toMatch(/Invalid EntityId format/);
        expect((e as Error).message).toMatch(/shard\.realm\.num/);
      }
    });
  });

  describe("error type", () => {
    test("throws Error object", () => {
      try {
        assertEntityId("invalid");
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });

    test("thrown error has stack trace", () => {
      try {
        assertEntityId("invalid");
      } catch (e) {
        expect((e as Error).stack).toBeDefined();
      }
    });
  });

  describe("type narrowing", () => {
    test("type narrowing works correctly after assertion", () => {
      const value = "0.0.123" as string;
      assertEntityId(value);
      const entityId: EntityId = value;
      expect(entityId).toStrictEqual("0.0.123");
    });

    test("assertion creates type guard for subsequent code", () => {
      const value = "999.888.777" as string;
      assertEntityId(value);
      expect(() => {
        const parts = value.split(".");
        expect(parts.length).toStrictEqual(3);
      }).not.toThrow();
    });
  });

  describe("assertion does not modify input", () => {
    test("input string remains unchanged after assertion", () => {
      const input = "123.456.789";
      assertEntityId(input);
      expect(input).toStrictEqual("123.456.789");
    });
  });
});

describe("formatEntityId", () => {
  describe("happy path - valid inputs", () => {
    test("correctly formats 0.0.123", () => {
      expect(formatEntityId(0, 0, 123)).toStrictEqual("0.0.123");
    });

    test("correctly formats larger numbers: 123.456.789", () => {
      expect(formatEntityId(123, 456, 789)).toStrictEqual("123.456.789");
    });

    test("handles zero values", () => {
      expect(formatEntityId(0, 0, 0)).toStrictEqual("0.0.0");
    });

    test("handles max boundary", () => {
      expect(formatEntityId(9999999999, 9999999999, 9999999999)).toStrictEqual(
        "9999999999.9999999999.9999999999",
      );
    });

    test("returns EntityId type", () => {
      const result = formatEntityId(0, 0, 123);
      const entityId: EntityId = result;
      expect(entityId).toStrictEqual("0.0.123");
    });
  });

  describe("negative numbers", () => {
    test("throws for negative shard: -1", () => {
      expect(() => formatEntityId(-1, 0, 0)).toThrow("Invalid EntityId components");
    });

    test("throws for negative realm", () => {
      expect(() => formatEntityId(0, -1, 0)).toThrow("Invalid EntityId components");
    });

    test("throws for negative num", () => {
      expect(() => formatEntityId(0, 0, -1)).toThrow("Invalid EntityId components");
    });

    test("throws for all negative", () => {
      expect(() => formatEntityId(-1, -2, -3)).toThrow("Invalid EntityId components");
    });

    test("handles -0 (negative zero as -0)", () => {
      expect(() => formatEntityId(-0, 0, 0)).not.toThrow();
    });
  });

  describe("overflow and boundary violations", () => {
    test("throws for shard > 9999999999", () => {
      expect(() => formatEntityId(10000000000, 0, 0)).toThrow("Invalid EntityId components");
    });

    test("throws for realm > 9999999999", () => {
      expect(() => formatEntityId(0, 10000000000, 0)).toThrow("Invalid EntityId components");
    });

    test("throws for num > 9999999999", () => {
      expect(() => formatEntityId(0, 0, 10000000000)).toThrow("Invalid EntityId components");
    });

    test("throws for Number.MAX_VALUE", () => {
      expect(() => formatEntityId(Number.MAX_VALUE, 0, 0)).toThrow("Invalid EntityId components");
    });
  });

  describe("non-integer inputs", () => {
    test("throws for non-integer shard: 1.5", () => {
      expect(() => formatEntityId(1.5, 0, 0)).toThrow("Invalid EntityId components");
    });

    test("throws for non-integer realm", () => {
      expect(() => formatEntityId(0, 2.5, 0)).toThrow("Invalid EntityId components");
    });

    test("throws for non-integer num", () => {
      expect(() => formatEntityId(0, 0, 3.5)).toThrow("Invalid EntityId components");
    });

    test("throws for decimal in all parts", () => {
      expect(() => formatEntityId(1.1, 2.2, 3.3)).toThrow("Invalid EntityId components");
    });

    test("throws for NaN shard", () => {
      expect(() => formatEntityId(NaN, 0, 0)).toThrow("Invalid EntityId components");
    });

    test("throws for NaN realm", () => {
      expect(() => formatEntityId(0, NaN, 0)).toThrow("Invalid EntityId components");
    });

    test("throws for NaN num", () => {
      expect(() => formatEntityId(0, 0, NaN)).toThrow("Invalid EntityId components");
    });

    test("throws for Infinity shard", () => {
      expect(() => formatEntityId(Infinity, 0, 0)).toThrow("Invalid EntityId components");
    });

    test("throws for -Infinity shard", () => {
      expect(() => formatEntityId(-Infinity, 0, 0)).toThrow("Invalid EntityId components");
    });
  });

  describe("boundary values", () => {
    test("handles minimum valid value: 0.0.0", () => {
      expect(formatEntityId(0, 0, 0)).toStrictEqual("0.0.0");
    });

    test("handles maximum valid value", () => {
      expect(formatEntityId(9999999999, 9999999999, 9999999999)).toStrictEqual(
        "9999999999.9999999999.9999999999",
      );
    });

    test("handles shard at boundary: 9999999999", () => {
      expect(formatEntityId(9999999999, 0, 0)).toStrictEqual("9999999999.0.0");
    });

    test("handles realm at boundary: 9999999999", () => {
      expect(formatEntityId(0, 9999999999, 0)).toStrictEqual("0.9999999999.0");
    });

    test("handles num at boundary: 9999999999", () => {
      expect(formatEntityId(0, 0, 9999999999)).toStrictEqual("0.0.9999999999");
    });

    test("handles shard at boundary - 1", () => {
      expect(formatEntityId(9999999998, 0, 0)).toStrictEqual("9999999998.0.0");
    });
  });

  describe("special number cases", () => {
    test("throws for Number.MIN_SAFE_INTEGER", () => {
      expect(() => formatEntityId(Number.MIN_SAFE_INTEGER, 0, 0)).toThrow(
        "Invalid EntityId components",
      );
    });

    test("throws for Number.MAX_SAFE_INTEGER (when exceeds 10 digits)", () => {
      const maxSafe = Number.MAX_SAFE_INTEGER;
      expect(() => formatEntityId(maxSafe, 0, 0)).toThrow("Invalid EntityId components");
    });

    test("handles Number.EPSILON (throws as it's decimal)", () => {
      expect(() => formatEntityId(Number.EPSILON, 0, 0)).toThrow("Invalid EntityId components");
    });
  });

  describe("error message includes component values", () => {
    test("error message includes all component values", () => {
      expect(() => formatEntityId(-1, 2, 3)).toThrow("shard=-1");
      expect(() => formatEntityId(0, -2, 3)).toThrow("realm=-2");
      expect(() => formatEntityId(0, 0, -3)).toThrow("num=-3");
    });
  });
});

describe("parseEntityIdParts", () => {
  describe("happy path - valid inputs", () => {
    test("returns tuple [0, 0, 123] for 0.0.123", () => {
      const result = parseEntityIdParts("0.0.123");
      expect(result).toStrictEqual([0, 0, 123]);
    });

    test("returns tuple [123, 456, 789] for larger numbers", () => {
      const result = parseEntityIdParts("123.456.789");
      expect(result).toStrictEqual([123, 456, 789]);
    });

    test("parsed numbers are correct integers", () => {
      const [shard, realm, num] = parseEntityIdParts("999.888.777");
      expect(shard).toStrictEqual(999);
      expect(realm).toStrictEqual(888);
      expect(num).toStrictEqual(777);
    });

    test("handles max boundary", () => {
      const result = parseEntityIdParts("9999999999.9999999999.9999999999");
      expect(result).toStrictEqual([9999999999, 9999999999, 9999999999]);
    });

    test("handles all zeros", () => {
      const result = parseEntityIdParts("0.0.0");
      expect(result).toStrictEqual([0, 0, 0]);
    });

    test("tuple has correct length of 3", () => {
      const result = parseEntityIdParts("1.2.3");
      expect(result).toHaveLength(3);
    });
  });

  describe("error cases - invalid inputs", () => {
    test("throws for invalid EntityId format: .0.123", () => {
      expect(() => parseEntityIdParts(".0.123" as unknown as EntityId)).toThrow(
        "Invalid EntityId format",
      );
    });

    test("throws for invalid EntityId format: 0..123", () => {
      expect(() => parseEntityIdParts("0..123" as unknown as EntityId)).toThrow(
        "Invalid EntityId format",
      );
    });

    test("throws for invalid EntityId format: 0.0.", () => {
      expect(() => parseEntityIdParts("0.0." as unknown as EntityId)).toThrow(
        "Invalid EntityId format",
      );
    });

    test("throws for extra parts: 0.0.123.456", () => {
      expect(() => parseEntityIdParts("0.0.123.456" as unknown as EntityId)).toThrow(
        "Invalid EntityId format",
      );
    });

    test("throws for non-numeric: a.b.c", () => {
      expect(() => parseEntityIdParts("a.b.c" as unknown as EntityId)).toThrow(
        "Invalid EntityId format",
      );
    });

    test("throws for negative numbers", () => {
      expect(() => parseEntityIdParts("-1.0.0" as unknown as EntityId)).toThrow(
        "Invalid EntityId format",
      );
    });

    test("throws for overflow", () => {
      expect(() => parseEntityIdParts("10000000000.0.0" as unknown as EntityId)).toThrow(
        "Invalid EntityId format",
      );
    });

    test("throws for empty string", () => {
      expect(() => parseEntityIdParts("" as unknown as EntityId)).toThrow(
        "Invalid EntityId format",
      );
    });

    test("throws for null", () => {
      expect(() => parseEntityIdParts(null as unknown as EntityId)).toThrow(
        "Invalid EntityId format",
      );
    });

    test("throws for undefined", () => {
      expect(() => parseEntityIdParts(undefined as unknown as EntityId)).toThrow(
        "Invalid EntityId format",
      );
    });
  });

  describe("malicious inputs", () => {
    test("throws for SQL injection attempt", () => {
      expect(() =>
        parseEntityIdParts("0'; DROP TABLE users; --.0.123" as unknown as EntityId),
      ).toThrow("Invalid EntityId format");
    });

    test("throws for XSS attempt", () => {
      expect(() => parseEntityIdParts("<script>.0.123" as unknown as EntityId)).toThrow(
        "Invalid EntityId format",
      );
    });

    test("throws for null byte injection", () => {
      expect(() => parseEntityIdParts("0.0\x00.123" as unknown as EntityId)).toThrow(
        "Invalid EntityId format",
      );
    });

    test("throws for emoji", () => {
      expect(() => parseEntityIdParts("0.0.\ud83d\ude31" as unknown as EntityId)).toThrow(
        "Invalid EntityId format",
      );
    });
  });

  describe("parsed number types", () => {
    test("returns numbers not strings", () => {
      const [shard, realm, num] = parseEntityIdParts("123.456.789");
      expect(typeof shard).toStrictEqual("number");
      expect(typeof realm).toStrictEqual("number");
      expect(typeof num).toStrictEqual("number");
    });

    test("parsed numbers are safe integers", () => {
      const [shard, realm, num] = parseEntityIdParts("123.456.789");
      expect(Number.isSafeInteger(shard)).toBe(true);
      expect(Number.isSafeInteger(realm)).toBe(true);
      expect(Number.isSafeInteger(num)).toBe(true);
    });

    test("parsed numbers are not NaN", () => {
      const [shard, realm, num] = parseEntityIdParts("123.456.789");
      expect(Number.isNaN(shard)).toBe(false);
      expect(Number.isNaN(realm)).toBe(false);
      expect(Number.isNaN(num)).toBe(false);
    });

    test("parsed numbers are finite", () => {
      const [shard, realm, num] = parseEntityIdParts("123.456.789");
      expect(Number.isFinite(shard)).toBe(true);
      expect(Number.isFinite(realm)).toBe(true);
      expect(Number.isFinite(num)).toBe(true);
    });
  });

  describe("error message includes input", () => {
    test("error message includes invalid EntityId", () => {
      try {
        parseEntityIdParts("invalid" as unknown as EntityId);
      } catch (e) {
        expect((e as Error).message).toMatch(/invalid/);
      }
    });
  });
});

describe("asEntityId", () => {
  describe("happy path - type assertion", () => {
    test("returns input as EntityId type (type assertion only)", () => {
      const input = "0.0.123";
      const result = asEntityId(input);
      expect(result).toStrictEqual("0.0.123");
    });

    test("returns same reference as input", () => {
      const input = "123.456.789";
      const result = asEntityId(input);
      expect(result).toBe(input);
    });

    test("type assertion works for valid ID", () => {
      const input = "999.888.777";
      const entityId: EntityId = asEntityId(input);
      expect(entityId).toStrictEqual("999.888.777");
    });
  });

  describe("no validation performed", () => {
    test("performs type assertion without validation", () => {
      const input = "invalid.input" as string;
      const result = asEntityId(input);
      const entityId: EntityId = result;
      expect(entityId as unknown as string).toStrictEqual("invalid.input");
    });

    test("accepts empty string", () => {
      const input = "" as string;
      const result = asEntityId(input);
      expect(result as unknown as string).toStrictEqual("");
    });

    test("accepts malformed EntityId", () => {
      const input = "not-an-entity-id" as string;
      const result = asEntityId(input);
      expect(result as unknown as string).toStrictEqual("not-an-entity-id");
    });

    test("accepts SQL injection attempt", () => {
      const input = "'; DROP TABLE users; --" as string;
      const result = asEntityId(input);
      expect(result as unknown as string).toStrictEqual("'; DROP TABLE users; --");
    });

    test("accepts XSS attempt", () => {
      const input = "<script>alert('xss')</script>" as string;
      const result = asEntityId(input);
      expect(result as unknown as string).toStrictEqual("<script>alert('xss')</script>");
    });

    test("accepts null byte injection", () => {
      const input = "null\x00byte" as string;
      const result = asEntityId(input);
      expect(result as unknown as string).toStrictEqual("null\x00byte");
    });

    test("accepts emoji", () => {
      const input = "\ud83d\ude31\ud83d\udd25\ud83d\udc80" as string;
      const result = asEntityId(input);
      expect(result as unknown as string).toStrictEqual("\ud83d\ude31\ud83d\udd25\ud83d\udc80");
    });

    test("accepts unicode", () => {
      const input = "\u7f51\u7edc\u9519\u8bef\u6d4b\u8bd5" as string;
      const result = asEntityId(input);
      expect(result as unknown as string).toStrictEqual("\u7f51\u7edc\u9519\u8bef\u6d4b\u8bd5");
    });
  });

  describe("special characters", () => {
    test("accepts special characters", () => {
      const input = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~" as string;
      const result = asEntityId(input);
      expect(result as unknown as string).toStrictEqual("!@#$%^&*()_+-=[]{}|;':\",./<>?`~");
    });

    test("accepts newlines and tabs", () => {
      const input = "line1\nline2\ttabbed" as string;
      const result = asEntityId(input);
      expect(result as unknown as string).toStrictEqual("line1\nline2\ttabbed");
    });
  });

  describe("edge cases", () => {
    test("accepts very long string", () => {
      const input = "x".repeat(10000) as string;
      const result = asEntityId(input);
      expect(result as unknown as string).toStrictEqual(input);
    });

    test("accepts string with only dots", () => {
      const input = "..." as string;
      const result = asEntityId(input);
      expect(result as unknown as string).toStrictEqual("...");
    });

    test("accepts contract format with dash", () => {
      const input = "0.0.123-456" as string;
      const result = asEntityId(input);
      expect(result as unknown as string).toStrictEqual("0.0.123-456");
    });
  });

  describe("immutability", () => {
    test("does not modify input string", () => {
      const input = "0.0.123";
      asEntityId(input);
      expect(input).toStrictEqual("0.0.123");
    });

    test("returns original reference", () => {
      const input = "123.456.789";
      const result = asEntityId(input);
      expect(Object.is(result, input)).toBe(true);
    });
  });

  describe("type system behavior", () => {
    test("bypasses type checker validation", () => {
      const definitelyNotAnEntityId = "hello world" as string;
      const entityId: EntityId = asEntityId(definitelyNotAnEntityId);
      expect(entityId as unknown as string).toStrictEqual("hello world");
    });

    test("can be used to satisfy EntityId type requirement", () => {
      function expectsEntityId(id: EntityId): string {
        return id;
      }

      const anyString = "not a real entity id" as string;
      const result = expectsEntityId(asEntityId(anyString));
      expect(result).toStrictEqual("not a real entity id");
    });
  });
});

describe("EntityId type system integration", () => {
  describe("template literal type validation", () => {
    test("valid EntityId matches template literal", () => {
      const validId: EntityId = "0.0.123";
      const pattern = /^\d{1,10}\.\d{1,10}\.\d{1,10}$/;
      expect(pattern.test(validId)).toBe(true);
    });

    test("invalid EntityId does not match template literal", () => {
      const invalidId = "invalid" as unknown as EntityId;
      const pattern = /^\d{1,10}\.\d{1,10}\.\d{1,10}$/;
      expect(pattern.test(invalidId)).toBe(false);
    });
  });

  describe("cross-function compatibility", () => {
    test("formatEntityId output works with isValidEntityId", () => {
      const formatted = formatEntityId(123, 456, 789);
      expect(isValidEntityId(formatted)).toBe(true);
    });

    test("formatEntityId output works with parseEntityId", () => {
      const formatted = formatEntityId(123, 456, 789);
      const parsed = parseEntityId(formatted);
      expect(parsed).toStrictEqual(formatted);
    });

    test("formatEntityId output works with parseEntityIdParts", () => {
      const formatted = formatEntityId(123, 456, 789);
      const parts = parseEntityIdParts(formatted);
      expect(parts).toStrictEqual([123, 456, 789]);
    });

    test("parseEntityId output can be formatted back", () => {
      const entityId = "123.456.789" as EntityId;
      const parts = parseEntityIdParts(entityId);
      const reformatted = formatEntityId(parts[0], parts[1], parts[2]);
      expect(reformatted).toStrictEqual(entityId);
    });
  });

  describe(" Hedera-specific scenarios", () => {
    test("handles system account IDs", () => {
      expect(isValidEntityId("0.0.1")).toBe(true);
      expect(isValidEntityId("0.0.2")).toBe(true);
      expect(isValidEntityId("0.0.3")).toBe(true);
    });

    test("handles treasury account ID", () => {
      expect(isValidEntityId("0.0.98")).toBe(true);
    });

    test("handles fee collection account ID", () => {
      expect(isValidEntityId("0.0.99")).toBe(true);
    });

    test("handles exchange rate account ID", () => {
      expect(isValidEntityId("0.0.100")).toBe(true);
    });

    test("handles API handles account IDs", () => {
      expect(isValidEntityId("0.0.1001")).toBe(true);
      expect(isValidEntityId("0.0.1002")).toBe(true);
      expect(isValidEntityId("0.0.1003")).toBe(true);
    });

    test("handles large shard numbers", () => {
      expect(isValidEntityId("999.0.123")).toBe(true);
      expect(isValidEntityId("9999.0.123")).toBe(true);
    });

    test("handles large realm numbers", () => {
      expect(isValidEntityId("0.999.123")).toBe(true);
      expect(isValidEntityId("0.9999.123")).toBe(true);
    });
  });
});
