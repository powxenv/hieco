# @hieco/wallet

`@hieco/wallet` is the headless Hieco wallet runtime for browser apps that want full control over wallet state, QR pairing, extension flows, and session restore.

It is the package you reach for when you want to own the wallet experience instead of adopting one for free.

## Why This Package Exists

Wallet connection is rarely just a button. Real apps need to manage:

- a current session
- a pending connection attempt
- extension and WalletConnect entry points
- reconnect and restore behavior
- a signer that can move into the rest of the app

`@hieco/wallet` keeps that complexity in one runtime so your UI can stay focused on presentation.

## When To Use It

Choose `@hieco/wallet` when you are building:

- a browser app outside React
- a custom wallet modal, drawer, or inline picker
- a framework integration that wants direct runtime ownership
- a product that needs fine-grained control over pairing and restore flows

If you want the React wrapper, use [`@hieco/wallet-react`](../wallet-react/README.md).

## Installation

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

That shared pending attempt is the important detail. `connectQr()` and `connectExtension(walletId)` join the same in-flight connection until it settles or gets cancelled, which makes custom wallet UI much easier to reason about.

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

## Notes

- `projectId` is required for real WalletConnect-backed pairing.
- Runtime creation is safe in shared app code, but connection and restore actions are browser-only.
- The curated wallet catalog includes HashPack, Kabila, and a generic WalletConnect option.

## Related Packages

- [`@hieco/wallet-react`](../wallet-react/README.md) for React bindings over this runtime
- [`@hieco/react`](../react/README.md) for signer-aware React queries and mutations
- [`@hieco/sdk`](../sdk/README.md) for direct signer-scoped application logic
