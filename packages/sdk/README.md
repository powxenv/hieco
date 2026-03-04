# @hieco/sdk

Ergonomic, type-safe SDK for Hiero blockchain transactions and queries.

## Features

- **Zero-Boilerplate Transactions** - Simple, fluent API for HBAR transfers, token operations, smart contracts, and more
- **Unified Client** - One client for consensus node transactions and mirror-node gRPC subscriptions
- **Automatic Retry & Resilience** - Built-in retry logic for transient network errors (`BUSY`, `PLATFORM_TRANSACTION_NOT_CREATED`)
- **Type-Safe Builders** - Fluent chainable builders with full TypeScript support and autocomplete
- **Event System** - Transaction lifecycle events (before, signed, submitted, confirmed, error) for visibility
- **Smart Error Messages** - Structured errors with context instead of cryptic status codes
- **Environment Auto-Loading** - Reads `HIERO_OPERATOR_ID`, `HIERO_PRIVATE_KEY`, `HIERO_NETWORK` from process env
- **Composable via `.extend()`** - Add custom actions and middleware
- **Mirror Node REST** - Built-in `hiero.mirror.*` client powered by `@hieco/mirror`

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
import { createHieroClient } from "@hieco/sdk";

const hiero = createHieroClient();

const mirrorInfo = await hiero.mirror.account.getInfo("0.0.123");

if (mirrorInfo.success) {
  console.log(mirrorInfo.data.account);
}

// Transfer HBAR
const result = await hiero.transfer({
  from: "0.0.123456",
  to: "0.0.5678",
  amount: 10,
});

if (result.success) {
  console.log(`Transfer complete. Transaction ID: ${result.data.transactionId}`);
} else {
  console.error(`Transfer failed: ${result.error.message}`);
}
```

## Core Concepts

### Client Configuration

The client auto-detects configuration from environment variables, but you can override:

```typescript
import { createHieroClient } from "@hieco/sdk";

const hiero = createHieroClient({
  network: "mainnet",
  operatorId: "0.0.123",
  operatorKey: "302e0201...",
  mirrorUrl: "https://mainnet.mirrornode.hedera.com",
  retry: {
    maxRetries: 3,
    initialDelayMs: 1000,
  },
});
```

### Default (Reusable) Configuration

If you want to configure once and use the same client everywhere:

```typescript
import { configureHiero, hiero } from "@hieco/sdk";

configureHiero({
  network: "testnet",
  logLevel: "info",
});

const result = await hiero().transfer({
  to: "0.0.5678",
  amount: 10,
});
```

### Wallet / Per-User Signer

When each user connects their own wallet, pass a Hedera JS SDK `Signer` and execute transactions with that signer:

```typescript
import { hiero } from "@hieco/sdk";
import type { Signer } from "@hiero-ledger/sdk";

export async function sendTip(userSigner: Signer, to: string, amount: number) {
  const client = hiero().withSigner(userSigner);

  return client.transfer({
    from: "0.0.123",
    to,
    amount,
  });
}
```

### Actions (Transactions)

Actions are the primary way to interact with the network. All actions return `SdkResult<T>` — a discriminated union of success and failure.

#### Crypto Actions

```typescript
// Transfer HBAR
const result = await hiero.transfer({
  from: "0.0.123",
  to: "0.0.5678",
  amount: 10,
  memo: "Payment",
});

// Create account
const createResult = await hiero.createAccount({
  initialBalance: 1,
  publicKey: "302a300506...",
});

// Delete account
const deleteResult = await hiero.deleteAccount({
  transferAccountId: "0.0.9999",
});
```

#### Token Actions

```typescript
// Create token
const createTokenResult = await hiero.createToken({
  name: "MyToken",
  symbol: "MYT",
  decimals: 6,
  initialSupply: 1000000,
});

// Mint token
const mintResult = await hiero.mintToken({
  tokenId: "0.0.987",
  amount: 100000,
});

// Burn token
const burnResult = await hiero.burnToken({
  tokenId: "0.0.987",
  amount: 50000,
});

// Associate token with account
const associateResult = await hiero.associateToken({
  accountId: "0.0.5678",
  tokenIds: ["0.0.987"],
});

// Transfer tokens
const transferResult = await hiero.transferToken({
  tokenId: "0.0.987",
  to: "0.0.5678",
  amount: 100,
});
```

#### Consensus Actions

```typescript
// Create topic
const createTopicResult = await hiero.createTopic({
  memo: "My Topic",
});

// Submit message
const submitResult = await hiero.submitMessage({
  topicId: "0.0.456",
  message: "Hello, Hiero!",
});

// Update topic
const updateResult = await hiero.updateTopic({
  topicId: "0.0.456",
  memo: "Updated Topic",
});

// Delete topic
const deleteTopicResult = await hiero.deleteTopic({
  topicId: "0.0.456",
});
```

#### Contract Actions

```typescript
// Deploy contract
const deployResult = await hiero.deployContract({
  bytecode: "0x608060...",
  gas: 100000,
  constructorParams: {
    types: ["uint256"],
    values: [42],
  },
});

// Execute contract function
const executeResult = await hiero.executeContract({
  contractId: "0.0.789",
  functionName: "transfer",
  gas: 50000,
  functionParams: {
    types: ["address", "uint256"],
    values: ["0.0.5678", 100],
  },
});

// Call contract (read-only)
const callResult = await hiero.callContract({
  contractId: "0.0.789",
  functionName: "balanceOf",
  functionParams: {
    types: ["address"],
    values: ["0.0.5678"],
  },
});
```

#### Schedule Actions

```typescript
// Create scheduled transaction
const scheduleResult = await hiero.scheduleTransaction({
  transaction: {
    type: "transfer",
    params: {
      from: "0.0.123",
      to: "0.0.5678",
      amount: 10,
    },
  },
  payerAccountId: "0.0.123",
});

