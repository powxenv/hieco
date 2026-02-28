# @hieco/mirror-shared

Shared utilities and types for Hedera Mirror Node packages.

## Features

- **Entity ID Utilities** - Parse, validate, and format Hedera entity IDs (`0.0.123`)
- **Network Configuration** - Manage network URLs and switch between networks
- **Query Keys Factory** - TanStack Query keys for consistent caching
- **Type Guards** - Type-safe result checking utilities
- **Query Helpers** - Prefetch and invalidate queries

## Installation

This package is automatically installed as a dependency when using framework packages:

```bash
# With React
npm install @hieco/mirror-react  # includes @hieco/mirror-shared

# With Preact
npm install @hieco/mirror-preact  # includes @hieco/mirror-shared

# With SolidJS
npm install @hieco/mirror-solid  # includes @hieco/mirror-shared
```

Utilities are re-exported by framework packages:

```typescript
import { createNetworkConfig, mirrorNodeKeys, isValidEntityId } from "@hieco/mirror-react";
```

## API Reference

### Entity ID Utilities

```typescript
// Validate entity ID
isValidEntityId(value: unknown): value is EntityId

// Parse entity ID to parts
parseEntityId(id: EntityId): { shard: number; realm: number; num: number } | null

// Assert entity ID (throws if invalid)
assertEntityId(value: unknown): asserts value is EntityId

// Format entity ID from parts
formatEntityId(shard: number, realm: number, num: number): EntityId

// Parse entity ID to tuple
parseEntityIdParts(id: EntityId): [shard: number, realm: number, num: number]
```

**Example:**

```typescript
import { isValidEntityId, parseEntityId, formatEntityId } from "@hieco/mirror-shared";

if (isValidEntityId("0.0.123")) {
  const parts = parseEntityId("0.0.123");
  // { shard: 0, realm: 0, num: 123 }
}

const id = formatEntityId(0, 0, 456);
// "0.0.456"
```

### Network Configuration

```typescript
// Create network configuration
createNetworkConfig(config: {
  defaultNetwork: NetworkType;
  networks?: Record<string, string>;
}): NetworkConfig

// Get network URL
getNetworkUrl(network: NetworkType, networks: Record<string, string>): string

// Check if default Hedera network
isDefaultNetwork(network: string): boolean
```

**Example:**

```typescript
import { createNetworkConfig, getNetworkUrl, isDefaultNetwork } from "@hieco/mirror-shared";

const networkConfig = createNetworkConfig({
  defaultNetwork: "mainnet",
  networks: {
    testnet: "https://testnet.mirrornode.hedera.com/api/v1",
    custom: "https://custom.mirror-node.com/api/v1",
  },
});

isDefaultNetwork("mainnet"); // true
isDefaultNetwork("custom"); // false

const url = getNetworkUrl("testnet", networkConfig.networks);
```

### Query Keys Factory

