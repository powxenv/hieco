# Quick Start

Canonical docs:

- [`@hieco/wallet` quick start](https://github.com/powxenv/hieco/tree/main/packages/wallet)
- [`@hieco/wallet-react` quick start](https://github.com/powxenv/hieco/tree/main/packages/wallet-react)
- [`@hieco/react` signer integration](https://github.com/powxenv/hieco/tree/main/packages/react)

## `@hieco/wallet` With Explicit `projectId`

```ts
import { createWallet } from "@hieco/wallet";

const wallet = createWallet({
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
});

await wallet.connect({
  wallet: "hashpack",
});
```

Use this shape for production apps.

## `@hieco/wallet` With Your Own UI

```ts
import { createWallet } from "@hieco/wallet";

const wallet = createWallet({
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
});

const stop = wallet.onChange(() => {
  const state = wallet.snapshot();
  console.log(state.status, state.prompt?.kind, state.account?.accountId);
});

await wallet.connect({
  wallet: "hashpack",
});

stop();
```

Use this when the app wants to render its own modal, drawer, QR screen, or retry flow.

## `@hieco/wallet-react` In A React App

```tsx
"use client";

import { WalletProvider } from "@hieco/wallet-react";
import { WalletButton, WalletDialog } from "@hieco/wallet-react/ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider projectId="YOUR_WALLETCONNECT_PROJECT_ID">
      <WalletButton />
      <WalletDialog />
      {children}
    </WalletProvider>
  );
}
```

`WalletButton` uses the default platform-aware flow:

- desktop => installed extension first
- mobile => wallet handoff first
- paired-device QR => explicit flow only

## `@hieco/wallet-react` Bring Your Own UI

```tsx
"use client";

import { useWallet, useWallets } from "@hieco/wallet-react";

export function CustomWalletPicker() {
  const wallet = useWallet();
  const wallets = useWallets();

  return (
    <div>
      {wallets.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            void wallet.connect({
              wallet: item.id,
              transport: item.defaultTransport ?? undefined,
            });
          }}
          type="button"
        >
          {item.name} ({item.readyState})
        </button>
      ))}

      {wallet.prompt?.kind === "qr" ? <div>Render QR from {wallet.prompt.uri}</div> : null}
    </div>
  );
}
```

## `@hieco/wallet-react` With Explicit `projectId`

```tsx
"use client";

import { WalletProvider } from "@hieco/wallet-react";
import { WalletButton, WalletDialog } from "@hieco/wallet-react/ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider projectId="YOUR_WALLETCONNECT_PROJECT_ID">
      <WalletButton />
      <WalletDialog />
      {children}
    </WalletProvider>
  );
}
```

## Explicit Paired-Device QR

```tsx
"use client";

import { useWallet } from "@hieco/wallet-react";

export function PairFromAnotherDeviceButton() {
  const wallet = useWallet();

  return (
    <button
      onClick={() => {
        void wallet.connect({
          wallet: "generic-hedera-walletconnect",
          transport: "walletconnect",
          presentation: "qr",
        });
      }}
      type="button"
    >
      Pair from another device
    </button>
  );
}
```

## Use The Signer With `@hieco/react`

```tsx
"use client";

import { HiecoProvider } from "@hieco/react";
import { WalletProvider, useWalletSigner } from "@hieco/wallet-react";
import { WalletButton, WalletDialog } from "@hieco/wallet-react/ui";

function HiecoRuntime({ children }: { children: React.ReactNode }) {
  const signer = useWalletSigner();

  return (
    <HiecoProvider config={{ network: "testnet" }} signer={signer}>
      {children}
    </HiecoProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider projectId="YOUR_WALLETCONNECT_PROJECT_ID">
      <WalletButton />
      <WalletDialog />
      <HiecoRuntime>{children}</HiecoRuntime>
    </WalletProvider>
  );
}
```
