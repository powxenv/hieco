import { describe, test, expect } from "bun:test";
import {
  isSuccess,
  isApiError,
  isNetworkError,
  isNotFoundError,
  isRateLimitError,
  isValidationError,
} from "../src/mirror/guards";
import type { ApiResult, ApiError } from "../src/types/api";

describe("isSuccess", () => {
  const successResult: ApiResult<string> = { success: true, data: "test data" };
  const errorResult: ApiResult<string, ApiError> = {
    success: false,
    error: { _tag: "NetworkError", message: "Network error" },
  };

  describe("happy path", () => {
    test("returns true for success result", () => {
      expect(isSuccess(successResult)).toBe(true);
    });

    test("returns false for error result", () => {
      expect(isSuccess(errorResult)).toBe(false);
    });
  });

  describe("type narrowing - data access", () => {
    test("type narrowing works: data accessible when true", () => {
      const result: ApiResult<string> = { success: true, data: "value" };
      if (isSuccess(result)) {
        expect(() => result.data.toUpperCase()).not.toThrow();
        const data: string = result.data;
        expect(data).toStrictEqual("value");
      }
    });

    test("type narrowing works: error not accessible in success branch", () => {
      const result: ApiResult<string> = { success: true, data: "value" };
      if (isSuccess(result)) {
        expect("error" in result).toBe(false);
      }
    });

    test("type narrowing works: error accessible when false", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "NetworkError", message: "Error" },
      };
      if (!isSuccess(result)) {
        expect(() => result.error._tag).not.toThrow();
        const error: ApiError = result.error;
        expect(error._tag).toStrictEqual("NetworkError");
      }
    });
  });

  describe("different data types", () => {
    test("handles success with string data", () => {
      const strResult: ApiResult<string> = { success: true, data: "string value" };
      expect(isSuccess(strResult)).toBe(true);
      if (isSuccess(strResult)) {
        const data = strResult.data;
        expect(data.toUpperCase()).toStrictEqual("STRING VALUE");
      }
    });

    test("handles success with number data", () => {
      const numResult: ApiResult<number> = { success: true, data: 42 };
      expect(isSuccess(numResult)).toBe(true);
      if (isSuccess(numResult)) {
        const data = numResult.data;
        expect(data + 10).toStrictEqual(52);
      }
    });

    test("handles success with boolean data", () => {
      const boolResult: ApiResult<boolean> = { success: true, data: true };
      expect(isSuccess(boolResult)).toBe(true);
      if (isSuccess(boolResult)) {
        expect(!boolResult.data).toBe(false);
      }
    });

    test("handles success with null data", () => {
      const nullResult: ApiResult<null> = { success: true, data: null };
      expect(isSuccess(nullResult)).toBe(true);
      if (isSuccess(nullResult)) {
        expect(nullResult.data).toBeNull();
      }
    });

    test("handles success with object data", () => {
      const objResult: ApiResult<{ id: string }> = { success: true, data: { id: "123" } };
      expect(isSuccess(objResult)).toBe(true);
      if (isSuccess(objResult)) {
        const data = objResult.data;
        expect(data.id).toStrictEqual("123");
      }
    });

    test("handles success with array data", () => {
      const arrResult: ApiResult<number[]> = { success: true, data: [1, 2, 3] };
      expect(isSuccess(arrResult)).toBe(true);
      if (isSuccess(arrResult)) {
        const data = arrResult.data;
        expect(data.length).toStrictEqual(3);
      }
    });

    test("handles success with nested object data", () => {
      type NestedData = { user: { name: string; age: number } };
      const nestedResult: ApiResult<NestedData> = {
        success: true,
        data: { user: { name: "Alice", age: 30 } },
      };
      expect(isSuccess(nestedResult)).toBe(true);
      if (isSuccess(nestedResult)) {
        const data = nestedResult.data;
        expect(data.user.name).toStrictEqual("Alice");
      }
    });
  });

  describe("edge cases", () => {
    test("handles success with empty string data", () => {
      const emptyResult: ApiResult<string> = { success: true, data: "" };
      expect(isSuccess(emptyResult)).toBe(true);
    });

    test("handles success with zero number data", () => {
      const zeroResult: ApiResult<number> = { success: true, data: 0 };
      expect(isSuccess(zeroResult)).toBe(true);
    });

    test("handles success with false boolean data", () => {
      const falseResult: ApiResult<boolean> = { success: true, data: false };
      expect(isSuccess(falseResult)).toBe(true);
    });

    test("handles success with empty array data", () => {
      const emptyArrResult: ApiResult<[]> = { success: true, data: [] };
      expect(isSuccess(emptyArrResult)).toBe(true);
    });

    test("handles success with empty object data", () => {
      const emptyObjResult: ApiResult<{}> = { success: true, data: {} };
      expect(isSuccess(emptyObjResult)).toBe(true);
    });

    test("handles success with undefined data (as void)", () => {
      const voidResult: ApiResult<void> = { success: true, data: undefined };
      expect(isSuccess(voidResult)).toBe(true);
      if (isSuccess(voidResult)) {
        expect(voidResult.data).toBeUndefined();
      }
    });
  });

  describe("all error types", () => {
    test("returns false for NetworkError", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "NetworkError", message: "Failed" },
      };
      expect(isSuccess(result)).toBe(false);
    });

    test("returns false for ValidationError", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "ValidationError", message: "Invalid" },
      };
      expect(isSuccess(result)).toBe(false);
    });

    test("returns false for NotFoundError", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "NotFoundError", message: "Not found" },
      };
      expect(isSuccess(result)).toBe(false);
    });

    test("returns false for RateLimitError", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "RateLimitError", message: "Rate limited" },
      };
      expect(isSuccess(result)).toBe(false);
    });

    test("returns false for UnknownError", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "UnknownError", message: "Unknown" },
      };
      expect(isSuccess(result)).toBe(false);
    });
  });
});

