# @hieco/wallet-react

## Overview

`@hieco/wallet-react` wraps `@hieco/wallet` in a React provider and a headless controller hook.

It provides:

- one `WalletProvider` for runtime ownership
- one `useWallet()` controller for common connect flows
- one `useWalletClient()` escape hatch for low-level runtime access
- grouped wallet lists, QR state, and action errors for custom UI

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

## When To Use This Package

Use `@hieco/wallet-react` when you want to:

- connect Hedera wallets from React components
- keep one wallet runtime available across a component tree
- build a custom dialog, drawer, or inline wallet picker with Hieco state
- read the connected wallet session and signer from React

If you need direct runtime control outside React, use [`@hieco/wallet`](../wallet/README.md) directly.

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
    <div>
      <button onClick={() => void wallet.open()}>Open wallet dialog</button>
      {wallet.connectableWallets.map((walletOption) => (
        <button
          disabled={!walletOption.canConnect}
          key={walletOption.id}
          onClick={() => {
            void wallet.connectExtension(walletOption.id);
          }}
        >
          {walletOption.name}
        </button>
      ))}
    </div>
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

## Core Concepts

### Provider-Owned Runtime

`WalletProvider` can:

- create and own a wallet runtime from `CreateWalletOptions`
- reuse an existing runtime through `wallet={wallet}`

That keeps the public surface small whether your app wants default ownership or already created a runtime with `createWallet(...)`.

### Headless Controller

`useWallet()` returns the main UI controller for the common flow:

- `chain`
- `session`
- `ready`
- `connectableWallets`
- `unavailableWallets`
- `qr`
- `error`
- `open()`
- `close()`
- `connectExtension(walletId)`
- `disconnect()`
- `clearError()`

`open()` starts or joins the shared QR connection attempt. `connectExtension(walletId)` can reuse that same attempt when the user chooses an installed extension.

### Low-Level Runtime Access

`useWalletClient()` returns the underlying `@hieco/wallet` runtime. Use it when you need methods such as:

- `snapshot()`
- `subscribe()`
- `cancelConnection()`
- `restore()`
- `destroy()`

## Advanced

### Build Your Own Dialog

```tsx
import { useEffect, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { QRCodeSVG } from "qrcode.react";
import { useWallet, useWalletClient } from "@hieco/wallet-react";

function WalletDialog() {
  const wallet = useWallet();
  const walletClient = useWalletClient();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (wallet.session) {
      setOpen(false);
    }
  }, [wallet.session]);

  const handleOpenChange = (nextOpen: boolean): void => {
    setOpen(nextOpen);

    if (!nextOpen) {
      wallet.close();
      walletClient.cancelConnection();
      return;
    }

    void wallet.open();
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger>Connect wallet</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup>
            {wallet.error ? <div>{wallet.error.message}</div> : null}

            {wallet.qr.uri ? (
              <QRCodeSVG value={wallet.qr.uri} />
            ) : (
              <div>{wallet.qr.pending ? "Generating QR..." : "QR pending"}</div>
            )}

            {wallet.connectableWallets.map((walletOption) => (
              <button
                disabled={!walletOption.canConnect}
                key={walletOption.id}
                onClick={() => {
                  void wallet.connectExtension(walletOption.id);
                }}
              >
                {walletOption.name}
              </button>
            ))}

            {wallet.unavailableWallets.map((walletOption) => (
              <a
                href={walletOption.installUrl}
                key={walletOption.id}
                rel="noreferrer"
                target="_blank"
              >
                Install {walletOption.name}
              </a>
            ))}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### Reuse An Existing Runtime

```tsx
import { createWallet } from "@hieco/wallet";
import { WalletProvider } from "@hieco/wallet-react";

const wallet = createWallet({
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  app: {
    name: "My Hieco App",
    description: "Wallet connection for My Hieco App",
    url: "https://example.com",
    icons: ["https://example.com/icon.png"],
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <WalletProvider wallet={wallet}>{children}</WalletProvider>;
}
```

### Pair With `@hieco/react`

```tsx
"use client";

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

export function Providers({ children }: { children: React.ReactNode }) {
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
      <HiecoRuntime>{children}</HiecoRuntime>
    </WalletProvider>
  );
}
```

## API Reference

### Provider Exports

| Export                | Kind      | Purpose                                        | Usage form                    |
| --------------------- | --------- | ---------------------------------------------- | ----------------------------- |
| `WalletProvider`      | component | Root provider for the wallet runtime.          | `<WalletProvider {...props}>` |
| `WalletProviderProps` | type      | Props accepted by `WalletProvider`.            | `type WalletProviderProps`    |
| `useWalletClient`     | hook      | Access the underlying `@hieco/wallet` runtime. | `useWalletClient()`           |

### Controller Exports

| Export             | Kind | Purpose                                               | Usage form              |
| ------------------ | ---- | ----------------------------------------------------- | ----------------------- |
| `useWallet`        | hook | Read grouped wallet state and common connect actions. | `useWallet()`           |
| `UseWalletResult`  | type | Return shape from `useWallet()`.                      | `type UseWalletResult`  |
| `UseWalletQrState` | type | QR state returned from `useWallet().qr`.              | `type UseWalletQrState` |

### `WalletProviderProps`

```ts
type WalletProviderProps =
  | {
      readonly children: ReactNode;
      readonly wallet: Wallet;
    }
  | (CreateWalletOptions & {
      readonly children: ReactNode;
    });
```

### `UseWalletResult`

```ts
type UseWalletResult = {
  readonly chain: WalletChain;
  readonly session: WalletSession | null;
  readonly ready: boolean;
  readonly connectableWallets: readonly WalletOption[];
  readonly unavailableWallets: readonly WalletOption[];
  readonly qr: {
    readonly enabled: boolean;
    readonly uri: string | null;
    readonly pending: boolean;
  };
  readonly error: Error | null;
  readonly open: () => Promise<void>;
  readonly close: () => void;
  readonly connectExtension: (walletId: string) => Promise<void>;
  readonly disconnect: () => Promise<void>;
  readonly clearError: () => void;
};
```

## Example

See [`examples/wallet`](../../examples/wallet/README.md).
