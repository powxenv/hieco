# @hieco/sdk

`@hieco/sdk` is the core Hieco client for Hedera reads, transactions, signer-scoped actions, and server-side workflows.

It is the main application-facing SDK in the workspace. If you want one fluent API for scripts, route handlers, workers, browser signer flows, or shared domain services, start here.

## Why This Package Exists

Hedera apps usually need more than raw transaction primitives. They need:

- readable domain methods
- strong typing across params and results
- a clean way to scope work to a signer
- a path from direct execution to descriptors and scheduled work
- behavior that still makes sense across browser, worker, and server runtimes

`@hieco/sdk` is that layer.

## When To Use It

Choose `@hieco/sdk` when you are building:

- backend handlers and server actions
- scripts, jobs, or workers
- transaction-heavy app logic
- browser code that already has a wallet signer
- shared application services reused across runtimes

If you want React providers and query hooks, use [`@hieco/react`](../react/README.md).

## Installation

```bash
npm install @hieco/sdk
```

```bash
pnpm add @hieco/sdk
```

```bash
yarn add @hieco/sdk
```

```bash
bun add @hieco/sdk
```

## Quick Start

### Server code with environment configuration

```ts
import { hieco } from "@hieco/sdk";

const client = hieco.fromEnv();
const account = await client.account.info("0.0.1001").now();

if (account.ok) {
  console.log(account.value.accountId);
}
```

### Explicit client configuration

```ts
import { hieco } from "@hieco/sdk";

const client = hieco({
  network: "testnet",
});

const token = await client.token.info("0.0.2001").now();
```

### Browser code with a wallet signer

```ts
import { hieco, type Signer } from "@hieco/sdk";

export function createWalletClient(signer: Signer) {
  return hieco({ network: "testnet" }).as(signer);
}
```

## Mental Model

The SDK is built around a simple flow:

1. Create a client.
2. Enter a domain namespace such as `account`, `token`, `topic`, or `contract`.
3. Build an operation.
4. Choose how to finish it.

Most operations support more than one ending:

- `.now()` executes immediately
- `.tx()` returns a `TransactionDescriptor`
- `.queue()` creates scheduled work for later execution

That gives you one surface for both direct app code and more deliberate transaction orchestration.

## Common Workflows

### Run a signed transfer

```ts
import { hieco } from "@hieco/sdk";

const client = hieco.fromEnv();

const result = await client.account
  .send({
    to: "0.0.1002",
    hbar: 1,
  })
  .now();
```

### Build now, submit later

```ts
const descriptor = client.token
  .transfer({
    tokenId: "0.0.2001",
    from: "0.0.1001",
    to: "0.0.1002",
    amount: 10,
  })
  .tx();

const receipt = await client.tx.submit(descriptor).now();
```

### Re-exported SDK types

`@hieco/sdk` also re-exports common SDK-facing types so most app code can stay on one package import.

```ts
import { Mnemonic, PublicKey, type Signer, hieco } from "@hieco/sdk";

const client = hieco.forTestnet();
const publicKey = PublicKey.fromString("302a300506032b6570032100...");
```

## Packaging Notes

The package now ships browser-friendly ESM output with explicit conditional exports for `browser`, `worker`, `workerd`, `node`, and `default`.

For most users, the important takeaway is simple: the SDK is easier to consume in modern browser and edge-style environments without changing how you use it.

## Environment Variables

`hieco.fromEnv()` reads these server-side environment variables:

- `HIERO_NETWORK`
- `HIERO_OPERATOR_ID` or `HIERO_ACCOUNT_ID`
- `HIERO_PRIVATE_KEY`
- `HIERO_MIRROR_URL`

Keep them in server-only code. Public browser configuration should use `config` plus an optional `signer`, not operator credentials.

## API At A Glance

Common namespaces include:

- `account`
- `token`
- `topic`
- `contract`
- `file`
- `schedule`
- `reads`
- `tx`
- `batch`
- `net`

Core entry points:

- `hieco(config?)`
- `hieco.fromEnv()`
- `hieco.forMainnet()`
- `hieco.forTestnet()`
- `hieco.forPreviewnet()`
- `hieco.withSigner(signer, config?)`

## Related Packages

- [`@hieco/react`](../react/README.md) for React providers and hooks over this SDK
- [`@hieco/wallet`](../wallet/README.md) and [`@hieco/wallet-react`](../wallet-react/README.md) for signer-producing wallet flows
- [`@hieco/mirror`](../mirror/README.md) for read-only Mirror Node access