```typescript
mirrorNodeKeys.account.info(network: NetworkType, accountId: EntityId)
mirrorNodeKeys.account.balances(network: NetworkType, accountId: EntityId)
mirrorNodeKeys.account.tokens(network: NetworkType, accountId: EntityId, params?: AccountNftsParams)
mirrorNodeKeys.account.nfts(network: NetworkType, accountId: EntityId, params?: AccountNftsParams)
mirrorNodeKeys.account.stakingRewards(network: NetworkType, accountId: EntityId, params?: PaginationParams)
mirrorNodeKeys.account.cryptoAllowances(network: NetworkType, accountId: EntityId)
mirrorNodeKeys.account.tokenAllowances(network: NetworkType, accountId: EntityId, params?: TokenAllowancesParams)
mirrorNodeKeys.account.nftAllowances(network: NetworkType, accountId: EntityId)
mirrorNodeKeys.account.outstandingAirdrops(network: NetworkType, accountId: EntityId)
mirrorNodeKeys.account.pendingAirdrops(network: NetworkType, accountId: EntityId)
mirrorNodeKeys.account.list(network: NetworkType, params?: AccountListParams)

mirrorNodeKeys.token.info(network: NetworkType, tokenId: EntityId)
mirrorNodeKeys.token.balances(network: NetworkType, tokenId: EntityId, params?: TokenBalancesParams)
mirrorNodeKeys.token.nfts(network: NetworkType, tokenId: EntityId)
mirrorNodeKeys.token.list(network: NetworkType, params?: TokenListParams)

mirrorNodeKeys.transaction.getById(network: NetworkType, transactionId: string)
mirrorNodeKeys.transaction.list(network: NetworkType, params?: TransactionListParams)
mirrorNodeKeys.transaction.listByAccount(network: NetworkType, accountId: EntityId, params?: TransactionsByAccountParams)

mirrorNodeKeys.contract.info(network: NetworkType, contractId: EntityId)
mirrorNodeKeys.contract.results(network: NetworkType, contractId: EntityId)
mirrorNodeKeys.contract.result(network: NetworkType, contractId: EntityId, resultId: string)
mirrorNodeKeys.contract.allResults(network: NetworkType, params?: ContractResultsParams)
mirrorNodeKeys.contract.state(network: NetworkType, contractId: EntityId, params?: ContractStateParams)
mirrorNodeKeys.contract.logs(network: NetworkType, contractId: EntityId)
mirrorNodeKeys.contract.allLogs(network: NetworkType, params?: ContractLogsParams)
mirrorNodeKeys.contract.list(network: NetworkType, params?: ContractListParams)

mirrorNodeKeys.topic.info(network: NetworkType, topicId: EntityId)
mirrorNodeKeys.topic.messages(network: NetworkType, topicId: EntityId, params?: TopicMessagesParams)
mirrorNodeKeys.topic.list(network: NetworkType, params?: PaginationParams)

mirrorNodeKeys.schedule.info(network: NetworkType, scheduleId: EntityId)
mirrorNodeKeys.schedule.list(network: NetworkType, params?: ScheduleListParams)

mirrorNodeKeys.network.exchangeRate(params?: { timestamp?: Timestamp })
mirrorNodeKeys.network.fees(network: NetworkType, params?: PaginationParams & { timestamp?: Timestamp })
mirrorNodeKeys.network.nodes(network: NetworkType, params?: NetworkNodesParams)
mirrorNodeKeys.network.stake()
mirrorNodeKeys.network.supply()

mirrorNodeKeys.block.block(blockNumberOrHash: string | number)
mirrorNodeKeys.block.blocks(params?: BlocksListParams)

mirrorNodeKeys.balance.balances(network: NetworkType, params?: BalancesListParams)
```

### Type Guards

```typescript
// Check if result is successful
isSuccess<T>(result: ApiResult<T>): result is { success: true; data: T }

// Check if result is an error
isApiError<T>(result: ApiResult<T>): result is { success: false; error: ApiError }

// Specific error type guards
isNetworkError(error: ApiError): error is ApiError & { _tag: "NetworkError" }
isNotFoundError(error: ApiError): error is ApiError & { _tag: "NotFoundError" }
isRateLimitError(error: ApiError): error is ApiError & { _tag: "RateLimitError" }
isValidationError(error: ApiError): error is ApiError & { _tag: "ValidationError" }
isUnknownError(error: ApiError): error is ApiError & { _tag: "UnknownError" }
```

**Example:**

```typescript
import { isSuccess, isNetworkError, isNotFoundError } from "@hieco/mirror-shared";

const result = await apiCall();

if (isSuccess(result)) {
  console.log(result.data);
} else if (isNetworkError(result)) {
  console.log("Network error - check connection");
} else if (isNotFoundError(result)) {
  console.log("Resource not found");
}
```

### Query Helpers

```typescript
// Prefetch a query
prefetchQuery(
  queryClient: QueryClient,
  client: MirrorNodeClient,
  key: readonly unknown[]
): Promise<void>

// Invalidate queries
invalidateQueries(
  queryClient: QueryClient,
  options: {
    exactKey?: readonly unknown[];
    entityType?: EntityType;
  }
): Promise<void>
```

**Entity Types:**

```typescript
type EntityType =
  | "account"
  | "token"
  | "transaction"
  | "contract"
  | "topic"
  | "schedule"
  | "block"
  | "balance"
  | "network";
```

**Example:**

```typescript
import { prefetchQuery, invalidateQueries, mirrorNodeKeys } from "@hieco/mirror-shared";

// Prefetch
await prefetchQuery(queryClient, client, mirrorNodeKeys.account.info("mainnet", "0.0.123"));

// Invalidate specific query
await invalidateQueries(queryClient, {
  exactKey: mirrorNodeKeys.account.info("mainnet", "0.0.123"),
});

// Invalidate all account queries
await invalidateQueries(queryClient, { entityType: "account" });

// Invalidate all queries
await invalidateQueries(queryClient, {});
```

## Related Packages

- [`@hieco/mirror`](https://www.npmjs.com/package/@hieco/mirror) - REST API client
- [`@hieco/mirror-react`](https://www.npmjs.com/package/@hieco/mirror-react) - React hooks
- [`@hieco/mirror-preact`](https://www.npmjs.com/package/@hieco/mirror-preact) - Preact hooks
- [`@hieco/mirror-solid`](https://www.npmjs.com/package/@hieco/mirror-solid) - SolidJS hooks

## License

MIT