// Delete scheduled transaction
const deleteScheduleResult = await hiero.deleteSchedule({
  scheduleId: "0.0.999",
});
```

#### File Actions

```typescript
// Create file
const createFileResult = await hiero.createFile({
  contents: Buffer.from("file contents"),
  keys: [publicKey],
});

// Append to file
const appendResult = await hiero.appendFile({
  fileId: "0.0.111",
  contents: Buffer.from("additional contents"),
});

// Delete file
const deleteFileResult = await hiero.deleteFile({
  fileId: "0.0.111",
});
```

### Builders (Fluent API)

Builders provide a fluent interface for constructing complex objects:

```typescript
const account = hiero.accounts().publicKey("302a300506...").initialBalance(1).build();

const token = hiero.tokens().name("MyToken").symbol("MYT").decimals(6).build();

const topic = hiero.topics().memo("My Topic").build();

const contract = hiero
  .contracts()
  .bytecode("0x608060...")
  .gas(100000)
  .constructorParams({
    types: ["uint256"],
    values: [42],
  })
  .build();
```

### Event System

Listen to transaction lifecycle events:

```typescript
const client = createHieroClient();

client.on("transaction:confirmed", (event) => {
  console.log(`Transaction confirmed: ${event.receipt.status}`);
});

client.on("transaction:before", (event) => {
  console.log(`Transaction starting: ${event.type}`);
});

client.on("transaction:submitted", (event) => {
  console.log(`Transaction submitted: ${event.transactionId} on node ${event.nodeId}`);
});

client.on("transaction:error", (event) => {
  console.error(`Transaction failed: ${event.error.message}`);
});

const result = await client.transfer({
  to: "0.0.5678",
  amount: 10,
});
```

### Middleware

Add custom middleware to the transaction pipeline:

```typescript
const client = createHieroClient({
  middleware: [
    async (context, next) => {
      console.log(`Processing transaction: ${context.transaction.type}`);
      return next();
    },
  ],
});

const result = await client.transfer({
  to: "0.0.5678",
  amount: 10,
});
```

### Custom Signing

Use custom signers for additional security or wallet integration:

```typescript
import type { Signer } from "@hiero-ledger/sdk";
import { DAppConnector } from "@hashgraph/hedera-wallet-connect";

// Use external signer
const dAppConnector = new DAppConnector();
const externalSigner = dAppConnector.signers[0];

const clientWithExternal = createHieroClient({
  signer: externalSigner,
});
```

### Extending the Client

Add custom actions via `.extend()`:

```typescript
const hiero = createHieroClient();

const extended = hiero.extend({
  customAction: async (client) => {
    return "custom result";
  },
});

const result = await extended.customAction();
```

## Error Handling

All operations return `SdkResult<T>`, a discriminated union:

```typescript
const result = await hiero.transfer({
  to: "0.0.5678",
  amount: 10,
});

if (result.success) {
  console.log(`Success: ${result.data.transactionId}`);
} else {
  // Access error details
  const error = result.error;
  console.error(`Message: ${result.error.message}`);
  if (result.error._tag === "TransactionError") {
    console.error(`Status: ${result.error.status}`);
  }
}
```

Error types include:

- `ConfigurationError` - Invalid client configuration
- `TransactionError` - Transaction failed (status code provided)
- `InvalidSignatureError` - Invalid signature for transaction

## Configuration

### Environment Variables

- `HIERO_OPERATOR_ID` - Account ID of the operator (e.g., `0.0.123456`)
- `HIERO_PRIVATE_KEY` - Operator private key in DER-encoded hex string format (compatible with `PrivateKey.fromStringDer`)
- `HIERO_NETWORK` - Network name: `mainnet`, `testnet`, or `previewnet` (default: `testnet`)
- `HIERO_MIRROR_URL` - Mirror node base URL used for both REST (`hiero.mirror.*`) and topic message subscriptions (`watchTopicMessages`)

### Client Options

```typescript
interface HieroClientConfig {
  network?: "mainnet" | "testnet" | "previewnet";
  operatorId?: string;
  operatorKey?: string;
  mirrorUrl?: string;
  signer?: Signer;
  retry?: {
    maxRetries?: number;
    maxDelayMs?: number;
    initialDelayMs?: number;
  };
  middleware?: ReadonlyArray<TransactionMiddleware>;
}
```

## Type Inference

The SDK uses advanced TypeScript patterns for type safety:

```typescript
// Builder types are inferred from the fluent API
const contract = hiero.contracts().bytecode("0x...").build();
// ✅ contract is typed as DeployContractParams

// Action parameters are strictly typed
await hiero.transfer({ from: "0.0.123", to: "0.0.5678", amount: 10 });
// ✅ TypeScript ensures all required fields are present

// Results are discriminated unions
const result = await hiero.transfer({...});
if (result.success) {
  // ✅ result.data is available here
} else {
  // ✅ result.error is available here
}
```

## Related Packages

- [`@hieco/types`](https://www.npmjs.com/package/@hieco/types) - Shared types
- [`@hieco/mirror`](https://www.npmjs.com/package/@hieco/mirror) - Mirror node REST API client
- [`@hieco/mirror-shared`](https://github.com/powxenv/hieco/tree/main/packages/mirror-shared) - Shared utilities
- [`@hiero-ledger/sdk`](https://www.npmjs.com/package/@hiero-ledger/sdk) - Official Hiero SDK

## Browser Support

Node.js >= 18.0.0. For browser usage, use a bundler like Vite or webpack.

## License

MIT
