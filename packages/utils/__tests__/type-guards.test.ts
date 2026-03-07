import { describe, test, expect } from "bun:test";
import { isApiError, isSuccess, toApiError } from "../src/mirror/guards";
import type { ApiError, ApiResult } from "../src/types/api";

describe("isSuccess", () => {
  test("returns true for success results", () => {
    const result: ApiResult<string> = { success: true, data: "value" };

    expect(isSuccess(result)).toBe(true);
  });

  test("returns false for error results", () => {
    const result: ApiResult<string> = {
      success: false,
      error: { _tag: "NetworkError", message: "offline" },
    };

    expect(isSuccess(result)).toBe(false);
  });

  test("narrows to data in the success branch", () => {
    const result: ApiResult<{ readonly id: string }> = {
      success: true,
      data: { id: "123" },
    };

    if (!isSuccess(result)) {
      throw new Error("Expected success result");
    }

    const data: { readonly id: string } = result.data;

    expect(data.id).toBe("123");
  });
});

describe("isApiError", () => {
  test("returns true for error results", () => {
    const result: ApiResult<string> = {
      success: false,
      error: { _tag: "NotFoundError", message: "missing" },
    };

    expect(isApiError(result)).toBe(true);
  });

  test("returns false for success results", () => {
    const result: ApiResult<string> = { success: true, data: "ok" };

    expect(isApiError(result)).toBe(false);
  });

  test("narrows to error in the failure branch", () => {
    const result: ApiResult<string, ApiError> = {
      success: false,
      error: { _tag: "ValidationError", message: "bad input", code: "INVALID" },
    };

    if (!isApiError(result)) {
      throw new Error("Expected failure result");
    }

    const error: ApiError = result.error;

    expect(error.message).toBe("bad input");
  });
});

describe("toApiError", () => {
  test("returns the same shape for ApiError values", () => {
    const error = { _tag: "RateLimitError", message: "slow down", code: "10" } as const;

    expect(toApiError(error)).toEqual(error);
  });

  test("converts standard errors into UnknownError", () => {
    expect(toApiError(new Error("boom"))).toEqual({
      _tag: "UnknownError",
      message: "boom",
    });
  });

  test("converts non-error values into UnknownError", () => {
    expect(toApiError("bad state")).toEqual({
      _tag: "UnknownError",
      message: "Unknown error occurred",
    });
  });
});