describe("isApiError", () => {
  const successResult: ApiResult<string> = { success: true, data: "test" };
  const errorResult: ApiResult<string, ApiError> = {
    success: false,
    error: { _tag: "ValidationError", message: "Invalid input" },
  };

  describe("happy path", () => {
    test("returns true for error result", () => {
      expect(isApiError(errorResult)).toBe(true);
    });

    test("returns false for success result", () => {
      expect(isApiError(successResult)).toBe(false);
    });
  });

  describe("type narrowing - error access", () => {
    test("type narrowing works: error accessible when true", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "NetworkError", message: "Failed" },
      };
      if (isApiError(result)) {
        expect(() => result.error._tag).not.toThrow();
        const error: ApiError = result.error;
        expect(error._tag).toStrictEqual("NetworkError");
      }
    });

    test("type narrowing works: data not accessible in error branch", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "NetworkError", message: "Failed" },
      };
      if (isApiError(result)) {
        expect("data" in result).toBe(false);
      }
    });

    test("type narrowing works: data accessible when false", () => {
      const result: ApiResult<string> = { success: true, data: "value" };
      if (!isApiError(result)) {
        expect(() => result.data.toUpperCase()).not.toThrow();
      }
    });
  });

  describe("all error types", () => {
    test("returns true for NetworkError", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "NetworkError", message: "Network error" },
      };
      expect(isApiError(result)).toBe(true);
      if (isApiError(result)) {
        expect(result.error._tag).toStrictEqual("NetworkError");
      }
    });

    test("returns true for ValidationError", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "ValidationError", message: "Validation error" },
      };
      expect(isApiError(result)).toBe(true);
    });

    test("returns true for NotFoundError", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "NotFoundError", message: "Not found" },
      };
      expect(isApiError(result)).toBe(true);
    });

    test("returns true for RateLimitError", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "RateLimitError", message: "Rate limited" },
      };
      expect(isApiError(result)).toBe(true);
    });

    test("returns true for UnknownError", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "UnknownError", message: "Unknown error" },
      };
      expect(isApiError(result)).toBe(true);
    });
  });

  describe("different data types with error", () => {
    test("handles error with string data type", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "NetworkError", message: "Failed" },
      };
      expect(isApiError(result)).toBe(true);
    });

    test("handles error with number data type", () => {
      const result: ApiResult<number> = {
        success: false,
        error: { _tag: "ValidationError", message: "Invalid" },
      };
      expect(isApiError(result)).toBe(true);
    });

    test("handles error with object data type", () => {
      const result: ApiResult<{ id: string }> = {
        success: false,
        error: { _tag: "NotFoundError", message: "Not found" },
      };
      expect(isApiError(result)).toBe(true);
    });
  });

  describe("edge cases", () => {
    test("handles error with empty message", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "NetworkError", message: "" },
      };
      expect(isApiError(result)).toBe(true);
    });

    test("handles error with very long message", () => {
      const longMessage = "x".repeat(10000);
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "ValidationError", message: longMessage },
      };
      expect(isApiError(result)).toBe(true);
    });

    test("handles error with special characters in message", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "NetworkError", message: "!@#$%^&*()" },
      };
      expect(isApiError(result)).toBe(true);
    });

    test("handles error with emoji in message", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "RateLimitError", message: "Too many requests \ud83d\udea6" },
      };
      expect(isApiError(result)).toBe(true);
    });

    test("handles error with newlines in message", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "UnknownError", message: "Error\non\nmultiple\nlines" },
      };
      expect(isApiError(result)).toBe(true);
    });
  });

  describe("error properties", () => {
    test("handles error with status property", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "NetworkError", message: "Failed", status: 500 },
      };
      expect(isApiError(result)).toBe(true);
      if (isApiError(result)) {
        expect(result.error.status).toStrictEqual(500);
      }
    });

    test("handles error with code property", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "ValidationError", message: "Invalid", code: "INVALID_FORMAT" },
      };
      expect(isApiError(result)).toBe(true);
      if (isApiError(result)) {
        expect(result.error.code).toStrictEqual("INVALID_FORMAT");
      }
    });

    test("handles error with both status and code", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "RateLimitError", message: "Limited", code: "60", status: 429 },
      };
      expect(isApiError(result)).toBe(true);
      if (isApiError(result)) {
        expect(result.error.code).toStrictEqual("60");
        expect(result.error.status).toStrictEqual(429);
      }
    });

    test("handles error without optional properties", () => {
      const result: ApiResult<string> = {
        success: false,
        error: { _tag: "NotFoundError", message: "Not found" },
      };
      expect(isApiError(result)).toBe(true);
      if (isApiError(result)) {
        expect(result.error.status).toBeUndefined();
        expect(result.error.code).toBeUndefined();
      }
    });
  });
});

