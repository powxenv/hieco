import type { ApiResult } from "../types/rest-api";
import { HttpClient } from "./http-client";
import { QueryBuilder, CursorPaginator, type PaginatedResponse } from "./builders";

export class BaseApi {
  protected readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  protected createQueryBuilder(): QueryBuilder {
    return new QueryBuilder();
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
    const result = await this.client.get<{ data: T[] }>(path, params);
    if (!result.success) return result as ApiResult<T[]>;
    return { success: true, data: result.data.data };
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
      const result = await this.client.get<PaginatedResponse<T>>(
        nextUrl.replace(`${this.client.baseUrl}/api/v1/`, ""),
      );

      if (!result.success) {
        if (items.length === 0) return result as ApiResult<T[]>;
        return { success: true, data: items };
      }

      items.push(...result.data.data);
      nextUrl = result.data.links.next ?? "";

      if (!nextUrl || result.data.data.length === 0) break;
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

    return CursorPaginator.create<T>(url, fetchFn);
  }
}
