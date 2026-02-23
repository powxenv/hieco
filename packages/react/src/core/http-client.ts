import type { ApiResult, MirrorNodeConfig, NetworkType } from "../types/rest-api";
import { ApiErrorFactory, NETWORK_CONFIGS } from "../types/rest-api";
import ky, { HTTPError, type Options } from "ky";
import pLimit from "p-limit";

export class HttpClient {
  readonly baseUrl: string;
  readonly network: NetworkType;
  private readonly limiter: ReturnType<typeof pLimit>;

  constructor(config: MirrorNodeConfig) {
    this.network = config.network;
    this.baseUrl = config.mirrorNodeUrl ?? NETWORK_CONFIGS[config.network].mirrorNode;
    
    this.limiter = pLimit(50);
  }

  private createClient(): typeof ky {
    return ky.create({
      prefixUrl: this.baseUrl,
      timeout: 30000,
      retry: {
        limit: 3,
        methods: ["get", "post"],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
        afterStatusCodes: [429],
        maxRetryAfter: 60000,
        backoffLimit: 10000,
        delay: (attemptCount) => {
          return 1000 * 2 ** (attemptCount - 1);
        },
      },
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
  }

  private async executeRequest<T>(path: string, options?: Options): Promise<ApiResult<T>> {
    const client = this.createClient();

    try {
      const response = await this.limiter(() => client(path, options));

      const data = await response.json<T>();
      return { success: true, data };
    } catch (error) {
      if (error instanceof HTTPError) {
        const { response } = error;

        if (response.status === 404) {
          return {
            success: false,
            error: ApiErrorFactory.notFound(`Resource not found: ${options?.method ?? "GET"} ${path}`),
          };
        }

        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          return {
            success: false,
            error: ApiErrorFactory.rateLimit(
              "Rate limit exceeded",
              retryAfter ? Number.parseInt(retryAfter, 10) : undefined,
            ),
          };
        }

        if (response.status >= 400) {
          const errorText = await this.safeText(response);
          return {
            success: false,
            error: ApiErrorFactory.network(
              `Request failed: ${response.status} ${response.statusText} - ${errorText}`,
              response.status,
            ),
          };
        }
      }

      return {
        success: false,
        error: ApiErrorFactory.network(
          error instanceof Error ? error.message : "Unknown network error",
        ),
      };
    }
  }

  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<ApiResult<T>> {
    if (!path || path.trim() === "") {
      throw new Error("Path cannot be empty");
    }

    return this.executeRequest<T>(`api/v1/${path.replace(/^\//, "")}`, {
      searchParams: params,
    });
  }

  async post<T>(path: string, body?: unknown): Promise<ApiResult<T>> {
    if (!path || path.trim() === "") {
      throw new Error("Path cannot be empty");
    }

    return this.executeRequest<T>(`api/v1/${path.replace(/^\//, "")}`, {
      method: "POST",
      json: body,
    });
  }

  private async safeText(response: Response): Promise<string> {
    try {
      return await response.text();
    } catch {
      return "";
    }
  }
}
