# Package Selection

Canonical docs:

- [`@hieco/sdk`](https://github.com/powxenv/hieco/tree/main/packages/sdk)
- [`@hieco/react`](https://github.com/powxenv/hieco/tree/main/packages/react)

Use this file first. It answers which SDK surface should drive the solution.

## Choose The Package

| User context | Choose | Why |
| --- | --- | --- |
| Node script, backend handler, worker, cron job, CLI, server action, route handler | `@hieco/sdk` | The core fluent client owns transactions, reads, and server runtime configuration. |
| Browser code that already receives a wallet `Signer` | `@hieco/sdk` | The SDK can be scoped with `client.as(signer)` without bringing in React. |
| React app that needs Hedera queries or mutations | `@hieco/react` | The React wrapper provides `HiecoProvider`, TanStack Query integration, and domain hooks. |
| Full-stack React app with server and client code | `@hieco/sdk` on the server and `@hieco/react` in the UI | This keeps credentials server-side and keeps client code declarative. |
## Runtime Matrix

| Runtime | Preferred surface | Setup shape |
| --- | --- | --- |
| Server-only | `@hieco/sdk` | `hieco.fromEnv()` or `hieco(config)` |
| Browser signer runtime | `@hieco/sdk` | `hieco({ network }).as(signer)` |
| React client app | `@hieco/react` | `<HiecoProvider config={{ network }}>` plus hooks |
| React app with SSR | `@hieco/sdk` and `@hieco/react` | server prefetch with `@hieco/sdk`, then hydrate `HiecoProvider` |

## Package Relationships

- `@hieco/react` re-exports the public types and helpers from `@hieco/sdk`.
- `@hieco/sdk` remains the source of truth for fluent Hedera reads, writes, and signer-scoped logic.

## Rule Of Thumb

- If the user says "React app" and needs Hedera queries or mutations, start from `@hieco/react`.
- If the user says "server", "script", "worker", or "CLI", start from `@hieco/sdk`.
- If the user needs wallet connection, QR, deeplinks, or wallet UI, switch to the wallet skill.
