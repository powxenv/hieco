# Package Selection

Canonical docs:

- [`@hieco/wallet`](https://github.com/powxenv/hieco/tree/main/packages/wallet)
- [`@hieco/wallet-react`](https://github.com/powxenv/hieco/tree/main/packages/wallet-react)
- [`@hieco/react`](https://github.com/powxenv/hieco/tree/main/packages/react)

Use this file first. It answers which wallet surface should drive the solution.

## Choose The Package

| User context | Choose | Why |
| --- | --- | --- |
| Browser app that wants headless wallet control | `@hieco/wallet` | The core runtime owns wallet state, shared connection attempts, restore behavior, and signer access. |
| React app that wants the standard wallet integration | `@hieco/wallet-react` | The React wrapper provides one provider and one headless controller hook. |
| React app that needs wallet connection plus Hedera queries | `@hieco/wallet-react` and `@hieco/react` | The wallet layer owns signer state and `@hieco/react` consumes the signer. |
| App that already uses Reown AppKit and needs compatibility | main SDK skill | The legacy AppKit bridge belongs to `@hieco/react`, not the wallet family. |
| Server-only code | neither wallet package | Wallet connection is browser-only. Use `@hieco/sdk` for server code. |

## Runtime Matrix

| Runtime | Preferred surface | Setup shape |
| --- | --- | --- |
| Browser wallet runtime | `@hieco/wallet` | `const wallet = createWallet(...)` |
| React wallet-connected app | `@hieco/wallet-react` | `<WalletProvider>` plus `useWallet()` |
| React app with Hedera data | `@hieco/wallet-react` and `@hieco/react` | `<WalletProvider>` plus `<HiecoProvider signer={wallet.session?.signer}>` |
| Legacy AppKit app | main SDK skill | `@hieco/react/appkit` is documented with the main SDK surface |

## Rule Of Thumb

- If the user says "wallet connection", "connect button", "QR", or "extension pairing", start from `@hieco/wallet-react`.
- If the user wants full control over runtime lifecycle or UI outside React, start from `@hieco/wallet`.
- If the user says "AppKit", switch to the main SDK skill.
- If the user mainly needs queries, transactions, or framework data hooks, switch to the main SDK skill.
