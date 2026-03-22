import { describe, expect, test } from "bun:test";
import { QueryBuilder, CursorPaginator } from "./builders";
import { findPageItems } from "./page";

describe("mirror query builders", () => {
  test("builds query parameters from scalar, array, pagination, and timestamps", () => {
    const query = new QueryBuilder()
      .add("account.id", "0.0.123")
      .add("deleted", false)
      .addIn("token.id", ["0.0.1", "0.0.2"])
      .addPagination({ limit: 25, order: "desc" })
      .addTimestamp({ from: "100", to: "200" })
      .set("custom", "value")
      .build();

    expect(query).toEqual({
      "account.id": "0.0.123",
      deleted: "false",
      "token.id": "0.0.1,0.0.2",
      limit: "25",
      order: "desc",
      timestamp: "gt:100:lt:200",
      custom: "value",
    });
  });

  test("stores direct timestamp filters unchanged", () => {
    const query = new QueryBuilder().addTimestamp("lte:123456").build();

    expect(query).toEqual({ timestamp: "lte:123456" });
  });

  test("finds the first array payload in a paginated response", () => {
    expect(
      findPageItems<string>({
        links: { next: "/next" },
        balances: ["a", "b"],
        other: [{ ignored: true }],
      }),
    ).toEqual(["a", "b"]);

    expect(findPageItems({ links: { next: "/next" }, summary: { total: 1 } })).toBeNull();
  });
});

describe("cursor paginator", () => {
  test("iterates through all pages until there is no next link", async () => {
    const responses = new Map<
      string,
      {
        readonly success: true;
        readonly data: {
          readonly links: { readonly next?: string };
          readonly accounts: readonly number[];
        };
      }
    >([
      [
        "/page-1",
        {
          success: true,
          data: {
            links: { next: "/page-2" },
            accounts: [1, 2],
          },
        },
      ],
      [
        "/page-2",
        {
          success: true,
          data: {
            links: {},
            accounts: [3],
          },
        },
      ],
    ]);

    const paginator = new CursorPaginator<number>("/page-1", async (url) => {
      const response = responses.get(url);

      if (!response) {
        throw new Error(`Unexpected page: ${url}`);
      }

      return response;
    });

    const items: number[] = [];

    for await (const item of paginator) {
      items.push(item);
    }

    expect(items).toEqual([1, 2, 3]);
  });

  test("throws when a page request fails", async () => {
    const paginator = new CursorPaginator<number>("/page-1", async () => ({
      success: false,
      error: {
        _tag: "NetworkError",
        message: "offline",
      },
    }));

    const consume = async (): Promise<void> => {
      for await (const _item of paginator) {
      }
    };

    await expect(consume()).rejects.toThrow("Pagination failed: offline");
  });

  test("throws when a paginated response contains no array payload", async () => {
    const paginator = new CursorPaginator<number>("/page-1", async () => ({
      success: true,
      data: {
        links: {},
      },
    }));

    const consume = async (): Promise<void> => {
      for await (const _item of paginator) {
      }
    };

    await expect(consume()).rejects.toThrow("No array found in paginated response");
  });
});
