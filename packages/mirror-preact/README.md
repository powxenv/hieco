# @hieco/mirror-preact

`@hieco/mirror-preact` gives Preact apps the same read-only Mirror Node experience that `@hieco/mirror-react` gives React apps.

It is the Preact-native way to bring Hieco Mirror reads into a component tree without giving up the underlying `@hieco/mirror` model.

## Why This Package Exists

Preact apps still need typed blockchain reads, shared client state, and predictable query flows. This package adds:

- a `MirrorNodeProvider` for Preact
- hook-based access to Mirror data
- shared network switching
- a familiar Hieco Mirror mental model

## When To Use It

Choose `@hieco/mirror-preact` when you are building a Preact app that needs:

- accounts, balances, and transactions
- token or NFT views
- contract or topic inspection
- read-only network data in a reactive UI

## Installation

```bash
bun add @hieco/mirror @hieco/mirror-preact @hieco/utils @tanstack/preact-query
```

Peer dependencies expected from the host app:

- `preact >= 10`
- `@tanstack/preact-query ^5`

## Quick Start

```tsx
import { MirrorNodeProvider, useAccountInfo, useTransactionList } from "@hieco/mirror-preact";

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

## Notes

- This package is the Preact wrapper over `@hieco/mirror`.
- The provider owns the current network and active `MirrorNodeClient`.
- The public flow matches the React and Solid wrappers so teams can move between frameworks with less friction.

## Related Packages

- [`@hieco/mirror`](../mirror/README.md)
- [`@hieco/mirror-react`](../mirror-react/README.md)
- [`@hieco/mirror-solid`](../mirror-solid/README.md)
