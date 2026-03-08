# @hieco/wallet-react

## Overview

`@hieco/wallet-react` brings the Hieco wallet runtime into React.

It is the easiest way to add Hedera wallet connection to a React app. You get:

- `WalletProvider`
- a small hook surface for wallet state and actions
- optional built-in UI from `@hieco/wallet-react/ui`
- a signer that works directly with `@hieco/react` and `@hieco/sdk`

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

You also need a WalletConnect `projectId` before you can connect a real wallet.

## When To Use This Package

Use `@hieco/wallet-react` when you want:

- the fastest wallet setup for a React app
- built-in wallet UI that you can use immediately
- the option to replace the UI later without changing the runtime
- a signer source for `@hieco/react` or `@hieco/sdk`

If you want full UI control without React helpers, use [`@hieco/wallet`](../wallet/README.md) directly.

## Quick Start

### Basic Setup

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

import type { ReactNode } from "react";
import { WalletProvider, useWalletSigner } from "@hieco/wallet-react";
import { WalletButton, WalletDialog } from "@hieco/wallet-react/ui";
import { HiecoProvider, useAccountInfo } from "@hieco/react";

function HiecoRuntime({ children }: { children: ReactNode }) {
  const signer = useWalletSigner();

  return (
    <HiecoProvider config={{ network: "testnet" }} signer={signer}>
      {children}
    </HiecoProvider>
  );
}

function AccountCard() {
  const account = useAccountInfo({ accountId: "0.0.1001" });

  if (account.isPending) return <div>Loading...</div>;
  if (account.isError) return <div>{account.error.message}</div>;

  return <pre>{JSON.stringify(account.data, null, 2)}</pre>;
}

export function App() {
  return (
    <WalletProvider projectId="YOUR_WALLETCONNECT_PROJECT_ID">
      <WalletButton />
      <WalletDialog />
      <HiecoRuntime>
        <AccountCard />
      </HiecoRuntime>
    </WalletProvider>
  );
}
```

## Core Concepts

### One Provider

`WalletProvider` can work in two ways:

- pass normal wallet options such as `projectId`, `wallets`, or `chains`
- pass `wallet={wallet}` when you already created a runtime yourself

That means you can start with the simple provider form and only drop down to a custom runtime when you really need to.

### One Main Hook

`useWallet()` returns the current wallet state and the main runtime actions together:

- `connect(options?)`
- `cancel()`
- `disconnect()`
- `restore()`
- `switchChain(chainId)`
- modal helpers for the built-in UI

This makes it the main hook for custom UI.

### Built-In UI

The UI lives in `@hieco/wallet-react/ui`.

It exports:

- `WalletButton`
- `WalletDialog`
- `WalletAccountButton`
- `WalletList`

The built-in UI is optional, but it is the fastest way to get started.

### Bring Your Own UI

You do not need to use `WalletButton` or `WalletDialog`.

The intended custom-UI path is:

- use `WalletProvider` for the runtime
- use `useWallet()` for the main state and actions
- use `useWallets()` when you only need the wallet list
- render your own modal, drawer, popover, or inline wallet picker

The runtime owns wallet logic. Your components own the presentation.

### Current Default Flow

The current React wallet flow is:

- click `WalletButton`
- choose a wallet in `WalletDialog`
- use an installed extension when available
- choose `Show QR code` when you intentionally want a paired-device flow

The dialog keeps the UI explicit:

- extension actions stay visible
- QR is an explicit action
- mobile handoff uses prompt state from the runtime

## Common Patterns

### Read Wallet State

```tsx
"use client";

import { useWallet } from "@hieco/wallet-react";

export function WalletStateCard() {
  const wallet = useWallet();

  return (
    <div>
      <p>Status: {wallet.status}</p>
      <p>Wallet: {wallet.wallet?.name ?? "Not connected"}</p>
      <p>Account: {wallet.account?.accountId ?? "No account yet"}</p>
      <p>Chain: {wallet.chain.id}</p>
    </div>
  );
}
```

### Build Custom UI

```tsx
"use client";

import { useWallet, useWallets } from "@hieco/wallet-react";

