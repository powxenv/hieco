# @hieco/mirror-solid

`@hieco/mirror-solid` gives Solid apps a provider and query helpers for read-only Hedera data from Mirror Node.

It keeps the same Hieco Mirror story intact while fitting Solid’s reactive model.

## Why This Package Exists

Solid apps need the same building blocks as other frontend apps:

- a shared client
- framework-native data APIs
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
npm install @hieco/mirror @hieco/mirror-solid @tanstack/solid-query
```

```bash
pnpm add @hieco/mirror @hieco/mirror-solid @tanstack/solid-query
```

```bash
yarn add @hieco/mirror @hieco/mirror-solid @tanstack/solid-query
```

```bash
bun add @hieco/mirror @hieco/mirror-solid @tanstack/solid-query
```

Peer dependencies expected from the host app:

- `solid-js >= 1.8`
- `@tanstack/solid-query ^5`

## Quick Start

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { MirrorNodeProvider, createAccountInfo } from "@hieco/mirror-solid";

const queryClient = new QueryClient();

function AccountPanel() {
  const account = createAccountInfo(() => ({ accountId: "0.0.1001" }));

  return <pre>{JSON.stringify(account.data, null, 2)}</pre>;
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

## Solid-Specific Shape

Unlike the React and Preact wrappers, the Solid package exposes `create*` query helpers such as:

- `createAccountInfo`
- `createTransactionsByAccount`
- `createContractLogs`

That keeps the API aligned with Solid’s reactive style instead of pretending every framework should look like React.

## Notes

- This package is read-only and built on `@hieco/mirror`.
- The provider exposes the active client and network-switching behavior.
- Its structure intentionally matches the rest of the Mirror family even though the query API style is Solid-native.

## Related Packages

- [`@hieco/mirror`](../mirror/README.md)
- [`@hieco/mirror-react`](../mirror-react/README.md)
- [`@hieco/mirror-preact`](../mirror-preact/README.md)
