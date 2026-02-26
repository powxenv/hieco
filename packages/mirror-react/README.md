# @hiecom/mirror-react

Type-safe React hooks for Hedera Mirror Node API with TanStack Query.

## Features

- **Full API Coverage** - Hooks for accounts, tokens, transactions, contracts, topics, schedules, blocks, network
- **Auto-pagination** - List hooks automatically fetch all pages
- **Infinite Queries** - Support for infinite scroll and load-more patterns
- **Network Switching** - Runtime network switching with automatic query refetch
- **Type-Safe** - Full TypeScript support
- **Optimistic Updates** - Prefetch and invalidate queries from anywhere

## Installation

```bash
# bun
bun add @hiecom/mirror-js @hiecom/mirror-react @tanstack/react-query

# npm
npm install @hiecom/mirror-js @hiecom/mirror-react @tanstack/react-query

# pnpm
pnpm add @hiecom/mirror-js @hiecom/mirror-react @tanstack/react-query

# yarn
yarn add @hiecom/mirror-js @hiecom/mirror-react @tanstack/react-query
```

## Quick Start

### Step 1: Wrap your app with providers

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MirrorNodeProvider, createNetworkConfig } from "@hiecom/mirror-react";

const queryClient = new QueryClient();

const networkConfig = createNetworkConfig({
  defaultNetwork: "mainnet",
  networks: {
    testnet: "https://testnet.mirrornode.hedera.com",
    custom: "https://custom.mirror-node.com",
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MirrorNodeProvider config={networkConfig}>
        <YourApp />
      </MirrorNodeProvider>
    </QueryClientProvider>
  );
}
```

### Step 2: Use hooks in your components

```tsx
import { useAccountInfo } from "@hiecom/mirror-react";

function AccountBalance({ accountId }: { accountId: string }) {
  const { data, isLoading, error } = useAccountInfo({ accountId });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.success) return <div>Failed to load</div>;

  return <div>Balance: {data.data.balance.balance} tinybars</div>;
}
```

## API Reference

### Provider Hooks

#### useNetwork

```typescript
const { network, switchNetwork } = useNetwork();
```

- `network: string` - Current network name
- `switchNetwork(network: string): void` - Switch to a different network

#### useMirrorNodeClient

```typescript
const client = useMirrorNodeClient();
```

- Returns the underlying `MirrorNodeClient` instance

### Account Hooks

```typescript
useAccountInfo({ accountId }: { accountId: string })
useAccountBalances({ accountId }: { accountId: string })
useAccountTokens({ accountId, params }: { accountId: string; params?: AccountNftsParams })
useAccountNfts({ accountId, params }: { accountId: string; params?: AccountNftsParams })
useAccountStakingRewards({ accountId, params }: { accountId: string; params?: PaginationParams })
useAccountCryptoAllowances({ accountId }: { accountId: string })
useAccountTokenAllowances({ accountId, params }: { accountId: string; params?: TokenAllowancesParams })
useAccountNftAllowances({ accountId }: { accountId: string })
useAccountOutstandingAirdrops({ accountId }: { accountId: string })
useAccountPendingAirdrops({ accountId }: { accountId: string })
useAccounts({ params }: { params?: AccountListParams })
useAccountsInfinite({ params }: { params?: AccountListParams })
```

### Token Hooks

```typescript
useTokenInfo({ tokenId }: { tokenId: string })
useTokenBalances({ tokenId, params }: { tokenId: string; params?: TokenBalancesParams })
useTokenNfts({ tokenId }: { tokenId: string })
useTokenNft({ tokenId, serialNumber }: { tokenId: string; serialNumber: number })
useTokenNftTransactions({ tokenId, serialNumber }: { tokenId: string; serialNumber: number })
useTokens({ params }: { params?: TokenListParams })
useTokensInfinite({ params }: { params?: TokenListParams })
```

### Transaction Hooks

```typescript
useTransaction({ transactionId }: { transactionId: string })
useTransactions({ params }: { params?: TransactionListParams })
useTransactionsByAccount({ accountId, params }: { accountId: string; params?: TransactionsByAccountParams })
useTransactionsInfinite({ params }: { params?: TransactionListParams })
usePollTransaction({ transactionId, options }: { transactionId: string; options?: { refetchInterval?: number } })
```

### Contract Hooks

```typescript
useContractInfo({ contractId }: { contractId: string })
useContractCall(params: ContractCallParams)
useContractResults({ contractId }: { contractId: string })
useContractResult({ contractId, resultId }: { contractId: string; resultId: string })
useContractAllResults({ params }: { params?: ContractResultsParams })
useContractResultByTransactionIdOrHash({ txIdOrHash }: { txIdOrHash: string })
useContractResultActions({ resultId }: { resultId: string })
useContractResultOpcodes({ resultId }: { resultId: string })
useContractState({ contractId, params }: { contractId: string; params?: ContractStateParams })
useContractLogs({ contractId }: { contractId: string })
useContractAllLogs({ params }: { params?: ContractLogsParams })
useContracts({ params }: { params?: ContractListParams })
useContractsInfinite({ params }: { params?: ContractListParams })
```

### Topic Hooks

```typescript
useTopicInfo({ topicId }: { topicId: string })
useTopicMessages({ topicId, params }: { topicId: string; params?: TopicMessagesParams })
useTopicMessage({ topicId, sequenceNumber }: { topicId: string; sequenceNumber: number })
useTopicMessageByTimestamp({ timestamp }: { timestamp: string })
useTopics({ params }: { params?: PaginationParams })
useTopicsInfinite({ params }: { params?: PaginationParams })
```

### Schedule Hooks

```typescript
useScheduleInfo({ scheduleId }: { scheduleId: string })
useSchedules({ params }: { params?: ScheduleListParams })
useSchedulesInfinite({ params }: { params?: ScheduleListParams })
```

### Block Hooks

```typescript
useBlock({ blockNumberOrHash }: { blockNumberOrHash: string | number })
useBlocks({ params }: { params?: BlocksListParams })
```

### Balance Hooks

```typescript
useBalances({ params }: { params?: BalancesListParams })
```

### Network Hooks

```typescript
useNetworkExchangeRate({ params }: { params?: { timestamp?: Timestamp } })
useNetworkFees({ params }: { params?: PaginationParams & { timestamp?: Timestamp } })
useNetworkNodes({ params }: { params?: NetworkNodesParams })
useNetworkStake()
useNetworkSupply()
```

### Utility Hooks

```typescript
usePrefetchQuery();
useInvalidateQueries();
```

## Query Options

All hooks accept standard TanStack Query options:

```tsx
const { data } = useAccountInfo({
  accountId: "0.0.123",
  enabled: true,
  staleTime: 60000,
  refetchOnWindowFocus: false,
});
```

## Pagination

### List Queries (Auto-Fetch All)

```tsx
import { useTokens } from "@hiecom/mirror-react";

