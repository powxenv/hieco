import { describe, expect, test } from "bun:test";
import { toApiError } from "../src/mirror/guards";

describe("toApiError", () => {
  test("returns ApiError values unchanged", () => {
    const error = {
      _tag: "ValidationError",
      message: "bad input",
      code: "INVALID_INPUT",
    } as const;

    expect(toApiError(error)).toEqual(error);
  });

  test("normalizes Error instances", () => {
    expect(toApiError(new Error("boom"))).toEqual({
      _tag: "UnknownError",
      message: "boom",
    });
  });

  test("normalizes non-error values", () => {
    expect(toApiError("bad state")).toEqual({
      _tag: "UnknownError",
      message: "Unknown error occurred",
    });
  });
});
