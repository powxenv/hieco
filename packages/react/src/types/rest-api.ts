export type NetworkType = "mainnet" | "testnet" | "previewnet";

export interface NetworkConfig {
  mirrorNode: string;
}

export const NETWORK_CONFIGS: Record<NetworkType, NetworkConfig> = {
  mainnet: {
    mirrorNode: "https://mainnet.mirrornode.hedera.com",
  },
  testnet: {
    mirrorNode: "https://testnet.mirrornode.hedera.com",
  },
  previewnet: {
    mirrorNode: "https://previewnet.mirrornode.hedera.com",
  },
};

export interface MirrorNodeConfig {
  network: NetworkType;
  mirrorNodeUrl?: string;
}

export interface PaginationParams {
  limit?: number;
  order?: "asc" | "desc";
}

export type QueryOperator<T extends string | number | boolean> =
  | T
  | `eq:${T}`
  | `ne:${T}`
  | `gt:${T}`
  | `gte:${T}`
  | `lt:${T}`
  | `lte:${T}`;

export type ApiResult<T, E extends ApiError = ApiError> =
  | { success: true; data: T }
  | { success: false; error: E };

export interface ApiError {
  _tag: "NetworkError" | "ValidationError" | "NotFoundError" | "RateLimitError" | "UnknownError";
  message: string;
  status?: number;
  code?: string;
}

export const ApiErrorFactory = {
  network: (message: string, status?: number): ApiError => ({
    _tag: "NetworkError",
    message,
    status,
  }),
  validation: (message: string, code?: string): ApiError => ({
    _tag: "ValidationError",
    message,
    code,
  }),
  notFound: (message: string): ApiError => ({
    _tag: "NotFoundError",
    message,
  }),
  rateLimit: (message: string, retryAfter?: number): ApiError => ({
    _tag: "RateLimitError",
    message,
    code: retryAfter?.toString(),
  }),
  unknown: (message: string, code?: string): ApiError => ({
    _tag: "UnknownError",
    message,
    code,
  }),
};

export type EntityId = `${number}.${number}.${number}`;

export type Timestamp = string;

export interface Key {
  _type: string;
  key: string;
}
