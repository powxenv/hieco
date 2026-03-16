# @hieco/mirror-react

`@hieco/mirror-react` gives React apps a provider and query hooks for read-only Hedera data from Mirror Node.

It keeps the API close to `@hieco/mirror`, but packages it in a shape that fits React and TanStack Query.

## Why This Package Exists

Mirror reads show up everywhere in React apps, but raw client calls quickly become repetitive. This package gives you:

- a shared `MirrorNodeProvider`
- React-friendly query hooks over the Mirror client
- network switching inside the provider
- a domain model that stays aligned with the core `@hieco/mirror` client

## When To Use It

Choose `@hieco/mirror-react` when you are building:

- read-only React dashboards
- explorers and activity feeds
- contract, token, topic, or account views
- React apps that need Mirror data but not transaction execution

If you need writes too, pair it with [`@hieco/react`](../react/README.md) or [`@hieco/sdk`](../sdk/README.md).

## Installation

```bash
npm install @hieco/mirror @hieco/mirror-react @tanstack/react-query
```

```bash
pnpm add @hieco/mirror @hieco/mirror-react @tanstack/react-query
```

```bash
yarn add @hieco/mirror @hieco/mirror-react @tanstack/react-query
```

```bash
bun add @hieco/mirror @hieco/mirror-react @tanstack/react-query
```

Peer dependencies expected from the host app:

- `react >= 18`
- `react-dom >= 18`
- `@tanstack/react-query ^5`

## Quick Start

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MirrorNodeProvider, useAccountInfo, useTransactionsByAccount } from "@hieco/mirror-react";

const queryClient = new QueryClient();

function AccountPanel() {
  const account = useAccountInfo({ accountId: "0.0.1001" });
  const transactions = useTransactionsByAccount({
    accountId: "0.0.1001",
    params: {
      limit: 10,
      order: "desc",
    },
  });

  if (account.isPending || transactions.isPending) {
    return <div>Loading...</div>;
  }

  return (
    <pre>{JSON.stringify({ account: account.data, transactions: transactions.data }, null, 2)}</pre>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MirrorNodeProvider config={{ defaultNetwork: "testnet" }}>
        <AccountPanel />
      </MirrorNodeProvider>
    </QueryClientProvider>
  );
}
```

## The Provider Model

`MirrorNodeProvider` owns:

- the current network name
- the active `MirrorNodeClient`
- the resolved Mirror Node URL
- a `switchNetwork()` function

That makes network changes explicit and keeps the rest of the component tree focused on data consumption.

## Custom Networks

For built-in networks, `config={{ defaultNetwork: "testnet" }}` is enough.

If you want custom names, provide a `networks` map alongside `defaultNetwork`. The provider validates that the selected network can resolve to a Mirror Node URL before switching.

## API At A Glance

The package exports:

- `MirrorNodeProvider`
- context hooks
- query hooks by domain
- boundary and polling helpers

The public shape mirrors the core domains from `@hieco/mirror`, so it stays familiar if you already know the plain TypeScript client.

## Related Packages

- [`@hieco/mirror`](../mirror/README.md) for the underlying client
- [`@hieco/mirror-preact`](../mirror-preact/README.md) and [`@hieco/mirror-solid`](../mirror-solid/README.md) for other UI frameworks
- [`@hieco/realtime-react`](../realtime-react/README.md) for live updates alongside Mirror reads
