# @hieco/wallet-react

`@hieco/wallet-react` brings the Hieco wallet runtime into React with a provider, a headless controller hook, and just enough structure to let your UI stay yours.

It is built for teams who want React-native wallet flows without being boxed into a prebuilt design system.

## Why This Package Exists

Most React apps want the same wallet ingredients:

- one runtime shared across the tree
- one hook for the common connection flow
- one place to read the session and signer
- enough low-level access to build a custom dialog

`@hieco/wallet-react` packages those pieces without taking over your UI.

## When To Use It

Choose `@hieco/wallet-react` when you are building:

- a React app with Hedera wallet connection
- a custom wallet modal or connect button
- a signer source for `@hieco/react`
- a React experience that needs QR, extension, reload, and disconnect flows

If you are not in React, use [`@hieco/wallet`](../wallet/README.md).

## Installation

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

- create and own a wallet runtime from wallet options
- reuse an existing runtime through `wallet={wallet}`

That gives you a smooth default and a deliberate escape hatch for advanced apps.

### `useWallet()`

`useWallet()` is the main controller hook. It groups the UI-facing state you usually care about:

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

## API At A Glance

Core exports:

- `WalletProvider`
- `useWallet`
- `useWalletClient`

Key ideas:

- headless by design
- built for custom UI
- signer available through `wallet.session?.signer`

## Notes

- `open()` starts or joins the shared QR flow.
- `reload()` recreates the pending QR flow without forcing a full UI restart.
- `close()` is controller-level UI state, while `cancelConnection()` stops the runtime’s pending connection attempt.

## Related Packages

- [`@hieco/wallet`](../wallet/README.md) for the underlying runtime
- [`@hieco/react`](../react/README.md) for Hedera queries and mutations in React
- [`@hieco/sdk`](../sdk/README.md) for non-React signer-scoped logic
