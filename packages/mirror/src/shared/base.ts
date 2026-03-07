import type { ApiResult } from "@hieco/utils";
import { HttpClient } from "./http";
import { CursorPaginator, type PaginatedResponse } from "./builders";
import { findPageItems } from "./page";

export class BaseApi {
  protected readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  protected async getSingle<T>(
    path: string,
    params?: Record<string, string>,
  ): Promise<ApiResult<T>> {
    return this.client.get<T>(path, params);
  }

  protected async getList<T>(
    path: string,
    params?: Record<string, string>,
  ): Promise<ApiResult<T[]>> {
    const result = await this.client.get<Record<string, unknown>>(path, params);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    const items = findPageItems<T>(result.data);

    if (!items) {
      return {
        success: false,
        error: { _tag: "UnknownError", message: "No array found in response" },
      };
    }

    return { success: true, data: [...items] };
  }

  protected async getAllPaginated<T>(
    path: string,
    params?: Record<string, string>,
  ): Promise<ApiResult<T[]>> {
    const items: T[] = [];
    let nextUrl = `${this.client.baseUrl}/api/v1/${path.replace(/^\//, "")}`;

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      nextUrl += `?${searchParams.toString()}`;
    }

    while (nextUrl) {
      const result = await this.client.get<Record<string, unknown>>(
        nextUrl.replace(`${this.client.baseUrl}/api/v1/`, ""),
      );

      if (!result.success) {
        if (items.length === 0) {
          return { success: false, error: result.error };
        }
        return { success: true, data: items };
      }

      const data = result.data;
      const links = data.links as { next?: string } | undefined;
      const pageItems = findPageItems<T>(data);

      if (!pageItems) {
        return {
          success: false,
          error: { _tag: "UnknownError", message: "No array found in response" },
        };
      }

      items.push(...pageItems);
      nextUrl = links?.next ? `${this.client.baseUrl}/api/v1/${links.next.replace(/^\//, "")}` : "";

      if (!nextUrl || pageItems.length === 0) break;
    }

    return { success: true, data: items };
  }

  protected createPaginator<T>(path: string, params?: Record<string, string>): CursorPaginator<T> {
    let url = `${this.client.baseUrl}/api/v1/${path.replace(/^\//, "")}`;

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const fetchFn = async (fetchUrl: string): Promise<ApiResult<PaginatedResponse<T>>> => {
      const relativePath = fetchUrl.replace(`${this.client.baseUrl}/api/v1/`, "");
      return this.client.get<PaginatedResponse<T>>(relativePath);
    };

    return new CursorPaginator<T>(url, fetchFn);
  }

  protected async getSinglePage<T>(
    path: string,
    params?: Record<string, string>,
  ): Promise<ApiResult<PaginatedResponse<T>>> {
    return this.client.get<PaginatedResponse<T>>(path, params);
  }

  protected async getSinglePageByUrl<T>(url: string): Promise<ApiResult<PaginatedResponse<T>>> {
    const relativePath = url.replace(`${this.client.baseUrl}/api/v1/`, "");
    return this.client.get<PaginatedResponse<T>>(relativePath);
  }
}
