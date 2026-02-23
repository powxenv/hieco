import type { ApiResult, MirrorNodeConfig, NetworkType } from "../types/rest-api";
import { ApiErrorFactory, NETWORK_CONFIGS } from "../types/rest-api";

interface RequestEntry {
  readonly timestamp: number;
}

export class HttpClient {
  readonly baseUrl: string;
  readonly network: NetworkType;
  private readonly rateLimitWindow: number = 1000;
  private readonly rateLimitMax: number = 50;
  private readonly maxRetries: number = 3;
  private readonly baseDelay: number = 1000;
  private requestHistory: RequestEntry[] = [];

  constructor(config: MirrorNodeConfig) {
    this.network = config.network;
    this.baseUrl = config.mirrorNodeUrl ?? NETWORK_CONFIGS[config.network].mirrorNode;
  }

  async get<T>(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): Promise<ApiResult<T>> {
    await this.waitForRateLimit();

    const url = this.buildUrl(path, params);
    const result = await this.fetchWithRetry<T>(url, {
      method: "GET",
    });

    return result;
  }

  async post<T>(path: string, body?: unknown): Promise<ApiResult<T>> {
    await this.waitForRateLimit();

    const url = `${this.baseUrl}/api/v1/${path.replace(/^\//, "")}`;
    const result = await this.fetchWithRetry<T>(url, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    return result;
  }

  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit,
    attempt: number = 1,
  ): Promise<ApiResult<T>> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...options.headers,
        },
      });

      this.recordRequest();

      if (response.status === 404) {
        return {
          success: false,
          error: ApiErrorFactory.notFound(`Resource not found: ${options.method} ${url}`),
        };
      }

      if (response.status === 429) {
        const retryAfter = response.headers.get("Retry-After");
        if (attempt < this.maxRetries) {
          const delay =
            this.baseDelay * 2 ** attempt +
            (retryAfter ? Number.parseInt(retryAfter, 10) * 1000 : 0);
          await this.sleep(delay);
          return this.fetchWithRetry<T>(url, options, attempt + 1);
        }
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

      const data = await this.safeJson<T>(response);
      if (data === null) {
        return {
          success: false,
          error: ApiErrorFactory.network("Failed to parse JSON response", response.status),
        };
      }
      return { success: true, data };
    } catch (error) {
      if (attempt < this.maxRetries && this.isRetryableError(error as Error)) {
        const delay = this.baseDelay * 2 ** attempt;
        await this.sleep(delay);
        return this.fetchWithRetry<T>(url, options, attempt + 1);
      }

      return {
        success: false,
        error: ApiErrorFactory.network(
          error instanceof Error ? error.message : "Unknown network error",
        ),
      };
    }
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): string {
    if (!path || path.trim() === "") {
      throw new Error("Path cannot be empty");
    }

    const cleanPath = path.replace(/^\//, "");
    const url = new URL(`${this.baseUrl}/api/v1/${cleanPath}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && key.trim() !== "") {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.rateLimitWindow;

    this.requestHistory = this.requestHistory.filter((entry) => entry.timestamp > windowStart);

    if (this.requestHistory.length >= this.rateLimitMax) {
      const oldestRequest = this.requestHistory[0]?.timestamp ?? now - this.rateLimitWindow;
      const waitTime = oldestRequest + this.rateLimitWindow - now;

      if (waitTime > 0) {
        await this.sleep(waitTime);
        this.requestHistory = this.requestHistory.filter(
          (entry) => entry.timestamp > Date.now() - this.rateLimitWindow,
        );
      }
    }
  }

  private recordRequest(): void {
    this.requestHistory.push({ timestamp: Date.now() });
  }

  private isRetryableError(error: Error): boolean {
    const retryableMessages = [
      "ECONNRESET",
      "ETIMEDOUT",
      "ECONNREFUSED",
      "fetch failed",
      "network",
    ];

    return retryableMessages.some((msg) => error.message.toLowerCase().includes(msg.toLowerCase()));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async safeText(response: Response): Promise<string> {
    try {
      return await response.text();
    } catch {
      return "";
    }
  }

  private async safeJson<T>(response: Response): Promise<T | null> {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
}
