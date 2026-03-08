# @hieco/wallet

## Overview

`@hieco/wallet` is the headless Hedera wallet runtime for Hieco.

It is designed for browser apps that want:

- one wallet runtime
- one state store
- one signer bridge into `@hieco/sdk`
- a clean path into framework wrappers such as `@hieco/wallet-react`

The runtime uses native Hedera WalletConnect sessions under a Hieco-owned API. Hieco docs refer to Reown when talking about the platform and docs site, while the protocol and package names still use the WalletConnect brand.

Creating a wallet runtime is SSR-safe. Actually connecting or restoring a wallet session is browser-only.

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

Use `@hieco/wallet` when you want:

- a framework-agnostic wallet runtime
- full control over wallet UI
- direct access to connection state and prompts
- a signer that plugs straight into `@hieco/sdk`

If you are building a React app and want the easiest path, start with [`@hieco/wallet-react`](../wallet-react/README.md).

## Quick Start

### Managed Mode

When you omit `projectId`, the runtime tries to resolve a managed project ID from the browser:

- `window.__HIECO_WALLET_PROJECT_ID__`
- `<meta name="hieco-wallet-project-id" content="...">`
- `/.well-known/hieco/wallet/project-id`

```ts
import { createWallet } from "@hieco/wallet";

const wallet = createWallet();

await wallet.connect({
  wallet: "hashpack",
});
```

### Explicit Project ID

```ts
import { createWallet } from "@hieco/wallet";

const wallet = createWallet({
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
});

await wallet.connect({
  wallet: "hashpack",
});
```

### Use The Signer With Hieco SDK

```ts
import { createWallet } from "@hieco/wallet";
import { hieco } from "@hieco/sdk";

const wallet = createWallet({
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
});

await wallet.connect();

const signer = wallet.signer();

if (!signer) {
  throw new Error("Wallet signer unavailable");
}

const client = hieco({ network: "testnet" }).as(signer);
```

## Core Concepts

### One Runtime

`createWallet()` returns one runtime with plain-language methods:

- `snapshot()`
- `onChange(listener)`
- `connect(options?)`
- `disconnect()`
- `restore()`
- `switchChain(chainId)`
- `signer()`
- `destroy()`

### Browser-Only Wallet Actions

You can create the runtime during SSR or in shared modules.

These methods are client-side only:

- `connect()`
- `restore()`

If they are called on the server, the runtime throws a typed `WALLET_NOT_READY` error with a clear hint.

### Prompt-Driven Connection Flow

When a new pairing is needed, the runtime exposes a prompt in state instead of a flat pairing string.

`prompt.kind === "qr"`

- render a QR code from `prompt.uri`

`prompt.kind === "deeplink"`

- open `prompt.href`
- keep `prompt.uri` available for copy or fallback handling

`prompt.kind === "return"`

- show return-to-app guidance for flows that need it

### Built-In Wallets

The curated v1 wallet catalog is:

- `hashpack()`
- `kabila()`
- `genericWalletConnectWallet()`

The generic wallet is a neutral Hedera fallback. It is not presented as an install page for the WalletConnect protocol itself.

### Defaults

When you create a wallet with no options, the runtime uses:

- `hedera:testnet`
- the built-in wallet catalog
- browser metadata inferred from the page
- `localStorage`
- `autoConnect: true`

### Standards

The runtime aligns with:

- HIP-820
- HIP-1190
- CAIP-2 chain IDs
- CAIP-10 account IDs

That means Hedera sessions use the `hedera` namespace and standard period-separated Hedera account identifiers.

## Advanced

### Limit The Wallet Catalog

```ts
import { createWallet, hashpack } from "@hieco/wallet";

const wallet = createWallet({
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  wallets: [hashpack()],
});
```

### Switch The Default Chain

```ts
import { createWallet, hederaMainnet } from "@hieco/wallet";

const wallet = createWallet({
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  chains: [hederaMainnet()],
});
```

### Add Redirect Metadata

```ts
import { createWallet } from "@hieco/wallet";

const wallet = createWallet({
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  app: {
    name: "My Hieco App",
    redirect: {
      universal: "https://example.com/wallet-return",
      native: "myapp://wallet-return",
    },
  },
});
```

### Force QR Or Deeplink Presentation

```ts
await wallet.connect({
  wallet: "hashpack",
  presentation: "qr",
});
```

```ts
await wallet.connect({
  wallet: "custom-wallet",
  presentation: "deeplink",
});
```

### Custom Wallet Definitions

If you want mobile deep link behavior for a custom wallet, provide `mobile.native` or `mobile.universal`.

