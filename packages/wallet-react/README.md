# @hieco/wallet-react

`@hieco/wallet-react` brings the Hieco wallet runtime into React.

It provides:

- `WalletProvider`
- hooks for wallet state and actions
- a signer that works with `@hieco/react` and `@hieco/sdk`

## Installation

```bash
bun add @hieco/wallet-react @hieco/wallet
```

Host app peer dependencies:

- `react >= 18`
- `react-dom >= 18`

You also need a WalletConnect `projectId` before you can connect a real wallet.

## Quick Start

```tsx
import type { ReactNode } from "react";
import { WalletProvider, useWallet } from "@hieco/wallet-react";

function ConnectButton() {
  const { connect, disconnect, account, status } = useWallet();

  if (account) {
    return <button onClick={() => disconnect()}>Disconnect</button>;
  }

  return (
    <button
      onClick={() =>
        connect({
          chain: "hedera:testnet",
          transport: "walletconnect",
          wallet: "hedera-wallet",
        })
      }
    >
      Connect Wallet
    </button>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletProvider
      projectId="YOUR_WALLETCONNECT_PROJECT_ID"
      app={{
        name: "My Hieco App",
        description: "Wallet connection for My Hieco App",
        url: "https://example.com",
        icons: ["https://example.com/icon.png"],
      }}
    >
      <ConnectButton />
      {children}
    </WalletProvider>
  );
}
```

`WalletProvider` requires explicit app metadata when it creates the wallet runtime for you.
If you pass a prebuilt `wallet` instance instead, you can keep that metadata at the `createWallet()` call site.

## Hooks

- `useWallet()` - main hook for wallet state and actions
- `useWallets()` - wallet catalog
- `useConnect()` - connect action
- `useDisconnect()` - disconnect action
- `useSwitchChain()` - switch chain action
- `useWalletAccount()` - account info
- `useWalletError()` - error state
- `useWalletModal()` - modal state
- `useWalletSigner()` - signer for transactions

## Example

See [`examples/wallet`](../../examples/wallet/README.md) for the local integration harness.

Inside this workspace, consumers should resolve `@hieco/wallet-react` and `@hieco/wallet` through Bun workspaces rather than by aliasing sibling package source directories.
