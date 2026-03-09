# @hieco/wallet

## Overview

`@hieco/wallet` is the headless wallet runtime for Hieco.

Use it when you want to connect a Hedera wallet without committing to a specific UI framework. It gives you:

- one wallet runtime created with `createWallet()`
- one observable state store
- one signer bridge that plugs into `@hieco/sdk`
- a clean foundation for framework wrappers such as `@hieco/wallet-react`

This package is designed for browser-based wallet connection. Creating the runtime is SSR-safe, but real wallet actions such as `connect()`, `restore()`, and `disconnect()` must run in the browser.

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

You also need a WalletConnect `projectId` before trying a real wallet connection.

## When To Use This Package

Use `@hieco/wallet` when you want:

- a framework-agnostic wallet runtime
- full control over the wallet UI
- direct access to connection state, prompts, and actions
- a Hedera-compatible signer for `@hieco/sdk`

If you are building a React app and want the fastest path, start with [`@hieco/wallet-react`](../wallet-react/README.md).

## Quick Start

### Create A Wallet Runtime

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
```

This gives you the default Hieco wallet setup:

- `hedera:testnet`
- the built-in wallet catalog
- your explicit app metadata
- local session persistence

### Connect A Wallet

```ts
await wallet.connect({
  wallet: "hashpack",
});
```

### Use The Signer With `@hieco/sdk`

```ts
import { createWallet } from "@hieco/wallet";
import { hieco } from "@hieco/sdk";

const wallet = createWallet({
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  app: {
    name: "My Hieco App",
    description: "Wallet connection for My Hieco App",
    url: "https://example.com",
    icons: ["https://example.com/icon.png"],
  },
});

await wallet.connect({ wallet: "hashpack" });

const signer = wallet.signer();

if (!signer) {
  throw new Error("Wallet signer unavailable");
}

const client = hieco({ network: "testnet" }).as(signer);
```

## Core Concepts

### One Runtime

`createWallet()` returns one runtime object with a small set of plain-language methods:

- `snapshot()`
- `onChange(listener)`
- `connect(options?)`
- `cancel()`
- `disconnect()`
- `restore()`
- `switchChain(chainId)`
- `signer()`
- `destroy()`

The runtime owns wallet state, session restore, prompt state, and signer resolution.

### Browser-Only Connection Actions

You can create a wallet runtime in shared modules or during SSR. That part is safe.

The actual wallet actions are client-side only:

- `connect()`
- `restore()`
- `disconnect()`

If they are called outside the browser, the runtime throws a typed wallet error.

### Default Wallet Flow

The runtime plans the connection flow based on:

- the current platform
- the selected wallet
- installed extension availability
- any explicit overrides passed to `connect()`

In practice:

- desktop browsers prefer installed extensions
- mobile browsers prefer wallet handoff
- QR is used only for explicit paired-device or cross-device flows

### Prompts

When a connection flow needs user handoff, the runtime exposes it in `state.prompt`.

`prompt.kind === "qr"`

- render a QR code from `prompt.uri`
- use this for explicit paired-device flows

`prompt.kind === "deeplink"`

- open `prompt.href`
- keep `prompt.uri` available for fallback handling

`prompt.kind === "return"`

- show return-to-app guidance after wallet handoff

### Built-In Wallets

The default wallet catalog currently includes:

- `hashpack()`
- `kabila()`
- `genericWalletConnectWallet()`

The generic wallet is a neutral WalletConnect fallback for Hedera. It is useful when you want one explicit WalletConnect option without hardcoding a specific wallet brand.

## Common Patterns

### Bring Your Own UI

`@hieco/wallet` is headless by design, so custom UI is a primary use case rather than an advanced escape hatch.

The usual pattern is:

1. create the runtime once
2. read the current state with `snapshot()`
3. subscribe with `onChange()`
4. render from `wallets`, `status`, `account`, `prompt`, and `error`
5. call `connect()`, `cancel()`, `disconnect()`, and `restore()` from your own UI

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

function render() {
  const state = wallet.snapshot();

  console.log(state.status);
  console.log(state.wallets.map((item) => `${item.name}: ${item.readyState}`));
  console.log(state.account?.accountId ?? "No account connected");
  console.log(state.prompt?.kind ?? "No prompt");
}

render();

const stop = wallet.onChange(render);

async function connectHashPack() {
  await wallet.connect({
    wallet: "hashpack",
  });
}

async function showQrCode() {
  await wallet.connect({
    wallet: "hedera-wallet",
    transport: "walletconnect",
    presentation: "qr",
  });
}

function cancelCurrentRequest() {
  wallet.cancel();
}

stop();
```

The runtime already handles wallet discovery, session restore, prompt state, and signer resolution. Your UI only needs to decide how that state should look on screen.

