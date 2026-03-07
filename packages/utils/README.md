# @hieco/utils

## Overview

`@hieco/utils` is the shared utility package used across the Hieco monorepo.

Internal package: this package is private to the workspace and is meant for maintainers and sibling packages, not standalone external installation.

It centralizes:

- shared API and pagination types
- entity and network helpers
- mirror query keys and invalidation helpers
- mirror provider utilities and type guards

## Installation

Add it as a workspace dependency from another package in this monorepo:

```bash
npm install @hieco/utils --workspace
```

```bash
pnpm add @hieco/utils --workspace
```

```bash
yarn workspace <package-name> add @hieco/utils
```

```bash
bun add @hieco/utils --cwd packages/<package-name>
```

## When To Use This Package

Use `@hieco/utils` when you are maintaining Hieco packages and need:

- the canonical `ApiResult` and `ApiError` types
- entity ID parsing or validation
- network config helpers for mirror providers
- shared query key generation or invalidation logic
- shared type guards for Mirror Node responses

## Quick Start

```ts
import {
  ApiErrorFactory,
  NETWORK_CONFIGS,
  formatEntityId,
  isSuccess,
  mirrorNodeKeys,
} from "@hieco/utils";

const tokenId = formatEntityId(0, 0, 2001);
const key = mirrorNodeKeys.token.info("testnet", tokenId);
const error = ApiErrorFactory.notFound("Token not found");

console.log(NETWORK_CONFIGS.testnet.mirrorNode, key, error);
```

## Core Concepts

### Shared Result Types

`ApiResult<T>` and `ApiError` are the shared read-layer result model used by mirror, realtime, and the framework adapters.

### Entity Helpers

Entity helpers keep `0.0.123` handling consistent across packages:

- `isValidEntityId`
- `parseEntityId`
- `assertEntityId`
- `formatEntityId`
- `parseEntityIdParts`
- `asEntityId`

### Network Helpers

Mirror provider packages share the same network config helpers:

- `NETWORK_CONFIGS`
- `DEFAULT_MIRROR_NODE_URLS`
- `isDefaultNetwork`
- `getNetworkUrl`
- `NetworkConfig`
- `AnyNetwork`

### Query Keys And Invalidation

The mirror framework packages all use the same key factory and invalidation helpers:

- `mirrorNodeKeys`
- `findMethodMapping`
- `invalidateQueries`

## Advanced

### Mirror Provider Utilities

```ts
import { getNetworkUrl, isDefaultNetwork } from "@hieco/utils";

const mirrorNodeUrl = getNetworkUrl("testnet", {});

if (isDefaultNetwork("testnet")) {
  console.log(mirrorNodeUrl);
}
```

### Query Invalidation

```ts
import { invalidateQueries } from "@hieco/utils";

await invalidateQueries(queryClient, {
  entity: { type: "account", id: "0.0.1001" },
  network: "testnet",
});
```

### Type Guards

```ts
import { isApiError, isNotFoundError, isSuccess } from "@hieco/utils";

if (isSuccess(result)) {
  console.log(result.data);
} else if (isNotFoundError(result.error)) {
  console.log("Missing resource");
} else if (isApiError(result.error)) {
  console.log(result.error.message);
}
```

## API Reference

### Shared Types

| Export                | Kind  | Purpose                                          | Usage form                          |
| --------------------- | ----- | ------------------------------------------------ | ----------------------------------- |
| `ApiResult`           | type  | Shared success or failure wrapper.               | `type ApiResult<T>`                 |
| `ApiError`            | type  | Shared API error shape.                          | `type ApiError`                     |
| `ApiErrorFactory`     | const | Helpers for constructing API errors.             | `ApiErrorFactory.notFound(message)` |
| `EntityId`            | type  | Hedera entity ID template literal type.          | `type EntityId`                     |
| `Timestamp`           | type  | Shared timestamp string type.                    | `type Timestamp`                    |
| `Key`                 | type  | Hedera key metadata.                             | `type Key`                          |
| `NetworkType`         | type  | Built-in network names.                          | `type NetworkType`                  |
| `MirrorNetworkConfig` | type  | Default mirror network config shape.             | `type MirrorNetworkConfig`          |
| `MirrorNodeConfig`    | type  | Mirror client config shape.                      | `type MirrorNodeConfig`             |
| `PaginationParams`    | type  | Shared list pagination params.                   | `type PaginationParams`             |
| `QueryOperator`       | type  | Comparison operator helper used in list filters. | `type QueryOperator<T>`             |

