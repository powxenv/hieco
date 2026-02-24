# hiecom

Type-safe SDK for interacting with Hedera Mirror Node API across multiple frameworks.

## Packages

| Package | Description | Framework |
|---------|-------------|-----------|
| [`@hiecom/mirror-node`](packages/mirror-node) | Core HTTP client with TypeScript types | Framework-agnostic |
| [`@hiecom/react-mirror-node`](packages/react-mirror-node) | React hooks with TanStack Query | React |
| [`@hiecom/solid-mirror-node`](packages/solid-mirror-node) | SolidJS hooks with TanStack Query | SolidJS |
| [`@hiecom/preact-mirror-node`](packages/preact-mirror-node) | Preact hooks with TanStack Query | Preact |

## Features

- **Type-safe**: Full TypeScript support with inferred types
- **Multiple frameworks**: Use with React, SolidJS, Preact, or standalone
- **TanStack Query integration**: Automatic caching, refetching, and invalidation
- **Network-aware queries**: Query keys include network for proper cache isolation
- **Runtime network switching**: Change networks without page reload
- **Infinite pagination**: Built-in support for paginated endpoints

## Quick Start

### React

```bash
bun add @hiecom/mirror-node @hiecom/react-mirror-node @tanstack/react-query
```

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MirrorNodeProvider, createNetworkConfig, useAccountInfo } from "@hiecom/react-mirror-node";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MirrorNodeProvider config={createNetworkConfig({ defaultNetwork: "mainnet" })}>
        <AccountBalance accountId="0.0.123" />
      </MirrorNodeProvider>
    </QueryClientProvider>
  );
}

function AccountBalance({ accountId }: { accountId: string }) {
  const { data, isLoading } = useAccountInfo({ accountId });
  if (isLoading) return <div>Loading...</div>;
  return <div>Balance: {data?.data.balance.balance} tinybars</div>;
}
```

### SolidJS

```bash
bun add @hiecom/mirror-node @hiecom/solid-mirror-node @tanstack/solid-query solid-js
```

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { MirrorNodeProvider, createNetworkConfig, createAccountInfo } from "@hiecom/solid-mirror-node";
import { Show } from "solid-js";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MirrorNodeProvider config={createNetworkConfig({ defaultNetwork: "mainnet" })}>
        <AccountBalance accountId="0.0.123" />
      </MirrorNodeProvider>
    </QueryClientProvider>
  );
}

function AccountBalance(props: { accountId: string }) {
  const query = createAccountInfo(() => ({ accountId: props.accountId }));
  return (
    <Show when={query.data?.success}>
      {(data) => <div>Balance: {data().data.balance.balance} tinybars</div>}
    </Show>
  );
}
```

## Pagination

All packages support infinite queries for paginated endpoints:

### React

```tsx
import { useTransactionsInfinite } from "@hiecom/react-mirror-node";

function TransactionList() {
  const { data, fetchNextPage, hasNextPage } = useTransactionsInfinite({
    params: { limit: 25 },
  });

  const transactions = data?.pages.flatMap((page) => page.data.transactions ?? []) ?? [];

  return (
    <div>
      {transactions.map((tx) => <li key={tx.transaction_id}>{tx.name}</li>)}
      {hasNextPage && <button onClick={() => fetchNextPage()}>Load More</button>}
    </div>
  );
}
```

### SolidJS

```tsx
import { createTransactionsInfinite } from "@hiecom/solid-mirror-node";
import { For, Show } from "solid-js";

function TransactionList() {
  const query = createTransactionsInfinite(() => ({ params: { limit: 25 } }));
  const transactions = () => query.data?.pages.flatMap((page) => page.data.transactions ?? []) ?? [];

  return (
    <div>
      <For each={transactions()}>{(tx) => <li key={tx.transaction_id}>{tx.name}</li>}</For>
      <Show when={query.hasNextPage}>
        <button onClick={() => query.fetchNextPage()}>Load More</button>
      </Show>
    </div>
  );
}
```

## Available Hooks

### Accounts
- Account info, balances, tokens, NFTs
- Staking rewards, allowances

### Tokens
- Token info, balances, NFTs
- NFT transactions

### Transactions
- Transaction details
- Transactions by account
- Transaction lists (paginated + infinite)

### Contracts
- Contract info, calls, results
- Contract state, logs

### Topics
- Topic info, messages
- Message by timestamp

### Schedules
- Schedule info
- Schedule lists

### Network
- Exchange rates, fees, nodes
- Stake, supply

## Documentation

See individual package READMEs for detailed documentation:

- [@hiecom/mirror-node](packages/mirror-node) - Core client
- [@hiecom/react-mirror-node](packages/react-mirror-node) - React hooks
- [@hiecom/solid-mirror-node](packages/solid-mirror-node) - SolidJS hooks
- [@hiecom/preact-mirror-node](packages/preact-mirror-node) - Preact hooks

## License

MIT
