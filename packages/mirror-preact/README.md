# @hieco/mirror-preact

`@hieco/mirror-preact` gives Preact apps the same read-only Mirror Node experience that `@hieco/mirror-react` gives React apps.

It is the Preact-native way to bring Hieco Mirror reads into a component tree without giving up the underlying `@hieco/mirror` mental model.

## Why This Package Exists

Preact apps still need typed blockchain reads, shared client state, and predictable query flows. This package adds:

- a `MirrorNodeProvider` for Preact
- query hooks over the core Mirror client
- shared network switching
- the same domain model used by the rest of the Mirror package family

## When To Use It

Choose `@hieco/mirror-preact` when you are building a Preact app that needs:

- accounts, balances, and transactions
- token or NFT views
- contract or topic inspection
- read-only network data in a reactive UI

## Installation

```bash
npm install @hieco/mirror @hieco/mirror-preact @tanstack/preact-query
```

```bash
pnpm add @hieco/mirror @hieco/mirror-preact @tanstack/preact-query
```

```bash
yarn add @hieco/mirror @hieco/mirror-preact @tanstack/preact-query
```

```bash
bun add @hieco/mirror @hieco/mirror-preact @tanstack/preact-query
```

Peer dependencies expected from the host app:

- `preact >= 10`
- `@tanstack/preact-query ^5`

## Quick Start

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/preact-query";
import { MirrorNodeProvider, useAccountInfo, useTransactionsByAccount } from "@hieco/mirror-preact";

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

## Notes

- This package is the Preact wrapper over `@hieco/mirror`.
- The provider owns the current network and active `MirrorNodeClient`.
- The public flow intentionally matches the React wrapper so teams can move between the two with less friction.

## Related Packages

- [`@hieco/mirror`](../mirror/README.md)
- [`@hieco/mirror-react`](../mirror-react/README.md)
- [`@hieco/mirror-solid`](../mirror-solid/README.md)
