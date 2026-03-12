# @hieco/wallet

`@hieco/wallet` is the low-level Hedera wallet runtime for Hieco.

It keeps the model small:

- one configured chain per runtime
- one active session
- one shared pending WalletConnect attempt
- one wallet list with installed and unavailable extension options

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

const pending = wallet.connectQr();

console.log(wallet.snapshot().connection?.uri);

const session = await pending;

console.log(session.accountId);
console.log(session.signer);
```

## Runtime API

`createWallet()` returns:

- `snapshot()`
- `subscribe(listener)`
- `connectQr()`
- `connectExtension(walletId)`
- `cancelConnection()`
- `disconnect()`
- `restore()`
- `destroy()`

It also exports:

- `getConnectableWallets(state)`
- `getUnavailableWallets(state)`

## State Shape

```ts
type WalletState = {
  readonly chain: WalletChain;
  readonly walletConnectEnabled: boolean;
  readonly wallets: readonly WalletOption[];
  readonly session: WalletSession | null;
  readonly connection: WalletConnection | null;
};
```

- `wallets` includes configured desktop wallets with real availability and install metadata
- `walletConnectEnabled` tells the UI whether QR and extension pairing are enabled
- `connection` is the one shared in-flight attempt for both QR and extension UI
- `session` is the durable connected state

For React apps, prefer [`@hieco/wallet-react`](../wallet-react/README.md). This package is the escape hatch for non-React apps and low-level integrations.

## Related Packages

- [`@hieco/wallet-react`](../wallet-react/README.md)
- [`examples/wallet`](../../examples/wallet/README.md)
