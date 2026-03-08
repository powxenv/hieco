# @hieco/wallet-react

## Overview

`@hieco/wallet-react` brings the Hieco Hedera wallet runtime into React.

It gives you:

- `WalletProvider`
- a small headless hook surface
- optional first-party UI through `@hieco/wallet-react/ui`
- direct signer compatibility with `@hieco/react` and `@hieco/sdk`

The intended experience is simple:

- mount one provider
- render one button and one dialog
- use `useWalletSigner()` anywhere you need a Hedera signer

Wallet connection is client-side. The provider is SSR-safe, but `connect()` and `restore()` remain browser-only runtime actions.

## Installation

```bash
npm install @hieco/wallet-react @hieco/wallet
```

```bash
pnpm add @hieco/wallet-react @hieco/wallet
```

```bash
yarn add @hieco/wallet-react @hieco/wallet
```

```bash
bun add @hieco/wallet-react @hieco/wallet
```

Host app peer dependencies:

- `react >= 18`
- `react-dom >= 18`

## When To Use This Package

Use `@hieco/wallet-react` when you want:

- the easiest Hedera wallet setup in React
- first-party wallet UI out of the box
- the option to replace the UI later without changing the runtime
- a signer for `@hieco/react` and `@hieco/sdk`

## Quick Start

### Zero-Config Provider

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

This path works when your app exposes a managed Hieco project ID in the browser.

### Explicit Project ID

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

### Use The Signer With `@hieco/react`

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

## Core Concepts

### One Provider

`WalletProvider` supports two modes:

- pass `wallet={wallet}` when you already created a runtime yourself
- pass normal wallet options such as `projectId`, `wallets`, or `chains` and let the provider create the runtime

### One Main Hook

`useWallet()` returns the runtime state plus the main actions:

- `connect(options?)`
- `disconnect()`
- `restore()`
- `switchChain(chainId)`
- modal helpers for the built-in UI

### Prompt-Driven UI

The React UI reads the runtime prompt model.

`prompt.kind === "qr"`

- render a QR code

`prompt.kind === "deeplink"`

- open the wallet app when the wallet definition provides mobile links
- keep a manual retry action visible

`prompt.kind === "return"`

- show return-to-app guidance

### Built-In UI

Import from `@hieco/wallet-react/ui`.

- `WalletButton`
- `WalletDialog`
- `WalletAccountButton`
- `WalletList`

The built-in UI is optional. The hooks are the primary API.

## Advanced

### Pass An Explicit Runtime

```tsx
"use client";

import { createWallet, hashpack } from "@hieco/wallet";
import { WalletProvider } from "@hieco/wallet-react";

const wallet = createWallet({
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  wallets: [hashpack()],
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <WalletProvider wallet={wallet}>{children}</WalletProvider>;
}
```

### Build Custom React UI

```tsx
"use client";

import { useWallet, useWalletError, useWallets } from "@hieco/wallet-react";

export function CustomWalletPicker() {
  const wallet = useWallet();
  const wallets = useWallets();
  const error = useWalletError();

  return (
    <div>
      {wallets.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            void wallet.connect({ wallet: item.id });
          }}
          type="button"
        >
          {item.name}
        </button>
      ))}

      {wallet.prompt?.kind === "qr" ? <p>Render a QR code from {wallet.prompt.uri}</p> : null}
      {error ? <p>{error.message}</p> : null}
    </div>
  );
}
```

### Restore A Session Manually

```tsx
"use client";

import { useWallet } from "@hieco/wallet-react";

export function RestoreWalletButton() {
  const wallet = useWallet();

  return (
    <button
      onClick={() => {
        void wallet.restore();
      }}
      type="button"
    >
      Restore wallet
    </button>
  );
}
```

### Force Presentation Mode

```tsx
void wallet.connect({
  wallet: "hashpack",
  presentation: "qr",
});
```

## API Reference

### Provider

| Export           | Kind      | What it does                                        | Parameters            | Returns     |
| ---------------- | --------- | --------------------------------------------------- | --------------------- | ----------- |
| `WalletProvider` | component | Provide a Hieco wallet runtime to React components. | `WalletProviderProps` | `ReactNode` |

```ts
type WalletProviderProps = CreateWalletOptions & {
  readonly children: ReactNode;
  readonly wallet?: Wallet;
};
```

### Hooks

| Hook                  | What it does                                             | Parameters | Returns                                                   |
| --------------------- | -------------------------------------------------------- | ---------- | --------------------------------------------------------- |
| `useWallet`           | Read the full wallet state and the main runtime actions. | none       | `UseWalletResult`                                         |
| `useWallets`          | Read the available wallet catalog.                       | none       | `readonly WalletOption[]`                                 |
| `useWalletAccount`    | Read the active wallet account.                          | none       | `WalletAccount \| null`                                   |
| `useWalletSigner`     | Read the active Hiero-compatible signer.                 | none       | `Signer \| undefined`                                     |
| `useConnect`          | Read the connect action.                                 | none       | `(options?: ConnectOptions) => Promise<WalletConnection>` |
| `useDisconnect`       | Read the disconnect action.                              | none       | `() => Promise<void>`                                     |
| `useSwitchChain`      | Read the chain switch action.                            | none       | `(chainId: string) => Promise<void>`                      |
| `useConnectionStatus` | Read only the wallet status.                             | none       | `WalletStatus`                                            |
| `useWalletError`      | Read only the current wallet error.                      | none       | `WalletError \| null`                                     |
| `useWalletModal`      | Read modal state and modal actions for the built-in UI.  | none       | `WalletModalState`                                        |

```ts
type WalletModalState = {
  readonly isOpen: boolean;
  readonly openModal: () => void;
  readonly closeModal: () => void;
  readonly toggleModal: () => void;
};
```

```ts
type UseWalletResult = WalletState & {
  readonly connect: (options?: ConnectOptions) => Promise<WalletConnection>;
  readonly disconnect: () => Promise<void>;
  readonly restore: () => Promise<WalletConnection | null>;
  readonly switchChain: (chainId: string) => Promise<void>;
  readonly openModal: () => void;
  readonly closeModal: () => void;
  readonly toggleModal: () => void;
  readonly isModalOpen: boolean;
};
```

### UI Subpath

Import from `@hieco/wallet-react/ui`.

| Export                | Kind      | What it does                                                   | Parameters | Returns     |
| --------------------- | --------- | -------------------------------------------------------------- | ---------- | ----------- |
| `WalletButton`        | component | Render the default connect button or connected account button. | none       | `ReactNode` |
| `WalletDialog`        | component | Render the default wallet connection dialog.                   | none       | `ReactNode` |
| `WalletAccountButton` | component | Render the connected account button directly.                  | none       | `ReactNode` |
| `WalletList`          | component | Render the built-in wallet picker list.                        | none       | `ReactNode` |

## Related Packages

- [`@hieco/wallet`](../wallet/README.md)
- [`@hieco/react`](../react/README.md)
- [`@hieco/sdk`](../sdk/README.md)