function TokenList() {
  const { data, isLoading } = useTokens({
    params: { limit: 25, order: "desc" },
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data?.success) return <div>Failed to load</div>;

  return (
    <div>
      <p>Total: {data.data.length} tokens</p>
      <ul>
        {data.data.map((token) => (
          <li key={token.token_id}>{token.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Infinite Queries

```tsx
import { useTokensInfinite } from "@hiecom/mirror-react";

function TokenList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useTokensInfinite();

  return (
    <div>
      {data?.pages.map(
        (page) =>
          page.success &&
          page.data.data.map((token) => <div key={token.token_id}>{token.name}</div>),
      )}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
```

## Examples

### Network Switching

```tsx
import { useNetwork } from "@hiecom/mirror-react";

function NetworkSelector() {
  const { network, switchNetwork } = useNetwork();

  return (
    <div>
      <span>Current: {network}</span>
      <button onClick={() => switchNetwork("mainnet")}>Mainnet</button>
      <button onClick={() => switchNetwork("testnet")}>Testnet</button>
    </div>
  );
}
```

### Prefetch and Invalidate

```tsx
import { prefetchQuery, invalidateQueries, mirrorNodeKeys } from "@hiecom/mirror-react";

function MyComponent() {
  const client = useMirrorNodeClient();

  const prefetchAccount = async () => {
    await prefetchQuery(queryClient, client, mirrorNodeKeys.account.info("mainnet", "0.0.123"));
  };

  const refreshAccount = async () => {
    await invalidateQueries(queryClient, {
      exactKey: mirrorNodeKeys.account.info("mainnet", "0.0.123"),
    });
  };

  return <button onClick={refreshAccount}>Refresh</button>;
}
```

## Related Packages

- [`@hiecom/mirror-js`](https://www.npmjs.com/package/@hiecom/mirror-js) - Core REST API client
- [`@hiecom/mirror-shared`](https://github.com/powxenv/hiecom/tree/main/packages/mirror-shared) - Shared utilities (internal)
- [`@hiecom/realtime`](https://www.npmjs.com/package/@hiecom/realtime) - WebSocket streaming client

## License

MIT
