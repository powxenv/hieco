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

1. Create or receive a `QueryClient`.
2. Mount `HiecoProvider`.
3. Pass public client config with `config`.
4. Pass a signer when the app becomes wallet-connected.
5. Use Hieco hooks in components.

The package is deliberately strict about runtime boundaries: sensitive credentials belong in server-only SDK code, not in public React config.

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

### Reuse your own QueryClient

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

The package also re-exports the `@hieco/sdk` surface, so shared types and client helpers stay close at hand in React code.

There is also an optional legacy subpath:

- `@hieco/react/appkit`

Use that only when you specifically need the AppKit bridge.

## Notes

- `config` only accepts public client configuration.
- Pass `signer` separately instead of mixing signer or operator credentials into provider config.
- The package can own a `QueryClient` or reuse one from the app.

## Related Packages

- [`@hieco/sdk`](../sdk/README.md) for the underlying client
- [`@hieco/wallet-react`](../wallet-react/README.md) for wallet connection in React
- [`@hieco/wallet`](../wallet/README.md) for wallet runtime control outside React
