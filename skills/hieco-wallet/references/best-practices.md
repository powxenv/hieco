# Best Practices

Canonical docs:

- [`@hieco/wallet` README](https://github.com/powxenv/hieco/tree/main/packages/wallet)
- [`@hieco/wallet-react` README](https://github.com/powxenv/hieco/tree/main/packages/wallet-react)
- [`@hieco/react` README](https://github.com/powxenv/hieco/tree/main/packages/react)

## Package Choice

- Prefer `@hieco/wallet-react` for React wallet connection and wallet UI.
- Prefer `@hieco/wallet` for headless or custom UI flows.

## Runtime Boundaries

- Creating a wallet runtime is SSR-safe.
- `connect()` and `restore()` are browser-only runtime actions.
- Do not treat wallet connection as a server-side concern for normal user flows.

## Connection UX

- Prefer the default flow: `WalletProvider`, `WalletButton`, and `WalletDialog`.
- Use QR as the default desktop pairing experience.
- Use deeplinks when a wallet definition provides mobile routes.
- Keep a manual retry or fallback action visible when opening the wallet app can fail.

## Configuration Strategy

- Use managed mode or zero-config setup for local development.
- Pass `projectId` explicitly in production.
- Persist only reconnect-safe session metadata. Do not persist secrets or signer material.

## Signer Integration

- Use `useWalletSigner()` as the signer source for `@hieco/react`.
- Keep wallet state in the wallet layer and blockchain data in `@hieco/react` or `@hieco/sdk`.
- Treat the signer as late-bound runtime session state.

## Custom Wallets

- Use the curated built-ins first: HashPack, Kabila, and the generic Hedera WalletConnect fallback.
- Add custom wallets only when you have stable icon and mobile-link metadata.
- Prefer native deep links over universal links when both exist.

## Branding And Standards

- Reown is the platform and docs brand.
- WalletConnect remains the protocol and package brand.
- Hedera wallet sessions should stay aligned with the `hedera` namespace and CAIP identifiers.
