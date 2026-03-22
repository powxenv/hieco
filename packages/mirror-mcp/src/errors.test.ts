import { describe, expect, test } from "bun:test";
import {
  LIMITS,
  entityIdRegex,
  evmAddressRegex,
  hex64Regex,
  timestampRegex,
  txIdRegex,
} from "./constants";
import { handleApiResult, MirrorMCPError } from "./errors";

describe("mirror MCP helpers", () => {
  test("returns successful API payloads unchanged", () => {
    expect(handleApiResult({ success: true, data: { id: "0.0.123" } })).toEqual({
      id: "0.0.123",
    });
  });

  test("throws enriched MCP errors for failed API results", () => {
    expect(() =>
      handleApiResult(
        {
          success: false,
          error: {
            _tag: "RateLimitError",
            message: "Too many requests",
            code: "60",
            status: 429,
          },
        },
        "getTopicInfo",
      ),
    ).toThrow(MirrorMCPError);

    expect(() =>
      handleApiResult(
        {
          success: false,
          error: {
            _tag: "RateLimitError",
            message: "Too many requests",
            code: "60",
            status: 429,
          },
        },
        "getTopicInfo",
      ),
    ).toThrow(
      "[getTopicInfo] RateLimitError: Too many requests (HTTP 429) [code: 60] Tip: Wait before retry",
    );
  });

  test("exposes expected validation constants", () => {
    expect(LIMITS).toEqual({
      MIN_LIMIT: 1,
      MAX_LIMIT: 1000,
      DEFAULT_PAGE_LIMIT: 25,
      MAX_NODE_ID: 1000,
    });

    expect(timestampRegex.test("2026-03-23T10:20:30Z")).toBe(true);
    expect(timestampRegex.test("2026/03/23 10:20:30")).toBe(false);
    expect(entityIdRegex.test("0.0.123")).toBe(true);
    expect(entityIdRegex.test("0-0-123")).toBe(false);
    expect(evmAddressRegex.test("0x1234567890abcdef1234567890abcdef12345678")).toBe(true);
    expect(evmAddressRegex.test("1234567890abcdef1234567890abcdef12345678")).toBe(false);
    expect(hex64Regex.test(`0x${"ab".repeat(32)}`)).toBe(true);
    expect(hex64Regex.test("0xabc")).toBe(false);
    expect(txIdRegex.test("0.0.123@1234567890.123456789")).toBe(true);
    expect(txIdRegex.test("0.0.123#1234567890.123456789")).toBe(false);
  });
});
