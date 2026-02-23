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
    <MirrorNodeProvider client={client}>
      <YourApp />
    </MirrorNodeProvider>
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

// Get outstanding airdrops
const airdrops = await client.account.getOutstandingAirdrops("0.0.123", {
  limit: 25,
});

// Get pending airdrops
const pending = await client.account.getPendingAirdrops("0.0.123", {
  "token.id": "0.0.456",
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

### Balance API

```tsx
const client = useMirrorNodeClient();

// Get balances for multiple accounts
const balances = await client.balance.getBalances({
  account: "0.0.123",
  limit: 100,
});

if (balances.success) {
  console.log(balances.data.balances); // Array of account balances
  console.log(balances.data.timestamp); // Balance timestamp
}
```

### Block API

```tsx
const client = useMirrorNodeClient();

// Get blocks
const blocks = await client.block.getBlocks({
  limit: 25,
  order: "desc",
});

if (blocks.success) {
  console.log(blocks.data.blocks); // Array of blocks
}

// Get specific block by hash or number
const block = await client.block.getBlock("0x123...");
// or
const block = await client.block.getBlock("12345");

if (block.success) {
  console.log(block.data.number);
  console.log(block.data.timestamp);
}
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

## Error Handling

The SDK provides comprehensive error handling through the `ApiError` discriminated union:

```tsx
const result = await client.account.getInfo("0.0.123");

if (!result.success) {
  switch (result.error._tag) {
    case "NetworkError":
      // HTTP request failed or returned non-2xx status
      console.error(`Network error: ${result.error.message}`);
      console.log(`Status: ${result.error.status}`);
      break;

    case "NotFoundError":
      // Resource not found (404)
      console.error(`Not found: ${result.error.message}`);
      break;

    case "RateLimitError":
      // Rate limited (429)
      console.error(`Rate limited: ${result.error.message}`);
      const retryAfter = result.error.code; // Retry-After header value
      break;

    case "ValidationError":
      // Invalid request parameters
      console.error(`Validation error: ${result.error.message}`);
      console.log(`Code: ${result.error.code}`);
      break;

    case "UnknownError":
      // Unexpected error
      console.error(`Unknown error: ${result.error.message}`);
      break;
  }
}
```

### Automatic Retry Behavior

The HTTP client automatically retries failed requests with exponential backoff:

- **Retry conditions**: 408, 413, 429, 500, 502, 503, 504 status codes
- **Max retries**: 3 attempts
- **Backoff delay**: 1000ms \* 2^(attempt-1) (1s, 2s, 4s)
- **Max backoff**: 10 seconds
- **Rate limiting**: 50 concurrent requests maximum

### Error Utilities

For creating consistent error responses in your own code:

```tsx
import { ApiErrorFactory } from "@hiecom/react";

const error = ApiErrorFactory.network("Connection failed", 503);
// { _tag: "NetworkError", message: "Connection failed", status: 503 }

const notFound = ApiErrorFactory.notFound("Account not found");
// { _tag: "NotFoundError", message: "Account not found" }

const rateLimit = ApiErrorFactory.rateLimit("Too many requests", 60);
// { _tag: "RateLimitError", message: "Too many requests", code: "60" }
```

## TanStack Query Integration

The package provides pre-built hooks for TanStack Query (React Query). Install the optional peer dependency:

```bash
npm install @tanstack/react-query
# or
bun add @tanstack/react-query
```

### Using Pre-built Hooks

Import hooks from the `@hiecom/react/tanstack-query` subpath:

```tsx
import { MirrorNodeProvider } from "@hiecom/react";
import { useAccountInfo, useTokens, useTransactions } from "@hiecom/react/tanstack-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
const client = new MirrorNodeClient({ network: "mainnet" });

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MirrorNodeProvider client={client}>
        <YourApp />
      </MirrorNodeProvider>
    </QueryClientProvider>
  );
}

function AccountBalance({ accountId }: { accountId: string }) {
  const { data, isLoading, error } = useAccountInfo({ accountId });

  if (isLoading) return <div>Loading...</div>;
  if (!data?.success) return <div>Error: {data.error.message}</div>;

  return <div>Balance: {data.data.balance.balance}</div>;
}

