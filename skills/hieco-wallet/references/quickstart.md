# Quick Start

Canonical docs:

- [`@hieco/wallet` quick start](https://github.com/powxenv/hieco/tree/main/packages/wallet)
- [`@hieco/wallet-react` quick start](https://github.com/powxenv/hieco/tree/main/packages/wallet-react)
- [`@hieco/react` signer integration](https://github.com/powxenv/hieco/tree/main/packages/react)

## `@hieco/wallet` In Managed Mode

```ts
import { createWallet } from "@hieco/wallet";

const wallet = createWallet();

await wallet.connect({
  wallet: "hashpack",
});
```

Managed mode resolves a project ID from browser state. It is good for local development and Hieco-managed environments.

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

## `@hieco/wallet-react` In A React App

```tsx
"use client";

import { WalletProvider } from "@hieco/wallet-react";
import { WalletButton, WalletDialog } from "@hieco/wallet-react/ui";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <WalletButton />
      <WalletDialog />
      {children}
    </WalletProvider>
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
