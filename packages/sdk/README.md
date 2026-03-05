# @hieco/sdk

Ergonomic, type-safe SDK for Hedera transactions and queries.

## Features

- **Single entrypoint** - `hiero()` factory returns a fully configured client
- **Domain-first API** - `client.accounts`, `client.tokens`, `client.hcs`, `client.contracts`, `client.files`, `client.schedules`
- **Telepathic defaults** - infers sender from operator or signer
- **Contract call defaults** - `contracts.call` uses a safe gas default (override as needed)
- **Typed tx builders** - `client.accounts.transfer.tx()` returns a schedule-ready descriptor
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
```

### Typed tx builders

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

## Related Packages

- [`@hieco/types`](https://www.npmjs.com/package/@hieco/types) - Shared types
- [`@hieco/mirror`](https://www.npmjs.com/package/@hieco/mirror) - Mirror node REST API client
- [`@hieco/mirror-shared`](https://github.com/powxenv/hieco/tree/main/packages/mirror-shared) - Shared utilities
- [`@hiero-ledger/sdk`](https://www.npmjs.com/package/@hiero-ledger/sdk) - Official Hedera SDK

## Browser Support

Node.js >= 18.0.0. For browser usage, use a bundler like Vite or webpack.

## License

MIT