function TokensList() {
  const { data, isLoading } = useTokens({
    params: { type: "FUNGIBLE_COMMON", limit: 50 },
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data?.success) return <div>Error loading tokens</div>;

  return (
    <ul>
      {data.data.map((token) => (
        <li key={token.token_id}>{token.name}</li>
      ))}
    </ul>
  );
}
```

### Infinite Queries

For paginated data, use the infinite query hooks:

```tsx
import { useAccountsInfinite } from "@hiecom/react/tanstack-query";

function AccountsList() {
  const { data, fetchNextPage, hasNextPage, isLoading } = useAccountsInfinite({
    params: { limit: 25, order: "desc" },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      {data?.pages.map((page) =>
        page.success
          ? page.data.map((account) => <div key={account.account}>{account.account}</div>)
          : null,
      )}
      {hasNextPage && <button onClick={() => fetchNextPage()}>Load More</button>}
    </>
  );
}
```

### Available Hooks

All hooks return `UseQueryResult<ApiResult<T>>` or `UseInfiniteQueryResult<ApiResult<T>>`:

#### Account Hooks

- `useAccountInfo({ accountId })` - Get account information
- `useAccountBalances({ accountId })` - Get account balances
- `useAccountTokens({ accountId, params })` - Get account tokens
- `useAccountNfts({ accountId, params })` - Get account NFTs
- `useAccountStakingRewards({ accountId, params })` - Get staking rewards
- `useAccountCryptoAllowances({ accountId })` - Get crypto allowances
- `useAccountTokenAllowances({ accountId, params })` - Get token allowances
- `useAccountNftAllowances({ accountId, params })` - Get NFT allowances
- `useAccountOutstandingAirdrops({ accountId, params })` - Get outstanding airdrops
- `useAccountPendingAirdrops({ accountId, params })` - Get pending airdrops
- `useAccounts({ params })` - List accounts
- `useAccountsInfinite({ params })` - Infinite scroll accounts

#### Token Hooks

- `useTokenInfo({ tokenId })` - Get token information
- `useTokenBalances({ tokenId, params })` - Get token holders
- `useTokenNfts({ tokenId, params })` - Get token NFTs
- `useTokenNft({ tokenId, serialNumber })` - Get specific NFT
- `useTokens({ params })` - List tokens
- `useTokensInfinite({ params })` - Infinite scroll tokens

#### Transaction Hooks

- `useTransaction({ transactionId })` - Get transaction details
- `useTransactionsByAccount({ accountId, params })` - Get account transactions
- `useTransactions({ params })` - List all transactions
- `useTransactionsInfinite({ params })` - Infinite scroll transactions

#### Contract Hooks

- `useContractInfo({ contractIdOrAddress })` - Get contract info
- `useContractCall({ params })` - Call contract (read-only)
- `useContractResults({ contractId, params })` - Get contract results
- `useContractState({ contractId, params })` - Get contract state
- `useContractLogs({ contractId, params })` - Get contract logs
- `useContracts({ params })` - List contracts
- `useContractsInfinite({ params })` - Infinite scroll contracts

#### Topic Hooks

- `useTopicInfo({ topicId })` - Get topic information
- `useTopicMessages({ topicId, params })` - Get topic messages
- `useTopicMessage({ topicId, sequenceNumber })` - Get specific message
- `useTopics({ params })` - List topics
- `useTopicsInfinite({ params })` - Infinite scroll topics

#### Schedule Hooks

- `useScheduleInfo({ scheduleId })` - Get schedule information
- `useSchedules({ params })` - List schedules
- `useSchedulesInfinite({ params })` - Infinite scroll schedules

#### Network Hooks

- `useNetworkExchangeRate()` - Get HBAR exchange rate
- `useNetworkFees({ params })` - Get network fees
- `useNetworkNodes()` - Get network nodes
- `useNetworkStake()` - Get network stake information
- `useNetworkSupply()` - Get total token supply

#### Balance & Block Hooks

- `useBalances({ params })` - Get account balances
- `useBlocks({ params })` - Get blocks
- `useBlock({ hashOrNumber })` - Get specific block

### Advanced: Using Query Keys Directly

For custom query implementations, use the exported query keys:

```tsx
import { useQuery } from "@tanstack/react-query";
import { useMirrorNodeClient, mirrorNodeKeys } from "@hiecom/react";

function CustomAccountQuery({ accountId }: { accountId: string }) {
  const client = useMirrorNodeClient();

  const { data } = useQuery({
    queryKey: mirrorNodeKeys.account.info(accountId),
    queryFn: () => client.account.getInfo(accountId),
    staleTime: 30_000, // 30 seconds
  });

  if (!data?.success) return null;
  return <div>{data.data.account}</div>;
}
```

## Pagination

The SDK supports two pagination patterns:

### Automatic Pagination

`listPaginated` automatically fetches all pages and returns a complete array:

```tsx
const result = await client.account.listPaginated({
  limit: 25,
  order: "desc",
});

if (result.success) {
  console.log(result.data); // Array of ALL accounts (all pages fetched)
  console.log(result.data.length); // Total count
}
```

### Cursor-based Pagination

For manual control over pagination, use the paginator:

```tsx
// Create a paginator
const paginator = client.account.createAccountPaginator({
  limit: 25,
  order: "desc",
});

// Iterate with for-await-of (async generator)
for await (const account of paginator) {
  console.log(account.account);
}

// Or manually control iteration
const page1 = await paginator.fetchNext();
// Returns: { success: true, data: PaginatedResponse<AccountInfo> }

// Use as async iterable in React
function useAccounts() {
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);

  useEffect(() => {
    const paginator = client.account.createAccountPaginator({ limit: 25 });
    const load = async () => {
      for await (const account of paginator) {
        setAccounts((prev) => [...prev, account]);
      }
    };
    load();
  }, []);

  return accounts;
}
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