describe("isNetworkError", () => {
  describe("positive cases", () => {
    test("returns true for NetworkError _tag", () => {
      const networkError: ApiError = {
        _tag: "NetworkError",
        message: "Connection failed",
        status: 500,
      };
      expect(isNetworkError(networkError)).toBe(true);
    });

    test("returns true for NetworkError without status", () => {
      const networkError: ApiError = { _tag: "NetworkError", message: "Failed" };
      expect(isNetworkError(networkError)).toBe(true);
    });
  });

  describe("negative cases - other error types", () => {
    test("returns false for ValidationError", () => {
      const validationError: ApiError = { _tag: "ValidationError", message: "Invalid input" };
      expect(isNetworkError(validationError)).toBe(false);
    });

    test("returns false for NotFoundError", () => {
      const notFoundError: ApiError = { _tag: "NotFoundError", message: "Not found" };
      expect(isNetworkError(notFoundError)).toBe(false);
    });

    test("returns false for RateLimitError", () => {
      const rateLimitError: ApiError = { _tag: "RateLimitError", message: "Too many requests" };
      expect(isNetworkError(rateLimitError)).toBe(false);
    });

    test("returns false for UnknownError", () => {
      const unknownError: ApiError = { _tag: "UnknownError", message: "Unknown error" };
      expect(isNetworkError(unknownError)).toBe(false);
    });
  });

  describe("type narrowing", () => {
    test("type narrowing works correctly - status accessible", () => {
      const error: ApiError = { _tag: "NetworkError", message: "Failed", status: 503 };
      if (isNetworkError(error)) {
        expect(() => error.status).not.toThrow();
        const status: number | undefined = error.status;
        expect(status).toStrictEqual(503);
      }
    });

    test("type narrowing excludes status for other errors", () => {
      const error: ApiError = { _tag: "ValidationError", message: "Invalid", code: "CODE" };
      if (isNetworkError(error)) {
        expect(error.status).toBeDefined();
      } else {
        expect(error.code).toStrictEqual("CODE");
      }
    });
  });

  describe("edge cases", () => {
    test("handles NetworkError with status 0", () => {
      const error: ApiError = { _tag: "NetworkError", message: "Failed", status: 0 };
      expect(isNetworkError(error)).toBe(true);
    });

    test("handles NetworkError with negative status", () => {
      const error: ApiError = { _tag: "NetworkError", message: "Failed", status: -1 };
      expect(isNetworkError(error)).toBe(true);
    });

    test("handles NetworkError with very large status", () => {
      const error: ApiError = { _tag: "NetworkError", message: "Failed", status: 99999 };
      expect(isNetworkError(error)).toBe(true);
    });

    test("handles NetworkError with empty message", () => {
      const error: ApiError = { _tag: "NetworkError", message: "" };
      expect(isNetworkError(error)).toBe(true);
    });

    test("handles NetworkError with special characters in message", () => {
      const error: ApiError = {
        _tag: "NetworkError",
        message: "Connection failed: ECONNREFUSED",
      };
      expect(isNetworkError(error)).toBe(true);
    });
  });

  describe("common HTTP status codes", () => {
    const networkStatuses = [400, 401, 403, 404, 408, 429, 500, 502, 503, 504, 599];

    for (const status of networkStatuses) {
      test(`returns true for NetworkError with status ${status}`, () => {
        const error: ApiError = {
          _tag: "NetworkError",
          message: "Network error",
          status,
        };
        expect(isNetworkError(error)).toBe(true);
      });
    }
  });

  describe("access properties when narrowed", () => {
    test("access status property when narrowed", () => {
      const networkError: ApiError = {
        _tag: "NetworkError",
        message: "Connection failed",
        status: 500,
      };
      if (isNetworkError(networkError)) {
        expect(networkError.status).toStrictEqual(500);
      }
    });

    test("access message property when narrowed", () => {
      const networkError: ApiError = {
        _tag: "NetworkError",
        message: "Timeout",
      };
      if (isNetworkError(networkError)) {
        expect(networkError.message).toStrictEqual("Timeout");
      }
    });

    test("status is optional when narrowed", () => {
      const networkError: ApiError = { _tag: "NetworkError", message: "Failed" };
      if (isNetworkError(networkError)) {
        expect(networkError.status).toBeUndefined();
      }
    });
  });
});

