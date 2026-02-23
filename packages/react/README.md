# @hiecom/react

Type-safe Hedera Mirror Node API client for React applications.

## Installation

```bash
npm install @hiecom/react
# or
bun add @hiecom/react
```

## Quick Start

```tsx
import { MirrorNodeClient, MirrorNodeProvider, useMirrorNodeClient } from "@hiecom/react";

const client = new MirrorNodeClient({ network: "mainnet" });

function App() {
  return (
    <MirrorNodeClient client={client}>
      <YourApp />
    </MirrorNodeClient>
  );
}

function YourComponent() {
  const client = useMirrorNodeClient();

  // Fetch account info
  const account = await client.account.getInfo("0.0.123");

  if (account.success) {
    console.log(account.data.balance);
  }
}
```

## Configuration

```tsx
import { MirrorNodeClient } from "@hiecom/react";

// Mainnet (default)
const mainnetClient = new MirrorNodeClient({ network: "mainnet" });

// Testnet
const testnetClient = new MirrorNodeClient({ network: "testnet" });

// Previewnet
const previewnetClient = new MirrorNodeClient({ network: "previewnet" });

// Custom Mirror Node URL
const customClient = new MirrorNodeClient({
  network: "mainnet",
  mirrorNodeUrl: "https://your-custom-mirror-node.com",
});
```

## API Reference

### Account API

```tsx
const client = useMirrorNodeClient();

// Get account by ID, alias, or EVM address
const account = await client.account.getInfo("0.0.123");

// Get account balances
const balances = await client.account.getBalances("0.0.123");

// Get tokens owned by account
const tokens = await client.account.getTokens("0.0.123", { limit: 25 });

// Get NFTs owned by account
const nfts = await client.account.getNfts("0.0.123", {
  "token.id": "0.0.456",
  limit: 100,
  order: "desc",
});

// Get staking rewards
const rewards = await client.account.getStakingRewards("0.0.123");

// Get crypto allowances
const allowances = await client.account.getCryptoAllowances("0.0.123");

// List accounts with filters
const accounts = await client.account.listPaginated({
  balance: "gte:1000",
  limit: 50,
  order: "desc",
});
```

### Token API

```tsx
const client = useMirrorNodeClient();

// Get token info
const token = await client.token.getInfo("0.0.456");

// Get token balances
const balances = await client.token.getBalances("0.0.456", {
  account: "0.0.123",
  limit: 100,
});

// Get NFTs for a token
const nfts = await client.token.getNfts("0.0.456", { limit: 25 });

// Get specific NFT
const nft = await client.token.getNft("0.0.456", 1);

// Get NFT transaction history
const transactions = await client.token.getNftTransactions("0.0.456", 1);

// List tokens with filters
const tokens = await client.token.listPaginated({
  type: "FUNGIBLE_COMMON",
  limit: 50,
});
```

### Topic API

```tsx
const client = useMirrorNodeClient();

// Get topic info
const topic = await client.topic.getInfo("0.0.789");

// Get topic messages
const messages = await client.topic.getMessages("0.0.789", {
  limit: 50,
  encoding: "utf-8",
});

// Get specific message by sequence number
const message = await client.topic.getMessage("0.0.789", 1);

// List topics
const topics = await client.topic.listPaginated({ limit: 25 });
```

### Transaction API

```tsx
const client = useMirrorNodeClient();

// Get transaction by ID
const tx = await client.transaction.getById("0.0.123@1234567890.123456789");

// Get transactions by account
const txs = await client.transaction.listByAccount("0.0.123", {
  limit: 50,
  result: "SUCCESS",
});

// List transactions with filters
const allTxs = await client.transaction.listPaginated({
  "account.id": "0.0.123",
  timestamp: { from: "1234567890.000000000", to: "1234567900.000000000" },
  limit: 100,
});
```

### Contract API

```tsx
const client = useMirrorNodeClient();

// Get contract info
const contract = await client.contract.getInfo("0.0.456");

// Call contract (read-only)
const result = await client.contract.call({
  contractId: "0.0.456",
  data: "0x...",
});

// Get contract execution results
const results = await client.contract.getResults("0.0.456", { limit: 25 });

// Get contract state
const state = await client.contract.getState("0.0.456", { slot: "0x..." });

// Get contract logs
const logs = await client.contract.getLogs("0.0.456", {
  timestamp: "1234567890.123456789",
});

// List contracts
const contracts = await client.contract.listPaginated({ limit: 50 });
```

### Schedule API

```tsx
const client = useMirrorNodeClient();

// Get schedule info
const schedule = await client.schedule.getInfo("0.0.123");

// List schedules with filters
const schedules = await client.schedule.listPaginated({
  "creator.account.id": "0.0.456",
  executed_timestamp: "gte:1234567890.000000000",
  limit: 25,
});
```

### Network API

```tsx
const client = useMirrorNodeClient();

// Get exchange rate
const rate = await client.network.getExchangeRate();

// Get network fees
const fees = await client.network.getFees();

// Get network nodes
const nodes = await client.network.getNodes();

// Get stake info
const stake = await client.network.getStake();

// Get token supply
const supply = await client.network.getSupply();
```

## Type Safety

All API methods return a typed `ApiResult<T>` that is a discriminated union:

```tsx
type ApiResult<T> = { success: true; data: T } | { success: false; error: ApiError };

// Handle success
const result = await client.account.getInfo("0.0.123");
if (result.success) {
  // result.data is fully typed
  console.log(result.data.balance);
}

// Handle error
if (!result.success) {
  console.error(result.error.message);
  console.log(result.error._tag); // "NetworkError" | "ValidationError" | "NotFoundError" | "RateLimitError" | "UnknownError"
}
```

## TanStack Query Integration

Use the query keys for cache management:

```tsx
import { useQuery } from "@tanstack/react-query";
import { MirrorNodeClient, mirrorNodeKeys } from "@hiecom/react";

const client = new MirrorNodeClient({ network: "mainnet" });

function AccountBalance({ accountId }: { accountId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: mirrorNodeKeys.account.info(accountId),
    queryFn: () => client.account.getInfo(accountId),
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data?.success) return <div>Error: {data.error.message}</div>;

  return <div>Balance: {data.data.balance.balance}</div>;
}
```

## Pagination

```tsx
// Simple pagination with listPaginated
const result = await client.account.listPaginated({
  limit: 25,
  order: "desc",
});

if (result.success) {
  console.log(result.data); // First page of results
  console.log(result.links?.next); // Cursor for next page
}

// Cursor-based pagination with paginator
const paginator = client.account.createAccountPaginator({
  limit: 25,
  order: "desc",
});

const page1 = await paginator.next();
const page2 = await paginator.next();
const allResults = await paginator.collect();
```

## Query Operators

Filter your queries using operators:

```tsx
// Single value (exact match)
{ account: "0.0.123" }

// Operators
{ balance: "gte:1000" }    // Greater than or equal
{ balance: "lte:500" }      // Less than or equal
{ balance: "gt:100" }      // Greater than
{ balance: "lt:50" }        // Less than
{ balance: "ne:0" }         // Not equal

// Timestamp range
{ timestamp: { from: "1234567890.000000000", to: "1234567900.000000000" } }
```

## License

Apache-2.0