### Entity And Network Helpers

| Export                     | Kind     | Purpose                                     | Usage form                          |
| -------------------------- | -------- | ------------------------------------------- | ----------------------------------- |
| `isValidEntityId`          | function | Validate an entity ID string.               | `isValidEntityId(value)`            |
| `parseEntityId`            | function | Parse an entity ID or return `null`.        | `parseEntityId(value)`              |
| `assertEntityId`           | function | Assert that a string is a valid entity ID.  | `assertEntityId(value)`             |
| `formatEntityId`           | function | Build an entity ID string from parts.       | `formatEntityId(shard, realm, num)` |
| `parseEntityIdParts`       | function | Split an entity ID into numeric parts.      | `parseEntityIdParts(id)`            |
| `asEntityId`               | function | Cast a known-good string to `EntityId`.     | `asEntityId(id)`                    |
| `NETWORK_CONFIGS`          | const    | Built-in network endpoints.                 | `NETWORK_CONFIGS.testnet`           |
| `DEFAULT_MIRROR_NODE_URLS` | const    | Default mirror URLs by network.             | `DEFAULT_MIRROR_NODE_URLS.testnet`  |
| `AnyNetwork`               | type     | Built-in network or custom string.          | `type AnyNetwork`                   |
| `NetworkConfig`            | type     | Provider config shape for mirror adapters.  | `type NetworkConfig<T, U>`          |
| `isDefaultNetwork`         | function | Check whether a network is built-in.        | `isDefaultNetwork(value)`           |
| `getNetworkUrl`            | function | Resolve the mirror URL for a given network. | `getNetworkUrl(network, networks)`  |

### Mirror Query Helpers

| Export                 | Kind     | Purpose                                              | Usage form                                 |
| ---------------------- | -------- | ---------------------------------------------------- | ------------------------------------------ |
| `mirrorNodeKeys`       | const    | Shared query key factory for mirror packages.        | `mirrorNodeKeys.account.info(network, id)` |
| `isValidMirrorNodeKey` | function | Check whether a key belongs to the mirror key space. | `isValidMirrorNodeKey(key)`                |
| `findMethodMapping`    | function | Resolve invalidation metadata for an operation key.  | `findMethodMapping(key)`                   |
| `EntityType`           | type     | Entity categories used by invalidation helpers.      | `type EntityType`                          |
| `InvalidateFilters`    | type     | Invalidation filter input.                           | `type InvalidateFilters`                   |
| `invalidateQueries`    | function | Invalidate related mirror queries on a query client. | `invalidateQueries(queryClient, filters)`  |

### Type Guards

| Export              | Kind     | Purpose                                    | Usage form                 |
| ------------------- | -------- | ------------------------------------------ | -------------------------- |
| `isSuccess`         | function | Narrow `ApiResult<T>` to a success result. | `isSuccess(result)`        |
| `isApiError`        | function | Narrow an unknown value to `ApiError`.     | `isApiError(value)`        |
| `isNetworkError`    | function | Check for network errors.                  | `isNetworkError(error)`    |
| `isNotFoundError`   | function | Check for not-found errors.                | `isNotFoundError(error)`   |
| `isRateLimitError`  | function | Check for rate-limit errors.               | `isRateLimitError(error)`  |
| `isValidationError` | function | Check for validation errors.               | `isValidationError(error)` |

## Related Packages

- [`@hieco/mirror`](../mirror/README.md) uses these shared mirror helpers directly
- [`@hieco/mirror-react`](../mirror-react/README.md), [`@hieco/mirror-preact`](../mirror-preact/README.md), and [`@hieco/mirror-solid`](../mirror-solid/README.md) use the provider and query key helpers
- [`@hieco/realtime`](../realtime/README.md) and [`@hieco/sdk`](../sdk/README.md) share the base types exported here