describe("isNotFoundError", () => {
  describe("positive cases", () => {
    test("returns true for NotFoundError _tag", () => {
      const notFoundError: ApiError = { _tag: "NotFoundError", message: "Resource not found" };
      expect(isNotFoundError(notFoundError)).toBe(true);
    });

    test("returns true for NotFoundError with EntityId in message", () => {
      const notFoundError: ApiError = {
        _tag: "NotFoundError",
        message: "Account 0.0.123 not found",
      };
      expect(isNotFoundError(notFoundError)).toBe(true);
    });
  });

  describe("negative cases - other error types", () => {
    test("returns false for NetworkError", () => {
      const networkError: ApiError = { _tag: "NetworkError", message: "Connection failed" };
      expect(isNotFoundError(networkError)).toBe(false);
    });

    test("returns false for ValidationError", () => {
      const validationError: ApiError = { _tag: "ValidationError", message: "Invalid input" };
      expect(isNotFoundError(validationError)).toBe(false);
    });

    test("returns false for RateLimitError", () => {
      const rateLimitError: ApiError = { _tag: "RateLimitError", message: "Rate limited" };
      expect(isNotFoundError(rateLimitError)).toBe(false);
    });

    test("returns false for UnknownError", () => {
      const unknownError: ApiError = { _tag: "UnknownError", message: "Unknown error" };
      expect(isNotFoundError(unknownError)).toBe(false);
    });
  });

  describe("type narrowing", () => {
    test("type narrowing works correctly", () => {
      const error: ApiError = { _tag: "NotFoundError", message: "Not found" };
      if (isNotFoundError(error)) {
        const narrowed: ApiError & { readonly _tag: "NotFoundError" } = error;
        expect(narrowed._tag).toStrictEqual("NotFoundError");
      }
    });

    test("narrowed error does not have status", () => {
      const error: ApiError = { _tag: "NotFoundError", message: "Not found" };
      if (isNotFoundError(error)) {
        expect("status" in error).toBe(false);
      }
    });

    test("narrowed error does not have code", () => {
      const error: ApiError = { _tag: "NotFoundError", message: "Not found" };
      if (isNotFoundError(error)) {
        expect("code" in error).toBe(false);
      }
    });
  });

  describe("edge cases", () => {
    test("handles NotFoundError with empty message", () => {
      const error: ApiError = { _tag: "NotFoundError", message: "" };
      expect(isNotFoundError(error)).toBe(true);
    });

    test("handles NotFoundError with special characters", () => {
      const error: ApiError = {
        _tag: "NotFoundError",
        message: "Resource 'test@domain.com' not found!",
      };
      expect(isNotFoundError(error)).toBe(true);
    });

    test("handles NotFoundError with unicode", () => {
      const error: ApiError = {
        _tag: "NotFoundError",
        message: "\u30ea\u30bd\u30fc\u30b9\u304c\u898b\u3064\u304b\u308a\u307e\u305b\u3093",
      };
      expect(isNotFoundError(error)).toBe(true);
    });
  });

  describe("Hedera-specific not found scenarios", () => {
    test("handles account not found message", () => {
      const error: ApiError = {
        _tag: "NotFoundError",
        message: "Account with id 0.0.1001 does not exist",
      };
      expect(isNotFoundError(error)).toBe(true);
    });

    test("handles contract not found message", () => {
      const error: ApiError = {
        _tag: "NotFoundError",
        message: "Contract with id 0.0.2001 does not exist",
      };
      expect(isNotFoundError(error)).toBe(true);
    });

    test("handles token not found message", () => {
      const error: ApiError = {
        _tag: "NotFoundError",
        message: "Token with id 0.0.3001 does not exist",
      };
      expect(isNotFoundError(error)).toBe(true);
    });

    test("handles transaction not found message", () => {
      const error: ApiError = {
        _tag: "NotFoundError",
        message: "Transaction with id 0.0.1234567890 not found",
      };
      expect(isNotFoundError(error)).toBe(true);
    });

    test("handles file not found message", () => {
      const error: ApiError = {
        _tag: "NotFoundError",
        message: "File data with id 0.0.4001 not found",
      };
      expect(isNotFoundError(error)).toBe(true);
    });
  });
});

