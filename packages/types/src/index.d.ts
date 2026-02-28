export type NetworkType = "mainnet" | "testnet" | "previewnet";
export interface NetworkConfig {
    readonly mirrorNode: string;
}
export declare const NETWORK_CONFIGS: Record<NetworkType, NetworkConfig>;
export interface MirrorNodeConfig {
    readonly network: NetworkType;
    readonly mirrorNodeUrl?: string;
}
export interface PaginationParams {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
}
export type QueryOperator<T extends string | number | boolean> = T | `eq:${T}` | `ne:${T}` | `gt:${T}` | `gte:${T}` | `lt:${T}` | `lte:${T}`;
export type ApiResult<T, E extends ApiError = ApiError> = {
    readonly success: true;
    readonly data: T;
} | {
    readonly success: false;
    readonly error: E;
};
export interface ApiError {
    readonly _tag: "NetworkError" | "ValidationError" | "NotFoundError" | "RateLimitError" | "UnknownError";
    readonly message: string;
    readonly status?: number;
    readonly code?: string;
}
export declare const ApiErrorFactory: {
    network: (message: string, status?: number) => ApiError;
    validation: (message: string, code?: string) => ApiError;
    notFound: (message: string) => ApiError;
    rateLimit: (message: string, retryAfter?: number) => ApiError;
    unknown: (message: string, code?: string) => ApiError;
};
export type EntityId = `${number}.${number}.${number}`;
export type Timestamp = string;
export interface Key {
    readonly _type: string;
    readonly key: string;
}
