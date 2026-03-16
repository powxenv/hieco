# @hieco/wallet

`@hieco/wallet` is the headless Hieco wallet runtime for browser apps that want full control over wallet state, QR pairing, extension flows, restore behavior, and signer handoff.

It is the package to use when you want to own the wallet experience instead of inheriting one.

## Why This Package Exists

Wallet connection is rarely just a button. Real apps need to manage:

- the current session
- a pending QR or extension connection attempt
- installed and unavailable wallets
- reconnect and restore behavior
- a signer that can move into the rest of the Hieco stack

`@hieco/wallet` keeps that complexity in one runtime so your UI can stay focused on presentation.

## When To Use It

Choose `@hieco/wallet` when you are building:

- a browser app outside React
- a custom wallet modal, drawer, or inline picker
- your own framework integration on top of the headless runtime
- a product that needs direct control over pairing, restore, and disconnect flows

If you want the React wrapper, use [`@hieco/wallet-react`](../wallet-react/README.md).

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

## How To Think About The Runtime

One wallet runtime owns:

- one configured chain
- one active session
- one shared pending connection attempt
- one wallet catalog

That shared pending attempt is the key behavioral detail. `connectQr()` and `connectExtension(walletId)` join the same in-flight attempt until it settles or gets canceled. That makes custom wallet UI easier to reason about because the runtime, not the component tree, owns the connection lifecycle.

## Common Workflows

### Read wallet state

```ts
const state = wallet.snapshot();

console.log(state.session?.accountId);
console.log(state.connection?.uri);
```

### Build your own wallet picker

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

  console.log(getConnectableWallets(state));
  console.log(getUnavailableWallets(state));
});
```

### Restore a previous session

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

await wallet.restore();
```

### Pass the signer into Hieco

```ts
import { hieco } from "@hieco/sdk";

const session = await wallet.connectQr();
const client = hieco({ network: "testnet" }).as(session.signer);
```

## Runtime Boundaries

Runtime creation is safe in shared app code and SSR environments, but connection actions are browser-only:

- `connectQr()`
- `connectExtension()`
- `disconnect()`
- `restore()`

That split is deliberate. You can mount the runtime safely during app setup and defer real wallet work until the browser is available.

## Subpath Exports

The package also ships focused subpaths for apps that want a narrower import surface:

- `@hieco/wallet/chains`
- `@hieco/wallet/selectors`
- `@hieco/wallet/state`
- `@hieco/wallet/wallets`

Those are useful when you want chain definitions, selector helpers, or curated wallet metadata without importing the entire package namespace.

## Packaging And Runtime Support

The wallet package now follows the same packaging rules as the rest of the public workspace:

- browser-targeted ESM build output
- dependencies kept external for the consuming app or bundler
- conditional exports for `browser`, `worker`, `workerd`, `node`, and `default`

That keeps the package easier to consume across modern frontend and edge-style runtimes while preserving the browser-only behavior of actual wallet interactions.

## API At A Glance

Core exports:

- `createWallet`
- `getConnectableWallets`
- `getUnavailableWallets`
- `hederaMainnet()`
- `hederaTestnet()`
- `hederaPreviewnet()`
- `hederaDevnet()`
- `hashpack()`
- `kabila()`
- `genericWalletConnectWallet()`
- `getDefaultWallets()`

Key runtime methods:

- `snapshot()`
- `subscribe(listener)`
- `connectQr()`
- `connectExtension(walletId)`
- `cancelConnection()`
- `disconnect()`
- `restore()`
- `destroy()`

## Related Packages

- [`@hieco/wallet-react`](../wallet-react/README.md) for React bindings over this runtime
- [`@hieco/react`](../react/README.md) for signer-aware React queries and mutations
- [`@hieco/sdk`](../sdk/README.md) for direct signer-scoped application logic
