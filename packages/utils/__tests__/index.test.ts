import { describe, test, expect } from "bun:test";
import { ApiErrorFactory, NETWORK_CONFIGS } from "../src";

describe("ApiErrorFactory.network", () => {
  describe("happy path", () => {
    test("creates error with correct _tag: NetworkError", () => {
      const error = ApiErrorFactory.network("Network request failed");
      expect(error._tag).toStrictEqual("NetworkError");
    });

    test("includes message parameter", () => {
      const error = ApiErrorFactory.network("Connection timeout");
      expect(error.message).toStrictEqual("Connection timeout");
    });

    test("handles optional status parameter", () => {
      const errorWithStatus = ApiErrorFactory.network("Service unavailable", 503);
      expect(errorWithStatus.status).toStrictEqual(503);

      const errorWithoutStatus = ApiErrorFactory.network("Network error");
      expect(errorWithoutStatus.status).toBeUndefined();
    });

    test("returns correct object structure", () => {
      const error = ApiErrorFactory.network("Network error", 500);
      expect(error).toStrictEqual({
        _tag: "NetworkError",
        message: "Network error",
        status: 500,
      });
    });
  });

  describe("edge cases and malicious inputs", () => {
    test("handles empty string message", () => {
      const error = ApiErrorFactory.network("");
      expect(error.message).toStrictEqual("");
      expect(error._tag).toStrictEqual("NetworkError");
    });

    test("handles very long message", () => {
      const longMessage = "x".repeat(10000);
      const error = ApiErrorFactory.network(longMessage);
      expect(error.message).toStrictEqual(longMessage);
    });

    test("handles message with newlines", () => {
      const error = ApiErrorFactory.network("Error\non\nmultiple\nlines");
      expect(error.message).toStrictEqual("Error\non\nmultiple\nlines");
    });

    test("handles message with emoji", () => {
      const error = ApiErrorFactory.network("Network failed 🔥💥");
      expect(error.message).toStrictEqual("Network failed 🔥💥");
    });

    test("handles SQL injection attempt", () => {
      const error = ApiErrorFactory.network("'; DROP TABLE users; --");
      expect(error.message).toStrictEqual("'; DROP TABLE users; --");
    });

    test("handles XSS attempt", () => {
      const error = ApiErrorFactory.network("<script>alert('xss')</script>");
      expect(error.message).toStrictEqual("<script>alert('xss')</script>");
    });

    test("handles null bytes", () => {
      const error = ApiErrorFactory.network("error\x00with\x00nulls");
      expect(error.message).toStrictEqual("error\x00with\x00nulls");
    });

    test("handles status 0", () => {
      const error = ApiErrorFactory.network("Network error", 0);
      expect(error.status).toStrictEqual(0);
    });

    test("handles negative status code", () => {
      const error = ApiErrorFactory.network("Network error", -1);
      expect(error.status).toStrictEqual(-1);
    });

    test("handles very large status code", () => {
      const error = ApiErrorFactory.network("Network error", 999999);
      expect(error.status).toStrictEqual(999999);
    });

    test("handles special characters in message", () => {
      const specialChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~";
      const error = ApiErrorFactory.network(specialChars);
      expect(error.message).toStrictEqual(specialChars);
    });

    test("handles unicode characters", () => {
      const error = ApiErrorFactory.network("网络错误 エラー 네트워크 오류");
      expect(error.message).toStrictEqual("网络错误 エラー 네트워크 오류");
    });

    test("handles right-to-left text", () => {
      const error = ApiErrorFactory.network("שגיאה ברשת");
      expect(error.message).toStrictEqual("שגיאה ברשת");
    });
  });

  describe("boundary values", () => {
    test("handles minimum valid HTTP status (100)", () => {
      const error = ApiErrorFactory.network("Continue", 100);
      expect(error.status).toStrictEqual(100);
    });

    test("handles maximum valid HTTP status (599)", () => {
      const error = ApiErrorFactory.network("Network Error", 599);
      expect(error.status).toStrictEqual(599);
    });

    test("handles HTTP 200 OK", () => {
      const error = ApiErrorFactory.network("Error", 200);
      expect(error.status).toStrictEqual(200);
    });

    test("handles HTTP 301 Moved Permanently", () => {
      const error = ApiErrorFactory.network("Error", 301);
      expect(error.status).toStrictEqual(301);
    });

    test("handles HTTP 302 Found", () => {
      const error = ApiErrorFactory.network("Error", 302);
      expect(error.status).toStrictEqual(302);
    });

    test("handles HTTP 400 Bad Request", () => {
      const error = ApiErrorFactory.network("Error", 400);
      expect(error.status).toStrictEqual(400);
    });

    test("handles HTTP 401 Unauthorized", () => {
      const error = ApiErrorFactory.network("Error", 401);
      expect(error.status).toStrictEqual(401);
    });

    test("handles HTTP 403 Forbidden", () => {
      const error = ApiErrorFactory.network("Error", 403);
      expect(error.status).toStrictEqual(403);
    });

    test("handles HTTP 404 Not Found", () => {
      const error = ApiErrorFactory.network("Error", 404);
      expect(error.status).toStrictEqual(404);
    });

    test("handles HTTP 500 Internal Server Error", () => {
      const error = ApiErrorFactory.network("Error", 500);
      expect(error.status).toStrictEqual(500);
    });

    test("handles HTTP 502 Bad Gateway", () => {
      const error = ApiErrorFactory.network("Error", 502);
      expect(error.status).toStrictEqual(502);
    });

    test("handles HTTP 503 Service Unavailable", () => {
      const error = ApiErrorFactory.network("Error", 503);
      expect(error.status).toStrictEqual(503);
    });

    test("handles HTTP 504 Gateway Timeout", () => {
      const error = ApiErrorFactory.network("Error", 504);
      expect(error.status).toStrictEqual(504);
    });
  });
});

