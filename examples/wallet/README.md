# Hieco Wallet Example

This example demonstrates the rewritten wallet flow:

- one Base UI dialog
- one shared runtime connection attempt
- one QR surface that starts immediately
- one wallet list with installed and unavailable extensions
- one settled session view

## Run The Example

Install workspace dependencies:

```bash
bun install
```

Start the example:

```bash
bun --filter '@examples/hieco-wallet' dev
```

## WalletConnect Setup

Create `examples/wallet/.env.local`:

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
VITE_APP_URL=http://localhost:5173
```

Then restart the dev server.

## What The Example Demonstrates

- `@hieco/wallet` exposes one shared `connection`, one `session`, and one wallet list with real availability
- `@hieco/wallet-react` exposes `useWallet()` as the headless connect controller
- opening the dialog starts the shared QR attempt immediately
- clicking an installed extension reuses the same attempt instead of creating another one
