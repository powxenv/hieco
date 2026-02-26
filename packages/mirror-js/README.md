# @hiecom/mirror-js

Hedera Mirror Node REST API client for JavaScript/TypeScript.

## Features

- **Full REST API Coverage** - Accounts, tokens, transactions, contracts, topics, schedules, blocks, network
- **Type-Safe** - Full TypeScript support with typed responses
- **Result Types** - Consistent `ApiResult<T>` pattern for error handling
- **Cursor Pagination** - Built-in support for paginated queries with async iteration
- **Framework Agnostic** - Works in Node.js, browser, React, Preact, SolidJS
- **Zero Dependencies** - Minimal bundle size

## Installation

```bash
# bun
bun add @hiecom/mirror-js

# npm
npm install @hiecom/mirror-js

# pnpm
pnpm add @hiecom/mirror-js

# yarn
yarn add @hiecom/mirror-js
```

## Quick Start

```typescript
import { createMirrorNodeClient } from "@hiecom/mirror-js";

const client = createMirrorNodeClient({ network: "mainnet" });

const result = await client.account.getInfo("0.0.123");

if (result.success) {
  console.log(result.data.balance);
} else {
  console.error(result.error.message);
}
```

## API Reference

### Client Creation

#### createMirrorNodeClient

```typescript
import { createMirrorNodeClient } from "@hiecom/mirror-js";

// Predefined networks
const mainnetClient = createMirrorNodeClient({ network: "mainnet" });
const testnetClient = createMirrorNodeClient({ network: "testnet" });
const previewnetClient = createMirrorNodeClient({ network: "previewnet" });

// Custom endpoint
const customClient = createMirrorNodeClient({
  mirrorNodeUrl: "https://your-mirror-node.com/api/v1",
});
```

#### MirrorNodeClient

```typescript
class MirrorNodeClient {
  readonly account: AccountApi;
  readonly token: TokenApi;
  readonly transaction: TransactionApi;
  readonly contract: ContractApi;
  readonly topic: TopicApi;
  readonly schedule: ScheduleApi;
  readonly network: NetworkApi;
  readonly balance: BalanceApi;
  readonly block: BlockApi;
}
```

### Account API

```typescript
// Get account info
client.account.getInfo(accountId: EntityId): Promise<ApiResult<AccountInfo>>

// Get balances
client.account.getBalances(accountId: EntityId): Promise<ApiResult<AccountBalance>>

// Get tokens
client.account.getTokens(accountId: EntityId, params?: AccountNftsParams): Promise<ApiResult<TokenAirdropsResponse>>

// Get NFTs
client.account.getNfts(accountId: EntityId, params?: AccountNftsParams): Promise<ApiResult<TokenAirdropsResponse>>

// Get staking rewards
client.account.getStakingRewards(accountId: EntityId, params?: PaginationParams): Promise<ApiResult<StakingReward[]>>

// Get crypto allowances
client.account.getCryptoAllowances(accountId: EntityId): Promise<ApiResult<CryptoAllowance[]>>

// Get token allowances
client.account.getTokenAllowances(accountId: EntityId, params?: TokenAllowancesParams): Promise<ApiResult<TokenAllowance[]>>

// Get NFT allowances
client.account.getNftAllowances(accountId: EntityId): Promise<ApiResult<NftAllowance[]>>

// Get outstanding airdrops
client.account.getOutstandingAirdrops(accountId: EntityId): Promise<ApiResult<TokenAirdropsResponse>>

// Get pending airdrops
client.account.getPendingAirdrops(accountId: EntityId): Promise<ApiResult<TokenAirdropsResponse>>

// List accounts (paginated - fetches all pages)
client.account.listPaginated(params: AccountListParams): Promise<ApiResult<TokenAirdropsResponse>>
```

### Token API

```typescript
// Get token info
client.token.getInfo(tokenId: EntityId): Promise<ApiResult<TokenInfo>>

// Get token balances
client.token.getBalances(tokenId: EntityId, params?: TokenBalancesParams): Promise<ApiResult<BalancesResponse>>

// Get NFTs
client.token.getNfts(tokenId: EntityId): Promise<ApiResult<Nft[]>>

// Get specific NFT
client.token.getNft(tokenId: EntityId, serialNumber: number): Promise<ApiResult<Nft>>

// Get NFT transactions
client.token.getNftTransactions(tokenId: EntityId, serialNumber: number): Promise<ApiResult<Transaction[]>>

// List tokens (paginated)
client.token.listPaginated(params?: TokenListParams): Promise<ApiResult<TokenAirdropsResponse>>
```

### Transaction API

```typescript
// Get transaction by ID
client.transaction.getById(transactionId: string): Promise<ApiResult<Transaction>>

// List transactions by account
client.transaction.listByAccount(accountId: EntityId, params?: TransactionsByAccountParams): Promise<ApiResult<Transaction[]>>

// List transactions (paginated)
client.transaction.listPaginated(params?: TransactionListParams): Promise<ApiResult<TokenAirdropsResponse>>
```

### Contract API

