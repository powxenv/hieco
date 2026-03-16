# @hieco/react

`@hieco/react` brings the Hieco SDK into React with providers, TanStack Query integration, and hooks that feel native in modern app code.

If `@hieco/sdk` is the engine room, `@hieco/react` is the layer that lets your component tree use it with less ceremony and better caching.

## Why This Package Exists

React apps need more than direct SDK calls. They need:

- a shared client lifecycle
- a clear place to provide a signer
- query keys and invalidation that match the data model
- hooks that fit loading, error, and success states cleanly

`@hieco/react` wraps `@hieco/sdk` in that experience.

## When To Use It

Choose `@hieco/react` when you are building:

- React apps that read Hedera data
- React apps that submit transactions
- wallet-connected UIs that pass a signer into a shared client
- server-rendered or hydrated React apps that already use TanStack Query

If you only need a non-React client, use [`@hieco/sdk`](../sdk/README.md).

## Installation

```bash
npm install @hieco/react @hieco/sdk @tanstack/react-query
```

```bash
pnpm add @hieco/react @hieco/sdk @tanstack/react-query
```

```bash
yarn add @hieco/react @hieco/sdk @tanstack/react-query
```

```bash
bun add @hieco/react @hieco/sdk @tanstack/react-query
```

Peer dependencies expected from the host app:

- `react >= 18`
- `react-dom >= 18`

## Quick Start

```tsx
import { HiecoProvider, useAccountInfo } from "@hieco/react";

function AccountCard() {
  const account = useAccountInfo({ accountId: "0.0.1001" });

  if (account.isPending) return <div>Loading...</div>;
  if (account.isError) return <div>{account.error.message}</div>;

  return <pre>{JSON.stringify(account.data, null, 2)}</pre>;
}

export function App() {
  return (
    <HiecoProvider config={{ network: "testnet" }}>
      <AccountCard />
    </HiecoProvider>
  );
}
```

## The Usual Flow

Most apps follow this pattern:

1. Mount `HiecoProvider`.
2. Pass public client config with `config`.
3. Pass a signer when the app becomes wallet-connected.
4. Use Hieco hooks in components.

The provider can create its own `QueryClient` when needed, or reuse one from the host app.

## Runtime Boundaries

The package is deliberately strict about runtime boundaries:

- `config` only accepts public client configuration
- operator credentials stay in server-only `@hieco/sdk` code
- `signer` is passed separately as session state

That split keeps React code focused on client state and queries instead of lower-level SDK configuration.

## Common Workflows

### Use a wallet signer

```tsx
import { HiecoProvider } from "@hieco/react";
import { WalletProvider, useWallet } from "@hieco/wallet-react";

function HiecoRuntime({ children }: { children: React.ReactNode }) {
  const wallet = useWallet();

  return (
    <HiecoProvider config={{ network: "testnet" }} signer={wallet.session?.signer}>
      {children}
    </HiecoProvider>
  );
}
```

### Reuse your own `QueryClient`

```tsx
import { QueryClient } from "@tanstack/react-query";
import { HiecoProvider } from "@hieco/react";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HiecoProvider config={{ network: "testnet" }} queryClient={queryClient}>
      {children}
    </HiecoProvider>
  );
}
```

## API At A Glance

Core exports:

- `HiecoProvider`
- generated query and mutation hooks
- `createHiecoQueryKey`
- `createHiecoMutationKey`

The package also re-exports the `@hieco/sdk` surface so shared types and helpers stay close at hand in React code.

There is also an optional AppKit subpath:

- `@hieco/react/appkit`

Use that only when you specifically need the AppKit bridge.

## Packaging And Runtime Support

`@hieco/react` publishes:

- browser-friendly ESM output
- externalized dependencies in the published build
- explicit conditional exports for `browser`, `worker`, `workerd`, `node`, and `default`

That keeps the package easier to consume in modern React stacks without changing how the public API feels in app code.

## Related Packages

- [`@hieco/sdk`](../sdk/README.md) for the underlying fluent client
- [`@hieco/wallet-react`](../wallet-react/README.md) for wallet connection in React
- [`@hieco/wallet`](../wallet/README.md) for wallet runtime control outside React
