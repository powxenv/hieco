# @hieco/mirror-react

`@hieco/mirror-react` gives React apps a provider and hooks for read-only Hedera data from Mirror Node.

It keeps the API close to `@hieco/mirror`, but packages it in a shape that fits React and TanStack Query.

## Why This Package Exists

Mirror reads show up everywhere in React apps, but raw client calls quickly become repetitive. This package gives you:

- a shared `MirrorNodeProvider`
- React-friendly hooks over the Mirror client
- network switching inside the provider
- consistent query behavior across account, token, contract, topic, and transaction reads

## When To Use It

Choose `@hieco/mirror-react` when you are building:

- read-only React dashboards
- explorers and activity feeds
- contract, token, or topic views
- React apps that need Mirror data but not transaction execution

If you need writes too, pair it with [`@hieco/react`](../react/README.md) or [`@hieco/sdk`](../sdk/README.md).

## Installation

```bash
bun add @hieco/mirror @hieco/mirror-react @hieco/utils @tanstack/react-query
```

Peer dependencies expected from the host app:

- `react >= 18`
- `react-dom >= 18`
- `@tanstack/react-query ^5`

## Quick Start

```tsx
import { MirrorNodeProvider, useAccountInfo, useTransactionList } from "@hieco/mirror-react";

function AccountPanel() {
  const account = useAccountInfo("0.0.1001");
  const transactions = useTransactionList({
    accountId: "0.0.1001",
    limit: 10,
    order: "desc",
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
    <MirrorNodeProvider config={{ defaultNetwork: "testnet" }}>
      <AccountPanel />
    </MirrorNodeProvider>
  );
}
```

## The Provider Model

`MirrorNodeProvider` owns:

- the current network name
- the active `MirrorNodeClient`
- the resolved Mirror Node URL
- a `switchNetwork()` function

That lets apps stay simple when they need to move between built-in or custom network targets.

## API At A Glance

The package exports:

- `MirrorNodeProvider`
- context hooks
- query hooks by domain
- boundary and polling helpers

The public shape mirrors the core domains from `@hieco/mirror`, so it stays familiar if you already know the plain TypeScript client.

## Notes

- This package is read-only.
- It depends on `@hieco/mirror` for the underlying client behavior.
- If your app is in Preact or Solid, use the matching wrapper package instead.

## Related Packages

- [`@hieco/mirror`](../mirror/README.md) for the underlying client
- [`@hieco/mirror-preact`](../mirror-preact/README.md) and [`@hieco/mirror-solid`](../mirror-solid/README.md) for other UI frameworks
- [`@hieco/realtime-react`](../realtime-react/README.md) for live updates alongside Mirror reads
