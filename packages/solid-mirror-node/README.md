# @hiecom/solid-mirror-node

Type-safe SolidJS hooks for Hedera Mirror Node API with TanStack Query.

## Installation

```bash
bun add @hiecom/mirror-node @hiecom/solid-mirror-node @tanstack/solid-query
```

## Quick Start

### Step 1: Wrap your app with providers

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { MirrorNodeProvider, createNetworkConfig } from "@hiecom/solid-mirror-node";

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
import { createAccountInfo } from "@hiecom/solid-mirror-node";
import { Show } from "solid-js";

function AccountBalance(props: { accountId: string }) {
  const query = createAccountInfo(() => ({
    accountId: props.accountId,
  }));

  return (
    <Show when={query.data}>
      {(data) => (
        <Show when={data().success} fallback={<div>Error: {data().error.message}</div>}>
          {(result) => <div>Balance: {result().data.balance.balance} tinybars</div>}
        </Show>
      )}
    </Show>
  );
}
```

## Switching Networks

Switch networks at runtime. All queries automatically refetch with the new network:

```tsx
import { useNetwork } from "@hiecom/solid-mirror-node";

function NetworkSelector() {
  const { network, switchNetwork } = useNetwork();

  return (
    <div>
      <span>Current: {network()}</span>
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
import { createTokens } from "@hiecom/solid-mirror-node";
import { Show } from "solid-js";

function TokenList() {
  const query = createTokens(() => ({
    params: { limit: 25, order: "desc" },
  }));

  return (
    <Show when={query.data?.success} fallback={<div>Loading...</div>}>
      {(data) => (
        <div>
          <p>Showing {data().data.length} tokens</p>
          <ul>
            {data().data.map((token) => (
              <li key={token.token_id}>{token.name}</li>
            ))}
          </ul>
        </div>
      )}
    </Show>
  );
}
```

The `limit` parameter controls how many items per page to fetch from the API. The hooks automatically follow the pagination cursor (`links.next`) to fetch all pages and combine the results.

## Available Hooks

All hooks use `create` prefix and accept reactive `Accessor<T>` options.

### Accounts
- `createAccountInfo` - Get account details
- `createAccountBalances` - Get account balances
- `createAccountTokens` - Get associated tokens
- `createAccountNfts` - Get associated NFTs
- `createAccounts` - List accounts (with pagination)

### Tokens
- `createTokenInfo` - Get token details
- `createTokenBalances` - Get token balances
- `createTokenNfts` - Get token NFTs
- `createTokens` - List tokens (with pagination)

### Transactions
- `createTransaction` - Get transaction details
- `createTransactions` - List transactions (with pagination)
- `createPollTransaction` - Poll for transaction confirmation

### Contracts
- `createContractInfo` - Get contract details
- `createContractCall` - Call contract function
- `createContractState` - Get contract state
- `createContractLogs` - Get contract logs
- `createContracts` - List contracts (with pagination)

### Topics
- `createTopicInfo` - Get topic details
- `createTopicMessages` - Get topic messages
- `createTopics` - List topics (with pagination)

### Schedules
- `createScheduleInfo` - Get schedule details
- `createSchedules` - List schedules (with pagination)

### Network
- `createNetworkExchangeRate` - Get HBAR exchange rates
- `createNetworkFees` - Get network fees
- `createNetworkNodes` - Get network nodes
- `createNetworkStake` - Get network stake
- `createNetworkSupply` - Get network supply

## Query Options

All hooks accept standard TanStack Query options:

```tsx
const query = createAccountInfo(() => ({
  accountId: "0.0.123",
  enabled: true,
  staleTime: 60000,
  refetchOnWindowFocus: false,
}));
```

## Reactivity in SolidJS

Options are wrapped in functions for automatic tracking:

```tsx
function AccountComponent() {
  const accountId = createSignal("0.0.123");

  // Automatically tracked - refetches when accountId changes
  const query = createAccountInfo(() => ({
    accountId: accountId(),
  }));

  return <div>{query.data()?.data?.balance.balance}</div>;
}
```

## Utilities

Prefetch and invalidate queries from anywhere in your app:

```tsx
import { prefetchQuery, invalidateQueries, mirrorNodeKeys } from "@hiecom/solid-mirror-node";
import { useMirrorNodeClient } from "@hiecom/solid-mirror-node";

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