describe("ApiErrorFactory.validation", () => {
  describe("happy path", () => {
    test("creates error with correct _tag: ValidationError", () => {
      const error = ApiErrorFactory.validation("Invalid input");
      expect(error._tag).toStrictEqual("ValidationError");
    });

    test("includes message parameter", () => {
      const error = ApiErrorFactory.validation("Invalid entity ID format");
      expect(error.message).toStrictEqual("Invalid entity ID format");
    });

    test("handles optional code parameter", () => {
      const errorWithCode = ApiErrorFactory.validation("Validation failed", "INVALID_FORMAT");
      expect(errorWithCode.code).toStrictEqual("INVALID_FORMAT");

      const errorWithoutCode = ApiErrorFactory.validation("Validation failed");
      expect(errorWithoutCode.code).toBeUndefined();
    });
  });

  describe("edge cases and malicious inputs", () => {
    test("handles empty string message", () => {
      const error = ApiErrorFactory.validation("");
      expect(error.message).toStrictEqual("");
      expect(error._tag).toStrictEqual("ValidationError");
    });

    test("handles empty string code", () => {
      const error = ApiErrorFactory.validation("Error", "");
      expect(error.code).toStrictEqual("");
    });

    test("handles very long code string", () => {
      const longCode = "A".repeat(1000);
      const error = ApiErrorFactory.validation("Error", longCode);
      expect(error.code).toStrictEqual(longCode);
    });

    test("handles code with special characters", () => {
      const specialCode = "ERR_!@#$%^&*()";
      const error = ApiErrorFactory.validation("Error", specialCode);
      expect(error.code).toStrictEqual(specialCode);
    });

    test("handles code with spaces", () => {
      const error = ApiErrorFactory.validation("Error", "INVALID FORMAT CODE");
      expect(error.code).toStrictEqual("INVALID FORMAT CODE");
    });

    test("handles message with emoji", () => {
      const error = ApiErrorFactory.validation("Invalid emoji 😱");
      expect(error.message).toStrictEqual("Invalid emoji 😱");
    });

    test("handles code with unicode", () => {
      const error = ApiErrorFactory.validation("Error", "エラー_ERR_コード");
      expect(error.code).toStrictEqual("エラー_ERR_コード");
    });
  });

  describe("Hedera-specific validation codes", () => {
    test("handles INVALID_ENTITY_ID format", () => {
      const error = ApiErrorFactory.validation("Invalid string", "INVALID_ENTITY_ID");
      expect(error.code).toStrictEqual("INVALID_ENTITY_ID");
    });

    test("handles INVALID_TIMESTAMP format", () => {
      const error = ApiErrorFactory.validation("Invalid timestamp", "INVALID_TIMESTAMP");
      expect(error.code).toStrictEqual("INVALID_TIMESTAMP");
    });

    test("handles INVALID_TRANSACTION_ID format", () => {
      const error = ApiErrorFactory.validation("Invalid transaction ID", "INVALID_TRANSACTION_ID");
      expect(error.code).toStrictEqual("INVALID_TRANSACTION_ID");
    });
  });
});

