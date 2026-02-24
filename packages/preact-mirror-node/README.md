# @hiecom/preact-mirror-node

Type-safe Preact hooks for Hedera Mirror Node API with TanStack Query.

## Installation

```bash
bun add @hiecom/mirror-node @hiecom/preact-mirror-node @tanstack/react-query
```

## Quick Start

### Step 1: Wrap your app with providers

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MirrorNodeProvider, createNetworkConfig } from "@hiecom/preact-mirror-node";

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
import { useAccountInfo } from "@hiecom/preact-mirror-node";

function AccountBalance({ accountId }: { accountId: string }) {
  const { data, isLoading, error } = useAccountInfo({ accountId });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.success) return <div>Failed to load</div>;

  return <div>Balance: {data.data.balance.balance} tinybars</div>;
}
```

## Switching Networks

Switch networks at runtime. All queries automatically refetch with the new network:

```tsx
import { useNetwork } from "@hiecom/preact-mirror-node";

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

## Pagination

The Hedera Mirror Node API uses cursor-based pagination. The hooks handle this automatically.

### List Queries

List hooks fetch all items across all pages by default:

```tsx
import { useTokens } from "@hiecom/preact-mirror-node";

function TokenList() {
  const { data, isLoading } = useTokens({
    params: { limit: 25, order: "desc" },
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data?.success) return <div>Failed to load</div>;

  return (
    <div>
      <p>Showing {data.data.length} tokens</p>
      <ul>
        {data.data.map((token) => (
          <li key={token.token_id}>{token.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

The `limit` parameter controls how many items per page to fetch from the API. The hooks automatically follow the pagination cursor (`links.next`) to fetch all pages and combine the results.

## Available Hooks

### Accounts
- `useAccountInfo` - Get account details
- `useAccountBalances` - Get account balances
- `useAccountTokens` - Get associated tokens
- `useAccountNfts` - Get associated NFTs
- `useAccounts` - List accounts (with pagination)

### Tokens
- `useTokenInfo` - Get token details
- `useTokenBalances` - Get token balances
- `useTokenNfts` - Get token NFTs
- `useTokens` - List tokens (with pagination)

### Transactions
- `useTransaction` - Get transaction details
- `useTransactions` - List transactions (with pagination)
- `usePollTransaction` - Poll for transaction confirmation

### Contracts
- `useContractInfo` - Get contract details
- `useContractCall` - Call contract function
- `useContractState` - Get contract state
- `useContractLogs` - Get contract logs
- `useContracts` - List contracts (with pagination)

### Topics
- `useTopicInfo` - Get topic details
- `useTopicMessages` - Get topic messages
- `useTopics` - List topics (with pagination)

### Schedules
- `useScheduleInfo` - Get schedule details
- `useSchedules` - List schedules (with pagination)

### Network
- `useNetworkExchangeRate` - Get HBAR exchange rates
- `useNetworkFees` - Get network fees
- `useNetworkNodes` - Get network nodes
- `useNetworkStake` - Get network stake
- `useNetworkSupply` - Get network supply

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

## Utilities

Prefetch and invalidate queries from anywhere in your app:

```tsx
import { prefetchQuery, invalidateQueries, mirrorNodeKeys } from "@hiecom/preact-mirror-node";
import { useMirrorNodeClient } from "@hiecom/preact-mirror-node";

function MyComponent() {
  const client = useMirrorNodeClient();

  // Prefetch data before it's needed
  const prefetchAccount = async () => {
    await prefetchQuery(queryClient, client, mirrorNodeKeys.account.info("mainnet", "0.0.123"));
  };

  // Invalidate queries to trigger refetch
  const refreshAccount = async () => {
    // Invalidate specific query
    await invalidateQueries(queryClient, {
      exactKey: mirrorNodeKeys.account.info("mainnet", "0.0.123"),
    });

    // Invalidate all queries for an entity type
    await invalidateQueries(queryClient, { entityType: "account" });

    // Invalidate all queries for an entity with specific ID
    await invalidateQueries(queryClient, {
      entityType: "account",
      resourceId: "0.0.123",
    });
  };

  // Invalidate all mirror-node queries
  const refreshAll = async () => {
    await invalidateQueries(queryClient, {});
  };
}
```

## License

MIT
