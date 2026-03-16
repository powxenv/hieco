# @hieco/runtime

`@hieco/runtime` is the runtime-aware adapter around the Hiero JavaScript SDK used by the Hieco package family.

It exists so Hieco packages can depend on one stable import path while package resolution still does the right thing in browsers, workers, workerd, and Node-style runtimes.

## Why This Package Exists

Before the runtime split, higher-level packages had to import SDK types and classes directly from `@hiero-ledger/sdk`. The current architecture moves that dependency behind one Hieco-owned boundary:

- `@hieco/sdk` re-exports core SDK types from `@hieco/runtime`
- `@hieco/wallet` uses it for signer and transaction interop
- the package manifest can declare different entrypoints for browser and node consumers without every sibling package having to solve that problem on its own

Most Hieco users will touch this package indirectly through `@hieco/sdk` or `@hieco/wallet`. Reach for it directly when you need raw Hiero SDK exports but want to stay aligned with Hieco’s runtime packaging.

## When To Use It

Use `@hieco/runtime` when you need:

- raw SDK classes such as `Client`, `PrivateKey`, or `Transaction`
- SDK types like `Signer` in shared code that already depends on Hieco packages
- one import path that can resolve correctly in browser, worker, and node environments

If you want Hieco’s fluent application client, use [`@hieco/sdk`](../sdk/README.md) instead.

## Installation

```bash
npm install @hieco/runtime
```

```bash
pnpm add @hieco/runtime
```

```bash
yarn add @hieco/runtime
```

```bash
bun add @hieco/runtime
```

## Quick Start

```ts
import { Client, PrivateKey, type Signer } from "@hieco/runtime";

const client = Client.forTestnet();
const key = PrivateKey.generateED25519();

export function useSigner(signer: Signer) {
  return { client, signer, key };
}
```

## Runtime Resolution

The package publishes explicit runtime-aware entrypoints:

- `@hieco/runtime` resolves to the browser build by default
- `@hieco/runtime/node` gives you the node entry explicitly
- `@hieco/runtime/browser` gives you the browser entry explicitly

The root export also declares `browser`, `worker`, `workerd`, `node`, and `default` conditions, so supported bundlers can pick the right file automatically.

## What It Exports

Today the package re-exports the underlying Hiero SDK surface. That means the familiar SDK classes and types are available here, including:

- `Client`
- `Signer`
- `PrivateKey`
- `PublicKey`
- `Mnemonic`
- transaction, query, and receipt types

The goal is not to rename the SDK. The goal is to give the Hieco workspace a single runtime boundary.

## Build And Publish Behavior

`@hieco/runtime` is the only public package in the workspace that currently ships separate browser and node build outputs:

- `dist/browser.js`
- `dist/node.js`

Everything else in the workspace can stay on a single browser-friendly ESM build and rely on conditional exports plus externalized dependencies.

## Related Packages

- [`@hieco/sdk`](../sdk/README.md) for the higher-level fluent Hieco client
- [`@hieco/wallet`](../wallet/README.md) for wallet-derived signers built on this runtime boundary