describe("ApiErrorFactory.notFound", () => {
  describe("happy path", () => {
    test("creates error with correct _tag: NotFoundError", () => {
      const error = ApiErrorFactory.notFound("Resource not found");
      expect(error._tag).toStrictEqual("NotFoundError");
    });

    test("includes message parameter", () => {
      const error = ApiErrorFactory.notFound("Account 0.0.123 not found");
      expect(error.message).toStrictEqual("Account 0.0.123 not found");
    });
  });

  describe("edge cases and malicious inputs", () => {
    test("handles empty string message", () => {
      const error = ApiErrorFactory.notFound("");
      expect(error.message).toStrictEqual("");
      expect(error._tag).toStrictEqual("NotFoundError");
    });

    test("handles message with string format", () => {
      const error = ApiErrorFactory.notFound("Contract 0.0.456-789 not found");
      expect(error.message).toStrictEqual("Contract 0.0.456-789 not found");
    });

    test("handles message with special characters", () => {
      const error = ApiErrorFactory.notFound("Resource 'test@domain.com' not found!");
      expect(error.message).toStrictEqual("Resource 'test@domain.com' not found!");
    });

    test("handles message with emoji", () => {
      const error = ApiErrorFactory.notFound("Not found 🕵️‍♀️");
      expect(error.message).toStrictEqual("Not found 🕵️‍♀️");
    });
  });

  describe("object structure", () => {
    test("has only expected properties", () => {
      const error = ApiErrorFactory.notFound("test");
      const keys = Object.keys(error);
      expect(keys).toStrictEqual(["_tag", "message"]);
    });

    test("does not have status property", () => {
      const error = ApiErrorFactory.notFound("test");
      expect("status" in error).toBe(false);
    });

    test("does not have code property", () => {
      const error = ApiErrorFactory.notFound("test");
      expect("code" in error).toBe(false);
    });
  });
});

