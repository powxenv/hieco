# @hieco/sdk

Ergonomic, type-safe SDK for Hiero blockchain transactions and queries.

## Features

- **Zero-Boilerplate Transactions** - Simple, fluent API for HBAR transfers, token operations, smart contracts, and more
- **Unified Client** - One client for consensus node transactions, Mirror Node queries, and WebSocket subscriptions
- **Automatic Retry & Resilience** - Built-in retry logic for transient network errors (`BUSY`, `PLATFORM_TRANSACTION_NOT_CREATED`)
- **Type-Safe Builders** - Fluent chainable builders with full TypeScript support and autocomplete
- **Event System** - Transaction lifecycle events (pending, settled, error) for visibility and custom middleware
- **Smart Error Messages** - Structured errors with context instead of cryptic status codes
- **Environment Auto-Loading** - Reads `HIERO_OPERATOR_ID`, `HIERO_PRIVATE_KEY`, `HIERO_NETWORK` from `.env`
- **Composable via `.extend()`** - Add custom actions and middleware

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
```

### Step 2: Create Client and Execute Transactions

```typescript
import { createHieroClient } from "@hieco/sdk";

const hiero = createHieroClient();

// Transfer HBAR
const result = await hiero.transfer({
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
  topicMemo: "My Topic",
});

// Submit message
const submitResult = await hiero.submitMessage({
  topicId: "0.0.456",
  message: "Hello, Hiero!",
});

// Update topic
const updateResult = await hiero.updateTopic({
  topicId: "0.0.456",
  topicMemo: "Updated Topic",
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
    to: "0.0.5678",
    amount: 10,
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
const appendResult = await hiero.appendToFile({
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
const account = hiero.account().initialBalance(1).publicKey("302a3005...").build();

const token = hiero
  .token()
  .name("MyToken")
  .symbol("MYT")
  .decimals(6)
  .initialSupply(1000000)
  .treasury("0.0.123")
  .build();

const topic = hiero.topic().memo("My Topic").adminKey("302a3005...").build();

const contract = hiero
  .contract()
  .bytecode("0x608060...")
  .gas(100000)
  .constructorParams({
    types: ["uint256"],
    values: [42],
  })
  .build();
```

### Mirror Node Queries

Access Mirror Node queries through the client:

```typescript
// Get account info
const accountInfo = await hiero.mirror.accountInfo("0.0.123");

// List accounts
const accounts = await hiero.mirror.accounts({
  limit: 10,
  order: "desc",
});

// Get token info
const tokenInfo = await hiero.mirror.tokenInfo("0.0.987");

// Get contract info
const contractInfo = await hiero.mirror.contractInfo("0.0.789");

// Get topic messages
const messages = await hiero.mirror.topicMessages("0.0.456", {
  limit: 20,
});

// Get transactions
const transactions = await hiero.mirror.transactions({
  limit: 10,
});
```

### Event System

Listen to transaction lifecycle events:

```typescript
const client = createHieroClient();

client.on("transaction:pending", (event) => {
  console.log(`Transaction submitted: ${event.transactionId}`);
});

client.on("transaction:settled", (event) => {
  console.log(`Transaction confirmed: ${event.receipt.status}`);
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
const client = createHieroClient();

client.use((transaction) => {
  console.log(`Processing transaction: ${transaction.type}`);
  return transaction;
});

const result = await client.transfer({
  to: "0.0.5678",
  amount: 10,
});
```

### Custom Signing

Use custom signers for additional security or wallet integration:

```typescript
import { LocalSigner } from "@hieco/sdk";
import { DAppConnector } from "@hashgraph/hedera-wallet-connect";

// Local signing
const localSigner = LocalSigner.privateKey("302e0201...");

const client = createHieroClient({
  signer: localSigner,
});

// Or use external signer (e.g., HashConnect)
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
  console.error(`Error: ${error.code}`);
  console.error(`Message: ${error.message}`);
  console.error(`Status: ${error.status}`);
}
```

Error types include:

- `ConfigurationError` - Invalid client configuration
- `ValidationError` - Invalid transaction parameters
- `SigningError` - Key signing failed
- `NetworkError` - Network connectivity issue
- `TransactionError` - Transaction failed (status code provided)
- `TimeoutError` - Operation timed out
- `UnknownError` - Unexpected error

## Configuration

### Environment Variables

- `HIERO_OPERATOR_ID` - Account ID of the operator (e.g., `0.0.123456`)
- `HIERO_PRIVATE_KEY` - Private key of the operator (ED25519 or ECDSA hex format)
- `HIERO_NETWORK` - Network name: `mainnet`, `testnet`, or `previewnet` (default: `testnet`)
- `HIERO_MIRROR_NODE_URL` - Custom Mirror Node URL (optional)

### Client Options

```typescript
interface HieroClientConfig {
  network?: "mainnet" | "testnet" | "previewnet";
  operatorId?: string;
  operatorKey?: string;
  mirrorNodeUrl?: string;
  signer?: Signer;
  retryConfig?: {
    maxRetries?: number;
    delayMs?: number;
    maxDelayMs?: number;
  };
}
```

## Type Inference

The SDK uses advanced TypeScript patterns for type safety:

```typescript
// Builder types are inferred from the fluent API
const token = hiero.token().name("X").build();
// ✅ token is typed as Token

// Action parameters are strictly typed
await hiero.transfer({ to: "0.0.5678", amount: 10 });
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
- [`@hieco/mirror`](https://www.npmjs.com/package/@hieco/mirror) - Mirror Node REST API client
- [`@hieco/mirror-shared`](https://github.com/powxenv/hieco/tree/main/packages/mirror-shared) - Shared utilities
- [`@hieco/realtime`](https://www.npmjs.com/package/@hieco/realtime) - WebSocket subscriptions
- [`@hiero-ledger/sdk`](https://www.npmjs.com/package/@hiero-ledger/sdk) - Official Hiero SDK

## Browser Support

Node.js >= 18.0.0. For browser usage, use a bundler like Vite or webpack.

## License

MIT