```ts
import { createWallet } from "@hieco/wallet";

const wallet = createWallet({
  projectId: "YOUR_WALLETCONNECT_PROJECT_ID",
  wallets: [
    {
      id: "example-wallet",
      name: "Example Wallet",
      icon: "https://example.com/icon.png",
      mobile: {
        native: "examplewallet://wc?uri={uri}",
      },
      transports: ["walletconnect"],
    },
  ],
});
```

### Restore Sessions Manually

```ts
const restored = await wallet.restore();

if (restored) {
  console.log(restored.account.accountId);
}
```

## API Reference

### Top-Level Exports

| Export                       | Kind     | What it does                                             | Parameters                    | Returns            |
| ---------------------------- | -------- | -------------------------------------------------------- | ----------------------------- | ------------------ |
| `createWallet`               | function | Create a headless Hedera wallet runtime.                 | `CreateWalletOptions?`        | `Wallet`           |
| `hederaMainnet`              | function | Create the built-in Hedera mainnet chain.                | none                          | `WalletChain`      |
| `hederaTestnet`              | function | Create the built-in Hedera testnet chain.                | none                          | `WalletChain`      |
| `hederaPreviewnet`           | function | Create the built-in Hedera previewnet chain.             | none                          | `WalletChain`      |
| `hederaDevnet`               | function | Create a devnet or custom Hedera chain.                  | `input?`                      | `WalletChain`      |
| `hashpack`                   | function | Create the curated HashPack wallet definition.           | none                          | `WalletDefinition` |
| `kabila`                     | function | Create the curated Kabila wallet definition.             | none                          | `WalletDefinition` |
| `genericWalletConnectWallet` | function | Create the neutral Hedera WalletConnect fallback wallet. | none                          | `WalletDefinition` |
| `createWalletError`          | function | Create a typed wallet error.                             | `code`, `message`, `options?` | `WalletError`      |
| `formatWalletError`          | function | Format a typed wallet error into readable text.          | `error`                       | `string`           |
| `asWalletError`              | function | Normalize unknown errors into a typed wallet error.      | `error`, `fallback`           | `WalletError`      |

### Wallet Runtime

| Method               | What it does                                               | Parameters               | Returns                             |
| -------------------- | ---------------------------------------------------------- | ------------------------ | ----------------------------------- |
| `wallet.snapshot`    | Read the current wallet state snapshot.                    | none                     | `WalletState`                       |
| `wallet.onChange`    | Subscribe to future wallet state changes.                  | `(listener: () => void)` | `() => void`                        |
| `wallet.connect`     | Start a wallet connection flow.                            | `ConnectOptions?`        | `Promise<WalletConnection>`         |
| `wallet.disconnect`  | Disconnect the current wallet session.                     | none                     | `Promise<void>`                     |
| `wallet.restore`     | Restore the previous wallet session if it still exists.    | none                     | `Promise<WalletConnection \| null>` |
| `wallet.switchChain` | Switch the active Hedera chain inside the current runtime. | `(chainId: string)`      | `Promise<void>`                     |
| `wallet.signer`      | Read the current Hiero-compatible signer.                  | none                     | `Signer \| undefined`               |
| `wallet.destroy`     | Tear down the runtime.                                     | none                     | `Promise<void>`                     |
| `wallet.$state`      | Read the underlying Nanostore directly.                    | none                     | `ReadableAtom<WalletState>`         |

### Key Types

```ts
type CreateWalletOptions = {
  readonly projectId?: string;
  readonly app?: Partial<Omit<WalletAppMetadata, "redirect">> & {
    readonly redirect?: {
      readonly native?: string;
      readonly universal?: string;
    };
  };
  readonly chains?: readonly WalletChain[];
  readonly wallets?: readonly WalletDefinition[];
  readonly autoConnect?: boolean;
  readonly storage?: WalletStorage;
  readonly storageKey?: string;
};
```

```ts
type ConnectOptions = {
  readonly wallet?: string;
  readonly chain?: string;
  readonly presentation?: "auto" | "qr" | "deeplink";
};
```

```ts
type WalletPrompt =
  | {
      readonly kind: "qr";
      readonly uri: string;
      readonly wallet: WalletOption;
    }
  | {
      readonly kind: "deeplink";
      readonly uri: string;
      readonly href: string;
      readonly wallet: WalletOption;
    }
  | {
      readonly kind: "return";
      readonly wallet: WalletOption;
      readonly href?: string;
    };
```

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
  readonly error: WalletError | null;
  readonly prompt: WalletPrompt | null;
};
```

## Related Packages

- [`@hieco/wallet-react`](../wallet-react/README.md)
- [`@hieco/react`](../react/README.md)
- [`@hieco/sdk`](../sdk/README.md)
