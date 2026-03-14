# @hieco/mirror-solid

`@hieco/mirror-solid` gives Solid apps a provider and hooks for read-only Hedera data from Mirror Node.

It keeps the same Hieco Mirror story intact while fitting Solid’s reactive model.

## Why This Package Exists

Solid apps need the same building blocks as other frontend apps:

- a shared client
- framework-native hooks
- network switching
- predictable data access across Hedera entities

This package delivers that on top of `@hieco/mirror`.

## When To Use It

Choose `@hieco/mirror-solid` when you are building a Solid app that needs:

- read-only account or token views
- transaction feeds
- topic or contract inspection
- network and block data in a reactive UI

## Installation

```bash
bun add @hieco/mirror @hieco/mirror-solid @hieco/utils @tanstack/solid-query
```

Peer dependencies expected from the host app:

- `solid-js >= 1.8`
- `@tanstack/solid-query ^5`

## Quick Start

```tsx
import { MirrorNodeProvider, useAccountInfo, useTransactionList } from "@hieco/mirror-solid";

function AccountPanel() {
  const account = useAccountInfo("0.0.1001");
  const transactions = useTransactionList(() => ({
    accountId: "0.0.1001",
    limit: 10,
    order: "desc",
  }));

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

- This package is read-only and built on `@hieco/mirror`.
- The provider exposes the active client and network-switching behavior.
- Its structure intentionally matches the React and Preact wrappers.

## Related Packages

- [`@hieco/mirror`](../mirror/README.md)
- [`@hieco/mirror-react`](../mirror-react/README.md)
- [`@hieco/mirror-preact`](../mirror-preact/README.md)
