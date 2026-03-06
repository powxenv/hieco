# @hieco/sdk

`@hieco/sdk` gives you one client, `hiero()`, for working with Hedera/Hiero.

This guide keeps the happy path simple: start with fluent calls, then use the API reference when you need exact method-by-method mappings.

## Contents

- [@hieco/sdk](#hiecosdk)
  - [Contents](#contents)
  - [Install](#install)
  - [Set up your client](#set-up-your-client)
  - [Runtime notes: Node vs Browser](#runtime-notes-node-vs-browser)
    - [Node/server](#nodeserver)
    - [Browser](#browser)
  - [Fluent in practice](#fluent-in-practice)
  - [Use cases](#use-cases)
    - [1) Shared client file used across your app](#1-shared-client-file-used-across-your-app)
    - [2) Let a connected wallet signer submit transfers](#2-let-a-connected-wallet-signer-submit-transfers)
    - [3) Multi-party approval with schedules](#3-multi-party-approval-with-schedules)
    - [4) Build in one layer, submit in another](#4-build-in-one-layer-submit-in-another)
  - [API reference](#api-reference)
    - [Accounts](#accounts)
    - [Tokens](#tokens)
    - [Topics](#topics)
    - [Contracts](#contracts)
    - [Files](#files)
    - [Schedules](#schedules)
    - [Transactions, network, reads](#transactions-network-reads)
    - [Node/system/util/batch](#nodesystemutilbatch)
  - [Descriptors](#descriptors)
  - [Error handling](#error-handling)
  - [Troubleshooting](#troubleshooting)
  - [Best practices](#best-practices)

## Install

```bash
bun add @hieco/sdk
```

```bash
npm install @hieco/sdk
```

## Set up your client

Pass config directly:

```ts
import { hiero } from "@hieco/sdk";

const client = hiero({
  network: "testnet",
  operator: "0.0.1234",
  key: "302e020100300506032b657004220420...",
  mirrorUrl: "https://testnet.mirrornode.hedera.com",
  maxFee: 2,
});
```

Or use environment variables:

- `HIERO_NETWORK`
- `HIERO_OPERATOR_ID` (or `HIERO_ACCOUNT_ID`)
- `HIERO_PRIVATE_KEY`
- `HIERO_MIRROR_URL`

Switch signer context when needed:

```ts
import { hiero } from "@hieco/sdk";
import type { Signer } from "@hieco/sdk";

const client = hiero();
const walletClient = client.as({} as Signer);
const scopedClient = client.with({ operator: "0.0.5555" });
```

## Runtime notes: Node vs Browser

The API is the same in both environments, but configuration behavior is different.

### Node/server

- Environment variables are read automatically.
- Using `operator` + `key` is the common setup.
- Best place for long-lived service keys.

```ts
import { hiero } from "@hieco/sdk";

const client = hiero();
const result = await client.account.send().to("0.0.2002").hbar(1).now();
```

### Browser

- Environment variables are not read by the SDK runtime config.
- Use a wallet signer (`client.as(signer)`) for user actions.
- Avoid embedding operator private keys in frontend bundles.

```ts
import { hiero } from "@hieco/sdk";
import type { Signer } from "@hieco/sdk";

export async function transferFromWallet(signer: Signer, to: string) {
  const client = hiero({ network: "testnet" }).as(signer);
  return client.account.send().to(to).hbar(1).now();
}
```

## Fluent in practice

The flow is simple:

- chain the action
- call `now()` to run
- call `tx()` if you need a descriptor
- call `queue()` to schedule it

Example:

```ts
const payment = await client.account
  .send()
  .from("0.0.1001")
  .to("0.0.2002")
  .hbar(1)
  .memo("invoice-42")
  .now();
```

Helpers used most often:

- `memo`, `fee`
- `from`, `to`, `hbar`, `amount`
- `token`, `account`, `topic`, `contract`, `file`
- `fn`, `args`, `gas`, `typed`
- `with`, `set`, `push`, `reset`

Schedule from the same chain:

```ts
const scheduled = await client.account.send().to("0.0.2002").hbar(1).queue({ memo: "multisig" });
```

## Use cases

### 1) Shared client file used across your app

Create one client in a single module:

```ts
// src/lib/hedera.ts
import { hiero } from "@hieco/sdk";

export const hedera = hiero({
  network: "testnet",
  operator: process.env.HIERO_OPERATOR_ID,
  key: process.env.HIERO_PRIVATE_KEY,
});
```

Use it anywhere:

```ts
// src/features/payouts/send-payout.ts
import { hedera } from "../../lib/hedera";

export async function sendPayout(to: string, amount: number) {
  return hedera.account.send().to(to).hbar(amount).memo("weekly-payout").now();
}
```

### 2) Let a connected wallet signer submit transfers

Use one app-level client, then scope it to the user's signer:

```ts
import { hiero } from "@hieco/sdk";
import type { Signer } from "@hieco/sdk";

const appClient = hiero({ network: "testnet" });

export async function transferWithWallet(signer: Signer, from: string, to: string, amount: number) {
  const userClient = appClient.as(signer);
  return userClient.account.send().from(from).to(to).hbar(amount).now();
}
```

### 3) Multi-party approval with schedules

Create once, collect signatures from different users, then wait for execution:

```ts
import { hiero } from "@hieco/sdk";
import type { Signer } from "@hieco/sdk";

const client = hiero({ network: "testnet", operator: "0.0.1234", key: "..." });

export async function runTwoPartyTransfer(recipient: string, signerA: Signer, signerB: Signer) {
  const queued = await client.account.send().to(recipient).hbar(10).queue({ memo: "2-party" });
  if (!queued.ok) return queued;

  const scheduleId = queued.value.scheduleId;

  const first = await client.schedule.sign(scheduleId, { signer: signerA }).now();
  if (!first.ok) return first;

  const second = await client.schedule.sign(scheduleId, { signer: signerB }).now();
  if (!second.ok) return second;

  return client.schedule.waitForExecution(scheduleId, { timeoutMs: 120_000 }).now();
}
```

### 4) Build in one layer, submit in another

Useful when a service builds intent and a different service controls submission:

```ts
import { hiero } from "@hieco/sdk";

const client = hiero({ network: "testnet" });

export function buildRewardTx(from: string, to: string, amount: number) {
  return client.account.send().from(from).to(to).hbar(amount).tx();
}

export async function submitRewardTx(descriptor: ReturnType<typeof buildRewardTx>) {
  if (!descriptor.ok) return descriptor;
  return client.tx.submit(descriptor.value);
}
```

## API reference

The table below is where we compare method names directly.

### Accounts

| Fluent                                              | Classic                                       |
| --------------------------------------------------- | --------------------------------------------- |
| `client.account.send(params?).now()`                | `client.accounts.transfer(params)`            |
| `client.account.create(params?).now()`              | `client.accounts.create(params)`              |
| `client.account.update(params?).now()`              | `client.accounts.update(params)`              |
| `client.account.delete(params?).now()`              | `client.accounts.delete(params)`              |
| `client.account.allow(params?).now()`               | `client.accounts.allowances(params)`          |
| `client.account.revokeNftAllowances(params?).now()` | `client.accounts.allowancesDeleteNft(params)` |
| `client.account.allowanceSnapshot(accountId).now()` | `client.accounts.allowancesList(accountId)`   |
| `client.account.ensureAllowances(params).now()`     | `client.accounts.allowancesEnsure(params)`    |
| `client.account.balance(accountId?).now()`          | `client.accounts.balance(accountId?)`         |
| `client.account.info(accountId).now()`              | `client.accounts.info(accountId)`             |
| `client.account.records(accountId?).now()`          | `client.accounts.records(accountId?)`         |

### Tokens

| Fluent                                              | Classic                                                |
| --------------------------------------------------- | ------------------------------------------------------ |
| `client.token.create(params?).now()`                | `client.tokens.create(params)`                         |
| `client.token.mint(params?).now()`                  | `client.tokens.mint(params)`                           |
| `client.token.burn(params?).now()`                  | `client.tokens.burn(params)`                           |
| `client.token.send(params?).now()`                  | `client.tokens.transfer(params)`                       |
| `client.token.sendNft(params?).now()`               | `client.tokens.transferNft(params)`                    |
| `client.token.associate(params?).now()`             | `client.tokens.associate(params)`                      |
| `client.token.dissociate(params?).now()`            | `client.tokens.dissociate(params)`                     |
| `client.token.freeze(params?).now()`                | `client.tokens.freeze(params)`                         |
| `client.token.unfreeze(params?).now()`              | `client.tokens.unfreeze(params)`                       |
| `client.token.grantKyc(params?).now()`              | `client.tokens.grantKyc(params)`                       |
| `client.token.revokeKyc(params?).now()`             | `client.tokens.revokeKyc(params)`                      |
| `client.token.pause(params?).now()`                 | `client.tokens.pause(params)`                          |
| `client.token.unpause(params?).now()`               | `client.tokens.unpause(params)`                        |
| `client.token.wipe(params?).now()`                  | `client.tokens.wipe(params)`                           |
| `client.token.delete(params?).now()`                | `client.tokens.delete(params)`                         |
| `client.token.update(params?).now()`                | `client.tokens.update(params)`                         |
| `client.token.fees(params?).now()`                  | `client.tokens.fees(params)`                           |
| `client.token.airdrop(params?).now()`               | `client.submit({ kind: "tokens.airdrop", ... })`       |
| `client.token.claimAirdrop(params?).now()`          | `client.submit({ kind: "tokens.claimAirdrop", ... })`  |
| `client.token.cancelAirdrop(params?).now()`         | `client.submit({ kind: "tokens.cancelAirdrop", ... })` |
| `client.token.reject(params?).now()`                | `client.submit({ kind: "tokens.reject", ... })`        |
| `client.token.updateNfts(params?).now()`            | `client.submit({ kind: "tokens.updateNfts", ... })`    |
| `client.token.info(tokenId).now()`                  | `client.tokens.info(tokenId)`                          |
| `client.token.nft(nft).now()`                       | `client.tokens.nftInfo(nft)`                           |
| `client.token.allowances(accountId, params?).now()` | `client.tokens.allowancesList(accountId, params?)`     |

### Topics

| Fluent                                          | Classic                                 |
| ----------------------------------------------- | --------------------------------------- |
| `client.topic.create(params?).now()`            | `client.hcs.create(params)`             |
| `client.topic.update(params?).now()`            | `client.hcs.update(params)`             |
| `client.topic.delete(params?).now()`            | `client.hcs.delete(params)`             |
| `client.topic.send(params?).now()`              | `client.hcs.submit(params)`             |
| `client.topic.sendJson(params?).now()`          | `client.hcs.submitJson(params)`         |
| `client.topic.sendMany(params?).now()`          | `client.hcs.batchSubmit(params)`        |
| `client.topic.watch(...)`                       | `client.hcs.watch(...)`                 |
| `client.topic.watchFrom(...)`                   | `client.hcs.watchFrom(...)`             |
| `client.topic.info(topicId).now()`              | `client.hcs.info(topicId)`              |
| `client.topic.messages(topicId, params?).now()` | `client.hcs.messages(topicId, params?)` |

### Contracts

| Fluent                                            | Classic                                      |
| ------------------------------------------------- | -------------------------------------------- |
| `client.contract.deploy(params?).now()`           | `client.contracts.deploy(params)`            |
| `client.contract.run(params?).now()`              | `client.contracts.execute(params)`           |
| `client.contract.runTyped(params?).now()`         | `client.contracts.executeTyped(params)`      |
| `client.contract.call(params).now()`              | `client.contracts.call(params)`              |
| `client.contract.callTyped(params).now()`         | `client.contracts.callTyped(params)`         |
| `client.contract.preflight(params).now()`         | `client.contracts.preflight(params)`         |
| `client.contract.withAbi(abi)`                    | `client.contracts.withAbi(abi)`              |
| `client.contract.delete(params?).now()`           | `client.contracts.delete(params)`            |
| `client.contract.update(params?).now()`           | `client.contracts.update(params)`            |
| `client.contract.info(contractId).now()`          | `client.contracts.info(contractId)`          |
| `client.contract.logs(contractId, params?).now()` | `client.contracts.logs(contractId, params?)` |
| `client.contract.bytecode(contractId).now()`      | `client.contracts.bytecode(contractId)`      |
| `client.contract.simulate(params).now()`          | `client.contracts.simulate(params)`          |
| `client.contract.estimate(params).now()`          | `client.contracts.estimateGas(params)`       |

### Files

| Fluent                                   | Classic                             |
| ---------------------------------------- | ----------------------------------- |
| `client.file.create(params?).now()`      | `client.files.create(params)`       |
| `client.file.append(params?).now()`      | `client.files.append(params)`       |
| `client.file.update(params?).now()`      | `client.files.update(params)`       |
| `client.file.delete(params?).now()`      | `client.files.delete(params)`       |
| `client.file.upload(params?).now()`      | `client.files.upload(params)`       |
| `client.file.updateLarge(params?).now()` | `client.files.updateLarge(params)`  |
| `client.file.info(fileId).now()`         | `client.files.info(fileId)`         |
| `client.file.contents(fileId).now()`     | `client.files.contents(fileId)`     |
| `client.file.text(fileId).now()`         | `client.files.contentsText(fileId)` |
| `client.file.json(fileId).now()`         | `client.files.contentsJson(fileId)` |

### Schedules

| Fluent                                                         | Classic                                                   |
| -------------------------------------------------------------- | --------------------------------------------------------- |
| `client.schedule.create(params?).now()`                        | `client.schedules.create(params)`                         |
| `client.schedule.sign(scheduleId, params?).now()`              | `client.schedules.sign(scheduleId, params?)`              |
| `client.schedule.delete(scheduleId, params?).now()`            | `client.schedules.delete(scheduleId, params?)`            |
| `client.schedule.info(scheduleId).now()`                       | `client.schedules.info(scheduleId)`                       |
| `client.schedule.wait(scheduleId, options?).now()`             | `client.schedules.wait(scheduleId, options?)`             |
| `client.schedule.createIdempotent(params?).now()`              | `client.schedules.createIdempotent(params)`               |
| `client.schedule.collect(params?).now()`                       | `client.schedules.collectSignatures(params)`              |
| `client.schedule.waitForExecution(scheduleId, options?).now()` | `client.schedules.waitForExecution(scheduleId, options?)` |

### Transactions, network, reads

| Fluent                                       | Classic                                                |
| -------------------------------------------- | ------------------------------------------------------ |
| `client.tx.submit(descriptor)`               | `client.submit(descriptor)`                            |
| `client.tx.record(transactionId)`            | `client.transactions.record(transactionId)`            |
| `client.tx.receipt(transactionId, options?)` | `client.transactions.receipt(transactionId, options?)` |
| `client.net.version().now()`                 | `client.network.version()`                             |
| `client.net.addressBook(options?).now()`     | `client.network.addressBook(options?)`                 |
| `client.reads.*`                             | `client.reads.*`                                       |

### Node/system/util/batch

These are fluent helper methods:

- `client.node.create(params?).now()`
- `client.node.update(params?).now()`
- `client.node.delete(params?).now()`
- `client.system.freeze(params?).now()`
- `client.util.random(params?).now()`
- `client.batch.atomic(params?).now()`

## Descriptors

Use descriptors when you want to build intent first and submit later.

```ts
import { hiero } from "@hieco/sdk";

const client = hiero();

const descriptor = client.accounts.transfer.tx({
  from: "0.0.1001",
  to: "0.0.2002",
  hbar: 1,
});

const result = await client.tx.submit(descriptor);
```

From fluent chain to descriptor:

```ts
const descriptor = client.account.send().from("0.0.1001").to("0.0.2002").hbar(1).tx();
if (!descriptor.ok) throw new Error(descriptor.error.message);
await client.tx.submit(descriptor.value);
```

## Error handling

Every call returns `Result<T>`.

```ts
import { hiero, unwrap } from "@hieco/sdk";

const client = hiero();
const result = await client.account.send().to("0.0.2002").hbar(1).now();

if (!result.ok) {
  console.error(result.error.code, result.error.message, result.error.hint);
}

const receipt = unwrap(result);
console.log(receipt.transactionId);
```

## Troubleshooting

| Code                      | Meaning                           | Typical fix                                       |
| ------------------------- | --------------------------------- | ------------------------------------------------- |
| `CONFIG_INVALID_NETWORK`  | invalid network value             | use `mainnet`, `testnet`, or `previewnet`         |
| `CONFIG_INVALID_OPERATOR` | account id format is invalid      | use `shard.realm.num`, for example `0.0.1234`     |
| `SIGNER_REQUIRED`         | signer or operator key is missing | pass `key` or bind a signer with `client.as(...)` |
| `TX_PRECHECK_FAILED`      | transaction failed precheck       | verify balances, keys, fees, and params           |
| `TX_RECEIPT_FAILED`       | receipt status is failure         | inspect status and transaction id details         |
| `MIRROR_QUERY_FAILED`     | mirror request failed             | check mirror URL, network, and mirror health      |

## Best practices

- Reuse one client per process and call `client.destroy()` when shutting down.
- Keep private keys in env vars or wallet providers, not in source files.
- Use `tx()` descriptors when you want reusable transaction objects.
- Use schedules for multi-party signing flows.
- Use `client.reads` for mirror-heavy read paths.
- In tests, assert on `error.code` rather than exact error strings.
