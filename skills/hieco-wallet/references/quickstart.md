# Quick Start

Canonical docs:

- [`@hieco/wallet` quick start](https://github.com/powxenv/hieco/tree/main/packages/wallet)
- [`@hieco/wallet-react` quick start](https://github.com/powxenv/hieco/tree/main/packages/wallet-react)
- [`@hieco/react` signer integration](https://github.com/powxenv/hieco/tree/main/packages/react)

## `@hieco/wallet`

```ts
import { createWallet } from "@hieco/wallet";

const wallet = createWallet({
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  app: {
    name: "My Hieco App",
    description: "Wallet connection for My Hieco App",
    url: "https://example.com",
    icons: ["https://example.com/icon.png"],
  },
});

const session = await wallet.connectQr();

console.log(session.accountId);
```

## `@hieco/wallet` With Your Own UI

```ts
import { createWallet, getConnectableWallets, getUnavailableWallets } from "@hieco/wallet";

const wallet = createWallet({
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  app: {
    name: "My Hieco App",
    description: "Wallet connection for My Hieco App",
    url: "https://example.com",
    icons: ["https://example.com/icon.png"],
  },
});

const stop = wallet.subscribe(() => {
  const state = wallet.snapshot();
  const connectableWallets = getConnectableWallets(state);
  const unavailableWallets = getUnavailableWallets(state);

  console.log(state.connection?.uri, state.session?.accountId);
  console.log(connectableWallets.length, unavailableWallets.length);
});

await wallet.connectQr();

stop();
```

## `@hieco/wallet-react`

```tsx
"use client";

import { WalletProvider, useWallet } from "@hieco/wallet-react";

function ConnectWallet() {
  const wallet = useWallet();

  if (wallet.session) {
    return <div>{wallet.session.accountId}</div>;
  }

  return (
    <button onClick={() => void wallet.open()} type="button">
      Connect wallet
    </button>
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
      <ConnectWallet />
      {children}
    </WalletProvider>
  );
}
```

## `@hieco/wallet-react` With A Custom Dialog

```tsx
"use client";

import { useWallet, useWalletClient } from "@hieco/wallet-react";

export function WalletDialog() {
  const wallet = useWallet();
  const walletClient = useWalletClient();

  return (
    <div>
      <button
        onClick={() => {
          void wallet.open();
        }}
        type="button"
      >
        Open wallet dialog
      </button>

      {wallet.qr.uri ? <div>Render QR from {wallet.qr.uri}</div> : null}

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

## `@hieco/wallet-react` With `@hieco/react`

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
