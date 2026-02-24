# @hiecom/react-mirror-node

Type-safe React hooks for Hedera Mirror Node.

## Install

```bash
# bun
bun add @hiecom/mirror-node @hiecom/react-mirror-node @tanstack/react-query

# npm
npm install @hiecom/mirror-node @hiecom/react-mirror-node @tanstack/react-query

# pnpm
pnpm add @hiecom/mirror-node @hiecom/react-mirror-node @tanstack/react-query

# yarn
yarn add @hiecom/mirror-node @hiecom/react-mirror-node @tanstack/react-query
```

## Quick Start

### 1. Setup Provider

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MirrorNodeProvider, createNetworkConfig } from "@hiecom/react-mirror-node";

const queryClient = new QueryClient();

// Default networks (mainnet, testnet, previewnet) are built-in
// Only specify custom networks if needed
const config = createNetworkConfig({
  defaultNetwork: "mainnet",
  networks: {
    local: "http://localhost:5600",
    staging: "https://staging.mirrornode.hedera.com",
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MirrorNodeProvider config={config}>
        <YourApp />
      </MirrorNodeProvider>
    </QueryClientProvider>
  );
}
```

### 2. Use Hooks

```tsx
import { useAccountInfo } from "@hiecom/react-mirror-node";

function AccountBalance({ accountId }: { accountId: string }) {
  const { data, isLoading, error } = useAccountInfo({ accountId });

  if (isLoading) return <span>Loading...</span>;
  if (!data?.success) return <span>Error: {data.error.message}</span>;

  return <span>Balance: {data.data.balance.balance} ℏ</span>;
}
```

## Network Switching

The package supports switching between networks at runtime.

### Define Your Networks

Default networks (mainnet, testnet, previewnet) are built-in with official Hedera URLs. Only specify custom networks:

```tsx
const config = createNetworkConfig({
  defaultNetwork: "mainnet",
  networks: {
    local: "http://localhost:5600",
    staging: "https://staging.mirrornode.hedera.com",
  },
});
```

### Switch Networks

```tsx
import { useNetwork } from "@hiecom/react-mirror-node";

function NetworkSwitcher() {
  const { network, switchNetwork } = useNetwork();

  return (
    <div>
      <p>Current: {network}</p>
      <button onClick={() => switchNetwork("testnet")}>Testnet</button>
      <button onClick={() => switchNetwork("mainnet")}>Mainnet</button>
      <button onClick={() => switchNetwork("local")}>Local</button>
    </div>
  );
}
```

### Query Keys Are Network-Aware

All queries automatically include the network in their cache keys, so switching networks triggers automatic refetch:

```tsx
// When network is "mainnet", key is:
// ["mirror-node", "mainnet", "account", "info", "0.0.123"]

// When network switches to "testnet", key becomes:
// ["mirror-node", "testnet", "account", "info", "0.0.123"]
// This triggers automatic refetch
```

## Prefetch & Invalidation

Generic helpers that work with all query keys:

```tsx
import { prefetchQuery, invalidateQueries, mirrorNodeKeys } from "@hiecom/react-mirror-node";

// Prefetch any query - method is automatically resolved
await prefetchQuery(queryClient, client, mirrorNodeKeys.account.info("mainnet", accountId));
await prefetchQuery(queryClient, client, mirrorNodeKeys.token.nft("mainnet", tokenId, serial));
await prefetchQuery(queryClient, client, mirrorNodeKeys.network.exchangeRate("mainnet"));

// Invalidate by exact key
await invalidateQueries(queryClient, {
  exactKey: mirrorNodeKeys.account.info("mainnet", accountId),
});

// Invalidate by entity type (type-safe)
await invalidateQueries(queryClient, { entityType: "account" });

// Invalidate by entity + ID
await invalidateQueries(queryClient, {
  entityType: "account",
  resourceId: accountId,
});

// Invalidate all mirror-node queries
await invalidateQueries(queryClient, {});
```

## Hooks

### Account

```tsx
useAccountInfo({ accountId });
useAccountBalances({ accountId });
useAccountTokens({ accountId, params });
useAccountNfts({ accountId, params });
useAccountStakingRewards({ accountId, params });
useAccountCryptoAllowances({ accountId });
useAccountTokenAllowances({ accountId, params });
useAccountNftAllowances({ accountId, params });
useAccountOutstandingAirdrops({ accountId, params });
useAccountPendingAirdrops({ accountId, params });
useAccounts({ params });
useAccountsInfinite({ params });
```

### Token

```tsx
useTokenInfo({ tokenId });
useTokenBalances({ tokenId, params });
useTokenNfts({ tokenId, params });
useTokenNft({ tokenId, serialNumber });
useTokenNftTransactions({ tokenId, serialNumber, params });
useTokens({ params });
useTokensInfinite({ params });
```

### Topic

```tsx
useTopicInfo({ topicId });
useTopicMessages({ topicId, params });
useTopicMessage({ topicId, sequenceNumber });
useTopicMessageByTimestamp({ timestamp });
useTopics({ params });
useTopicsInfinite({ params });
```

### Transaction

```tsx
useTransaction({ transactionId });
useTransactionsByAccount({ accountId, params });
useTransactions({ params });
useTransactionsInfinite({ params });
```

### Contract

```tsx
useContractInfo({ contractIdOrAddress });
useContractCall({ params });
useContractResults({ contractId, params });
useContractResult({ contractId, timestamp });
useContractAllResults({ params });
useContractResultByTransactionIdOrHash({ transactionIdOrHash, params });
useContractResultActions({ transactionIdOrHash });
useContractResultOpcodes({ transactionIdOrHash });
useContractState({ contractId, params });
useContractLogs({ contractId, params });
useContractAllLogs({ params });
useContracts({ params });
useContractsInfinite({ params });
```

### Schedule

```tsx
useScheduleInfo({ scheduleId });
useSchedules({ params });
useSchedulesInfinite({ params });
```

### Network

```tsx
useNetworkExchangeRate();
useNetworkFees();
useNetworkNodes();
useNetworkStake();
useNetworkSupply();
```

### Balance

```tsx
useBalances({ params });
```

### Block

```tsx
useBlock({ hashOrNumber });
useBlocks({ params });
```

## Query Options

All hooks accept TanStack Query options:

```tsx
const { data } = useAccountInfo({
  accountId: "0.0.123",
  enabled: true,
  staleTime: 1000 * 60 * 5,
  refetchOnWindowFocus: false,
  retry: 3,
});
```

## Pagination

```tsx
const { data } = useAccounts({ params: { balance: "gte:1000", limit: 25 } });

const { data, fetchNextPage, hasNextPage } = useAccountsInfinite({
  params: { limit: 25 },
});
```

## License

MIT
