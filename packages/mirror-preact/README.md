# @hieco/mirror-preact

Type-safe Preact hooks for Hedera Mirror Node API with TanStack Query.

## Features

- **Full API Coverage** - Hooks for accounts, tokens, transactions, contracts, topics, schedules, blocks, network
- **Auto-pagination** - List hooks automatically fetch all pages
- **Infinite Queries** - Support for infinite scroll and load-more patterns
- **Network Switching** - Runtime network switching with automatic query refetch
- **Type-Safe** - Full TypeScript support
- **Bundle Optimized** - Optimized for Preact's smaller bundle size

## Installation

```bash
# bun
bun add @hieco/mirror @hieco/mirror-preact @tanstack/preact-query

# npm
npm install @hieco/mirror @hieco/mirror-preact @tanstack/preact-query

# pnpm
pnpm add @hieco/mirror @hieco/mirror-preact @tanstack/preact-query

# yarn
yarn add @hieco/mirror @hieco/mirror-preact @tanstack/preact-query
```

## Quick Start

### Step 1: Wrap your app with providers

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/preact-query";
import { MirrorNodeProvider } from "@hieco/mirror-preact";

const queryClient = new QueryClient();

const networkConfig = {
  defaultNetwork: "mainnet",
  networks: {
    testnet: "https://testnet.mirrornode.hedera.com",
    custom: "https://custom-mirror-node.com",
  },
};

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
import { useAccountInfo } from "@hieco/mirror-preact";

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

```typescript
const { network, switchNetwork } = useNetwork();
const client = useMirrorNodeClient();
```

### Account Hooks

```typescript
useAccountInfo({ accountId });
useAccountBalances({ accountId });
useAccountTokens({ accountId, params });
useAccountNfts({ accountId, params });
useAccountStakingRewards({ accountId, params });
useAccountCryptoAllowances({ accountId });
useAccountTokenAllowances({ accountId, params });
useAccountNftAllowances({ accountId });
useAccountOutstandingAirdrops({ accountId });
useAccountPendingAirdrops({ accountId });
useAccounts({ params });
useAccountsInfinite({ params });
```

### Token Hooks

```typescript
useTokenInfo({ tokenId });
useTokenBalances({ tokenId, params });
useTokenNfts({ tokenId });
useTokenNft({ tokenId, serialNumber });
useTokenNftTransactions({ tokenId, serialNumber });
useTokens({ params });
useTokensInfinite({ params });
```

### Transaction Hooks

```typescript
useTransaction({ transactionId });
useTransactions({ params });
useTransactionsByAccount({ accountId, params });
useTransactionsInfinite({ params });
usePollTransaction({ transactionId, options });
```

### Contract Hooks

```typescript
useContractInfo({ contractId });
useContractCall(params);
useContractResults({ contractId });
useContractResult({ contractId, resultId });
useContractAllResults({ params });
useContractResultByTransactionIdOrHash({ txIdOrHash });
useContractResultActions({ resultId });
useContractResultOpcodes({ resultId });
useContractState({ contractId, params });
useContractLogs({ contractId });
useContractAllLogs({ params });
useContracts({ params });
useContractsInfinite({ params });
```

### Topic Hooks

```typescript
useTopicInfo({ topicId });
useTopicMessages({ topicId, params });
useTopicMessage({ topicId, sequenceNumber });
useTopicMessageByTimestamp({ timestamp });
useTopics({ params });
useTopicsInfinite({ params });
```

### Schedule Hooks

```typescript
useScheduleInfo({ scheduleId });
useSchedules({ params });
useSchedulesInfinite({ params });
```

### Block Hooks

```typescript
useBlock({ blockNumberOrHash });
useBlocks({ params });
```

### Balance Hooks

```typescript
useBalances({ params });
```

### Network Hooks

```typescript
useNetworkExchangeRate({ params });
useNetworkFees({ params });
useNetworkNodes({ params });
useNetworkStake();
useNetworkSupply();
```

## Examples

### Network Switching

```tsx
import { useNetwork } from "@hieco/mirror-preact";

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

### Infinite Scroll

```tsx
import { useTokensInfinite } from "@hieco/mirror-preact";

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

## Related Packages

- [`@hieco/mirror`](https://www.npmjs.com/package/@hieco/mirror) - Core REST API client
- [`@hieco/utils`](https://github.com/powxenv/hieco/tree/main/packages/utils) - Shared utilities (internal)
- [`@hieco/realtime`](https://www.npmjs.com/package/@hieco/realtime) - WebSocket streaming client

## License

MIT
