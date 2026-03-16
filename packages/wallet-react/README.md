# @hieco/wallet-react

`@hieco/wallet-react` brings the Hieco wallet runtime into React with a provider, a headless controller hook, and a clean separation between wallet state and wallet UI.

It is built for teams who want React-native wallet flows without being boxed into a prebuilt design system.

## Why This Package Exists

Most React apps want the same wallet ingredients:

- one runtime shared across the tree
- one hook for the common connection flow
- one place to read the current session and signer
- enough low-level access to build a custom dialog

`@hieco/wallet-react` packages those pieces without taking over the UI.

## When To Use It

Choose `@hieco/wallet-react` when you are building:

- a React app with Hedera wallet connection
- a custom connect button, modal, or drawer
- a signer source for [`@hieco/react`](../react/README.md)
- a React experience that needs QR, extension, reload, and disconnect flows

If you are not in React, use [`@hieco/wallet`](../wallet/README.md).

## Installation

```bash
npm install @hieco/wallet @hieco/wallet-react
```

```bash
pnpm add @hieco/wallet @hieco/wallet-react
```

```bash
yarn add @hieco/wallet @hieco/wallet-react
```

```bash
bun add @hieco/wallet @hieco/wallet-react
```

Peer dependencies expected from the host app:

- `react >= 18`
- `react-dom >= 18`

## Quick Start

```tsx
import type { ReactNode } from "react";
import { WalletProvider, useWallet } from "@hieco/wallet-react";

function ConnectWallet() {
  const wallet = useWallet();

  if (wallet.session) {
    return <button onClick={() => void wallet.disconnect()}>Disconnect</button>;
  }

  return (
    <button onClick={() => void wallet.open()} type="button">
      Connect wallet
    </button>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletProvider
      projectId="YOUR_WALLETCONNECT_PROJECT_ID"
      app={{
        name: "My Hieco App",
        description: "Wallet connection for My Hieco App",
        url: "https://example.com",
        icons: ["https://example.com/icon.png"],
      }}
    >
      <ConnectWallet />
      {children}
    </WalletProvider>
  );
}
```

## The Main Pieces

### `WalletProvider`

`WalletProvider` can either:

- create and own a wallet runtime from `CreateWalletOptions`
- reuse an existing runtime through `wallet={wallet}`

When it owns the runtime, it lazily creates it on the client. That means the provider is safe to mount during SSR, while real wallet work still waits for the browser.

### `useWallet()`

`useWallet()` is the main controller hook. It groups the UI-facing state most apps care about:

- `session`
- `ready`
- `connectableWallets`
- `unavailableWallets`
- `qr`
- `error`
- `open()`
- `reload()`
- `close()`
- `connectExtension(walletId)`
- `disconnect()`
- `clearError()`

### `useWalletClient()`

Use `useWalletClient()` when you need the underlying runtime directly, such as `cancelConnection()`, `restore()`, or raw `snapshot()` access.

## Common Workflows

### Build a custom dialog

```tsx
import { useWallet, useWalletClient } from "@hieco/wallet-react";

export function WalletDialog() {
  const wallet = useWallet();
  const walletClient = useWalletClient();

  return (
    <div>
      <button onClick={() => void wallet.open()} type="button">
        Open wallet dialog
      </button>

      {wallet.qr.uri ? <div>Render QR from {wallet.qr.uri}</div> : null}
      {wallet.qr.expired ? <div>QR expired. Recreate it.</div> : null}

      {wallet.connectableWallets.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            void wallet.connectExtension(item.id);
          }}
          type="button"
        >
          {item.name}
        </button>
      ))}

      <button onClick={() => void wallet.reload()} type="button">
        {wallet.qr.expired ? "Recreate QR" : "Reload QR"}
      </button>

      <button
        onClick={() => {
          wallet.close();
          walletClient.cancelConnection();
        }}
        type="button"
      >
        Close
      </button>
    </div>
  );
}
```

### Feed the signer into `@hieco/react`

```tsx
import { HiecoProvider } from "@hieco/react";
import { useWallet } from "@hieco/wallet-react";

function HiecoRuntime({ children }: { children: React.ReactNode }) {
  const wallet = useWallet();

  return (
    <HiecoProvider config={{ network: "testnet" }} signer={wallet.session?.signer}>
      {children}
    </HiecoProvider>
  );
}
```

## Connection Semantics

`@hieco/wallet-react` is a controller layer over the headless runtime, so a few details matter:

- `open()` starts or joins the shared QR flow
- `reload()` cancels the current attempt and starts a fresh QR flow
- `close()` only clears controller-level UI state
- `cancelConnection()` stops the runtime’s pending connection attempt
- `connectExtension(walletId)` can reuse the same pending attempt started by `open()`

That separation is what makes it possible to build custom wallet UIs without duplicating connection state machines in React.

## Packaging And Runtime Support

The package ships browser-friendly ESM output with conditional exports for `browser`, `worker`, `workerd`, `node`, and `default`.

In practice:

- mount the provider freely in React apps
- treat actual wallet actions as browser-only
- let the package lazy-load the headless runtime on the client when it owns it

## Related Packages

- [`@hieco/wallet`](../wallet/README.md) for the underlying runtime
- [`@hieco/react`](../react/README.md) for Hedera queries and mutations in React
- [`@hieco/sdk`](../sdk/README.md) for non-React signer-scoped logic
