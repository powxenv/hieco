# @hieco/sdk

`@hieco/sdk` is the core Hieco SDK.

It gives you one client factory, `hieco(...)`, for:

- server-side transaction flows
- browser wallet flows
- scripts, jobs, and CLIs
- framework loaders, actions, and server functions

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

## Choose A Starting Point

Start with one of these patterns:

| Goal                                      | Start with                           |
| ----------------------------------------- | ------------------------------------ |
| Server runtime with env-based credentials | `hieco.fromEnv()`                    |
| Browser wallet flow                       | `hieco({ network }).as(signer)`      |
| Explicit runtime config                   | `hieco({ network, mirrorUrl, ... })` |
| Testnet-only setup                        | `hieco.forTestnet()`                 |

## Package Layout

`@hieco/sdk` is organized by domain:

- `client/` contains runtime config and the core client
- `accounts/`, `contracts/`, `files/`, `network/`, `reads/`, `schedules/`, `tokens/`, `topics/`, and `transactions/` contain the public Hedera operations
- `telepathic/` contains the fluent builder client
- `errors/`, `results/`, and `shared/` contain the small cross-domain primitives shared by those domains

## Quick Start

### Server

```ts
import { hieco } from "@hieco/sdk";

const client = hieco.fromEnv();
```

### Browser Wallet

```ts
import { hieco, type Signer } from "@hieco/sdk";

export function createWalletClient(signer: Signer) {
  return hieco({ network: "testnet" }).as(signer);
}
```

## The Client Factory

`hieco(...)` creates a client from explicit config.

```ts
import { hieco } from "@hieco/sdk";

const client = hieco({
  network: "testnet",
  mirrorUrl: "https://testnet.mirrornode.hedera.com",
});
```

Factory helpers:

- `hieco(config?)`
- `hieco.fromEnv()`
- `hieco.forTestnet()`
- `hieco.forMainnet()`
- `hieco.forPreviewnet()`
- `hieco.withSigner(signer, config?)`

## Server Runtime

`hieco.fromEnv()` is the server runtime helper.

It reads:

- `HIERO_NETWORK`
- `HIERO_OPERATOR_ID` or `HIERO_ACCOUNT_ID`
- `HIERO_PRIVATE_KEY`
- `HIERO_MIRROR_URL`

Example:

```ts
import { hieco } from "@hieco/sdk";

const client = hieco.fromEnv();

const result = await client.account
  .send({
    to: "0.0.2002",
    hbar: 1,
  })
  .now();
```

This is a good fit for:

- API routes
- server actions
- route loaders
- route actions
- workers
- scripts
- CLIs

## Browser Wallet Runtime

For browser apps, start with public config and then scope the client to a wallet signer.

```ts
import { hieco, type Signer } from "@hieco/sdk";

export async function transferFromWallet(signer: Signer, to: string) {
  return hieco({ network: "testnet" }).as(signer).account.send({ to, hbar: 1 }).now();
}
```

This is a good fit for:

- browser wallets
- dapp UIs
- wallet-authorized user actions
- React, Preact, or Solid apps that own a signer

## Framework Recipes

### Next.js

Use the SDK in:

- server-only modules
- Route Handlers
- Server Actions
- Server Components

Example:

```ts
import "server-only";
import { hieco } from "@hieco/sdk";

export const serverHieco = hieco.fromEnv();
```

### TanStack Start

Use the SDK in:

- `createServerFn()`
- `createServerOnlyFn()`
- other server-only modules

Example:

```ts
import { createServerFn } from "@tanstack/react-start";
import { hieco } from "@hieco/sdk";

export const sendHbar = createServerFn({ method: "POST" }).handler(async () => {
  return hieco.fromEnv().account.send({ to: "0.0.2002", hbar: 1 }).now();
});
```

### React Router Framework Mode

Use the SDK in:

- `loader`
- `action`
- server entry modules

Example:

