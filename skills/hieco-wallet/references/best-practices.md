# Best Practices

Canonical docs:

- [`@hieco/wallet` README](https://github.com/powxenv/hieco/tree/main/packages/wallet)
- [`@hieco/wallet-react` README](https://github.com/powxenv/hieco/tree/main/packages/wallet-react)
- [`@hieco/react` README](https://github.com/powxenv/hieco/tree/main/packages/react)

## Package Choice

- Prefer `@hieco/wallet-react` for wallet connection inside React.
- Prefer `@hieco/wallet` for non-React runtimes or when the app owns runtime lifecycle directly.

## Runtime Boundaries

- Creating a wallet runtime is SSR-safe.
- `connectQr()`, `connectExtension()`, `disconnect()`, and `restore()` are browser-only runtime actions.
- Pass `projectId` explicitly before attempting a real wallet connection or session restore.

## Connection Flow

- Treat one runtime as one chain, one active session, and one pending connection attempt.
- Start the common flow with `connectQr()` or `useWallet().open()`.
- Let installed extension buttons call `connectExtension(walletId)` so they can reuse the shared pending attempt.
- Use `cancelConnection()` when dismissing the UI should stop the pending attempt.

## UI Composition

- Keep the runtime in Hieco and the presentation in your own components.
- In React, render from `connectableWallets`, `unavailableWallets`, `qr`, `session`, and `error`.
- Use `getConnectableWallets(state)` and `getUnavailableWallets(state)` when building directly on the core runtime.
- Show install links only for unavailable wallets that expose `installUrl`.

## Restore And Persistence

- Use `restoreOnStart` when the app should attempt reconnection automatically after hydration.
- Use `restore()` when the app wants to control reconnect timing itself.
- Persist only reconnect-safe session metadata. Do not persist secrets or signer material.

## Signer Integration

- In React, use `useWallet().session?.signer` as the signer source for `@hieco/react`.
- Outside React, use `wallet.snapshot().session?.signer` after the session is connected.
- Keep wallet state in the wallet layer and Hedera reads and writes in `@hieco/react` or `@hieco/sdk`.

## Custom Wallets

- Start with the curated defaults: HashPack, Kabila, and the generic WalletConnect wallet.
- Add custom wallets only when the app has stable install metadata and icon URLs.
- Narrow the wallet catalog only when the product has a clear compatibility or UX requirement.
