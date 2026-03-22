import { describe, expect, test } from "bun:test";
import { readList, readPage, readSingle, toReadPage, withDefaultLimit } from "./shared";

describe("read helpers", () => {
  test("creates read pages and applies default limits", () => {
    expect(toReadPage([1, 2, 3], "/next")).toEqual({
      items: [1, 2, 3],
      next: "/next",
    });

    expect(withDefaultLimit()).toEqual({ limit: 25 });
    expect(withDefaultLimit({ order: "desc" })).toEqual({
      order: "desc",
      limit: 25,
    });
    expect(withDefaultLimit({ limit: 5, order: "asc" })).toEqual({
      limit: 5,
      order: "asc",
    });
  });

  test("maps successful single and list reads", () => {
    expect(readSingle({ success: true, data: { id: "0.0.1" } }, "Failed")).toEqual({
      ok: true,
      value: { id: "0.0.1" },
    });

    expect(readList({ success: true, data: [1, 2] }, "Failed", "/next")).toEqual({
      ok: true,
      value: {
        items: [1, 2],
        next: "/next",
      },
    });
  });

  test("maps mirror node failures into typed errors", () => {
    const result = readSingle(
      {
        success: false,
        error: {
          _tag: "NetworkError",
          message: "offline",
          status: 503,
          code: "EHOSTDOWN",
        },
      },
      "Could not read balance",
    );

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("Expected readSingle to fail");
    }
    expect(result.error).toEqual({
      code: "MIRROR_QUERY_FAILED",
      message: "Could not read balance",
      hint: "Verify mirror node connectivity",
      details: {
        status: 503,
        code: "EHOSTDOWN",
      },
    });
  });

  test("extracts page items from the first array field", () => {
    expect(
      readPage(
        {
          success: true,
          data: {
            links: {
              next: "/tokens?page=2",
            },
            tokens: [{ id: "0.0.1" }, { id: "0.0.2" }],
          },
        },
        "Could not read token page",
      ),
    ).toEqual({
      ok: true,
      value: {
        items: [{ id: "0.0.1" }, { id: "0.0.2" }],
        next: "/tokens?page=2",
      },
    });
  });

  test("returns an empty page when no array payload exists", () => {
    expect(
      readPage(
        {
          success: true,
          data: {
            links: {},
          },
        },
        "Could not read page",
      ),
    ).toEqual({
      ok: true,
      value: {
        items: [],
      },
    });
  });
});
