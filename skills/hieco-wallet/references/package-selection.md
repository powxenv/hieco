# Package Selection

Canonical docs:

- [`@hieco/wallet`](https://github.com/powxenv/hieco/tree/main/packages/wallet)
- [`@hieco/wallet-react`](https://github.com/powxenv/hieco/tree/main/packages/wallet-react)
- [`@hieco/react`](https://github.com/powxenv/hieco/tree/main/packages/react)

Use this file first. It answers which wallet surface should drive the solution.

## Choose The Package

| User context                                               | Choose                                   | Why                                                                        |
| ---------------------------------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------- |
| Browser app that wants headless wallet control             | `@hieco/wallet`                          | The core runtime owns wallet state, prompts, reconnect, and signer access. |
| React app that wants the easiest wallet setup              | `@hieco/wallet-react`                    | The React layer gives one provider, hooks, and first-party wallet UI.      |
| React app that needs wallet connection plus Hedera queries | `@hieco/wallet-react` and `@hieco/react` | The wallet layer owns signer state and `@hieco/react` consumes the signer. |
| App that already uses Reown AppKit and needs compatibility | main SDK skill                           | The legacy AppKit bridge belongs to `@hieco/react`, not the wallet family. |
| Server-only code                                           | neither wallet package                   | Wallet connection is browser-only; use `@hieco/sdk` for server code.       |

## Runtime Matrix

| Runtime                    | Preferred surface                      | Setup shape                                                          |
| -------------------------- | -------------------------------------- | -------------------------------------------------------------------- |
| Browser wallet runtime     | `@hieco/wallet`                        | `const wallet = createWallet()`                                      |
| React wallet-connected app | `@hieco/wallet-react`                  | `<WalletProvider>` plus hooks or UI                                  |
| React app with Hedera data | `@hieco/wallet-react` + `@hieco/react` | `<WalletProvider>` plus `<HiecoProvider signer={useWalletSigner()}>` |
| Legacy AppKit app          | main SDK skill                         | `@hieco/react/appkit` is documented with the `@hieco/react` surface  |

## Rule Of Thumb

- If the user says "wallet connection", "connect button", "installed extension", "mobile wallet handoff", or "paired-device QR", start from `@hieco/wallet-react`.
- If the user wants full control over wallet UX, start from `@hieco/wallet`.
- If the user says "AppKit", switch to the main SDK skill.
- If the user mainly needs queries, transactions, or framework data hooks, switch to the main SDK skill.
