# @hieco/sdk

`@hieco/sdk` is the core Hieco client for Hedera reads, transactions, signer-scoped actions, and server-side workflows.

Use it when you want one fluent API that feels at home in scripts, route handlers, workers, and any place where you need precise control without UI framework overhead.

## Why This Package Exists

Hedera apps usually need more than raw transaction primitives. They need:

- readable domain methods
- strong typing across params and results
- a clean way to scope work to a signer
- a path from quick reads to queued or executable transactions

`@hieco/sdk` is that foundation. It is the package the React layer builds on, and it is the place to start when you want the full Hieco application model without React.

## When To Use It

Choose `@hieco/sdk` when you are building:

- backend handlers and server actions
- CLI scripts and jobs
- transaction-heavy app logic
- wallet-aware browser code that already has a signer
- shared domain services you want to reuse across runtimes

If you want TanStack Query hooks and a provider for React, use [`@hieco/react`](../react/README.md).

## Installation

```bash
bun add @hieco/sdk
```

## Quick Start

### Start from environment configuration

```ts
import { hieco } from "@hieco/sdk";

const client = hieco.fromEnv();
const account = await client.account.info("0.0.1001").now();

if (account.ok) {
  console.log(account.value.accountId);
}
```

### Start from explicit config

```ts
import { hieco } from "@hieco/sdk";

const client = hieco({
  network: "testnet",
});

const token = await client.token.info("0.0.2001").now();
```

## Mental Model

The SDK is designed around a simple flow:

1. Create a client.
2. Enter a domain namespace like `account`, `token`, or `contract`.
3. Build an operation.
4. Choose how to use it.

Most operations give you more than one ending:

- `.now()` to execute immediately
- `.tx()` to get a transaction descriptor
- `.queue()` to collect work for later execution or composition

That makes the SDK useful both for straightforward app code and for more deliberate transaction orchestration.

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

### Scope a client to a wallet signer

```ts
import { hieco } from "@hieco/sdk";

const client = hieco({ network: "testnet" }).as(session.signer);
const info = await client.account.info(session.accountId).now();
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

## API At A Glance

The public surface is organized around domain namespaces instead of one flat bag of helpers.

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

Useful shared exports:

- `Signer`
- `PrivateKey`
- `PublicKey`
- `Mnemonic`
- `KeyList`
- result helpers and result types
- network and timestamp types from the shared layer

```ts
import { Mnemonic, PublicKey, hieco } from "@hieco/sdk";

const client = hieco.forTestnet();
const publicKey = PublicKey.fromString("302a300506032b6570032100...");
const mnemonic = await Mnemonic.fromString("word1 word2 word3 ...");
const privateKey = await mnemonic.toStandardEd25519PrivateKey();
```

## Notes

- `hieco.fromEnv()` is the most convenient server-side entry point.
- Signer-scoped usage is a first-class path, not a workaround.
- The React package re-exports this SDK surface, but `@hieco/sdk` stays the better choice for non-React code.

## Related Packages

- [`@hieco/react`](../react/README.md) for React providers and hooks over this SDK
- [`@hieco/wallet`](../wallet/README.md) and [`@hieco/wallet-react`](../wallet-react/README.md) for signer-producing wallet flows
- [`@hieco/mirror`](../mirror/README.md) for read-only Mirror Node access