describe("isRateLimitError", () => {
  describe("positive cases", () => {
    test("returns true for RateLimitError _tag", () => {
      const rateLimitError: ApiError = {
        _tag: "RateLimitError",
        message: "Too many requests",
        code: "60",
      };
      expect(isRateLimitError(rateLimitError)).toBe(true);
    });

    test("returns true for RateLimitError without code", () => {
      const rateLimitError: ApiError = { _tag: "RateLimitError", message: "Rate limited" };
      expect(isRateLimitError(rateLimitError)).toBe(true);
    });
  });

  describe("negative cases - other error types", () => {
    test("returns false for NetworkError", () => {
      const networkError: ApiError = { _tag: "NetworkError", message: "Connection failed" };
      expect(isRateLimitError(networkError)).toBe(false);
    });

    test("returns false for ValidationError", () => {
      const validationError: ApiError = { _tag: "ValidationError", message: "Invalid input" };
      expect(isRateLimitError(validationError)).toBe(false);
    });

    test("returns false for NotFoundError", () => {
      const notFoundError: ApiError = { _tag: "NotFoundError", message: "Not found" };
      expect(isRateLimitError(notFoundError)).toBe(false);
    });

    test("returns false for UnknownError", () => {
      const unknownError: ApiError = { _tag: "UnknownError", message: "Unknown error" };
      expect(isRateLimitError(unknownError)).toBe(false);
    });
  });

  describe("type narrowing", () => {
    test("type narrowing works correctly - code accessible", () => {
      const error: ApiError = {
        _tag: "RateLimitError",
        message: "Rate limited",
        code: "30",
      };
      if (isRateLimitError(error)) {
        expect(() => error.code).not.toThrow();
        const code: string | undefined = error.code;
        expect(code).toStrictEqual("30");
      }
    });

    test("type narrowing excludes status property", () => {
      const error: ApiError = {
        _tag: "RateLimitError",
        message: "Rate limited",
        code: "60",
      };
      if (isRateLimitError(error)) {
        expect("status" in error).toBe(false);
      }
    });
  });

  describe("edge cases", () => {
    test("handles RateLimitError with code 0", () => {
      const error: ApiError = { _tag: "RateLimitError", message: "Limited", code: "0" };
      expect(isRateLimitError(error)).toBe(true);
    });

    test("handles RateLimitError with empty code", () => {
      const error: ApiError = { _tag: "RateLimitError", message: "Limited", code: "" };
      expect(isRateLimitError(error)).toBe(true);
    });

    test("handles RateLimitError with very large retry value", () => {
      const error: ApiError = {
        _tag: "RateLimitError",
        message: "Limited",
        code: "86400",
      };
      expect(isRateLimitError(error)).toBe(true);
    });

    test("handles RateLimitError with decimal code", () => {
      const error: ApiError = {
        _tag: "RateLimitError",
        message: "Limited",
        code: "30.5",
      };
      expect(isRateLimitError(error)).toBe(true);
    });
  });

  describe("common retry intervals", () => {
    const retryIntervals = [1, 5, 10, 15, 30, 60, 120, 300, 600, 3600];

    for (const interval of retryIntervals) {
      test(`returns true for RateLimitError with retry after ${interval}s`, () => {
        const error: ApiError = {
          _tag: "RateLimitError",
          message: "Rate limited",
          code: interval.toString(),
        };
        expect(isRateLimitError(error)).toBe(true);
      });
    }
  });

  describe("access properties when narrowed", () => {
    test("access code property when narrowed", () => {
      const rateLimitError: ApiError = {
        _tag: "RateLimitError",
        message: "Too many requests",
        code: "60",
      };
      if (isRateLimitError(rateLimitError)) {
        expect(rateLimitError.code).toStrictEqual("60");
      }
    });

    test("access message property when narrowed", () => {
      const rateLimitError: ApiError = {
        _tag: "RateLimitError",
        message: "Retry later",
      };
      if (isRateLimitError(rateLimitError)) {
        expect(rateLimitError.message).toStrictEqual("Retry later");
      }
    });

    test("code is optional when narrowed", () => {
      const rateLimitError: ApiError = {
        _tag: "RateLimitError",
        message: "Rate limited",
      };
      if (isRateLimitError(rateLimitError)) {
        expect(rateLimitError.code).toBeUndefined();
      }
    });
  });

  describe("Hedera-specific rate limit scenarios", () => {
    test("handles HBAR balance query rate limit", () => {
      const error: ApiError = {
        _tag: "RateLimitError",
        message: "Too many balance queries",
        code: "10",
      };
      expect(isRateLimitError(error)).toBe(true);
    });

    test("handles transaction rate limit", () => {
      const error: ApiError = {
        _tag: "RateLimitError",
        message: "Transaction rate limit exceeded",
        code: "1",
      };
      expect(isRateLimitError(error)).toBe(true);
    });

    test("handles API rate limit with cost header", () => {
      const error: ApiError = {
        _tag: "RateLimitError",
        message: "Rate limit: cost=250, bucket=1000",
        code: "60",
      };
      expect(isRateLimitError(error)).toBe(true);
    });
  });
});