```tsx
import type { Route } from "./+types/account";
import { hieco } from "@hieco/sdk";

export async function loader({ params }: Route.LoaderArgs) {
  return hieco.fromEnv().account.info(params.accountId).now();
}
```

## Core Usage Pattern

Most operations return a handle that ends with `.now()`.

```ts
const result = await client.account.send({ to: "0.0.2002", hbar: 1 }).now();
```

The same operation is often available through `client.do.*` as a direct execution shortcut:

```ts
const result = await client.do.account.send({ to: "0.0.2002", hbar: 1 });
```

Many transaction-capable operations also support:

- `.tx()` to build a transaction descriptor
- `.queue()` to create a scheduled transaction flow

## Common Workflows

Create account:

```ts
const result = await client.account.create({ publicKey: "302a3005..." }).now();
```

Transfer token:

```ts
const result = await client.token
  .transfer({ tokenId: "0.0.5005", from: "0.0.1001", to: "0.0.2002", amount: 10 })
  .now();
```

Deploy contract:

```ts
const result = await client.contract.deployArtifact({ bytecode, gas: 2_000_000 }).now();
```

Query balance:

```ts
const result = await client.account.balance("0.0.1234").now();
```

## Client Methods

Instance methods:

- `client.as(signer)`
- `client.with({ signer?, operator?, key? })`
- `client.setOperator(operator, key)`
- `client.setMaxAttempts(n)`
- `client.setMaxNodeAttempts(n)`
- `client.setRequestTimeout(ms)`
- `client.setGrpcDeadline(ms)`
- `client.setMinBackoff(ms)`
- `client.setMaxBackoff(ms)`
- `client.destroy()`

## SDK Utilities

The SDK root also exports a small set of utility types and helpers that are useful in app code:

- `EntityId`
- `NetworkType`
- `NETWORK_CONFIGS`
- `isValidEntityId()`
- `parseEntityId()`
- `assertEntityId()`
- `formatEntityId()`
- `parseEntityIdParts()`
- `isDefaultNetwork()`

Example:

```ts
import { formatEntityId, isValidEntityId, type EntityId } from "@hieco/sdk";

const treasury: EntityId = formatEntityId(0, 0, 1001);

export function requireEntityId(value: string): EntityId {
  if (!isValidEntityId(value)) {
    throw new Error("Expected a Hedera entity id");
  }

  return value;
}
```

## Main API Surface

### Accounts

- `client.account.send(params?).now()`
- `client.account.transfer(params?).now()`
- `client.account.create(params?).now()`
- `client.account.update(params?).now()`
- `client.account.delete(params?).now()`
- `client.account.allow(params?).now()`
- `client.account.allowances(params?).now()`
- `client.account.adjustAllowances(params?).now()`
- `client.account.revokeNftAllowances(params?).now()`
- `client.account.allowancesDeleteNft(params?).now()`
- `client.account.allowanceSnapshot(accountId).now()`
- `client.account.ensureAllowances(params).now()`
- `client.account.balance(accountId?).now()`
- `client.account.info(accountId).now()`
- `client.account.infoFlow(accountId, options?).now()`
- `client.account.records(accountId?).now()`

### Tokens

- `client.token.create(params?).now()`
- `client.token.mint(params?).now()`
- `client.token.burn(params?).now()`
- `client.token.send(params?).now()`
- `client.token.transfer(params?).now()`
- `client.token.sendNft(params?).now()`
- `client.token.transferNft(params?).now()`
- `client.token.associate(params?).now()`
- `client.token.dissociate(params?).now()`
- `client.token.freeze(params?).now()`
- `client.token.unfreeze(params?).now()`
- `client.token.grantKyc(params?).now()`
- `client.token.revokeKyc(params?).now()`
- `client.token.pause(params?).now()`
- `client.token.unpause(params?).now()`
- `client.token.wipe(params?).now()`
- `client.token.delete(params?).now()`
- `client.token.update(params?).now()`
- `client.token.fees(params?).now()`
- `client.token.airdrop(params?).now()`
- `client.token.claimAirdrop(params?).now()`
- `client.token.cancelAirdrop(params?).now()`
- `client.token.reject(params?).now()`
- `client.token.rejectFlow(params?).now()`
- `client.token.updateNfts(params?).now()`
- `client.token.info(tokenId).now()`
- `client.token.nft(nft).now()`
- `client.token.allowances(accountId, params?).now()`