describe("ApiErrorFactory.rateLimit", () => {
  describe("happy path", () => {
    test("creates error with correct _tag: RateLimitError", () => {
      const error = ApiErrorFactory.rateLimit("Too many requests");
      expect(error._tag).toStrictEqual("RateLimitError");
    });

    test("includes message parameter", () => {
      const error = ApiErrorFactory.rateLimit("Rate limit exceeded");
      expect(error.message).toStrictEqual("Rate limit exceeded");
    });

    test("converts retryAfter number to code string", () => {
      const error = ApiErrorFactory.rateLimit("Retry later", 60);
      expect(error.code).toStrictEqual("60");
    });

    test("handles missing retryAfter parameter", () => {
      const error = ApiErrorFactory.rateLimit("Rate limited");
      expect(error.code).toBeUndefined();
    });
  });

  describe("edge cases and malicious inputs", () => {
    test("handles retryAfter of 0", () => {
      const error = ApiErrorFactory.rateLimit("Rate limited", 0);
      expect(error.code).toStrictEqual("0");
    });

    test("handles very large retryAfter", () => {
      const error = ApiErrorFactory.rateLimit("Rate limited", 86400);
      expect(error.code).toStrictEqual("86400");
    });

    test("handles negative retryAfter", () => {
      const error = ApiErrorFactory.rateLimit("Rate limited", -1);
      expect(error.code).toStrictEqual("-1");
    });

    test("handles decimal retryAfter", () => {
      const error = ApiErrorFactory.rateLimit("Rate limited", 30.5);
      expect(error.code).toStrictEqual("30.5");
    });

    test("handles empty string message", () => {
      const error = ApiErrorFactory.rateLimit("");
      expect(error.message).toStrictEqual("");
    });

    test("handles message with emoji", () => {
      const error = ApiErrorFactory.rateLimit("Too many requests 🚦");
      expect(error.message).toStrictEqual("Too many requests 🚦");
    });
  });

  describe("rate limit boundary values", () => {
    test("handles 1 second retry", () => {
      const error = ApiErrorFactory.rateLimit("Retry", 1);
      expect(error.code).toStrictEqual("1");
    });

    test("handles 5 second retry interval", () => {
      const error = ApiErrorFactory.rateLimit("Retry", 5);
      expect(error.code).toStrictEqual("5");
    });

    test("handles 10 second retry interval", () => {
      const error = ApiErrorFactory.rateLimit("Retry", 10);
      expect(error.code).toStrictEqual("10");
    });

    test("handles 15 second retry interval", () => {
      const error = ApiErrorFactory.rateLimit("Retry", 15);
      expect(error.code).toStrictEqual("15");
    });

    test("handles 30 second retry interval", () => {
      const error = ApiErrorFactory.rateLimit("Retry", 30);
      expect(error.code).toStrictEqual("30");
    });

    test("handles 60 second retry interval", () => {
      const error = ApiErrorFactory.rateLimit("Retry", 60);
      expect(error.code).toStrictEqual("60");
    });

    test("handles 120 second retry interval", () => {
      const error = ApiErrorFactory.rateLimit("Retry", 120);
      expect(error.code).toStrictEqual("120");
    });

    test("handles 300 second retry interval", () => {
      const error = ApiErrorFactory.rateLimit("Retry", 300);
      expect(error.code).toStrictEqual("300");
    });

    test("handles 600 second retry interval", () => {
      const error = ApiErrorFactory.rateLimit("Retry", 600);
      expect(error.code).toStrictEqual("600");
    });

    test("handles 3600 second retry interval", () => {
      const error = ApiErrorFactory.rateLimit("Retry", 3600);
      expect(error.code).toStrictEqual("3600");
    });

    test("handles maximum retry value (24 hours)", () => {
      const error = ApiErrorFactory.rateLimit("Retry", 86400);
      expect(error.code).toStrictEqual("86400");
    });
  });
});

describe("ApiErrorFactory.unknown", () => {
  describe("happy path", () => {
    test("creates error with correct _tag: UnknownError", () => {
      const error = ApiErrorFactory.unknown("Unknown error occurred");
      expect(error._tag).toStrictEqual("UnknownError");
    });

    test("includes message parameter", () => {
      const error = ApiErrorFactory.unknown("Unexpected error");
      expect(error.message).toStrictEqual("Unexpected error");
    });

    test("handles optional code parameter", () => {
      const errorWithCode = ApiErrorFactory.unknown("Unknown error", "ERR_UNKNOWN");
      expect(errorWithCode.code).toStrictEqual("ERR_UNKNOWN");

      const errorWithoutCode = ApiErrorFactory.unknown("Unknown error");
      expect(errorWithoutCode.code).toBeUndefined();
    });
  });

  describe("edge cases and malicious inputs", () => {
    test("handles empty string message", () => {
      const error = ApiErrorFactory.unknown("");
      expect(error.message).toStrictEqual("");
      expect(error._tag).toStrictEqual("UnknownError");
    });

    test("handles message with stack trace format", () => {
      const stackMessage = "Error at Context\n    at file.js:123:45";
      const error = ApiErrorFactory.unknown(stackMessage);
      expect(error.message).toStrictEqual(stackMessage);
    });

    test("handles message with JSON", () => {
      const jsonMessage = '{"error":"internal","code":500}';
      const error = ApiErrorFactory.unknown(jsonMessage);
      expect(error.message).toStrictEqual(jsonMessage);
    });

    test("handles very long error codes", () => {
      const longCode = "E".repeat(500);
      const error = ApiErrorFactory.unknown("Error", longCode);
      expect(error.code).toStrictEqual(longCode);
    });

    test("handles code with UUID format", () => {
      const uuidCode = "550e8400-e29b-41d4-a716-446655440000";
      const error = ApiErrorFactory.unknown("Error", uuidCode);
      expect(error.code).toStrictEqual(uuidCode);
    });
  });
});

