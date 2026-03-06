# @hieco/sdk

`@hieco/sdk` provides one unified API: `hieco(...)`.

`hieco` is a DX-first layer built on top of the Hiero/Hedera SDK stack (`@hiero-ledger/sdk`) so you keep network power while writing much cleaner app code.

## Install

```bash
bun add @hieco/sdk
```

## Quick start

```ts
import { hieco } from "@hieco/sdk";

const client = hieco.fromEnv();
```

Or explicit config:

```ts
import { hieco } from "@hieco/sdk";

const client = hieco({
  network: "testnet",
  operator: "0.0.1234",
  key: "302e020100300506032b657004220420...",
});
```

## Core pattern

- Transactions use fluent builders and end with `.now()`
- Queries return a query handle and end with `.now()`
- Descriptor extraction uses `.tx()`
- Scheduling uses `.queue()`

Optional shortcut:

- `client.do.*` runs the same operation directly without calling `.now()`

```ts
const result = await client.account.send().to("0.0.2002").hbar(1).memo("invoice-42").now();
```

```ts
const result = await client.do.account.send({ to: "0.0.2002", hbar: 1 });
```

## 4 workflows in 3 lines

Create account:

```ts
const result = await client.account.create({ publicKey: "302a3005..." }).now();
```

Transfer token:

```ts
const result = await client.token.transfer({ tokenId: "0.0.5005", from: "0.0.1001", to: "0.0.2002", amount: 10 }).now();
```

Deploy contract:

```ts
const result = await client.contract.deployArtifact({ bytecode, gas: 2_000_000 }).now();
```

Query balance:

```ts
const result = await client.account.balance("0.0.1234").now();
```

## Runtime setup

### Node/server

- `hieco.fromEnv()` reads environment variables
- Best for operator key + backend service flows

Environment variables:

- `HIERO_NETWORK`
- `HIERO_OPERATOR_ID` (or `HIERO_ACCOUNT_ID`)
- `HIERO_PRIVATE_KEY`
- `HIERO_MIRROR_URL`

### Browser

- Do not embed private keys
- Scope signer context with `client.as(signer)`

```ts
import { hieco } from "@hieco/sdk";
import type { Signer } from "@hieco/sdk";

export async function transferFromWallet(signer: Signer, to: string) {
  return hieco({ network: "testnet" }).as(signer).account.send().to(to).hbar(1).now();
}
```

## Main API surface

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

### Client methods

- `client.as(signer)` — scope to a wallet signer
- `client.with({ signer?, operator?, key? })` — reconfigure client
- `client.setOperator(operator, key)` — set operator after creation
- `client.setMaxAttempts(n)` — max retry attempts
- `client.setMaxNodeAttempts(n)` — max node retries
- `client.setRequestTimeout(ms)` — request timeout
- `client.setGrpcDeadline(ms)` — gRPC deadline
- `client.setMinBackoff(ms)` — min backoff between retries
- `client.setMaxBackoff(ms)` — max backoff between retries
- `client.destroy()` — clean up client resources

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
- `client.net.setNetwork(network)`
- `client.net.setMirrorNetwork(mirror)`
- `client.reads.*.*(...).now()`
- `client.evm.sendRaw(params?).now()`
- `client.do.evm.sendRaw(params?)`
- `client.legacy.liveHash.add(params?).now()`
- `client.legacy.liveHash.delete(params?).now()`
- `client.legacy.liveHash.get(params).now()`
- `client.do.legacy.liveHash.add(params?)`
- `client.do.legacy.liveHash.delete(params?)`
- `client.do.legacy.liveHash.get(params)`

## Descriptors and scheduling

```ts
const descriptor = client.account.send().from("0.0.1001").to("0.0.2002").hbar(1).tx();
if (!descriptor.ok) throw new Error(descriptor.error.message);

const submitted = await client.tx.submit(descriptor.value).now();
```

```ts
const queued = await client.account.send().to("0.0.2002").hbar(1).queue({ memo: "2-party" });
```

## Error handling

All operations return `Result<T>`.

```ts
import { hieco, unwrap } from "@hieco/sdk";

const result = await hieco.fromEnv().account.send().to("0.0.2002").hbar(1).now();
if (!result.ok) {
  console.error(result.error.code, result.error.message, result.error.hint);
}

const receipt = unwrap(result);
console.log(receipt.transactionId);
```

Helpers:

- `classifyError(error)`
- `formatError(error)`
- `unwrap(result)`

## Best practices

- Reuse one client instance per process; call `client.destroy()` at shutdown
- Keep private keys in secure env/wallet providers
- Use `.tx()` when intent and submission are split across layers
- Use schedules for multi-party approval flows
- Use `client.reads` for mirror-heavy read paths
