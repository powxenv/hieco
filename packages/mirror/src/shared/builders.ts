import type { ApiResult, PaginationParams, QueryOperator, TimestampFilter } from "@hieco/utils";
import { findPageItems } from "./page";

export class QueryBuilder {
  private params: Map<string, string> = new Map();

  add<T extends string | number | boolean>(
    paramName: string,
    value: QueryOperator<T> | undefined,
  ): this {
    if (value !== undefined && value !== null) {
      this.params.set(paramName, String(value));
    }
    return this;
  }

  addIn<T extends string | number>(paramName: string, values: T[] | undefined): this {
    if (values && values.length > 0) {
      this.params.set(paramName, values.join(","));
    }
    return this;
  }

  addPagination(params: PaginationParams): this {
    if (params.limit !== undefined) {
      this.params.set("limit", String(params.limit));
    }
    if (params.order !== undefined) {
      this.params.set("order", params.order);
    }
    return this;
  }

  addTimestamp(timestamp: TimestampFilter | undefined): this {
    if (!timestamp) return this;

    if (typeof timestamp === "string") {
      this.params.set("timestamp", timestamp);
    } else {
      const parts: string[] = [];
      if (timestamp.from) {
        parts.push(`gt:${timestamp.from}`);
      }
      if (timestamp.to) {
        parts.push(`lt:${timestamp.to}`);
      }
      if (parts.length > 0) {
        this.params.set("timestamp", parts.join(":"));
      }
    }
    return this;
  }

  set(paramName: string, value: string): this {
    this.params.set(paramName, value);
    return this;
  }

  build(): Record<string, string> {
    return Object.fromEntries(this.params);
  }
}

export interface PaginatedResponse<T> {
  readonly links: {
    readonly next?: string;
  };
  readonly [K: string]: readonly T[] | { readonly next?: string } | undefined;
}

export class CursorPaginator<T> implements AsyncIterable<T> {
  private nextUrl: string | null;
  private readonly fetchFn: (url: string) => Promise<ApiResult<PaginatedResponse<T>>>;

  constructor(
    initialUrl: string,
    fetchFn: (url: string) => Promise<ApiResult<PaginatedResponse<T>>>,
  ) {
    this.nextUrl = initialUrl;
    this.fetchFn = fetchFn;
  }

  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    while (this.nextUrl) {
      const result = await this.fetchFn(this.nextUrl);

      if (!result.success) {
        throw new Error(`Pagination failed: ${result.error.message}`);
      }

      const response = result.data;
      this.nextUrl = response.links.next ?? null;

      const items = findPageItems<T>(response);

      if (!items) {
        throw new Error("No array found in paginated response");
      }
      for (const item of items) {
        yield item;
      }

      if (items.length === 0) {
        break;
      }
    }
  }
}
