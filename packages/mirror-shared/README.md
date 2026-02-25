# @hiecom/mirror-shared

Shared utilities and types for Hedera Mirror Node packages.

This is an internal package used by `@hiecom/mirror-js`, `@hiecom/mirror-react`, `@hiecom/mirror-preact`, and `@hiecom/mirror-solid`.

## Features

- **Entity ID utilities** - Parse, validate, and format Hedera entity IDs (e.g., `0.0.123`)
- **Network configuration** - Manage network URLs and switching between mainnet/testnet/custom
- **Query keys factory** - TanStack Query keys for consistent caching
- **Type guards** - Type-safe result checking
- **Query helpers** - Prefetch and invalidate queries

## Usage

This package is automatically installed as a dependency when using any of the framework packages:

```bash
npm install @hiecom/mirror-react  # includes @hiecom/mirror-shared
```

Utilities are re-exported by framework packages, so you can import them directly:

```typescript
// When using @hiecom/mirror-react
import {
  createNetworkConfig,
  mirrorNodeKeys,
  isValidEntityId,
} from "@hiecom/mirror-react";
```

## Entity ID Utilities

```typescript
import {
  isValidEntityId,
  parseEntityId,
  assertEntityId,
  formatEntityId,
  parseEntityIdParts,
} from "@hiecom/mirror-shared";

// Validate
if (isValidEntityId("0.0.123")) {
  // Handle valid entity ID
}

// Parse
const parts = parseEntityId("0.0.123");
// { shard: 0, realm: 0, num: 123 }

// Assert (throws if invalid)
assertEntityId("0.0.123");

// Format
const id = formatEntityId(0, 0, 123);
// "0.0.123"

// Parse to tuple
const [shard, realm, num] = parseEntityIdParts("0.0.123");
// [0, 0, 123]
```

## Network Configuration

```typescript
import {
  createNetworkConfig,
  getNetworkUrl,
  isDefaultNetwork,
} from "@hiecom/mirror-shared";

const networkConfig = createNetworkConfig({
  defaultNetwork: "mainnet",
  networks: {
    testnet: "https://testnet.mirrornode.hedera.com/api/v1",
    custom: "https://custom.mirror-node.com/api/v1",
  },
});

// Check if default Hedera network
isDefaultNetwork("mainnet"); // true
isDefaultNetwork("custom"); // false

// Get URL for network
const url = getNetworkUrl("testnet", networkConfig.networks);
```

## TanStack Query Keys

```typescript
import { mirrorNodeKeys } from "@hiecom/mirror-shared";

// Account keys
mirrorNodeKeys.account.info("mainnet", "0.0.123");
mirrorNodeKeys.account.balances("mainnet", "0.0.123");
mirrorNodeKeys.account.list("mainnet");

// Token keys
mirrorNodeKeys.token.info("mainnet", "0.0.456");
mirrorNodeKeys.token.list("mainnet");

// Transaction keys
mirrorNodeKeys.transaction.getById("mainnet", "0.0.123@1234567890.123456789");
mirrorNodeKeys.transaction.list("mainnet");
```

## Type Guards

```typescript
import {
  isSuccess,
  isApiError,
  isNetworkError,
  isNotFoundError,
  isRateLimitError,
  isValidationError,
} from "@hiecom/mirror-shared";

const result = await apiCall();

if (isSuccess(result)) {
  console.log(result.data);
}

if (isApiError(result)) {
  if (isNetworkError(result)) {
    console.log("Network error");
  } else if (isNotFoundError(result)) {
    console.log("Not found");
  } else if (isRateLimitError(result)) {
    console.log("Rate limited");
  } else if (isValidationError(result)) {
    console.log("Validation failed");
  }
}
```

## Query Helpers

```typescript
import {
  prefetchQuery,
  invalidateQueries,
  EntityType,
} from "@hiecom/mirror-shared";
import { QueryClient } from "@tanstack/react-query";

// Prefetch a query
await prefetchQuery(queryClient, client, mirrorNodeKeys.account.info("mainnet", "0.0.123"));

// Invalidate specific query
await invalidateQueries(queryClient, {
  exactKey: mirrorNodeKeys.account.info("mainnet", "0.0.123"),
});

// Invalidate all queries for an entity type
await invalidateQueries(queryClient, {
  entityType: EntityType.Account,
});

// Invalidate all queries
await invalidateQueries(queryClient, {});
```

## License

MIT