describe("isValidationError", () => {
  describe("positive cases", () => {
    test("returns true for ValidationError _tag", () => {
      const validationError: ApiError = {
        _tag: "ValidationError",
        message: "Invalid entity ID format",
        code: "INVALID_FORMAT",
      };
      expect(isValidationError(validationError)).toBe(true);
    });

    test("returns true for ValidationError without code", () => {
      const validationError: ApiError = {
        _tag: "ValidationError",
        message: "Invalid input",
      };
      expect(isValidationError(validationError)).toBe(true);
    });
  });

  describe("negative cases - other error types", () => {
    test("returns false for NetworkError", () => {
      const networkError: ApiError = { _tag: "NetworkError", message: "Connection failed" };
      expect(isValidationError(networkError)).toBe(false);
    });

    test("returns false for NotFoundError", () => {
      const notFoundError: ApiError = { _tag: "NotFoundError", message: "Not found" };
      expect(isValidationError(notFoundError)).toBe(false);
    });

    test("returns false for RateLimitError", () => {
      const rateLimitError: ApiError = { _tag: "RateLimitError", message: "Rate limited" };
      expect(isValidationError(rateLimitError)).toBe(false);
    });

    test("returns false for UnknownError", () => {
      const unknownError: ApiError = { _tag: "UnknownError", message: "Unknown error" };
      expect(isValidationError(unknownError)).toBe(false);
    });
  });

  describe("type narrowing", () => {
    test("type narrowing works correctly - code accessible", () => {
      const error: ApiError = {
        _tag: "ValidationError",
        message: "Validation failed",
        code: "ERR_CODE",
      };
      if (isValidationError(error)) {
        expect(() => error.code).not.toThrow();
        const code: string | undefined = error.code;
        expect(code).toStrictEqual("ERR_CODE");
      }
    });

    test("type narrowing excludes status property", () => {
      const error: ApiError = {
        _tag: "ValidationError",
        message: "Invalid",
        code: "CODE",
      };
      if (isValidationError(error)) {
        expect("status" in error).toBe(false);
      }
    });
  });

  describe("edge cases", () => {
    test("handles ValidationError with empty code", () => {
      const error: ApiError = { _tag: "ValidationError", message: "Invalid", code: "" };
      expect(isValidationError(error)).toBe(true);
    });

    test("handles ValidationError with very long code", () => {
      const error: ApiError = {
        _tag: "ValidationError",
        message: "Invalid",
        code: "A".repeat(1000),
      };
      expect(isValidationError(error)).toBe(true);
    });

    test("handles ValidationError with special characters in code", () => {
      const error: ApiError = {
        _tag: "ValidationError",
        message: "Invalid",
        code: "ERR_!@#$%",
      };
      expect(isValidationError(error)).toBe(true);
    });

    test("handles ValidationError with spaces in code", () => {
      const error: ApiError = {
        _tag: "ValidationError",
        message: "Invalid",
        code: "INVALID FORMAT",
      };
      expect(isValidationError(error)).toBe(true);
    });
  });

  describe("access properties when narrowed", () => {
    test("access code property when narrowed", () => {
      const validationError: ApiError = {
        _tag: "ValidationError",
        message: "Invalid entity ID format",
        code: "INVALID_FORMAT",
      };
      if (isValidationError(validationError)) {
        expect(validationError.code).toStrictEqual("INVALID_FORMAT");
      }
    });

    test("access message property when narrowed", () => {
      const validationError: ApiError = {
        _tag: "ValidationError",
        message: "Validation failed",
      };
      if (isValidationError(validationError)) {
        expect(validationError.message).toStrictEqual("Validation failed");
      }
    });

    test("code is optional when narrowed", () => {
      const validationError: ApiError = {
        _tag: "ValidationError",
        message: "Invalid input",
      };
      if (isValidationError(validationError)) {
        expect(validationError.code).toBeUndefined();
      }
    });
  });

  describe("Hedera-specific validation codes", () => {
    test("handles INVALID_ENTITY_ID code", () => {
      const error: ApiError = {
        _tag: "ValidationError",
        message: "Invalid EntityId",
        code: "INVALID_ENTITY_ID",
      };
      expect(isValidationError(error)).toBe(true);
      if (isValidationError(error)) {
        expect(error.code).toStrictEqual("INVALID_ENTITY_ID");
      }
    });

    test("handles INVALID_TIMESTAMP code", () => {
      const error: ApiError = {
        _tag: "ValidationError",
        message: "Invalid timestamp",
        code: "INVALID_TIMESTAMP",
      };
      expect(isValidationError(error)).toBe(true);
    });

    test("handles INVALID_TRANSACTION_ID code", () => {
      const error: ApiError = {
        _tag: "ValidationError",
        message: "Invalid transaction ID",
        code: "INVALID_TRANSACTION_ID",
      };
      expect(isValidationError(error)).toBe(true);
    });

    test("handles INVALID_KEY_FORMAT code", () => {
      const error: ApiError = {
        _tag: "ValidationError",
        message: "Invalid key format",
        code: "INVALID_KEY_FORMAT",
      };
      expect(isValidationError(error)).toBe(true);
    });

    test("handles MISSING_REQUIRED_FIELD code", () => {
      const error: ApiError = {
        _tag: "ValidationError",
        message: "Missing required field",
        code: "MISSING_REQUIRED_FIELD",
      };
      expect(isValidationError(error)).toBe(true);
    });

    test("handles INVALID_AMOUNT code", () => {
      const error: ApiError = {
        _tag: "ValidationError",
        message: "Invalid amount",
        code: "INVALID_AMOUNT",
      };
      expect(isValidationError(error)).toBe(true);
    });

    test("handles INVALID_SIGNATURE code", () => {
      const error: ApiError = {
        _tag: "ValidationError",
        message: "Invalid signature",
        code: "INVALID_SIGNATURE",
      };
      expect(isValidationError(error)).toBe(true);
    });
  });

  describe("validation error messages", () => {
    test("handles validation error with emoji", () => {
      const error: ApiError = {
        _tag: "ValidationError",
        message: "Invalid input \ud83d\ude31",
      };
      expect(isValidationError(error)).toBe(true);
    });

    test("handles validation error with unicode", () => {
      const error: ApiError = {
        _tag: "ValidationError",
        message: "\u691c\u8a3c\u30a8\u30e9\u30fc: \u7121\u52b9\u306a\u5165\u529b",
      };
      expect(isValidationError(error)).toBe(true);
    });

    test("handles validation error with newlines", () => {
      const error: ApiError = {
        _tag: "ValidationError",
        message: "Multiple errors:\n- Field 1: Required\n- Field 2: Invalid format",
      };
      expect(isValidationError(error)).toBe(true);
    });
  });
});

