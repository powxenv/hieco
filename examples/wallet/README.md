# Hieco Wallet Example

This example demonstrates the Hieco wallet flow in a small React app.

It focuses on:

- one shared runtime connection attempt
- one QR surface that starts and reloads predictably
- one wallet list split into connectable and unavailable entries
- one settled session view with signer-backed state
- one headless React controller built on `useWallet()`

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
- `@hieco/wallet-react` exposes `useWallet()` as the headless React controller
- opening the dialog starts the shared QR attempt
- clicking an installed extension reuses the same pending attempt instead of creating another one
- `reload()` recreates the QR attempt cleanly when the old session has expired

## Useful Files

- `src/main.tsx` wires the wallet provider
- `src/App.tsx` renders the custom wallet dialog and connected session state
