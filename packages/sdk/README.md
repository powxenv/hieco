# @hieco/sdk

Ergonomic, type-safe SDK for Hedera transactions and queries.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [SDK Surface](#sdk-surface)
- [Core Concepts](#core-concepts)
- [Transactions](#transactions)
- [Queries and Read Models](#queries-and-read-models)
- [Use Cases](#use-cases)
- [Configuration](#configuration)
- [Type Inference](#type-inference)
- [Related Packages](#related-packages)
- [Browser Support](#browser-support)
- [License](#license)

## Features

- **Single entrypoint** - `hiero()` factory returns a fully configured client
- **Domain-first API** - `client.accounts`, `client.tokens`, `client.hcs`, `client.contracts`, `client.files`, `client.schedules`, `client.transactions`
- **Telepathic defaults** - infers sender from operator or signer
- **Contract call defaults** - `contracts.call` uses a safe gas default (override as needed)
- **Schedule-ready descriptors** - `client.accounts.transfer.tx()` returns a descriptor for schedules
- **Actionable errors** - structured error objects with `code`, `hint`, and `transactionId`
- **Mirror node built-in** - `client.mirror.*` backed by `@hieco/mirror`

## Installation

```bash
bun add @hieco/sdk @hiero-ledger/sdk
```

## Quick Start

### Step 1: Set Environment Variables

Create a `.env` file:

```env
HIERO_OPERATOR_ID=0.0.123456
HIERO_PRIVATE_KEY=302e020100300506032b657004220420...
HIERO_NETWORK=testnet
HIERO_MIRROR_URL=https://testnet.mirrornode.hedera.com
```

### Step 2: Create Client and Execute Transactions

```typescript
import { hiero } from "@hieco/sdk";

const client = hiero();

const mirrorInfo = await client.mirror.account.getInfo("0.0.123");

if (mirrorInfo.success) {
  console.log(mirrorInfo.data.account);
}

const transfer = await client.accounts.transfer({
  to: "0.0.5678",
  hbar: 10,
});

if (transfer.ok) {
  console.log(`Transfer complete. Transaction ID: ${transfer.value.transactionId}`);
} else {
  console.error(`Transfer failed: ${transfer.error.message}`);
}
```

## Core Concepts

### Client Configuration

The client auto-detects configuration from environment variables, but you can override:

```typescript
import { hiero } from "@hieco/sdk";

const client = hiero({
  network: "mainnet",
  operator: "0.0.123",
  key: "302e0201...",
  mirrorUrl: "https://mainnet.mirrornode.hedera.com",
  maxFee: 2,
});
```

### Default (Reusable) Configuration

Create a tiny helper in your app for a shared client:

```typescript
import { hiero } from "@hieco/sdk";

export const client = hiero({
  network: "testnet",
});
```

### Wallet / Per-User Signer

When each user connects their own wallet, pass a Hedera JS SDK `Signer` and execute transactions with that signer:

```typescript
import { hiero } from "@hieco/sdk";
import type { Signer } from "@hiero-ledger/sdk";

export async function sendTip(userSigner: Signer, to: string, amount: number) {
  const client = hiero().as(userSigner);

  return client.accounts.transfer({
    to,
    hbar: amount,
  });
}
```

### Multi-Party Signing (Scheduled Transactions)

When a transaction needs multiple signatures (multi-sig / threshold keys / multiple wallets), use a Scheduled Transaction.
The network will collect signatures and execute once the required signatures are present.

```typescript
import { hiero } from "@hieco/sdk";
import type { Signer } from "@hiero-ledger/sdk";

export async function multiPartyTransfer(
  payer: Signer,
  signerA: Signer,
  signerB: Signer,
): Promise<string> {
  const client = hiero().as(payer);

  const schedule = await client.schedules.create({
    tx: client.accounts.transfer.tx({ to: "0.0.2002", hbar: 5 }),
  });
  if (!schedule.ok) throw new Error(schedule.error.message);

  const sigA = await client.schedules.sign(schedule.value.scheduleId, { signer: signerA });
  if (!sigA.ok) throw new Error(sigA.error.message);

  const sigB = await client.schedules.sign(schedule.value.scheduleId, { signer: signerB });
  if (!sigB.ok) throw new Error(sigB.error.message);

  const executed = await client.schedules.wait(schedule.value.scheduleId);
  if (!executed.ok) throw new Error(executed.error.message);

  const executedAt = executed.value.schedule.executed_timestamp;
  if (!executedAt) throw new Error("Schedule executed but no executed_timestamp was returned");
  return executedAt;
}
```

## SDK Surface

### Client

- `hiero(config?)` — creates a configured client
- `client.as(signer)` — returns a client bound to a signer
- `client.with({ signer, operator, key })` — returns a client with overrides
- `client.submit(descriptor)` — submit a transaction descriptor
- `client.destroy()` — close the native client

### Accounts

- `client.accounts.transfer(params)`
- `client.accounts.transfer.tx(params)`
- `client.accounts.create(params)`
- `client.accounts.create.tx(params)`
- `client.accounts.update(params)`
- `client.accounts.update.tx(params)`
- `client.accounts.delete(params)`
- `client.accounts.delete.tx(params)`
- `client.accounts.allowances(params)`
- `client.accounts.allowances.tx(params)`
- `client.accounts.balance(accountId?)`
- `client.accounts.info(accountId)`

### Tokens

- `client.tokens.create(params)` / `.tx(params)`
- `client.tokens.mint(params)` / `.tx(params)`
- `client.tokens.burn(params)` / `.tx(params)`
- `client.tokens.transfer(params)` / `.tx(params)`
- `client.tokens.transferNft(params)` / `.tx(params)`
- `client.tokens.associate(params)` / `.tx(params)`
- `client.tokens.dissociate(params)` / `.tx(params)`
- `client.tokens.freeze(params)` / `.tx(params)`
- `client.tokens.unfreeze(params)` / `.tx(params)`
- `client.tokens.grantKyc(params)` / `.tx(params)`
- `client.tokens.revokeKyc(params)` / `.tx(params)`
- `client.tokens.pause(params)` / `.tx(params)`
- `client.tokens.unpause(params)` / `.tx(params)`
- `client.tokens.wipe(params)` / `.tx(params)`
- `client.tokens.delete(params)` / `.tx(params)`
- `client.tokens.update(params)` / `.tx(params)`
- `client.tokens.fees(params)` / `.tx(params)`
- `client.tokens.info(tokenId)`

### Consensus (HCS)

- `client.hcs.create(params)` / `.tx(params)`
- `client.hcs.update(params)` / `.tx(params)`
- `client.hcs.delete(params)` / `.tx(params)`
- `client.hcs.submit(params)` / `.tx(params)`
- `client.hcs.watch(topicId, handler, options?)`
- `client.hcs.info(topicId)`
- `client.hcs.messages(topicId, params?)`

### Contracts

- `client.contracts.deploy(params)` / `.tx(params)`
- `client.contracts.execute(params)` / `.tx(params)`
- `client.contracts.call(params)`
- `client.contracts.delete(params)` / `.tx(params)`
- `client.contracts.update(params)` / `.tx(params)`
- `client.contracts.info(contractId)`
- `client.contracts.logs(contractId, params?)`
- `client.contracts.bytecode(contractId)`
- `client.contracts.simulate({ contractId, fn, args?, senderEvmAddress?, gas?, value?, gasPrice?, blockNumber? })`
- `client.contracts.estimateGas({ contractId, fn, args?, senderEvmAddress?, gas?, value?, gasPrice?, blockNumber? })`

### Files

- `client.files.create(params)` / `.tx(params)`
- `client.files.append(params)` / `.tx(params)`
- `client.files.update(params)` / `.tx(params)`
- `client.files.delete(params)` / `.tx(params)`
- `client.files.info(fileId)`
- `client.files.contents(fileId)`

### Schedules

- `client.schedules.create(params)` / `.tx(params)`
- `client.schedules.sign(scheduleId, params?)` / `.tx(params)`
- `client.schedules.delete(scheduleId, params?)` / `.tx(params)`
- `client.schedules.info(scheduleId)`
- `client.schedules.wait(scheduleId, options?)`

### Transactions

- `client.transactions.record(transactionId)`
- `client.transactions.receipt(transactionId, options?)`

### Network

- `client.network.version()`
- `client.network.addressBook({ fileId?, limit? })`

## Transactions

### Actions (Transactions)

#### Account Actions

```typescript
const transferResult = await client.accounts.transfer({
  to: "0.0.5678",
  hbar: 10,
});

const createResult = await client.accounts.create({
  initialBalance: 1,
  publicKey: "302a300506...",
});

const deleteResult = await client.accounts.delete({
  accountId: "0.0.123",
  transferAccountId: "0.0.9999",
});
```

#### Token Actions

```typescript
const createTokenResult = await client.tokens.create({
  name: "MyToken",
  symbol: "MYT",
  decimals: 6,
  supply: 1_000_000,
});

const mintResult = await client.tokens.mint({
  tokenId: "0.0.987",
  amount: 100_000,
});

const burnResult = await client.tokens.burn({
  tokenId: "0.0.987",
  amount: 50_000,
});

const associateResult = await client.tokens.associate({
  accountId: "0.0.5678",
  tokenIds: ["0.0.987"],
});

const transferResult = await client.tokens.transfer({
  tokenId: "0.0.987",
  to: "0.0.5678",
  amount: 100,
});
```

#### Consensus Actions

```typescript
const createTopicResult = await client.hcs.create({
  memo: "My Topic",
});

const submitResult = await client.hcs.submit({
  topicId: "0.0.456",
  message: "Hello, Hedera!",
});

const updateResult = await client.hcs.update({
  topicId: "0.0.456",
  memo: "Updated Topic",
});

const deleteTopicResult = await client.hcs.delete({
  topicId: "0.0.456",
});
```

#### Contract Actions

```typescript
const deployResult = await client.contracts.deploy({
  bytecode: "0x608060...",
  gas: 100000,
  constructorParams: {
    types: ["uint256"],
    values: [42],
  },
});

const executeResult = await client.contracts.execute({
  id: "0.0.789",
  fn: "transfer",
  args: ["0.0.5678", 100],
  gas: 50000,
});

const callResult = await client.contracts.call({
  id: "0.0.789",
  fn: "balanceOf",
  args: ["0.0.5678"],
  returns: "uint256",
});

const callWithGasOverride = await client.contracts.call({
  id: "0.0.789",
  fn: "balanceOf",
  args: ["0.0.5678"],
  gas: 200000,
  returns: "uint256",
});

const simulation = await client.contracts.simulate({
  contractId: "0.0.789",
  fn: "balanceOf",
  args: ["0.0.5678"],
});

const estimate = await client.contracts.estimateGas({
  contractId: "0.0.789",
  fn: "balanceOf",
  args: ["0.0.5678"],
});
```

#### Schedule Actions

```typescript
const scheduleResult = await client.schedules.create({
  tx: client.accounts.transfer.tx({ to: "0.0.5678", hbar: 10 }),
  payerAccountId: "0.0.123",
});

const deleteScheduleResult = await client.schedules.delete("0.0.999");
```

#### File Actions

```typescript
const createFileResult = await client.files.create({
  contents: Buffer.from("file contents"),
  keys: [publicKey],
});

const appendResult = await client.files.append({
  fileId: "0.0.111",
  contents: Buffer.from("additional contents"),
});

const deleteFileResult = await client.files.delete({
  fileId: "0.0.111",
});

const fileInfo = await client.files.info("0.0.111");
const fileContents = await client.files.contents("0.0.111");
```

### Schedule-ready descriptors

```typescript
const tx = client.accounts.transfer.tx({ to: "0.0.5678", hbar: 10 });
const scheduled = await client.schedules.create({ tx });
```

### Error Handling

```typescript
import { unwrap } from "@hieco/sdk";

const receipt = unwrap(await client.accounts.transfer({ to: "0.0.5678", hbar: 10 }));
console.log(receipt.transactionId);
```

## Error Handling

All operations return `Result<T>`:

```typescript
const result = await client.accounts.transfer({ to: "0.0.5678", hbar: 10 });

if (result.ok) {
  console.log(`Success: ${result.value.transactionId}`);
} else {
  console.error(result.error.code, result.error.message);
}
```

## Configuration

### Environment Variables

- `HIERO_OPERATOR_ID` - Account ID of the operator (e.g., `0.0.123456`)
- `HIERO_PRIVATE_KEY` - Operator private key in DER-encoded hex string format (compatible with `PrivateKey.fromStringDer`)
- `HIERO_NETWORK` - Network name: `mainnet`, `testnet`, or `previewnet` (default: `testnet`)
- `HIERO_MIRROR_URL` - Mirror node base URL used for mirror REST

### Client Options

```typescript
interface ClientConfig {
  network?: "mainnet" | "testnet" | "previewnet";
  operator?: string;
  key?: string;
  signer?: Signer;
  mirrorUrl?: string;
  maxFee?: number | string | bigint;
}
```

## Type Inference

```typescript
const tx = client.accounts.transfer.tx({ to: "0.0.5678", hbar: 10 });
// ✅ tx is typed and schedule-ready

const result = await client.tokens.create({ name: "MyToken", symbol: "MYT" });
// ✅ result.value and result.error are discriminated
```

## Queries and Read Models

### Account and token info

```typescript
const account = await client.accounts.info("0.0.123");
const token = await client.tokens.info("0.0.987");
```

### Contract logs

```typescript
const logs = await client.contracts.logs("0.0.789", { limit: 25 });
```

### HCS messages

```typescript
const messages = await client.hcs.messages("0.0.456", { limit: 50 });
```

### File info and contents

```typescript
const info = await client.files.info("0.0.111");
const contents = await client.files.contents("0.0.111");
```

### Transaction records

```typescript
const record = await client.transactions.record("0.0.123@1680000000.123456789");

const receipt = await client.transactions.receipt("0.0.123@1680000000.123456789", {
  includeChildren: true,
});
```

## Use Cases

### Reward drop to many accounts

```typescript
for (const accountId of ["0.0.201", "0.0.202", "0.0.203"]) {
  await client.accounts.transfer({ to: accountId, hbar: 1 });
}
```

### Token launch with treasury and fixed supply

```typescript
const token = await client.tokens.create({
  name: "LaunchToken",
  symbol: "LCH",
  supply: 1_000_000,
  decimals: 6,
  treasury: "0.0.123",
});

const nftInfo = await client.tokens.nftInfo({ tokenId: "0.0.987", serial: 1 });
```

### Contract read + write flow

```typescript
await client.contracts.execute({
  id: "0.0.789",
  fn: "setValue",
  args: [42],
  gas: 120_000,
});

const result = await client.contracts.call({
  id: "0.0.789",
  fn: "getValue",
  returns: "uint256",
});

const gasEstimate = await client.contracts.estimateGas({
  contractId: "0.0.789",
  fn: "setValue",
  args: [42],
});
```

### HCS stream consumer

````typescript
const stop = client.hcs.watch("0.0.456", (message) => {
  console.log(message.text());
});

setTimeout(() => stop(), 30_000);

### Network version + address book

```typescript
const version = await client.network.version();
const book = await client.network.addressBook({ limit: 10 });
````

````

### Treasury sweep

```typescript
for (const accountId of ["0.0.401", "0.0.402"]) {
  await client.accounts.transfer({ to: "0.0.999", from: accountId, hbar: 0.5 });
}
````

### Token supply expansion

```typescript
await client.tokens.mint({
  tokenId: "0.0.987",
  amount: 250_000,
});
```

### File-backed config lookup

```typescript
const bytes = await client.files.contents("0.0.111");
if (bytes.ok) {
  const text = new TextDecoder().decode(bytes.value.contents);
  console.log(text);
}
```

### Contract deployment + first call

```typescript
const deploy = await client.contracts.deploy({
  bytecode: "0x608060...",
  gas: 150_000,
});

if (deploy.ok) {
  await client.contracts.execute({
    id: deploy.value.contractId,
    fn: "initialize",
    args: ["0.0.123"],
    gas: 120_000,
  });
}
```

## Related Packages

- [`@hieco/utils`](https://github.com/powxenv/hieco/tree/main/packages/utils) - Shared utilities and types
- [`@hieco/mirror`](https://www.npmjs.com/package/@hieco/mirror) - Mirror node REST API client
- [`@hiero-ledger/sdk`](https://www.npmjs.com/package/@hiero-ledger/sdk) - Official Hedera SDK

## Browser Support

Node.js >= 18.0.0. For browser usage, use a bundler like Vite or webpack.

## License

MIT