export function CustomWalletPicker() {
  const wallet = useWallet();
  const wallets = useWallets();

  return (
    <div>
      {wallets.map((item) => (
        <div key={item.id}>
          <p>{item.name}</p>
          <p>{item.readyState}</p>

          {(item.readyState === "installed" || item.readyState === "loadable") && (
            <button
              onClick={() => {
                void wallet.connect({
                  wallet: item.id,
                  transport: item.defaultTransport ?? undefined,
                });
              }}
              type="button"
            >
              Connect
            </button>
          )}

          {item.readyState === "cross-device" && (
            <button
              onClick={() => {
                void wallet.connect({
                  wallet: item.id,
                  transport: "walletconnect",
                  presentation: "qr",
                });
              }}
              type="button"
            >
              Show QR code
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

This is the main bring-your-own-UI pattern in React:

- `useWallets()` gives you the wallet catalog
- `useWallet()` gives you state, actions, and prompt state
- your UI decides how to render QR, deep links, retries, and errors

### Render Prompt State Yourself

```tsx
"use client";

import { useWallet } from "@hieco/wallet-react";

export function WalletPromptState() {
  const wallet = useWallet();

  if (wallet.prompt?.kind === "qr") {
    return <div>Render a QR code from {wallet.prompt.uri}</div>;
  }

  if (wallet.prompt?.kind === "deeplink") {
    return <a href={wallet.prompt.href}>Open wallet</a>;
  }

  if (wallet.prompt?.kind === "return") {
    return <div>Finish in the wallet, then return to the app.</div>;
  }

  return null;
}
```

This is the key idea behind bring-your-own UI with Hieco Wallet: the runtime owns the connection flow, while your components decide how to present each step.

### Restore A Session

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

### Pass A Prebuilt Runtime

```tsx
"use client";

import type { ReactNode } from "react";
import { createWallet, hashpack } from "@hieco/wallet";
import { WalletProvider } from "@hieco/wallet-react";

const wallet = createWallet({
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  wallets: [hashpack()],
});

export function Providers({ children }: { children: ReactNode }) {
  return <WalletProvider wallet={wallet}>{children}</WalletProvider>;
}
```

## Hook Reference

### Main Hooks

| Hook                    | What it does                                               |
| ----------------------- | ---------------------------------------------------------- |
| `useWallet()`           | Read the full wallet state and the main runtime actions.   |
| `useWallets()`          | Read the available wallet catalog for the current runtime. |
| `useWalletAccount()`    | Read the active wallet account.                            |
| `useWalletSigner()`     | Read the current Hiero-compatible signer.                  |
| `useConnect()`          | Read only the connect action.                              |
| `useDisconnect()`       | Read only the disconnect action.                           |
| `useSwitchChain()`      | Read only the chain-switch action.                         |
| `useConnectionStatus()` | Read only the wallet status.                               |
| `useWalletError()`      | Read only the current wallet error.                        |
| `useWalletModal()`      | Read and control the built-in modal state.                 |

### `useWallet()` Return Shape

```ts
type UseWalletResult = {
  readonly status: WalletStatus;
  readonly wallets: readonly WalletOption[];
  readonly wallet: WalletOption | null;
  readonly account: WalletAccount | null;
  readonly accounts: readonly WalletAccount[];
  readonly chain: WalletChain;
  readonly chains: readonly WalletChain[];
  readonly signer: Signer | undefined;
  readonly transport: WalletTransportId | null;
  readonly error: WalletError | null;
  readonly prompt: WalletPrompt | null;
  readonly connect: (options?: ConnectOptions) => Promise<WalletConnection>;
  readonly cancel: () => void;
  readonly disconnect: () => Promise<void>;
  readonly restore: () => Promise<WalletConnection | null>;
  readonly switchChain: (chainId: string) => Promise<void>;
  readonly openModal: () => void;
  readonly closeModal: () => void;
  readonly toggleModal: () => void;
  readonly isModalOpen: boolean;
};
```

### Modal State

```ts
type WalletModalState = {
  readonly isOpen: boolean;
  readonly openModal: () => void;
  readonly closeModal: () => void;
  readonly toggleModal: () => void;
};
```

## UI Component Reference

| Export                | What it does                                                           |
| --------------------- | ---------------------------------------------------------------------- |
| `WalletButton`        | Default connect button. Shows the account button when connected.       |
| `WalletDialog`        | Built-in dialog for wallet selection, QR, deep link, and error states. |
| `WalletAccountButton` | Compact connected-wallet button.                                       |
| `WalletList`          | Wallet picker list used by the built-in dialog and custom UIs.         |

## Important Notes

- `WalletProvider` is SSR-safe, but real wallet actions are browser-only
- you need a real `projectId` before connecting
- `useWalletSigner()` is the main bridge into `@hieco/react` and `@hieco/sdk`
- the built-in UI is optional, but it is the recommended starting point

## Related Packages

- [`@hieco/wallet`](../wallet/README.md) for the headless wallet runtime
- [`@hieco/react`](../react/README.md) for React Hedera queries and mutations
- [`@hieco/sdk`](../sdk/README.md) for the core Hedera SDK
