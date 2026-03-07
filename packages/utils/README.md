# @hieco/utils

## Overview

`@hieco/utils` is the shared utility package used across the Hieco monorepo.

Internal package: this package is private to the workspace and is meant for maintainers and sibling packages, not standalone external installation.

It centralizes:

- shared API and pagination types
- entity validation and network helpers
- mirror query keys and invalidation helpers
- mirror provider utilities and error normalization

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
- entity ID validation
- network config helpers for mirror providers
- shared query key generation or invalidation logic
- shared error normalization at framework boundaries

## Quick Start

```ts
import { ApiErrorFactory, NETWORK_CONFIGS, isValidEntityId, mirrorNodeKeys } from "@hieco/utils";

const tokenId = "0.0.2001";
const key = mirrorNodeKeys.token.info("testnet", tokenId);
const error = ApiErrorFactory.notFound("Token not found");

console.log(isValidEntityId(tokenId), NETWORK_CONFIGS.testnet.mirrorNode, key, error);
```

## Core Concepts

### Shared Result Types

`ApiResult<T>` and `ApiError` are the shared read-layer result model used by mirror, realtime, and the framework adapters.

### Entity Helpers

Hedera entity IDs are plain strings, and `isValidEntityId` is the shared runtime check kept for real string input boundaries.

### Network Helpers

Mirror provider packages share the same network config helpers:

- `NETWORK_CONFIGS`
- `DEFAULT_MIRROR_NODE_URLS`
- `isDefaultNetwork`
- `getNetworkUrl`
- `NetworkConfig`

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

### Result Handling

```ts
if (result.success) {
  console.log(result.data);
} else if (result.error._tag === "NotFoundError") {
  console.log("Missing resource");
} else {
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
| `Key`                 | type  | Hedera key metadata.                             | `type Key`                          |
| `NetworkType`         | type  | Built-in network names.                          | `type NetworkType`                  |
| `MirrorNetworkConfig` | type  | Default mirror network config shape.             | `type MirrorNetworkConfig`          |
| `MirrorNodeConfig`    | type  | Mirror client config shape.                      | `type MirrorNodeConfig`             |
| `PaginationParams`    | type  | Shared list pagination params.                   | `type PaginationParams`             |
| `TimestampFilter`     | type  | Shared timestamp range filter shape.             | `type TimestampFilter`              |
| `QueryOperator`       | type  | Comparison operator helper used in list filters. | `type QueryOperator<T>`             |

### Entity And Network Helpers

| Export                     | Kind     | Purpose                                     | Usage form                         |
| -------------------------- | -------- | ------------------------------------------- | ---------------------------------- |
| `isValidEntityId`          | function | Validate an entity ID string.               | `isValidEntityId(value)`           |
| `NETWORK_CONFIGS`          | const    | Built-in network endpoints.                 | `NETWORK_CONFIGS.testnet`          |
| `DEFAULT_MIRROR_NODE_URLS` | const    | Default mirror URLs by network.             | `DEFAULT_MIRROR_NODE_URLS.testnet` |
| `NetworkConfig`            | type     | Provider config shape for mirror adapters.  | `type NetworkConfig`               |
| `isDefaultNetwork`         | function | Check whether a network is built-in.        | `isDefaultNetwork(value)`          |
| `getNetworkUrl`            | function | Resolve the mirror URL for a given network. | `getNetworkUrl(network, networks)` |

### Mirror Query Helpers

| Export                 | Kind     | Purpose                                              | Usage form                                 |
| ---------------------- | -------- | ---------------------------------------------------- | ------------------------------------------ |
| `mirrorNodeKeys`       | const    | Shared query key factory for mirror packages.        | `mirrorNodeKeys.account.info(network, id)` |
| `isValidMirrorNodeKey` | function | Check whether a key belongs to the mirror key space. | `isValidMirrorNodeKey(key)`                |
| `findMethodMapping`    | function | Resolve invalidation metadata for an operation key.  | `findMethodMapping(key)`                   |
| `EntityType`           | type     | Entity categories used by invalidation helpers.      | `type EntityType`                          |
| `InvalidateFilters`    | type     | Invalidation filter input.                           | `type InvalidateFilters`                   |
| `invalidateQueries`    | function | Invalidate related mirror queries on a query client. | `invalidateQueries(queryClient, filters)`  |

### Result Helpers

| Export       | Kind     | Purpose                                          | Usage form          |
| ------------ | -------- | ------------------------------------------------ | ------------------- |
| `toApiError` | function | Normalize an unknown thrown value to `ApiError`. | `toApiError(error)` |

## Related Packages

- [`@hieco/mirror`](../mirror/README.md) uses these shared mirror helpers directly
- [`@hieco/mirror-react`](../mirror-react/README.md), [`@hieco/mirror-preact`](../mirror-preact/README.md), and [`@hieco/mirror-solid`](../mirror-solid/README.md) use the provider and query key helpers
- [`@hieco/realtime`](../realtime/README.md) and [`@hieco/sdk`](../sdk/README.md) share the base types exported here