describe("cross-type guard compatibility", () => {
  describe("mutually exclusive type guards", () => {
    test("isNetworkError returns false for all other types", () => {
      const errors: ApiError[] = [
        { _tag: "ValidationError", message: "Invalid" },
        { _tag: "NotFoundError", message: "Not found" },
        { _tag: "RateLimitError", message: "Limited" },
        { _tag: "UnknownError", message: "Unknown" },
      ];
      for (const error of errors) {
        expect(isNetworkError(error)).toBe(false);
      }
    });

    test("isValidationError returns false for all other types", () => {
      const errors: ApiError[] = [
        { _tag: "NetworkError", message: "Network error" },
        { _tag: "NotFoundError", message: "Not found" },
        { _tag: "RateLimitError", message: "Limited" },
        { _tag: "UnknownError", message: "Unknown" },
      ];
      for (const error of errors) {
        expect(isValidationError(error)).toBe(false);
      }
    });

    test("isNotFoundError returns false for all other types", () => {
      const errors: ApiError[] = [
        { _tag: "NetworkError", message: "Network error" },
        { _tag: "ValidationError", message: "Invalid" },
        { _tag: "RateLimitError", message: "Limited" },
        { _tag: "UnknownError", message: "Unknown" },
      ];
      for (const error of errors) {
        expect(isNotFoundError(error)).toBe(false);
      }
    });

    test("isRateLimitError returns false for all other types", () => {
      const errors: ApiError[] = [
        { _tag: "NetworkError", message: "Network error" },
        { _tag: "ValidationError", message: "Invalid" },
        { _tag: "NotFoundError", message: "Not found" },
        { _tag: "UnknownError", message: "Unknown" },
      ];
      for (const error of errors) {
        expect(isRateLimitError(error)).toBe(false);
      }
    });
  });

  describe("exhaustive type checking patterns", () => {
    test("can use type guards to switch on error type", () => {
      const errors: ApiError[] = [
        { _tag: "NetworkError", message: "Network error", status: 500 },
        { _tag: "ValidationError", message: "Invalid", code: "CODE" },
        { _tag: "NotFoundError", message: "Not found" },
        { _tag: "RateLimitError", message: "Limited", code: "60" },
        { _tag: "UnknownError", message: "Unknown", code: "ERR" },
      ];

      for (const error of errors) {
        if (isNetworkError(error)) {
          expect(error._tag).toStrictEqual("NetworkError");
        } else if (isValidationError(error)) {
          expect(error._tag).toStrictEqual("ValidationError");
        } else if (isNotFoundError(error)) {
          expect(error._tag).toStrictEqual("NotFoundError");
        } else if (isRateLimitError(error)) {
          expect(error._tag).toStrictEqual("RateLimitError");
        } else {
          expect(error._tag).toStrictEqual("UnknownError");
        }
      }
    });
  });

  describe("type guard chains", () => {
    test("allows chaining multiple type guards", () => {
      const error: ApiError = { _tag: "ValidationError", message: "Invalid", code: "CODE" };
      expect(isNetworkError(error)).toBe(false);
      expect(isValidationError(error)).toBe(true);
    });

    test("correctly identifies specific error type in sequence", () => {
      const error: ApiError = { _tag: "RateLimitError", message: "Limited", code: "60" };
      if (isNetworkError(error)) {
        expect(true).toBe(false);
      } else if (isValidationError(error)) {
        expect(true).toBe(false);
      } else if (isNotFoundError(error)) {
        expect(true).toBe(false);
      } else if (isRateLimitError(error)) {
        expect(true).toBe(true);
      } else {
        expect(true).toBe(false);
      }
    });
  });
});