describe("NETWORK_CONFIGS constant", () => {
  describe("structure verification", () => {
    test("contains all three network types", () => {
      expect(NETWORK_CONFIGS).toHaveProperty("mainnet");
      expect(NETWORK_CONFIGS).toHaveProperty("testnet");
      expect(NETWORK_CONFIGS).toHaveProperty("previewnet");
    });

    test("has exactly three network types", () => {
      const keys = Object.keys(NETWORK_CONFIGS);
      expect(keys).toStrictEqual(["mainnet", "testnet", "previewnet"]);
    });

    test("has correct mirrorNode URLs", () => {
      expect(NETWORK_CONFIGS.mainnet.mirrorNode).toStrictEqual(
        "https://mainnet.mirrornode.hedera.com",
      );
      expect(NETWORK_CONFIGS.testnet.mirrorNode).toStrictEqual(
        "https://testnet.mirrornode.hedera.com",
      );
      expect(NETWORK_CONFIGS.previewnet.mirrorNode).toStrictEqual(
        "https://previewnet.mirrornode.hedera.com",
      );
    });

    test("returns config objects with correct structure", () => {
      expect(NETWORK_CONFIGS.mainnet).toHaveProperty("mirrorNode");
      expect(NETWORK_CONFIGS.testnet).toHaveProperty("mirrorNode");
      expect(NETWORK_CONFIGS.previewnet).toHaveProperty("mirrorNode");
    });

    test("mainnet config has only mirrorNode property", () => {
      const keys = Object.keys(NETWORK_CONFIGS.mainnet);
      expect(keys).toStrictEqual(["mirrorNode"]);
    });

    test("testnet config has only mirrorNode property", () => {
      const keys = Object.keys(NETWORK_CONFIGS.testnet);
      expect(keys).toStrictEqual(["mirrorNode"]);
    });

    test("previewnet config has only mirrorNode property", () => {
      const keys = Object.keys(NETWORK_CONFIGS.previewnet);
      expect(keys).toStrictEqual(["mirrorNode"]);
    });
  });

  describe("URL format validation", () => {
    test("mainnet URL uses HTTPS protocol", () => {
      expect(NETWORK_CONFIGS.mainnet.mirrorNode).toMatch(/^https:\/\//);
    });

    test("testnet URL uses HTTPS protocol", () => {
      expect(NETWORK_CONFIGS.testnet.mirrorNode).toMatch(/^https:\/\//);
    });

    test("previewnet URL uses HTTPS protocol", () => {
      expect(NETWORK_CONFIGS.previewnet.mirrorNode).toMatch(/^https:\/\//);
    });

    test("mainnet URL points to valid domain", () => {
      const url = new URL(NETWORK_CONFIGS.mainnet.mirrorNode);
      expect(url.hostname).toStrictEqual("mainnet.mirrornode.hedera.com");
    });

    test("testnet URL points to valid domain", () => {
      const url = new URL(NETWORK_CONFIGS.testnet.mirrorNode);
      expect(url.hostname).toStrictEqual("testnet.mirrornode.hedera.com");
    });

    test("previewnet URL points to valid domain", () => {
      const url = new URL(NETWORK_CONFIGS.previewnet.mirrorNode);
      expect(url.hostname).toStrictEqual("previewnet.mirrornode.hedera.com");
    });

    test("mainnet URL has no trailing slash", () => {
      expect(NETWORK_CONFIGS.mainnet.mirrorNode).not.toMatch(/\/$/);
    });

    test("testnet URL has no trailing slash", () => {
      expect(NETWORK_CONFIGS.testnet.mirrorNode).not.toMatch(/\/$/);
    });

    test("previewnet URL has no trailing slash", () => {
      expect(NETWORK_CONFIGS.previewnet.mirrorNode).not.toMatch(/\/$/);
    });

    test("mainnet URL uses standard HTTPS port", () => {
      const url = new URL(NETWORK_CONFIGS.mainnet.mirrorNode);
      expect(url.port).toStrictEqual("");
    });

    test("testnet URL uses standard HTTPS port", () => {
      const url = new URL(NETWORK_CONFIGS.testnet.mirrorNode);
      expect(url.port).toStrictEqual("");
    });

    test("previewnet URL uses standard HTTPS port", () => {
      const url = new URL(NETWORK_CONFIGS.previewnet.mirrorNode);
      expect(url.port).toStrictEqual("");
    });
  });

  describe("type safety", () => {
    test("can be used as Record with NetworkType keys", () => {
      const mainnetConfig = NETWORK_CONFIGS.mainnet;
      expect(mainnetConfig).toBeDefined();
      expect(mainnetConfig.mirrorNode).toBeDefined();
    });

    test("preserves readonly nature at type level", () => {
      const config: typeof NETWORK_CONFIGS = NETWORK_CONFIGS;
      expect(config).toBe(NETWORK_CONFIGS);
    });
  });
});

describe("ApiError cross-type compatibility", () => {
  test("all error types have same structure base", () => {
    const networkError = ApiErrorFactory.network("test");
    const validationError = ApiErrorFactory.validation("test");
    const notFoundError = ApiErrorFactory.notFound("test");
    const rateLimitError = ApiErrorFactory.rateLimit("test");
    const unknownError = ApiErrorFactory.unknown("test");

    expect(networkError).toHaveProperty("_tag");
    expect(networkError).toHaveProperty("message");

    expect(validationError).toHaveProperty("_tag");
    expect(validationError).toHaveProperty("message");

    expect(notFoundError).toHaveProperty("_tag");
    expect(notFoundError).toHaveProperty("message");

    expect(rateLimitError).toHaveProperty("_tag");
    expect(rateLimitError).toHaveProperty("message");

    expect(unknownError).toHaveProperty("_tag");
    expect(unknownError).toHaveProperty("message");
  });

  test("all error _tag values are distinct", () => {
    const errors = [
      ApiErrorFactory.network("test"),
      ApiErrorFactory.validation("test"),
      ApiErrorFactory.notFound("test"),
      ApiErrorFactory.rateLimit("test"),
      ApiErrorFactory.unknown("test"),
    ];

    const tags = errors.map((e) => e._tag);
    const uniqueTags = new Set(tags);
    expect(uniqueTags.size).toStrictEqual(5);
  });
});

describe("error serialization", () => {
  test("network error serializes correctly", () => {
    const error = ApiErrorFactory.network("test", 500);
    const serialized = JSON.stringify(error);
    const parsed = JSON.parse(serialized);
    expect(parsed).toStrictEqual({
      _tag: "NetworkError",
      message: "test",
      status: 500,
    });
  });

  test("validation error serializes correctly", () => {
    const error = ApiErrorFactory.validation("test", "CODE");
    const serialized = JSON.stringify(error);
    const parsed = JSON.parse(serialized);
    expect(parsed).toStrictEqual({
      _tag: "ValidationError",
      message: "test",
      code: "CODE",
    });
  });

  test("notFound error serializes correctly", () => {
    const error = ApiErrorFactory.notFound("test");
    const serialized = JSON.stringify(error);
    const parsed = JSON.parse(serialized);
    expect(parsed).toStrictEqual({
      _tag: "NotFoundError",
      message: "test",
    });
  });

  test("rateLimit error serializes correctly", () => {
    const error = ApiErrorFactory.rateLimit("test", 60);
    const serialized = JSON.stringify(error);
    const parsed = JSON.parse(serialized);
    expect(parsed).toStrictEqual({
      _tag: "RateLimitError",
      message: "test",
      code: "60",
    });
  });

  test("unknown error serializes correctly", () => {
    const error = ApiErrorFactory.unknown("test", "CODE");
    const serialized = JSON.stringify(error);
    const parsed = JSON.parse(serialized);
    expect(parsed).toStrictEqual({
      _tag: "UnknownError",
      message: "test",
      code: "CODE",
    });
  });
});
