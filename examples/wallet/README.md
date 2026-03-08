# Hieco Wallet Example

This example shows how to use:

- `@hieco/wallet` for the headless wallet runtime
- `@hieco/wallet-react` for the React provider, hooks, and default UI

The app demonstrates:

- explicit WalletConnect project ID mode with `VITE_WALLETCONNECT_PROJECT_ID`
- the default `WalletButton` and `WalletDialog`
- custom wallet controls built with `useWallet()` and related hooks
- desktop extension-first connection routing
- explicit QR pairing when the user chooses it

## Run The Example

Install the workspace dependencies:

```bash
bun install
```

Build the wallet packages once so the example resolves their published entrypoints:

```bash
bun run build:wallet
bun run build:wallet-react
```

Start the example:

```bash
bun --filter '@examples/hieco-wallet' dev
```

## Explicit Project ID

Create `examples/wallet/.env.local`:

```bash
VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

Then restart the dev server.

## Next Step

To pair the wallet signer with the transactional SDK layer, mount `@hieco/react` and pass `useWalletSigner()` into `HiecoProvider`.

## Connection Behavior

- Desktop browsers prefer installed HashPack or Kabila extensions.
- The dialog lets the user choose an installed extension or open a QR code explicitly.
- Installed extension actions still remain available inside the dialog.
- Mobile browsers prefer wallet handoff flows.