```typescript
// Get contract info
client.contract.getInfo(contractId: EntityId): Promise<ApiResult<ContractInfo>>

// Call contract
client.contract.call(params: ContractCallParams): Promise<ApiResult<ContractCallResult>>

// Get contract results
client.contract.getResults(contractId: EntityId): Promise<ApiResult<ContractResultsResponse>>

// Get specific result
client.contract.getResult(contractId: EntityId, resultId: string): Promise<ApiResult<ContractResultDetails>>

// Get all results (paginated)
client.contract.getAllResults(params?: ContractResultsParams): Promise<ApiResult<ContractResultsResponse>>

// Get result by transaction
client.contract.getResultByTransactionIdOrHash(txIdOrHash: string): Promise<ApiResult<ContractResultDetails>>

// Get result actions
client.contract.getResultActions(resultId: string): Promise<ApiResult<ContractAction[]>>

// Get result opcodes
client.contract.getResultOpcodes(resultId: string): Promise<ApiResult<ContractOpcodesResponse>>

// Get contract state
client.contract.getState(contractId: EntityId, params?: ContractStateParams): Promise<ApiResult<ContractState[]>>

// Get contract logs
client.contract.getLogs(contractId: EntityId): Promise<ApiResult<ContractLog[]>>

// Get all logs (paginated)
client.contract.getAllContractLogs(params?: ContractLogsParams): Promise<ApiResult<ContractResultsResponse>>

// List contracts (paginated)
client.contract.listPaginated(params?: ContractListParams): Promise<ApiResult<TokenAirdropsResponse>>
```

### Topic API

```typescript
// Get topic info
client.topic.getInfo(topicId: EntityId): Promise<ApiResult<Topic>>

// Get messages
client.topic.getMessages(topicId: EntityId, params?: TopicMessagesParams): Promise<ApiResult<TopicMessage[]>>

// Get message by sequence number
client.topic.getMessage(topicId: EntityId, sequenceNumber: number): Promise<ApiResult<TopicMessage>>

// Get message by timestamp
client.topic.getMessageByTimestamp(timestamp: Timestamp): Promise<ApiResult<TopicMessage>>

// List topics (paginated)
client.topic.listPaginated(params?: PaginationParams): Promise<ApiResult<TokenAirdropsResponse>>
```

### Schedule API

```typescript
// Get schedule info
client.schedule.getInfo(scheduleId: EntityId): Promise<ApiResult<Schedule>>

// List schedules (paginated)
client.schedule.listPaginated(params?: ScheduleListParams): Promise<ApiResult<TokenAirdropsResponse>>
```

### Network API

```typescript
// Get exchange rate
client.network.getExchangeRate(params?: { timestamp?: Timestamp }): Promise<ApiResult<ExchangeRate>>

// Get network fees
client.network.getFees(params?: PaginationParams & { timestamp?: Timestamp }): Promise<ApiResult<NetworkFee>>

// Get network nodes
client.network.getNodes(params?: NetworkNodesParams): Promise<ApiResult<NetworkNode[]>>

// Get network stake
client.network.getStake(): Promise<ApiResult<NetworkStake>>

// Get network supply
client.network.getSupply(): Promise<ApiResult<NetworkSupply>>

// List (paginated)
client.network.listPaginated(params?: PaginationParams): Promise<ApiResult<TokenAirdropsResponse>>
```

### Balance API

```typescript
// List balances (paginated)
client.balance.getBalances(params?: BalancesListParams): Promise<ApiResult<BalancesResponse>>
```

### Block API

```typescript
// Get block
client.block.getBlock(blockNumberOrHash: string | number): Promise<ApiResult<Block>>

// Get blocks
client.block.getBlocks(params?: BlocksListParams): Promise<ApiResult<Block[]>>
```

### Pagination

#### Paginated Response

```typescript
interface PaginatedResponse<T> {
  readonly links: {
    readonly next?: string;
  };
  readonly data: readonly T[];
}
```

#### Auto-Fetch All Pages

```typescript
const result = await client.token.listPaginated({ limit: 100 });

if (result.success) {
  console.log(`Fetched ${result.data.length} total tokens`);
}
```

#### Manual Pagination

```typescript
// Get first page
const page1 = await client.token.listPaginatedPage({ limit: 25 });

if (page1.success) {
  const { data, links } = page1.data;
  console.log(`Items: ${data.length}, Next: ${links.next ?? "none"}`);
}

// Get next page
if (page1.success && page1.data.links.next) {
  const page2 = await client.token.listPaginatedPageByUrl(page1.data.links.next);
}
```

#### Async Iterator

```typescript
const paginator = client.token.createTokenPaginator({ limit: 100 });

for await (const token of paginator) {
  console.log(token.name);
}
```

## Response Format

All methods return an `ApiResult<T>`:

```typescript
const result = await client.account.getInfo("0.0.123");

if (result.success) {
  console.log(result.data.balance);
} else {
  console.error(result.error.message);
}
```

## Framework Packages

For React, Preact, and SolidJS, use the framework-specific packages:

- [`@hiecom/mirror-react`](https://www.npmjs.com/package/@hiecom/mirror-react) - React hooks with TanStack Query
- [`@hiecom/mirror-preact`](https://www.npmjs.com/package/@hiecom/mirror-preact) - Preact hooks with TanStack Query
- [`@hiecom/mirror-solid`](https://www.npmjs.com/package/@hiecom/mirror-solid) - SolidJS hooks with TanStack Query

## Related Packages

- [`@hiecom/types`](https://github.com/powxenv/hiecom/tree/main/packages/types) - Shared TypeScript types (internal)
- [`@hiecom/mirror-shared`](https://github.com/powxenv/hiecom/tree/main/packages/mirror-shared) - Shared utilities (internal)
- [`@hiecom/realtime`](https://www.npmjs.com/package/@hiecom/realtime) - WebSocket streaming client

## License

MIT
