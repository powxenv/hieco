# @hieco/wallet

## Overview

`@hieco/wallet` is the headless Hedera wallet runtime for Hieco.

It provides:

- one configured chain per runtime
- one active wallet session
- one shared pending WalletConnect connection attempt
- one wallet catalog with installed and unavailable desktop extension options

## Installation

```bash
npm install @hieco/wallet
```

```bash
pnpm add @hieco/wallet
```

```bash
yarn add @hieco/wallet
```

```bash
bun add @hieco/wallet
```

## When To Use This Package

Use `@hieco/wallet` when you want to:

- manage wallet connection from a browser runtime outside React
- build your own wallet dialog, drawer, or inline picker
- keep direct control over QR, extension, restore, and disconnect flows
- read the connected `Signer` from one shared runtime

If you are building a React UI, prefer [`@hieco/wallet-react`](../wallet-react/README.md) unless you specifically want to own runtime lifecycle yourself.

## Quick Start

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
console.log(session.signer);
```

## Core Concepts

### One Runtime

`createWallet(...)` returns one runtime with these actions:

- `snapshot()`
- `subscribe(listener)`
- `connectQr()`
- `connectExtension(walletId)`
- `cancelConnection()`
- `disconnect()`
- `restore()`
- `destroy()`

### State Model

`snapshot()` returns the current `WalletState`:

```ts
type WalletState = {
  readonly chain: WalletChain;
  readonly walletConnectEnabled: boolean;
  readonly wallets: readonly WalletOption[];
  readonly session: WalletSession | null;
  readonly connection: WalletConnection | null;
};
```

- `walletConnectEnabled` tells the UI whether connection actions are available
- `wallets` contains installed and unavailable wallet options
- `session` is the durable connected wallet state
- `connection` is the current shared in-flight connection attempt

### Shared Connection Flow

`connectQr()` and `connectExtension(walletId)` join the same pending connection attempt until it settles or is canceled.

That lets you:

- start a QR flow immediately
- let an installed extension reuse the same attempt
- keep one piece of connection state for your UI

### Wallet Catalog Helpers

The package also exports selectors for common UI groupings:

- `getConnectableWallets(state)`
- `getUnavailableWallets(state)`

## Advanced

### Restore A Previous Session

```ts
const wallet = createWallet({
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  app: {
    name: "My Hieco App",
    description: "Wallet connection for My Hieco App",
    url: "https://example.com",
    icons: ["https://example.com/icon.png"],
  },
  restoreOnStart: true,
});

const restoredSession = await wallet.restore();
```

`restoreOnStart` performs a best-effort browser restore after the runtime is created. `restore()` lets you control that flow manually.

### Custom Chains And Wallet Catalogs

```ts
import { createWallet, hashpack, hederaDevnet, kabila } from "@hieco/wallet";

const wallet = createWallet({
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  app: {
    name: "My Hieco App",
    description: "Wallet connection for My Hieco App",
    url: "https://example.com",
    icons: ["https://example.com/icon.png"],
  },
  chain: hederaDevnet({
    rpcUrl: "http://127.0.0.1:7546",
    mirrorUrl: "http://127.0.0.1:5551",
  }),
  wallets: [hashpack(), kabila()],
});
```

### Signer Integration

```ts
import { hieco } from "@hieco/sdk";

const session = await wallet.connectQr();
const client = hieco({ network: "testnet" }).as(session.signer);
```

## API Reference

### Root Exports

| Export                       | Kind     | Purpose                                               | Usage form                        |
| ---------------------------- | -------- | ----------------------------------------------------- | --------------------------------- |
| `createWallet`               | function | Create the headless wallet runtime.                   | `createWallet(options)`           |
| `getConnectableWallets`      | function | Filter installed wallet options for UI rendering.     | `getConnectableWallets(state)`    |
| `getUnavailableWallets`      | function | Filter unavailable wallet options for install links.  | `getUnavailableWallets(state)`    |
| `hederaMainnet`              | function | Create the built-in Hedera mainnet chain definition.  | `hederaMainnet()`                 |
| `hederaTestnet`              | function | Create the built-in Hedera testnet chain definition.  | `hederaTestnet()`                 |
| `hederaPreviewnet`           | function | Create the built-in Hedera previewnet chain.          | `hederaPreviewnet()`              |
| `hederaDevnet`               | function | Create a devnet or custom chain definition.           | `hederaDevnet(config?)`           |
| `hashpack`                   | function | Create the curated HashPack wallet definition.        | `hashpack()`                      |
| `kabila`                     | function | Create the curated Kabila wallet definition.          | `kabila()`                        |
| `genericWalletConnectWallet` | function | Create the generic WalletConnect wallet definition.   | `genericWalletConnectWallet()`    |
| `getDefaultWallets`          | function | Return the default wallet catalog used by the runtime | `getDefaultWallets()`             |
| `WalletError`                | class    | Typed wallet error with a stable `code` field.        | `new WalletError(code, message?)` |
| `asWalletError`              | function | Normalize unknown errors into `WalletError`.          | `asWalletError(error, fallback)`  |

### Runtime Methods

| Member                    | Kind   | Purpose                                                        | Usage form                    |
| ------------------------- | ------ | -------------------------------------------------------------- | ----------------------------- |
| `wallet.snapshot`         | method | Read the current wallet state synchronously.                   | `wallet.snapshot()`           |
| `wallet.subscribe`        | method | Listen for wallet state updates.                               | `wallet.subscribe(listener)`  |
| `wallet.connectQr`        | method | Start or join the shared QR connection flow.                   | `wallet.connectQr()`          |
| `wallet.connectExtension` | method | Start or join the shared extension connection flow.            | `wallet.connectExtension(id)` |
| `wallet.cancelConnection` | method | Clear the pending connection attempt without ending a session. | `wallet.cancelConnection()`   |
| `wallet.disconnect`       | method | Disconnect the active wallet session.                          | `wallet.disconnect()`         |
| `wallet.restore`          | method | Restore a previously persisted wallet session if possible.     | `wallet.restore()`            |
| `wallet.destroy`          | method | Tear down the runtime and clear client resources.              | `wallet.destroy()`            |

### Exported Types

| Export                | Kind | Purpose                                                                  | Usage form                 |
| --------------------- | ---- | ------------------------------------------------------------------------ | -------------------------- |
| `CreateWalletOptions` | type | Runtime configuration for app metadata, chain, wallets, and persistence. | `type CreateWalletOptions` |
| `WalletState`         | type | Snapshot returned by `wallet.snapshot()`.                                | `type WalletState`         |
| `WalletSession`       | type | Active connected wallet session with `Signer`.                           | `type WalletSession`       |
| `WalletConnection`    | type | Pending connection state for QR and extension flows.                     | `type WalletConnection`    |
| `WalletChain`         | type | Hedera chain definition used by the runtime.                             | `type WalletChain`         |
| `WalletDefinition`    | type | Input wallet catalog entry for custom wallet definitions.                | `type WalletDefinition`    |
| `WalletOption`        | type | Runtime wallet option with availability metadata.                        | `type WalletOption`        |

## Related Packages

- [`@hieco/wallet-react`](../wallet-react/README.md) for React bindings over this runtime
- [`@hieco/react`](../react/README.md) for Hedera queries and mutations scoped to a wallet signer
- [`examples/wallet`](../../examples/wallet/README.md) for a complete wallet dialog example
