# @hieco/wallet-react

`@hieco/wallet-react` brings the Hieco wallet runtime into React.

It provides:

- `WalletProvider`
- hooks for wallet state and actions
- optional built-in UI from `@hieco/wallet-react/ui`
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
import { WalletProvider } from "@hieco/wallet-react";
import { WalletButton, WalletDialog } from "@hieco/wallet-react/ui";

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
      <WalletButton />
      <WalletDialog />
      {children}
    </WalletProvider>
  );
}
```

`WalletProvider` requires explicit app metadata when it creates the wallet runtime for you.
If you pass a prebuilt `wallet` instance instead, you can keep that metadata at the `createWallet()` call site.

## Built-In UI

The built-in UI lives in `@hieco/wallet-react/ui`.

It exports:

- `WalletButton`
- `WalletDialog`
- `WalletAccountButton`
- `WalletList`

The built-in UI now uses StyleX for component-scoped styling.
Importing and rendering the `ui` entry applies the bundled styles automatically.
No Tailwind setup and no separate stylesheet import are required.

If you never import `@hieco/wallet-react/ui`, no UI styles are loaded.

## Customization

The built-in UI keeps the same CSS custom property override surface:

Supported CSS variables:

- `--hieco-wallet-font-family`
- `--hieco-wallet-radius`
- `--hieco-wallet-overlay-background`
- `--hieco-wallet-surface-background`
- `--hieco-wallet-surface-border`
- `--hieco-wallet-surface-shadow`
- `--hieco-wallet-text-primary`
- `--hieco-wallet-text-secondary`
- `--hieco-wallet-accent-background`
- `--hieco-wallet-accent-background-hover`
- `--hieco-wallet-accent-foreground`
- `--hieco-wallet-accent-border`
- `--hieco-wallet-muted-background`
- `--hieco-wallet-muted-background-hover`
- `--hieco-wallet-muted-foreground`
- `--hieco-wallet-muted-border`
- `--hieco-wallet-error-background`
- `--hieco-wallet-error-border`
- `--hieco-wallet-error-foreground`

## Bring Your Own UI

You do not need to use `WalletButton` or `WalletDialog`.

Use:

- `WalletProvider` for the runtime
- `useWallet()` for state and actions
- `useWallets()` for the wallet catalog
- your own modal, drawer, inline picker, or prompt UI

## Example

See [`examples/wallet`](../../examples/wallet/README.md) for the local integration harness.

Inside this workspace, consumers should resolve `@hieco/wallet-react` and `@hieco/wallet` through Bun workspaces rather than by aliasing sibling package source directories.
