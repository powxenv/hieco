# @hieco/wallet-react

`@hieco/wallet-react` is the primary wallet DX layer for React apps.

## Installation

```bash
bun add @hieco/wallet-react @hieco/wallet
```

Host app peer dependencies:

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

## Public API

- `useWallet()` returns the headless connect controller for the common dialog flow
- `useWalletClient()` returns the low-level runtime
- `WalletProvider` creates and tears down the runtime when needed

## Build Your Own UI

`@hieco/wallet-react` stays headless on purpose. The intended path is:

- use `useWallet()` for grouped wallet lists, QR state, and connect actions
- keep only the dialog shell open state in your app
- render QR from `wallet.qr`
- render wallet buttons from `wallet.connectableWallets`
- render install links from `wallet.unavailableWallets`
- show action errors from `wallet.error`

Base UI dialog example:

```tsx
import { useEffect, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { useWallet } from "@hieco/wallet-react";
import { QRCodeSVG } from "qrcode.react";

function WalletDialog() {
  const wallet = useWallet();
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

## Low-Level Runtime

If you need raw runtime access, `useWalletClient()` still returns the underlying `@hieco/wallet` instance with `snapshot()`, `subscribe()`, `connectQr()`, `connectExtension()`, `cancelConnection()`, `disconnect()`, `restore()`, and `destroy()`.

## Example

See [`examples/wallet`](../../examples/wallet/README.md).