### What To Render In A Custom UI

These fields are the main UI surface:

- `state.wallets` for the available wallet list and ready state
- `state.status` for loading, idle, and connected states
- `state.account` and `state.wallet` for the connected view
- `state.prompt` for QR, deep link, and return guidance
- `state.error` for readable failure messages

### Subscribe To Wallet State

```ts
const stop = wallet.onChange(() => {
  const state = wallet.snapshot();
  console.log(state.status, state.account?.accountId);
});

stop();
```

### Restore A Previous Session

```ts
const restored = await wallet.restore();

if (restored) {
  console.log("Restored", restored.account.accountId);
}
```

### Force QR Pairing

```ts
await wallet.connect({
  wallet: "hedera-wallet",
  transport: "walletconnect",
  presentation: "qr",
});
```

Use this only when you intentionally want a paired-device flow. It is not the normal desktop default.

### Limit The Wallet Catalog

```ts
import { createWallet, hashpack } from "@hieco/wallet";

const wallet = createWallet({
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  app: {
    name: "My Hieco App",
    description: "Wallet connection for My Hieco App",
    url: "https://example.com",
    icons: ["https://example.com/icon.png"],
  },
  wallets: [hashpack()],
});
```

### Change The Default Chain

```ts
import { createWallet, hederaMainnet } from "@hieco/wallet";

const wallet = createWallet({
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  app: {
    name: "My Hieco App",
    description: "Wallet connection for My Hieco App",
    url: "https://example.com",
    icons: ["https://example.com/icon.png"],
  },
  chains: [hederaMainnet()],
});
```

## Important Types

### `CreateWalletOptions`

```ts
type CreateWalletOptions = {
  readonly projectId?: string;
  readonly app: WalletAppMetadata;
  readonly chains?: readonly WalletChain[];
  readonly wallets?: readonly WalletDefinition[];
  readonly autoConnect?: boolean;
  readonly storage?: WalletStorage;
  readonly storageKey?: string;
};
```

### `ConnectOptions`

```ts
type ConnectOptions = {
  readonly wallet?: string;
  readonly chain?: string;
  readonly presentation?: "auto" | "qr" | "deeplink";
  readonly transport?: "extension" | "walletconnect";
};
```

### `WalletState`

```ts
type WalletState = {
  readonly status: "idle" | "connecting" | "connected" | "restoring" | "disconnecting" | "error";
  readonly wallets: readonly WalletOption[];
  readonly wallet: WalletOption | null;
  readonly account: WalletAccount | null;
  readonly accounts: readonly WalletAccount[];
  readonly chain: WalletChain;
  readonly chains: readonly WalletChain[];
  readonly signer: Signer | undefined;
  readonly transport: "extension" | "walletconnect" | null;
  readonly error: WalletError | null;
  readonly prompt: WalletPrompt | null;
};
```

## API Overview

### Main Entry

| Export                  | What it does               |
| ----------------------- | -------------------------- |
| `createWallet(options)` | Create the wallet runtime. |

### Chain Helpers

| Export                  | What it does                                        |
| ----------------------- | --------------------------------------------------- |
| `hederaMainnet()`       | Return the built-in Hedera mainnet chain config.    |
| `hederaTestnet()`       | Return the built-in Hedera testnet chain config.    |
| `hederaPreviewnet()`    | Return the built-in Hedera previewnet chain config. |
| `hederaDevnet(options)` | Return a custom local or dev Hedera chain config.   |

### Wallet Definitions

| Export                         | What it does                         |
| ------------------------------ | ------------------------------------ |
| `hashpack()`                   | Built-in HashPack wallet definition. |
| `kabila()`                     | Built-in Kabila wallet definition.   |
| `genericWalletConnectWallet()` | Generic Hedera WalletConnect option. |

### Errors

| Export                           | What it does                                          |
| -------------------------------- | ----------------------------------------------------- |
| `asWalletError(error, fallback)` | Normalize unknown runtime errors into a wallet error. |
| `walletErrorCodes`               | List of supported wallet error codes.                 |

## Standards And Architecture

Hieco uses the current Hedera wallet standards internally:

- Hedera namespace sessions
- CAIP-2 chain IDs
- CAIP-10 account identifiers
- WalletConnect protocol packages under the hood

In the docs you will see both **Reown** and **WalletConnect** mentioned:

- **Reown** is the company and docs brand
- **WalletConnect** is still the protocol and package brand

## Related Packages

- [`@hieco/wallet-react`](../wallet-react/README.md) for the React provider, hooks, and built-in wallet UI
- [`@hieco/sdk`](../sdk/README.md) for signer-scoped Hedera queries and transactions
- [`@hieco/react`](../react/README.md) for React hooks on top of the core Hedera SDK