### Contracts

- `client.contract.deploy(params?).now()`
- `client.contract.deployArtifact(params?).now()`
- `client.contract.run(params?).now()`
- `client.contract.execute(params?).now()`
- `client.contract.runTyped(params?).now()`
- `client.contract.executeTyped(params?).now()`
- `client.contract.call(params).now()`
- `client.contract.callTyped(params).now()`
- `client.contract.preflight(params).now()`
- `client.contract.withAbi(abi)`
- `client.contract.delete(params?).now()`
- `client.contract.update(params?).now()`
- `client.contract.info(contractId).now()`
- `client.contract.logs(contractId, params?).now()`
- `client.contract.bytecode(contractId).now()`
- `client.contract.simulate(params).now()`
- `client.contract.estimate(params).now()`
- `client.contract.estimateGas(params).now()`

### Topics

- `client.topic.create(params?).now()`
- `client.topic.update(params?).now()`
- `client.topic.delete(params?).now()`
- `client.topic.send(params?).now()`
- `client.topic.submit(params?).now()`
- `client.topic.sendJson(params?).now()`
- `client.topic.submitJson(params?).now()`
- `client.topic.sendMany(params?).now()`
- `client.topic.batchSubmit(params?).now()`
- `client.topic.watch(topicId, handler, options?)`
- `client.topic.watchFrom(topicId, handler, options?)`
- `client.topic.info(topicId).now()`
- `client.topic.messages(topicId, params?).now()`

### Files

- `client.file.create(params?).now()`
- `client.file.append(params?).now()`
- `client.file.update(params?).now()`
- `client.file.delete(params?).now()`
- `client.file.upload(params?).now()`
- `client.file.updateLarge(params?).now()`
- `client.file.info(fileId).now()`
- `client.file.contents(fileId).now()`
- `client.file.text(fileId).now()`
- `client.file.contentsText(fileId).now()`
- `client.file.json(fileId).now()`
- `client.file.contentsJson(fileId).now()`

### Schedules

- `client.schedule.create(params?).now()`
- `client.schedule.sign(scheduleId, params?).now()`
- `client.schedule.delete(scheduleId, params?).now()`
- `client.schedule.info(scheduleId).now()`
- `client.schedule.wait(scheduleId, options?).now()`
- `client.schedule.createIdempotent(params?).now()`
- `client.schedule.collect(params?).now()`
- `client.schedule.collectSignatures(params?).now()`
- `client.schedule.waitForExecution(scheduleId, options?).now()`

### Node, system, utility, batch

- `client.node.create(params?).now()`
- `client.node.update(params?).now()`
- `client.node.delete(params?).now()`
- `client.system.freeze(params?).now()`
- `client.system.deleteEntity(params?).now()`
- `client.system.undeleteEntity(params?).now()`
- `client.util.random(params?).now()`
- `client.batch.atomic(params?).now()`

### Network, tx, reads, evm, legacy

- `client.tx.submit(descriptor).now()`
- `client.tx.record(transactionId).now()`
- `client.tx.receipt(transactionId, options?).now()`
- `client.do.tx.submit(descriptor)`
- `client.do.tx.record(transactionId)`
- `client.do.tx.receipt(transactionId, options?)`
- `client.net.version().now()`
- `client.net.addressBook(options?).now()`
- `client.net.ping(nodeAccountId).now()`
- `client.net.pingAll().now()`
- `client.net.update().now()`
- `client.reads.*`
- `client.evm.sendRaw(params)`
- `client.legacy.liveHash.*`

## Related Packages

- `@hieco/react` for React UI and hooks