describe("type guard determinism", () => {
  test("returns consistent result for same input", () => {
    const error: ApiError = { _tag: "NetworkError", message: "Test" };
    expect(isNetworkError(error)).toBe(isNetworkError(error));
    expect(isNetworkError(error)).toBe(true);
  });

  test("does not modify input error", () => {
    const error: ApiError = { _tag: "NetworkError", message: "Test", status: 500 };
    const beforeStatus = error.status;
    isNetworkError(error);
    expect(error.status).toStrictEqual(beforeStatus);
  });

  test("does not have side effects", () => {
    const error: ApiError = { _tag: "ValidationError", message: "Test", code: "CODE" };
    const keysBefore = Object.keys(error);
    isValidationError(error);
    const keysAfter = Object.keys(error);
    expect(keysBefore).toStrictEqual(keysAfter);
  });
});

describe("type guard performance", () => {
  test("handles many error checks efficiently", () => {
    const errors: ApiError[] = Array.from({ length: 1000 }, (_, i) => ({
      _tag: ["NetworkError", "ValidationError", "NotFoundError", "RateLimitError", "UnknownError"][
        i % 5
      ] as ApiError["_tag"],
      message: `Error ${i}`,
    }));

    for (const error of errors) {
      expect(
        isNetworkError(error) ||
          isValidationError(error) ||
          isNotFoundError(error) ||
          isRateLimitError(error) ||
          error._tag === "UnknownError",
      ).toBe(true);
    }
  });
});
