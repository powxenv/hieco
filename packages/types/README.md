# @hiecom/types

Shared TypeScript types for Hiecom packages.

## Features

- **Network Types** - Network type definitions and configuration
- **API Primitives** - Result types, error types, pagination
- **Entity Types** - Common Hedera entity ID and timestamp types
- **Type Factories** - Helper functions for creating typed results

## Installation

```bash
# bun
bun add @hiecom/types

# npm
npm install @hiecom/types

# pnpm
pnpm add @hiecom/types

# yarn
yarn add @hiecom/types
```

> **Note**: This package is automatically installed as a dependency when using other Hiecom packages.

## API Reference

### Types

#### NetworkType

```typescript
type NetworkType = "mainnet" | "testnet" | "previewnet";
```

#### NetworkConfig

```typescript
interface NetworkConfig {
  readonly mirrorNode: string;
}
```

#### MirrorNodeConfig

```typescript
interface MirrorNodeConfig {
  readonly network: NetworkType;
  readonly mirrorNodeUrl?: string;
}
```

#### PaginationParams

```typescript
interface PaginationParams {
  readonly limit?: number;
  readonly order?: "asc" | "desc";
}
```

#### QueryOperator

```typescript
type QueryOperator<T extends string | number | boolean> =
  | T
  | `eq:${T}`
  | `ne:${T}`
  | `gt:${T}`
  | `gte:${T}`
  | `lt:${T}`
  | `lte:${T}`;
```

#### ApiResult

```typescript
type ApiResult<T, E extends ApiError = ApiError> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };
```

#### ApiError

```typescript
interface ApiError {
  readonly _tag:
    | "NetworkError"
    | "ValidationError"
    | "NotFoundError"
    | "RateLimitError"
    | "UnknownError";
  readonly message: string;
  readonly status?: number;
  readonly code?: string;
}
```

#### EntityId

```typescript
type EntityId = `${number}.${number}.${number}`;
```

#### Timestamp

```typescript
type Timestamp = string;
```

#### Key

```typescript
interface Key {
  readonly _type: string;
  readonly key: string;
}
```

### Constants

#### NETWORK_CONFIGS

```typescript
import { NETWORK_CONFIGS } from "@hiecom/types";

NETWORK_CONFIGS.mainnet; // { mirrorNode: "https://mainnet.mirrornode.hedera.com" }
NETWORK_CONFIGS.testnet; // { mirrorNode: "https://testnet.mirrornode.hedera.com" }
NETWORK_CONFIGS.previewnet; // { mirrorNode: "https://previewnet.mirrornode.hedera.com" }
```

### Factories

#### ApiErrorFactory

```typescript
import { ApiErrorFactory } from "@hiecom/types";

ApiErrorFactory.network("Connection failed", 500);
// { _tag: "NetworkError", message: "Connection failed", status: 500 }

ApiErrorFactory.validation("Invalid input", "INVALID_PARAM");
// { _tag: "ValidationError", message: "Invalid input", code: "INVALID_PARAM" }

ApiErrorFactory.notFound("Resource not found");
// { _tag: "NotFoundError", message: "Resource not found" }

ApiErrorFactory.rateLimit("Too many requests", 60);
// { _tag: "RateLimitError", message: "Too many requests", code: "60" }

ApiErrorFactory.unknown("Unknown error");
// { _tag: "UnknownError", message: "Unknown error" }
```

## Usage

```typescript
import { ApiResult, ApiErrorFactory, EntityId } from "@hiecom/types";

function fetchAccount(id: EntityId): ApiResult<Account> {
  // ... implementation
  return {
    success: true,
    data: { account: id, balance: 1000 },
  };
}

const result = fetchAccount("0.0.123");

if (result.success) {
  console.log(result.data.balance);
} else {
  console.error(result.error.message);
}
```

## Related Packages

- [`@hiecom/mirror-js`](https://www.npmjs.com/package/@hiecom/mirror-js) - Mirror Node REST API client
- [`@hiecom/realtime`](https://www.npmjs.com/package/@hiecom/realtime) - WebSocket streaming client
- [`@hiecom/mirror-shared`](https://github.com/powxenv/hiecom/tree/main/packages/mirror-shared) - Shared utilities (internal)

## License

MIT
