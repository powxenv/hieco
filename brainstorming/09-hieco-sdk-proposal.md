# @hieco/sdk — Comprehensive Proposal

> The developer experience layer for Hiero. From first connection to complex
> transaction orchestration — intuitive, powerful, and genuinely enjoyable.

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Vision](#2-vision)
3. [Design Philosophy](#3-design-philosophy)
4. [Architecture Overview](#4-architecture-overview)
5. [The Developer Journey](#5-the-developer-journey)
6. [Client System](#6-client-system)
7. [Transaction Pipeline](#7-transaction-pipeline)
8. [Progressive Disclosure](#8-progressive-disclosure)
9. [Transaction Actions](#9-transaction-actions)
10. [Resource Builders (Fluent API)](#10-resource-builders-fluent-api)
11. [Mirror Node Integration](#11-mirror-node-integration)
12. [Type System & Inference](#12-type-system--inference)
13. [Error Handling](#13-error-handling)
14. [Retry & Resilience](#14-retry--resilience)
15. [Event System](#15-event-system)
16. [Facades (Static-like Access)](#16-facades-static-like-access)
17. [React Integration (@hieco/sdk-react)](#17-react-integration-hiecosdk-react)
18. [Tree-Shaking & Bundle Size](#18-tree-shaking--bundle-size)
19. [Compatibility with Existing @hieco Packages](#19-compatibility-with-existing-hieco-packages)
20. [Package Structure](#20-package-structure)
21. [API Reference](#21-api-reference)
22. [Before & After](#22-before--after)
23. [Roadmap](#23-roadmap)
24. [Architectural Decisions](#24-architectural-decisions)
25. [Audit Log](#25-audit-log)

---

## 1. Problem Statement

Building on the Hiero network today requires developers to write verbose, repetitive
boilerplate for every operation. A simple HBAR transfer looks like this:

```typescript
import { Client, TransferTransaction, Hbar, AccountId, PrivateKey } from "@hiero-ledger/sdk"

const client = Client.forTestnet()
client.setOperator(
  AccountId.fromString(process.env.HIERO_ACCOUNT_ID!),
  PrivateKey.fromStringED25519(process.env.HIERO_PRIVATE_KEY!)
)

const transaction = new TransferTransaction()
  .addHbarTransfer(AccountId.fromString("0.0.1234"), new Hbar(-10))
  .addHbarTransfer(AccountId.fromString("0.0.5678"), new Hbar(10))
  .setTransactionMemo("Payment")
  .setMaxTransactionFee(new Hbar(1))

const frozenTx = await transaction.freezeWith(client)
const signedTx = await frozenTx.sign(PrivateKey.fromStringED25519(process.env.HIERO_PRIVATE_KEY!))
const response = await signedTx.execute(client)
const receipt = await response.getReceipt(client)

console.log(`Status: ${receipt.status}`)
```

**Every. Single. Time.** Create → Configure → Freeze → Sign → Execute → Receipt.

This is not a developer experience. It is a ceremony.

### The Pain is Structural

| Pain Point | Impact |
|---|---|
| Manual `Client.forTestnet()` + `setOperator()` ceremony | Every file, every script, every test |
| `AccountId.fromString()` / `PrivateKey.fromStringED25519()` wrapping | Type conversion noise everywhere |
| Explicit `freezeWith()` → `sign()` → `execute()` → `getReceipt()` chain | 4 lines that never vary |
| No automatic retry on `BUSY` / `PLATFORM_TRANSACTION_NOT_CREATED` | Silent failures in production |
| No gas estimation for smart contracts | Manual guessing or over-provisioning |
| Cryptic `Status.INVALID_SIGNATURE` with no context | Hours lost debugging key mismatches |
| Separate clients for consensus node vs Mirror Node | Two integration paths, two mental models |
| `AccountBalanceQuery` planned for deprecation | Future migration with no abstraction layer |
| No transaction lifecycle visibility | No hooks, no events, no middleware |

The Hiero SDK is correct, complete, and well-maintained. But it optimizes for
**protocol fidelity** over **developer productivity**. That gap is where `@hieco/sdk`
lives.

---

## 2. Vision

`@hieco/sdk` exists to make the Hiero network feel **native** to TypeScript developers.
Not "blockchain SDK you learn to tolerate" — genuinely pleasant to use, the way
the best tools disappear into your workflow.

```typescript
import { createHieroClient } from "@hieco/sdk"

const hiero = createHieroClient()

await hiero.transfer({ to: "0.0.5678", amount: 10 })
```

Three lines. Zero ceremony. The client reads credentials from environment variables,
defaults to testnet, handles the entire freeze → sign → execute → receipt lifecycle,
retries on transient errors, and returns a typed result.

### Core Principles

1. **The happy path should be one line.** Every common operation — transfer, create
   token, submit message — has a single-call shorthand. No setup, no boilerplate.

2. **Complexity is opt-in, not mandatory.** Need custom signing? Multi-sig? Manual
   gas limits? The API unfolds gracefully. You never pay for complexity you don't use.

3. **One client, one mental model.** Consensus node transactions, Mirror Node queries,
   and WebSocket subscriptions all flow through `HieroClient`. No juggling clients.

4. **TypeScript is the documentation.** Types are so precise that autocomplete alone
   teaches you the API. Discriminated unions, template literals, conditional types —
   the compiler is your guide.

5. **Errors are conversations, not codes.** Instead of `Status.INVALID_SIGNATURE`,
   you get a structured error explaining which keys were expected, which were provided,
   and what the account's key structure actually requires.

6. **The SDK never lies about what happened.** Every operation returns `ApiResult<T>` —
   a discriminated union of success and failure. No thrown exceptions for expected
   errors. Pattern match, don't try/catch.

---

## 3. Design Philosophy

### 3.1 Inspirations

This SDK draws from the best developer experience patterns in modern tooling:

**From Laravel:** Convention over configuration. Environment variable auto-loading.
Fluent, chainable builders that read like prose. The idea that the framework should
work for you, not the other way around.

**From viem:** Composable client decoration via `.extend()`. Tree-shakable action
functions that take the client as the first argument. Transport abstractions that
hide protocol complexity.

**From wagmi:** Mutation hooks that track lifecycle state (`idle → pending → success`).
Config objects that wire up the entire stack. Provider patterns that make the client
available to the entire component tree.

**From Zod:** Type inference that flows from runtime to compile time. The schema is
the source of truth. You define once, TypeScript infers the rest.

### 3.2 Key Translations

| Pattern | @hieco/sdk |
|---|---|
| `Eloquent::create([...])` | `hiero.tokens().name("X").symbol("Y").create()` |
| `DB::table(...)->where(...)->get()` | `hiero.mirror.accounts().balance.gte(1000).get()` |
| Service Container | `createHieroClient()` resolves consensus + mirror transports |
| Facades | `import { transfer } from "@hieco/sdk/facade"` |
| `.env` auto-loading | `HIERO_OPERATOR_ID`, `HIERO_PRIVATE_KEY`, `HIERO_NETWORK` |
| `createClient().extend(publicActions)` | `createHieroClient().extend(tokenActions)` |
| Tree-shakable imports | `import { transfer } from "@hieco/sdk/actions"` |
| `useWriteContract` | `useTransfer`, `useCreateToken`, `useSubmitMessage` |
| Transport abstraction | `ConsensusTransport` / `MirrorTransport` |
| Middleware pipeline | Transaction middleware (retry, logging, gas estimation) |

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      @hieco/sdk-react                       │
│  useTransfer · useCreateToken · useSubmitMessage · ...      │
├─────────────────────────────────────────────────────────────┤
│                        @hieco/sdk                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    HieroClient                        │  │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────────────────┐  │  │
│  │  │Consensus│  │  Mirror   │  │     Relay (WS)      │  │  │
│  │  │Transport│  │ Transport │  │     Transport       │  │  │
│  │  └────┬────┘  └─────┬────┘  └──────────┬──────────┘  │  │
│  │       │             │                   │             │  │
│  │  ┌────┴────┐  ┌─────┴──────┐  ┌────────┴───────┐    │  │
│  │  │ Actions │  │  Queries   │  │  Subscriptions │    │  │
│  │  └─────────┘  └────────────┘  └────────────────┘    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  │
│  │ Builders │  │  Events  │  │ Errors   │  │ Middleware  │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  │
│  ┌──────────┐                                               │
│  │ Signers  │  privateKeySigner · fromHieroSigner           │
│  └──────────┘                                               │
├─────────────────────────────────────────────────────────────┤
│              @hiero-ledger/sdk  ·  @hieco/mirror            │
│                     @hieco/types · @hieco/realtime           │
├─────────────────────────────────────────────────────────────┤
│         @hashgraph/hedera-wallet-connect (optional)         │
│   DAppConnector → DAppSigner → fromHieroSigner() adapter   │
└─────────────────────────────────────────────────────────────┘
```

### Dependency Graph

```
@hieco/sdk
  ├── @hiero-ledger/sdk     (peer: consensus node transactions)
  ├── @hieco/mirror         (Mirror Node REST queries)
  ├── @hieco/realtime       (WebSocket subscriptions)
  └── @hieco/types          (shared foundation types)

@hieco/sdk-react
  ├── @hieco/sdk            (core SDK)
  ├── @hieco/mirror-react   (existing Mirror hooks, re-exported)
  └── @tanstack/react-query (peer dependency)
```

### Core Modules

| Module | Responsibility | Entry Point |
|---|---|---|
| `client` | Client creation, configuration, service resolution | `@hieco/sdk` |
| `actions/crypto` | HBAR transfers, account CRUD | `@hieco/sdk/actions` |
| `actions/token` | HTS token lifecycle (create, mint, burn, associate, transfer) | `@hieco/sdk/actions` |
| `actions/consensus` | HCS topic CRUD, message submission | `@hieco/sdk/actions` |
| `actions/contract` | Smart contract deploy, execute, call | `@hieco/sdk/actions` |
| `actions/schedule` | Scheduled transactions | `@hieco/sdk/actions` |
| `actions/file` | File service operations | `@hieco/sdk/actions` |
| `builders` | Fluent resource builders | `@hieco/sdk/builders` |
| `mirror` | Mirror Node query integration | `@hieco/sdk/mirror` |
| `events` | Transaction lifecycle events | `@hieco/sdk/events` |
| `middleware` | Transaction pipeline middleware | `@hieco/sdk/middleware` |
| `errors` | Enhanced error types and messages | `@hieco/sdk/errors` |
| `facade` | Singleton static-like access | `@hieco/sdk/facade` |

---

## 5. The Developer Journey

This is the core of what `@hieco/sdk` optimizes for. Every design decision flows
from making these moments feel right.

### Moment 1: First Connection

The developer has just installed the SDK. They want to talk to the network.

```bash
bun add @hieco/sdk @hiero-ledger/sdk
```

**Node (scripts, backends, CLIs):**

```env
HIERO_OPERATOR_ID=0.0.1234
HIERO_PRIVATE_KEY=302e020100300506032b657004220420...
```

```typescript
import { createHieroClient } from "@hieco/sdk"

const hiero = createHieroClient()
```

Done. No `Client.forTestnet()`. No `AccountId.fromString()`. No `PrivateKey.fromStringED25519()`.
The client reads environment variables, detects the network, initializes the consensus
transport, lazily prepares the Mirror Node client. One line.

**Browser (dApps):**

```typescript
import { createHieroClient, fromHieroSigner } from "@hieco/sdk"
import { DAppConnector } from "@hashgraph/hedera-wallet-connect"

// 1. Connect via WalletConnect (ecosystem standard — works with HashPack, Kabila, Dropp)
const dAppConnector = new DAppConnector(/* metadata, ledgerId, projectId */)
await dAppConnector.init()
const session = await dAppConnector.openModal()
const walletSigner = dAppConnector.getSigner(accountId)  // DAppSigner (implements Hiero Signer)

// 2. Wrap in @hieco/sdk's Signer interface
const hiero = createHieroClient({
  network: "mainnet",
  operator: {
    accountId: "0.0.1234",
    signer: fromHieroSigner(walletSigner),
  },
})
```

Browser environments require explicit operator configuration — the SDK refuses to
guess about signing in a context where private keys should never exist in plain text.
Transport auto-detection selects gRPC-web automatically.

### Moment 2: First Transaction

The developer wants to send HBAR. They type `hiero.` and autocomplete shows them
every available action.

```typescript
const result = await hiero.transfer({ to: "0.0.5678", amount: 10 })
```

Behind the scenes: build `TransferTransaction`, set operator as sender, freeze with
client, sign with operator key, execute, wait for receipt, wrap in `ApiResult`,
retry if the node was `BUSY`. The developer sees none of this.

### Moment 3: First Error

The transfer fails. Instead of `Status.INSUFFICIENT_PAYER_BALANCE`:

```typescript
if (!result.success) {
  console.log(result.error.message)
  // "Transaction failed with INSUFFICIENT_PAYER_BALANCE on account 0.0.1234.
  //  The payer account does not have enough HBAR to cover the transaction fee.
  //  Check the account balance with hiero.getBalance({ accountId: '0.0.1234' })."
}
```

The error is a structured object with `_tag` discrimination. The message is
human-readable. The developer knows exactly what happened and what to do.

### Moment 4: Growing Complexity

The developer's needs evolve. They need custom signing, multiple recipients,
specific gas limits. The API does not change shape — it just accepts more parameters:

```typescript
// Simple (day 1)
await hiero.transfer({ to: "0.0.5678", amount: 10 })

// Multi-recipient (day 5)
await hiero.transfer({
  transfers: [
    { to: "0.0.5678", amount: 5 },
    { to: "0.0.9012", amount: 5 },
  ],
  memo: "Split payment",
})

// Custom signing (day 15)
await hiero.transfer({
  to: "0.0.5678",
  amount: 100,
  signers: [additionalKey],
  maxFee: 2,
  nodeAccountIds: ["0.0.3"],
})

// Full control (day 30)
const frozen = await hiero.buildTransaction("transfer", {
  to: "0.0.5678",
  amount: 100,
})
const bytes = frozen.toBytes()       // serialize for external signing
frozen.addSignature(pubKey, sig)     // add external signature
const result = await hiero.submitTransaction(frozen)
```

Same API surface. Same mental model. Just more knobs turned.

### Moment 5: Reading the Network

The developer needs account data. The Mirror Node is available through the same client:

```typescript
const account = await hiero.mirror.accounts.get("0.0.1234")

const richAccounts = await hiero.mirror
  .accounts()
  .balance.gte(1000_00000000)
  .order("desc")
  .limit(25)
  .get()

for await (const tx of hiero.mirror.transactions().account("0.0.1234").all()) {
  console.log(tx.transaction_id)
}
```

No separate client. No separate configuration. One object, both writing and reading.

### Moment 6: React Integration

The developer is building a UI. Transaction state management should be trivial:

```tsx
import { useTransfer } from "@hieco/sdk-react"

function SendButton() {
  const { mutate, isPending, isSuccess, error } = useTransfer()

  return (
    <button
      disabled={isPending}
      onClick={() => mutate({ to: "0.0.5678", amount: 10 })}
    >
      {isPending ? "Sending..." : "Send 10 HBAR"}
    </button>
  )
}
```

Lifecycle state is managed. Error state is managed. The hook re-renders the component
at the right times. The developer focuses on UI, not plumbing.

---

## 6. Client System

### 6.1 Client Creation

```typescript
import { createHieroClient } from "@hieco/sdk"

// Node: zero-config — reads HIERO_OPERATOR_ID, HIERO_PRIVATE_KEY, HIERO_NETWORK from env
const hiero = createHieroClient()

// Explicit configuration (Node or browser)
const hiero = createHieroClient({
  network: "testnet",
  operator: {
    accountId: "0.0.1234",
    privateKey: "302e020100300506032b657004220420...",
  },
})

// Browser: explicit operator required (env-var fallback disabled)
import { privateKeySigner } from "@hieco/sdk"

const hiero = createHieroClient({
  network: "testnet",
  operator: {
    accountId: "0.0.1234",
    signer: privateKeySigner("302e020100..."),
  },
})

// Browser with wallet signer (via @hashgraph/hedera-wallet-connect)
import { fromHieroSigner } from "@hieco/sdk"
import { DAppConnector } from "@hashgraph/hedera-wallet-connect"

const dAppConnector = new DAppConnector(/* ... */)
await dAppConnector.init()
const walletSigner = dAppConnector.getSigner(accountId)

const hiero = createHieroClient({
  network: "mainnet",
  operator: {
    accountId: "0.0.1234",
    signer: fromHieroSigner(walletSigner),
  },
})

// Full configuration with all transports
const hiero = createHieroClient({
  network: "mainnet",
  operator: {
    accountId: "0.0.1234",
    privateKey: "302e020100300506032b657004220420...",
  },
  transport: "auto",  // "auto" | "grpc" | "grpc-web" (auto-detects environment)
  mirror: {
    url: "https://mainnet.mirrornode.hedera.com",
    rateLimitPerSecond: 50,
  },
  middleware: [loggingMiddleware(), retryMiddleware({ maxRetries: 3 })],
  maxTransactionFee: 5,  // HBAR
  defaultTransactionValidDuration: 120, // seconds
})
```

### 6.2 Signer Interface

The SDK defines a minimal `Signer` interface scoped to what the transaction pipeline
actually needs: sign raw bytes and provide a public key. This mirrors viem's
`CustomSource` pattern — the SDK never imports wallet packages, it accepts an
interface.

```typescript
interface Signer {
  sign(bytes: Uint8Array): Promise<Uint8Array>
  getPublicKey(): Promise<PublicKey>
}
```

**Built-in signers:**

```typescript
import { privateKeySigner } from "@hieco/sdk"

// Auto-detects key format: ED25519 DER, ECDSA DER, raw hex
const signer = privateKeySigner("302e020100300506032b657004220420...")
```

**Adapter for ecosystem wallets:**

The Hedera ecosystem has standardized on `@hashgraph/hedera-wallet-connect`, which
provides `DAppSigner` — a class implementing the Hiero SDK's full `Signer` interface
(12 methods). HashPack, Kabila, and Dropp all use it. Blade Wallet shut down July
2025 and its SDK is deprecated.

`@hieco/sdk` does NOT build wallet connectors or depend on wallet SDKs. Instead, it
ships a `fromHieroSigner()` adapter that bridges any object implementing the Hiero
SDK's `Signer` interface (including `DAppSigner`) into our minimal interface:

```typescript
import { fromHieroSigner } from "@hieco/sdk"
import { DAppConnector } from "@hashgraph/hedera-wallet-connect"

const dAppConnector = new DAppConnector(metadata, ledgerId, projectId)
await dAppConnector.init()
const session = await dAppConnector.openModal()
const walletSigner = dAppConnector.getSigner(accountId)

const hiero = createHieroClient({
  network: "mainnet",
  operator: {
    accountId: accountId.toString(),
    signer: fromHieroSigner(walletSigner),
  },
})
```

**Custom signer (ad-hoc):**

Developers can implement the `Signer` interface directly for any signing backend
(HSMs, custodial services, multi-party computation):

```typescript
const customSigner: Signer = {
  async sign(bytes) {
    return myHsmService.sign(bytes)
  },
  async getPublicKey() {
    return myHsmService.getPublicKey()
  },
}
```

**Why not use the Hiero SDK's full Signer interface?**

The Hiero SDK's `Signer` is a 12-method fat interface (`getLedgerId`, `getAccountId`,
`getAccountKey`, `getNetwork`, `getMirrorNetwork`, `sign`, `getAccountBalance`,
`getAccountInfo`, `getAccountRecords`, `signTransaction`, `checkTransaction`,
`populateTransaction`, `call`). Most of these are query methods that `@hieco/sdk`
already handles through its own transports. Requiring implementors to provide 12
methods for what is fundamentally a signing operation would kill the DX for custom
integrations. Our 2-method interface is the minimum viable contract; `fromHieroSigner`
bridges the gap for ecosystem signers that already implement the full interface.

### 6.3 Environment-Aware Operator Resolution

In **Node environments**, if `operator` is omitted from config, the SDK reads
`HIERO_OPERATOR_ID` and `HIERO_PRIVATE_KEY` from `process.env` and constructs
a `privateKeySigner` automatically.

In **browser environments**, omitting `operator` throws a `ConfigurationError`:

```
ConfigurationError: Operator configuration is required in browser environments.
Provide { operator: { accountId, signer } } to createHieroClient().
```

This prevents accidental private key exposure in client-side bundles and forces
intentional signer setup — whether a private key for testing (with appropriate
warnings) or a `fromHieroSigner()` adapter wrapping a WalletConnect `DAppSigner`.

### 6.4 HieroClient Interface

```typescript
interface HieroClient {
  readonly network: NetworkType
  readonly operatorAccountId: EntityId
  readonly operatorPublicKey: string

  // Transports (lazy-initialized, auto-detected environment)
  readonly consensus: ConsensusTransport
  readonly mirror: MirrorQueryClient

  // Quick actions (convenience methods on the client itself)
  transfer(params: TransferParams): Promise<SdkResult<TransferReceipt>>
  createAccount(params: CreateAccountParams): Promise<SdkResult<AccountReceipt>>
  createToken(params: CreateTokenParams): Promise<SdkResult<TokenReceipt>>
  createTopic(params: CreateTopicParams): Promise<SdkResult<TopicReceipt>>
  submitMessage(params: SubmitMessageParams): Promise<SdkResult<MessageReceipt>>
  deployContract(params: DeployContractParams): Promise<SdkResult<ContractReceipt>>
  executeContract(params: ExecuteContractParams): Promise<SdkResult<ContractExecuteReceipt>>
  callContract(params: CallContractParams): Promise<SdkResult<ContractCallResult>>
  getBalance(params: GetBalanceParams): Promise<SdkResult<BalanceResult>>

  // Fluent builders
  tokens(): TokenBuilder
  topics(): TopicBuilder
  accounts(): AccountBuilder
  contracts(): ContractBuilder

  // Transaction lifecycle
  buildTransaction<T extends TransactionType>(
    type: T,
    params: TransactionParamsMap[T],
  ): Promise<FrozenTransaction>
  submitTransaction(frozen: FrozenTransaction): Promise<SdkResult<TransactionReceipt>>

  // Composable extension (viem pattern)
  extend<TActions extends Record<string, unknown>>(
    decorator: (client: HieroClient) => TActions,
  ): HieroClient & TActions

  // Event system
  on<TEvent extends TransactionEvent>(
    event: TEvent,
    handler: TransactionEventHandler<TEvent>,
  ): Unsubscribe

  // Real-time subscriptions (different transports per type)
  watchTopicMessages(params: WatchTopicMessagesParams): Unsubscribe   // gRPC via @hiero-ledger/sdk
  watchContractLogs(params: WatchContractLogsParams): Unsubscribe     // WebSocket via @hieco/realtime

  // Raw access (escape hatch to underlying libraries)
  readonly raw: {
    readonly client: import("@hiero-ledger/sdk").Client
    readonly mirrorClient: import("@hieco/mirror").MirrorNodeClient
  }

  close(): Promise<void>
}

interface GetBalanceParams {
  readonly accountId: EntityId
  readonly source?: "mirror" | "consensus"  // default: "mirror"
}
```

### 6.5 Composable Extension (viem Pattern)

```typescript
import { createHieroClient } from "@hieco/sdk"
import { hcsActions, tokenActions, contractActions } from "@hieco/sdk/actions"

const hiero = createHieroClient()
  .extend(hcsActions)
  .extend(tokenActions)
  .extend(contractActions)

// hiero now has all HCS + Token + Contract methods
await hiero.createTopic({ memo: "My topic", submitKey: true })
await hiero.createToken({ name: "Gold", symbol: "GLD", decimals: 8 })
await hiero.deployContract({ bytecode: "0x...", gas: 100_000 })
```

The base client ships with convenience actions for the most common operations.
The `.extend()` pattern lets you add domain-specific action sets without bloating
the default bundle.

### 6.6 Tree-Shakable Standalone Actions

```typescript
import { createHieroClient } from "@hieco/sdk"
import { transfer, createToken } from "@hieco/sdk/actions"

const hiero = createHieroClient()

// Actions accept the client as the first argument (like viem)
await transfer(hiero, { to: "0.0.5678", amount: 10 })
await createToken(hiero, { name: "Gold", symbol: "GLD", decimals: 8 })
```

Both patterns — `hiero.transfer(...)` and `transfer(hiero, ...)` — call the same
underlying implementation. Choose based on preference and bundle requirements.

### 6.7 Environment Variable Convention (Node Only)

| Variable | Default | Description |
|---|---|---|
| `HIERO_OPERATOR_ID` | — | Operator account ID (`0.0.XXXX`) |
| `HIERO_PRIVATE_KEY` | — | Operator private key (DER-encoded or raw hex) |
| `HIERO_NETWORK` | `"testnet"` | Network name (`mainnet`, `testnet`, `previewnet`) |
| `HIERO_MIRROR_URL` | Network default | Custom Mirror Node URL |
| `HIERO_RELAY_URL` | Network default | Custom JSON-RPC Relay URL |
| `HIERO_MAX_TRANSACTION_FEE` | `"2"` | Default max fee in HBAR |
| `HIERO_LOG_LEVEL` | `"none"` | Logging verbosity (`none`, `error`, `warn`, `info`, `debug`) |

Environment variable resolution is **disabled in browser environments**. The SDK
detects the runtime and only reads `process.env` in Node. Browser clients must
provide explicit configuration via `createHieroClient({ operator: ... })`.

The SDK detects private key format automatically — ED25519 DER, ECDSA DER, or raw
hex. No `fromStringED25519` vs `fromStringECDSA` decision for the developer.
Mnemonic phrases are not auto-detected and should use the `Mnemonic` class from
`@hiero-ledger/sdk` directly.

> **Note:** `HIERO_ACCOUNT_ID` is also accepted as an alias for `HIERO_OPERATOR_ID`
> for backward compatibility.

---

## 7. Transaction Pipeline

This is the heart of the SDK. Every transaction — whether triggered by
`hiero.transfer()`, a fluent builder's `.create()`, or a standalone action function —
flows through the same pipeline:

```
┌──────────┐    ┌────────────┐    ┌──────────────┐    ┌────────┐
│  Params  │───▶│   Build    │───▶│  Middleware   │───▶│ Freeze │
│  (user)  │    │ Transaction│    │  (pre-exec)  │    │        │
└──────────┘    └────────────┘    └──────────────┘    └───┬────┘
                                                         │
┌──────────┐    ┌────────────┐    ┌──────────────┐    ┌──┴─────┐
│  Result  │◀───│  Receipt   │◀───│   Execute    │◀───│  Sign  │
│ (caller) │    │  (wait)    │    │  (submit)    │    │        │
└──────────┘    └────────────┘    └──────────────┘    └────────┘
```

### 7.1 Pipeline Stages

**1. Params → Build:** The user's params object is validated and transformed into
a native `@hiero-ledger/sdk` transaction. String entity IDs are parsed into
`AccountId` / `TokenId` / `TopicId`. Numbers are wrapped in `Hbar`. Booleans like
`adminKey: true` are resolved to the operator's public key.

**2. Build → Middleware (pre-exec):** The constructed transaction passes through
the middleware chain. Middleware can inspect, modify, log, or reject the transaction
before execution. The retry middleware wraps the remaining pipeline in retry logic.

**3. Middleware → Freeze:** The transaction is frozen with the client, locking in
the transaction ID, node account IDs, and valid duration.

**4. Freeze → Sign:** The operator's private key signs the frozen transaction.
Additional signers (if provided via params) are applied in order.

**5. Sign → Execute:** The signed transaction is submitted to a consensus node.

**6. Execute → Receipt:** The SDK waits for the transaction receipt, confirming
the transaction reached consensus.

**7. Receipt → Result:** The receipt is mapped to a typed result object and wrapped
in `ApiResult<T, SdkError>`. Success data includes the transaction ID, status,
and any created entity IDs (account, token, topic, contract, file, schedule).

### 7.2 Middleware Interface

```typescript
type TransactionMiddleware = (
  context: TransactionContext,
  next: () => Promise<SdkResult<TransactionReceipt>>,
) => Promise<SdkResult<TransactionReceipt>>

interface TransactionContext {
  readonly type: TransactionType
  readonly params: Record<string, unknown>
  readonly client: HieroClient
  readonly attempt: number
  readonly transactionId: string | undefined
  readonly startedAt: number
}
```

### 7.3 Built-in Middleware

```typescript
import {
  retryMiddleware,
  loggingMiddleware,
  gasEstimationMiddleware,
} from "@hieco/sdk/middleware"

const hiero = createHieroClient({
  middleware: [
    loggingMiddleware({ level: "info" }),
    retryMiddleware({ maxRetries: 3 }),
    gasEstimationMiddleware({ bufferPercent: 20 }),
  ],
})
```

**Retry middleware** is enabled by default (3 retries, exponential backoff, retries
on `BUSY` / `PLATFORM_TRANSACTION_NOT_CREATED` / `PLATFORM_NOT_ACTIVE`). It can be
configured at the client level or overridden per-transaction.

**Logging middleware** emits structured log events at each pipeline stage:
`transaction:building`, `transaction:frozen`, `transaction:signed`,
`transaction:submitted`, `transaction:confirmed`, `transaction:error`.

**Gas estimation middleware** is opt-in for contract operations. It uses the Mirror
Node REST API (`POST /api/v1/contracts/call` with `{ "estimate": true }`) to
estimate gas. For complex state-dependent contracts where the Mirror Node estimate
is insufficient, developers can switch to dry-run execution via the Hiero SDK.
A configurable buffer percentage is added to the estimate.

```typescript
gasEstimationMiddleware({
  strategy: "mirror",        // "mirror" (default) | "dry-run"
  bufferPercent: 20,
})
```

### 7.4 Custom Middleware

```typescript
const auditMiddleware: TransactionMiddleware = async (context, next) => {
  console.log(`[${context.type}] Starting attempt ${context.attempt}`)
  const start = performance.now()
  const result = await next()
  const duration = performance.now() - start

  if (result.success) {
    console.log(`[${context.type}] Confirmed in ${duration.toFixed(0)}ms`)
  } else {
    console.error(`[${context.type}] Failed: ${result.error._tag}`)
  }

  return result
}

const hiero = createHieroClient({
  middleware: [auditMiddleware],
})
```

---

## 8. Progressive Disclosure

The API is designed so that complexity unfolds gradually. A developer should never
need to learn more than what their current task demands.

### 8.1 Level 0: One-Liner

The simplest possible invocation. Sensible defaults everywhere.

```typescript
await hiero.transfer({ to: "0.0.5678", amount: 10 })
await hiero.createToken({ name: "Gold", symbol: "GLD", decimals: 8 })
await hiero.createTopic({ memo: "Audit log" })
await hiero.submitMessage({ topicId: "0.0.TOPIC", message: "Hello" })
```

### 8.2 Level 1: Configuration

Optional fields that control behavior without changing the API shape.

```typescript
await hiero.transfer({
  to: "0.0.5678",
  amount: 10,
  memo: "Invoice #1234",
  maxFee: 1,
})

await hiero.createToken({
  name: "Gold",
  symbol: "GLD",
  decimals: 8,
  initialSupply: 1_000_000,
  treasury: "0.0.1234",
  adminKey: true,
  supplyKey: true,
  freezeDefault: false,
})
```

### 8.3 Level 2: Multi-Party

Transactions involving multiple accounts or requiring additional signatures.

```typescript
// Multiple recipients
await hiero.transfer({
  transfers: [
    { to: "0.0.5678", amount: 5 },
    { to: "0.0.9012", amount: 5 },
  ],
})

// Additional signers
await hiero.transfer({
  to: "0.0.5678",
  amount: 100,
  signers: [secondaryKey],
})

// Token with multiple key holders
await hiero.createToken({
  name: "Governed Token",
  symbol: "GOV",
  decimals: 8,
  adminKey: adminPublicKey,
  supplyKey: minterPublicKey,
  freezeKey: compliancePublicKey,
  wipeKey: compliancePublicKey,
  signers: [adminKey, minterKey, complianceKey],
})
```

### 8.4 Level 3: Pipeline Control

For advanced use cases — manual freezing, external signing, custom node selection.

```typescript
// Build without executing (for external signing flows)
const frozen = await hiero.buildTransaction("transfer", {
  to: "0.0.5678",
  amount: 100,
})

// Serialize for transport
const bytes = frozen.toBytes()

// Add externally-obtained signature
frozen.addSignature(externalPublicKey, externalSignature)

// Submit manually
const result = await hiero.submitTransaction(frozen)

// Or: complete low-level control via escape hatch
const rawClient = hiero.raw.client
const rawTx = new TransferTransaction()
  .addHbarTransfer(AccountId.fromString("0.0.1234"), new Hbar(-10))
  .addHbarTransfer(AccountId.fromString("0.0.5678"), new Hbar(10))
const response = await rawTx.execute(rawClient)
```

### 8.5 Level 4: Fluent Builders

For developers who prefer expressive, chainable construction over parameter objects.

```typescript
const token = await hiero
  .tokens()
  .name("Loyalty Points")
  .symbol("LOYAL")
  .decimals(2)
  .initialSupply(1_000_000)
  .treasuryAccount("0.0.1234")
  .adminKey(hiero.operatorPublicKey)
  .supplyKey(hiero.operatorPublicKey)
  .memo("Loyalty program token")
  .create()
```

Both `hiero.createToken({...})` and `hiero.tokens()...create()` produce identical
transactions through the same pipeline. Two syntaxes, one behavior.

---

## 9. Transaction Actions

### 9.1 Action Signature

Every action follows the same contract:

```typescript
type Action<TParams, TResult> = (
  client: HieroClient,
  params: TParams,
) => Promise<SdkResult<TResult>>
```

When called as a method on the client (`hiero.transfer(...)`), the client parameter
is bound automatically.

### 9.2 Crypto Actions

```typescript
// Transfer HBAR
await hiero.transfer({
  to: "0.0.5678",
  amount: 10,               // number = HBAR, Hbar instance also accepted
  memo: "Payment for services",
})

// Transfer HBAR to multiple recipients
await hiero.transfer({
  transfers: [
    { to: "0.0.5678", amount: 5 },
    { to: "0.0.9012", amount: 5 },
  ],
  memo: "Split payment",
})

// Create account
const result = await hiero.createAccount({
  initialBalance: 10,
  memo: "Service account",
  maxAutoTokenAssociations: 10,
})
if (result.success) {
  console.log(result.data.accountId) // EntityId
}

// Update account
await hiero.updateAccount({
  accountId: "0.0.1234",
  memo: "Updated memo",
  maxAutoTokenAssociations: 50,
})

// Delete account (transfer remaining balance)
await hiero.deleteAccount({
  accountId: "0.0.1234",
  transferTo: "0.0.5678",
})

// Approve HBAR/token allowance
await hiero.approveAllowance({
  ownerAccountId: "0.0.1234",
  spenderAccountId: "0.0.5678",
  amount: 50, // HBAR
})
```

### 9.3 Token Actions (HTS)

```typescript
// Create fungible token
const token = await hiero.createToken({
  name: "Loyalty Points",
  symbol: "LOYAL",
  decimals: 2,
  initialSupply: 1_000_000,
  treasury: "0.0.1234",      // defaults to operator if omitted
  adminKey: true,             // true = use operator key
  supplyKey: true,
  freezeDefault: false,
})

// Create NFT collection
const nft = await hiero.createToken({
  name: "Art Collection",
  symbol: "ART",
  type: "NON_FUNGIBLE_UNIQUE",
  maxSupply: 10_000,
  supplyKey: true,
  treasury: "0.0.1234",
})

// Mint tokens
await hiero.mintToken({
  tokenId: "0.0.TOKEN",
  amount: 500,
})

// Mint NFTs (with metadata)
await hiero.mintToken({
  tokenId: "0.0.NFT",
  metadata: [
    Buffer.from("ipfs://QmXxx..."),
    Buffer.from("ipfs://QmYyy..."),
  ],
})

// Transfer tokens
await hiero.transferToken({
  tokenId: "0.0.TOKEN",
  to: "0.0.5678",
  amount: 100,
})

// Transfer NFT
await hiero.transferNft({
  tokenId: "0.0.NFT",
  serialNumber: 1,
  to: "0.0.5678",
})

// Associate token with account
await hiero.associateToken({
  accountId: "0.0.5678",
  tokenIds: ["0.0.TOKEN1", "0.0.TOKEN2"],
})

// Full token lifecycle
await hiero.burnToken({ tokenId: "0.0.TOKEN", amount: 50 })
await hiero.wipeToken({ tokenId: "0.0.TOKEN", accountId: "0.0.5678", amount: 10 })
await hiero.freezeToken({ tokenId: "0.0.TOKEN", accountId: "0.0.5678" })
await hiero.unfreezeToken({ tokenId: "0.0.TOKEN", accountId: "0.0.5678" })
await hiero.pauseToken({ tokenId: "0.0.TOKEN" })
await hiero.unpauseToken({ tokenId: "0.0.TOKEN" })
await hiero.grantKyc({ tokenId: "0.0.TOKEN", accountId: "0.0.5678" })
await hiero.revokeKyc({ tokenId: "0.0.TOKEN", accountId: "0.0.5678" })
await hiero.deleteToken({ tokenId: "0.0.TOKEN" })
```

### 9.4 Consensus Actions (HCS)

```typescript
// Create topic
const topic = await hiero.createTopic({
  memo: "Audit log",
  submitKey: true,             // true = operator key
  adminKey: true,
})

// Submit message (string)
await hiero.submitMessage({
  topicId: "0.0.TOPIC",
  message: "Hello, consensus!",
})

// Submit structured message (auto-serialized to JSON)
await hiero.submitMessage({
  topicId: "0.0.TOPIC",
  message: { event: "user.signup", userId: "abc123", timestamp: Date.now() },
})

// Submit large message (auto-chunked for messages > 1024 bytes)
await hiero.submitMessage({
  topicId: "0.0.TOPIC",
  message: largePayload,
})

// Update topic
await hiero.updateTopic({
  topicId: "0.0.TOPIC",
  memo: "Audit log v2",
})

// Delete topic
await hiero.deleteTopic({ topicId: "0.0.TOPIC" })
```

### 9.5 Smart Contract Actions

```typescript
// Deploy contract
const contract = await hiero.deployContract({
  bytecode: "0x608060...",
  gas: 100_000,                // or omit for auto-estimation
  constructorParams: {
    types: ["string", "uint256"],
    values: ["Hello", 42],
  },
  adminKey: true,
  memo: "MyContract v1",
})

// Execute contract function (state-changing, costs gas)
await hiero.executeContract({
  contractId: "0.0.CONTRACT",
  functionName: "transfer",
  functionParams: {
    types: ["address", "uint256"],
    values: ["0.0.5678", 100],
  },
  gas: 50_000,
})

// Call contract (read-only, free, via Mirror Node)
const result = await hiero.callContract({
  contractId: "0.0.CONTRACT",
  functionName: "balanceOf",
  functionParams: {
    types: ["address"],
    values: ["0.0.1234"],
  },
})

// Deploy with gas estimation (Mirror Node POST /api/v1/contracts/call with estimate: true)
const contract = await hiero.deployContract({
  bytecode: "0x608060...",
  gasEstimate: true,           // runs Mirror Node gas estimation
  constructorParams: { types: ["string"], values: ["Hello"] },
})
```

### 9.6 Schedule Actions

```typescript
// Schedule a transaction for later execution
const scheduled = await hiero.scheduleTransaction({
  transaction: {
    type: "transfer",
    params: { to: "0.0.5678", amount: 100 },
  },
  expirationTime: new Date("2026-04-01"),
  memo: "Scheduled payment",
  waitForExpiry: false,
})

// Add signature to scheduled transaction (multi-sig flow)
await hiero.signSchedule({
  scheduleId: "0.0.SCHEDULE",
})

// Delete scheduled transaction
await hiero.deleteSchedule({
  scheduleId: "0.0.SCHEDULE",
})
```

### 9.7 File Actions

```typescript
await hiero.createFile({
  contents: Buffer.from("Hello, Hiero!"),
  memo: "My file",
})

await hiero.appendFile({
  fileId: "0.0.FILE",
  contents: Buffer.from(" More content."),
})

await hiero.deleteFile({ fileId: "0.0.FILE" })
```

### 9.8 Multi-Signature Support

```typescript
// Transaction requiring multiple signatures
const result = await hiero.transfer({
  to: "0.0.5678",
  amount: 100,
  signers: [secondaryKey, tertiaryKey],
})

// Or: freeze for external signing
const frozen = await hiero.buildTransaction("transfer", {
  to: "0.0.5678",
  amount: 100,
})

// Serialize → send to another party → receive signature back
const bytes = frozen.toBytes()
frozen.addSignature(otherPublicKey, otherSignature)

const result = await hiero.submitTransaction(frozen)
```

---

## 10. Resource Builders (Fluent API)

For developers who prefer chainable, prose-like construction:

### 10.1 Token Builder

```typescript
const token = await hiero
  .tokens()
  .name("Loyalty Points")
  .symbol("LOYAL")
  .decimals(2)
  .initialSupply(1_000_000)
  .treasuryAccount("0.0.1234")
  .adminKey(hiero.operatorPublicKey)
  .supplyKey(hiero.operatorPublicKey)
  .freezeDefault(false)
  .memo("Loyalty program token")
  .create()
```

### 10.2 Topic Builder

```typescript
const topic = await hiero
  .topics()
  .memo("Audit events")
  .submitKey(hiero.operatorPublicKey)
  .adminKey(hiero.operatorPublicKey)
  .autoRenewAccount("0.0.1234")
  .autoRenewPeriod(7776000)
  .create()
```

### 10.3 Account Builder

```typescript
const account = await hiero
  .accounts()
  .initialBalance(50)
  .memo("Service account")
  .maxAutoTokenAssociations(100)
  .receiverSignatureRequired(false)
  .create()
```

### 10.4 Contract Builder

```typescript
const contract = await hiero
  .contracts()
  .bytecode(compiledBytecode)
  .gas(200_000)
  .constructorParams(["Hello", 42])
  .adminKey(hiero.operatorPublicKey)
  .memo("MyContract v1.0")
  .autoRenewPeriod(7776000)
  .deploy()
```

Every builder's terminal method (`.create()`, `.deploy()`) flows through the same
transaction pipeline as direct action calls. Builders are syntax sugar, not a
separate code path.

---

## 11. Mirror Node Integration

### 11.1 Balance Queries with Source Selection

The `AccountBalanceQuery` is planned for deprecation in the Hiero SDK. The SDK
defaults to Mirror Node for balance queries — free and fast — but provides an
explicit `source` option for developers who need real-time consensus data.

```typescript
// Default: Mirror Node (free, fast, sufficient for most applications)
const balance = await hiero.getBalance({ accountId: "0.0.1234" })

// Explicit: consensus node (real-time, costs HBAR)
const balance = await hiero.getBalance({
  accountId: "0.0.1234",
  source: "consensus",
})
```

Most applications never need consensus-sourced balances. The Mirror Node default
respects developer resources while the option preserves access for arbitrage,
high-frequency trading, or other latency-sensitive use cases.

### 11.2 Unified Query Client

The `hiero.mirror` property exposes a fluent query interface built on top of
`@hieco/mirror`'s `MirrorNodeClient`. The SDK uses **plural** naming
(`hiero.mirror.accounts`, `hiero.mirror.tokens`) to distinguish the fluent query
API from `@hieco/mirror`'s singular domain APIs (`client.account`, `client.token`).
Both are accessible — the fluent API is sugar, the raw client is the escape hatch.

```typescript
// Direct access
const account = await hiero.mirror.accounts.get("0.0.1234")
const tokens = await hiero.mirror.tokens.list({ limit: 10 })

// Fluent query builder
const richAccounts = await hiero.mirror
  .accounts()
  .balance.gte(1000_00000000)
  .order("desc")
  .limit(25)
  .get()

// Pagination with AsyncIterable
for await (const tx of hiero.mirror.transactions().account("0.0.1234").all()) {
  console.log(tx.transaction_id)
}

// Topic messages with filtering
const messages = await hiero.mirror
  .topics("0.0.TOPIC")
  .messages()
  .sequenceNumber.gte(100)
  .limit(50)
  .get()
```

### 11.3 Relationship Loading (Planned — v0.2)

> **Postponed:** Relationship loading requires parallel Mirror Node requests and
> response stitching. While feasible, it adds implementation complexity without
> solving an urgent pain point — developers can make two calls today. This will be
> added in v0.2 after the core SDK stabilizes.

Inspired by Eloquent's eager loading, the planned API:

```typescript
// Load account with related data in parallel
const account = await hiero.mirror.accounts.get("0.0.1234", {
  with: ["tokens", "nfts"],
})
// account.tokens → Token[]
// account.nfts → Nft[]
```

### 11.4 Query Builder Interface

The fluent query builder is a thin facade over `@hieco/mirror`'s existing domain
APIs (`AccountApi`, `TokenApi`, etc.) and their internal `QueryBuilder`. It
translates chainable method calls into query parameters that are passed to the
underlying API methods.

```typescript
interface MirrorQueryBuilder<T> {
  // Filtering
  eq(value: T): this
  ne(value: T): this
  gt(value: T): this
  gte(value: T): this
  lt(value: T): this
  lte(value: T): this

  // Sorting & pagination
  order(direction: "asc" | "desc"): this
  limit(count: number): this
  after(cursor: string): this

  // Timestamp filtering
  timestamp: {
    gt(ts: string | Date | number): MirrorQueryBuilder<T>
    gte(ts: string | Date | number): MirrorQueryBuilder<T>
    lt(ts: string | Date | number): MirrorQueryBuilder<T>
    lte(ts: string | Date | number): MirrorQueryBuilder<T>
  }

  // Terminal methods
  get(): Promise<ApiResult<readonly T[]>>
  first(): Promise<ApiResult<T>>
  all(): AsyncIterable<T>    // delegates to @hieco/mirror CursorPaginator
}
```

---

## 12. Type System & Inference

TypeScript is not just supported — it is the primary interface. The type system
teaches developers the API through autocomplete and compile-time feedback.

### 12.1 Entity ID as Template Literal

```typescript
// From @hieco/types — enforced at the type level
type EntityId = `${number}.${number}.${number}`

// These compile
const a: EntityId = "0.0.1234"
const b: EntityId = "0.0.5678"

// These do not compile
const c: EntityId = "0.0"         // Error: not enough segments
const d: EntityId = "abc.0.1234"  // Error: not a number
```

### 12.2 Params Types — Self-Documenting

```typescript
interface TransferParams {
  readonly to?: EntityId
  readonly amount?: number | Hbar
  readonly transfers?: readonly TransferEntry[]
  readonly memo?: string
  readonly maxFee?: number
  readonly signers?: readonly PrivateKey[]
  readonly retry?: RetryConfig | false
  readonly nodeAccountIds?: readonly EntityId[]
}

interface TransferEntry {
  readonly to: EntityId
  readonly amount: number | Hbar
}
```

The type system enforces that you provide either `to` + `amount` or `transfers`,
but not both. TypeScript autocomplete shows every available field with its type.

### 12.3 Discriminated Result Types

```typescript
type SdkResult<T> = ApiResult<T, SdkError>

// ApiResult from @hieco/types:
type ApiResult<T, E = ApiError> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E }
```

After checking `result.success`, TypeScript narrows the type automatically:

```typescript
const result = await hiero.createToken({...})

if (result.success) {
  result.data.tokenId   // EntityId ✓ (narrowed to success branch)
  result.data.status     // string ✓
  result.error           // Error: property 'error' does not exist ✓
} else {
  result.error._tag      // SdkError["_tag"] ✓ (narrowed to error branch)
  result.data            // Error: property 'data' does not exist ✓
}
```

### 12.4 Transaction Type Map (Conditional Types)

```typescript
type TransactionType =
  | "transfer"
  | "createAccount"
  | "createToken"
  | "mintToken"
  | "createTopic"
  | "submitMessage"
  | "deployContract"
  | "executeContract"
  | "scheduleTransaction"
  // ... all transaction types

// Maps transaction type → params type
interface TransactionParamsMap {
  transfer: TransferParams
  createAccount: CreateAccountParams
  createToken: CreateTokenParams
  mintToken: MintTokenParams
  createTopic: CreateTopicParams
  submitMessage: SubmitMessageParams
  deployContract: DeployContractParams
  executeContract: ExecuteContractParams
  scheduleTransaction: ScheduleTransactionParams
  // ...
}

// Maps transaction type → result type
interface TransactionResultMap {
  transfer: TransferReceipt
  createAccount: AccountReceipt
  createToken: TokenReceipt
  mintToken: MintReceipt
  createTopic: TopicReceipt
  submitMessage: MessageReceipt
  deployContract: ContractReceipt
  executeContract: ContractExecuteReceipt
  scheduleTransaction: ScheduleReceipt
  // ...
}
```

This enables fully typed generic methods:

```typescript
// buildTransaction infers both params and result from the type string
const frozen = await hiero.buildTransaction("transfer", {
  to: "0.0.5678",  // TypeScript knows this must be TransferParams
  amount: 10,
})

// The event system uses the same map for typed payloads
hiero.on("transaction:transfer:confirmed", (event) => {
  event.receipt.status  // TypeScript knows this is TransferReceipt
})
```

### 12.5 Builder Return Type Inference

Fluent builders use `this` return types for chaining, and the terminal method
returns the correct `SdkResult`:

```typescript
class TokenBuilder {
  name(value: string): this { /* ... */ }
  symbol(value: string): this { /* ... */ }
  decimals(value: number): this { /* ... */ }
  // ...
  create(): Promise<SdkResult<TokenReceipt>> { /* ... */ }
}
```

Autocomplete at every step shows only the methods available on `TokenBuilder`.
The terminal `.create()` returns the specific receipt type.

---

## 13. Error Handling

### 13.1 Enhanced Error Types

Building on `@hieco/types`' `ApiError` pattern with `_tag` discrimination:

```typescript
type SdkError =
  | { readonly _tag: "TransactionError"; readonly status: string; readonly transactionId: string; readonly message: string }
  | { readonly _tag: "InsufficientBalanceError"; readonly accountId: EntityId; readonly message: string }
  | { readonly _tag: "InvalidSignatureError"; readonly transactionId: string; readonly message: string }
  | { readonly _tag: "GasEstimationError"; readonly contractId: EntityId; readonly message: string }
  | { readonly _tag: "NetworkError"; readonly url: string; readonly statusCode: number; readonly message: string }
  | { readonly _tag: "TimeoutError"; readonly operation: string; readonly timeoutMs: number; readonly message: string }
  | { readonly _tag: "RateLimitError"; readonly retryAfterMs: number; readonly message: string }
  | { readonly _tag: "ConfigurationError"; readonly field: string; readonly message: string }
  | { readonly _tag: "InvalidEntityIdError"; readonly value: string; readonly message: string }
```

### 13.2 Human-Readable Error Messages

The SDK translates Hiero status codes into developer-friendly messages that explain
what happened and what to do. Error messages are generated from locally available
context only — the SDK never makes additional network requests during error handling.

```typescript
// Instead of: "Status: INVALID_SIGNATURE"
{
  _tag: "InvalidSignatureError",
  message: "Transaction 0.0.1234@1234567890.000000000 failed with INVALID_SIGNATURE. "
    + "The signatures provided did not satisfy the key requirements for this transaction. "
    + "Use hiero.mirror.accounts.get('0.0.1234') to inspect the account's key structure.",
  transactionId: "0.0.1234@1234567890.000000000",
}

// Instead of: "Status: INSUFFICIENT_PAYER_BALANCE"
{
  _tag: "InsufficientBalanceError",
  message: "Transaction failed with INSUFFICIENT_PAYER_BALANCE on account 0.0.1234. "
    + "The payer account does not have enough HBAR to cover the transaction fee. "
    + "Check the account balance with hiero.getBalance({ accountId: '0.0.1234' }).",
  accountId: "0.0.1234",
}

// Instead of: "Status: TOKEN_NOT_ASSOCIATED_TO_ACCOUNT"
{
  _tag: "TransactionError",
  status: "TOKEN_NOT_ASSOCIATED_TO_ACCOUNT",
  message: "Token 0.0.TOKEN is not associated with account 0.0.5678. "
    + "Call hiero.associateToken({ accountId: '0.0.5678', tokenIds: ['0.0.TOKEN'] }) first.",
  transactionId: "0.0.1234@1234567890.000000000",
}
```

The error messages reference SDK methods by name, so the developer can copy-paste
the suggested fix directly.

### 13.3 Type-Safe Error Narrowing

```typescript
const result = await hiero.transfer({ to: "0.0.5678", amount: 10 })

if (!result.success) {
  switch (result.error._tag) {
    case "InsufficientBalanceError":
      console.log(`Insufficient balance on ${result.error.accountId}`)
      break
    case "InvalidSignatureError":
      console.log(`Signature mismatch: ${result.error.message}`)
      break
    case "NetworkError":
      console.log(`Network issue: ${result.error.statusCode}`)
      break
    case "TimeoutError":
      console.log(`Timed out after ${result.error.timeoutMs}ms`)
      break
    default: {
      const _exhaustive: never = result.error
      // TypeScript ensures all cases are handled ^
    }
  }
}
```

### 13.4 Error Type Guards

SDK-specific type guards, consistent with `@hieco/mirror-shared`'s pattern but
operating on `SdkError` (not `ApiError`). These are separate from the `ApiError`
type guards in `@hieco/mirror-shared` because `SdkError` has different `_tag`
variants — they are not interchangeable.

```typescript
import {
  isInsufficientBalanceError,
  isInvalidSignatureError,
  isNetworkError,
  isRateLimitError,
} from "@hieco/sdk/errors"

const result = await hiero.transfer({ to: "0.0.5678", amount: 10 })

if (!result.success && isRateLimitError(result.error)) {
  await sleep(result.error.retryAfterMs)
  // retry...
}
```

---

## 14. Retry & Resilience

### 14.1 Built-in Retry with Exponential Backoff

Retry is enabled by default. Every transaction is automatically retried on known
transient errors.

```typescript
// Default retry configuration (applied automatically)
const hiero = createHieroClient()
// Equivalent to:
const hiero = createHieroClient({
  retry: {
    maxRetries: 3,
    initialDelayMs: 500,
    maxDelayMs: 10_000,
    backoffMultiplier: 2,
    jitter: true,
    retryableStatuses: [
      "BUSY",
      "PLATFORM_TRANSACTION_NOT_CREATED",
      "PLATFORM_NOT_ACTIVE",
    ],
  },
})
```

### 14.2 Per-Transaction Override

```typescript
// More retries for critical transactions
await hiero.transfer({
  to: "0.0.5678",
  amount: 10,
  retry: { maxRetries: 5, maxDelayMs: 30_000 },
})

// No retry for idempotency-sensitive operations
await hiero.transfer({
  to: "0.0.5678",
  amount: 10,
  retry: false,
})
```

### 14.3 Retry Observability

The event system emits retry events so you can monitor retry behavior:

```typescript
hiero.on("transaction:retry", (event) => {
  console.warn(
    `Retrying ${event.type} (attempt ${event.attempt}/${event.maxRetries}): ${event.reason}`
  )
})
```

---

## 15. Event System

### 15.1 Transaction Lifecycle Events

```typescript
const unsubscribe = hiero.on("transaction:confirmed", (event) => {
  console.log(`${event.transactionId} confirmed: ${event.status}`)
})

hiero.on("transaction:transfer:confirmed", (event) => {
  console.log(`Transfer confirmed`)
})

hiero.on("transaction:error", (event) => {
  console.error(`${event.transactionId} failed: ${event.error._tag}`)
})

hiero.on("transaction:before", (event) => {
  console.log(`Executing ${event.type}...`)
})

hiero.on("transaction:retry", (event) => {
  console.warn(`Retry attempt ${event.attempt} for ${event.type}`)
})

unsubscribe()
```

### 15.2 Event Types

```typescript
type TransactionEvent =
  | "transaction:before"
  | "transaction:signed"
  | "transaction:submitted"
  | "transaction:confirmed"
  | "transaction:error"
  | "transaction:retry"
  | `transaction:${TransactionType}:before`
  | `transaction:${TransactionType}:confirmed`
  | `transaction:${TransactionType}:error`
```

### 15.3 Real-Time Subscriptions

The client provides two subscription mechanisms with honest transport boundaries:

**Topic Messages** — uses `TopicMessageQuery` from `@hiero-ledger/sdk` (gRPC
server-streaming to the mirror node). This is NOT a WebSocket subscription.

```typescript
// Topic message stream (via @hiero-ledger/sdk TopicMessageQuery, gRPC)
const unsubscribe = hiero.watchTopicMessages({
  topicId: "0.0.TOPIC",
  startTime: new Date("2026-01-01"),  // optional
  handler: (message) => {
    console.log(`Sequence ${message.sequenceNumber}: ${message.contents}`)
  },
  onError: (error) => {
    console.error("Subscription error:", error)
  },
})

// Stop listening
unsubscribe()
```

**Contract Logs** — uses `@hieco/realtime`'s `RelayWebSocketClient` with
`eth_subscribe("logs")`. Requires a JSON-RPC Relay WebSocket endpoint.

```typescript
// Contract event log stream (via @hieco/realtime, WebSocket eth_subscribe)
const unsubscribe = hiero.watchContractLogs({
  contractId: "0.0.CONTRACT",
  handler: (log) => {
    console.log(`Event: ${log.topics[0]}`)
  },
})
```

> **Why two mechanisms?** Topic messages use HCS gRPC streaming — a Hiero-native
> protocol with no WebSocket equivalent. Contract logs use Ethereum-compatible
> `eth_subscribe` over WebSocket. These are fundamentally different transport layers
> and the SDK does not pretend otherwise.

---

## 16. Facades (Static-like Access)

For scripts, CLIs, and quick prototypes where creating a client feels heavy:

```typescript
import { transfer, createToken, submitMessage } from "@hieco/sdk/facade"

// Auto-creates a singleton client from environment variables on first call
await transfer({ to: "0.0.5678", amount: 10 })
await createToken({ name: "Gold", symbol: "GLD", decimals: 8 })
await submitMessage({ topicId: "0.0.TOPIC", message: "Hello" })
```

Each facade function lazily initializes a module-scoped `HieroClient` on first
invocation using `createHieroClient()` with zero-config defaults. Ideal for
scripts that do one thing and exit.

---

## 17. React Integration (@hieco/sdk-react)

### 17.1 Provider

```tsx
import { HieroProvider, createHieroConfig } from "@hieco/sdk-react"

const config = createHieroConfig({
  network: "testnet",
  operator: {
    accountId: "0.0.1234",
    privateKey: "302e...",
  },
})

function App() {
  return (
    <HieroProvider config={config}>
      <MyApp />
    </HieroProvider>
  )
}
```

### 17.2 Transaction Mutation Hooks

Following the wagmi `useWriteContract` pattern:

```tsx
import { useTransfer, useCreateToken } from "@hieco/sdk-react"

function TransferButton() {
  const { mutate, isPending, isSuccess, error, data } = useTransfer()

  return (
    <button
      disabled={isPending}
      onClick={() => mutate({ to: "0.0.5678", amount: 10 })}
    >
      {isPending ? "Sending..." : "Send 10 HBAR"}
    </button>
  )
}

function CreateTokenForm() {
  const { mutateAsync } = useCreateToken()

  async function handleSubmit(values: TokenFormValues) {
    const result = await mutateAsync({
      name: values.name,
      symbol: values.symbol,
      decimals: values.decimals,
      initialSupply: values.supply,
    })
    if (result.success) {
      console.log(`Created token: ${result.data.tokenId}`)
    }
  }

  return <form onSubmit={handleSubmit}>{/* ... */}</form>
}
```

### 17.3 Hook Return Type

```typescript
interface UseTransactionResult<TData, TParams> {
  readonly mutate: (params: TParams) => void
  readonly mutateAsync: (params: TParams) => Promise<SdkResult<TData>>
  readonly data: TData | undefined
  readonly error: SdkError | null
  readonly status: "idle" | "pending" | "success" | "error"
  readonly isIdle: boolean
  readonly isPending: boolean
  readonly isSuccess: boolean
  readonly isError: boolean
  readonly reset: () => void
  readonly transactionId: string | undefined
}
```

### 17.4 Re-exported Mirror Hooks

`@hieco/sdk-react` re-exports all hooks from `@hieco/mirror-react` — developers
have a single import source for both reads and writes:

```tsx
import {
  // Writes (new, from @hieco/sdk-react)
  useTransfer,
  useCreateToken,
  useSubmitMessage,
  // Reads (re-exported from @hieco/mirror-react)
  useAccountInfo,
  useAccountBalances,
  useTokenInfo,
  // Provider (unified)
  HieroProvider,
} from "@hieco/sdk-react"
```

### 17.5 Subscription Hooks

```tsx
import { useTopicMessages, useContractLogs } from "@hieco/sdk-react"

function AuditLog() {
  const { messages, isConnected } = useTopicMessages({
    topicId: "0.0.TOPIC",
  })

  return (
    <ul>
      {messages.map((msg) => (
        <li key={msg.sequenceNumber}>{msg.contents}</li>
      ))}
    </ul>
  )
}
```

> **Note:** `useTopicMessages` uses `TopicMessageQuery` (gRPC) internally.
> `useContractLogs` uses `@hieco/realtime` (WebSocket `eth_subscribe`). These are
> different transport layers and have different connection lifecycle characteristics.
```

### 17.6 Hooks for Every Action

| Hook | Params | Return |
|---|---|---|
| `useTransfer` | `TransferParams` | `UseTransactionResult<TransferReceipt>` |
| `useCreateAccount` | `CreateAccountParams` | `UseTransactionResult<AccountReceipt>` |
| `useCreateToken` | `CreateTokenParams` | `UseTransactionResult<TokenReceipt>` |
| `useMintToken` | `MintTokenParams` | `UseTransactionResult<MintReceipt>` |
| `useBurnToken` | `BurnTokenParams` | `UseTransactionResult<TransactionReceipt>` |
| `useTransferToken` | `TransferTokenParams` | `UseTransactionResult<TransactionReceipt>` |
| `useAssociateToken` | `AssociateTokenParams` | `UseTransactionResult<TransactionReceipt>` |
| `useCreateTopic` | `CreateTopicParams` | `UseTransactionResult<TopicReceipt>` |
| `useSubmitMessage` | `SubmitMessageParams` | `UseTransactionResult<MessageReceipt>` |
| `useDeployContract` | `DeployContractParams` | `UseTransactionResult<ContractReceipt>` |
| `useExecuteContract` | `ExecuteContractParams` | `UseTransactionResult<ContractExecuteReceipt>` |
| `useOperator` | — | `{ accountId, publicKey, network }` |
| `useTopicMessages` | `{ topicId }` | `{ messages, isConnected }` (via gRPC `TopicMessageQuery`) |
| `useContractLogs` | `{ contractId }` | `{ logs, isConnected }` (via WebSocket `eth_subscribe`) |

---

## 18. Tree-Shaking & Bundle Size

### 18.1 Entry Point Strategy

```
@hieco/sdk                   → createHieroClient, HieroClient, core types, privateKeySigner
@hieco/sdk/signer            → Signer interface, privateKeySigner, fromHieroSigner adapter
@hieco/sdk/actions           → all action functions
@hieco/sdk/actions/crypto    → transfer, createAccount, updateAccount, deleteAccount
@hieco/sdk/actions/token     → createToken, mintToken, burnToken, transferToken, ...
@hieco/sdk/actions/consensus → createTopic, submitMessage, deleteTopic, updateTopic
@hieco/sdk/actions/contract  → deployContract, executeContract, callContract
@hieco/sdk/actions/schedule  → scheduleTransaction, signSchedule, deleteSchedule
@hieco/sdk/actions/file      → createFile, appendFile, deleteFile
@hieco/sdk/builders          → TokenBuilder, TopicBuilder, AccountBuilder, ContractBuilder
@hieco/sdk/mirror            → MirrorQueryClient, query builders
@hieco/sdk/events            → event types, typed emitter
@hieco/sdk/middleware         → retryMiddleware, loggingMiddleware, gasEstimationMiddleware
@hieco/sdk/errors            → SdkError, type guards, error factories
@hieco/sdk/facade            → singleton facades
```

### 18.2 Bundle Impact

`@hiero-ledger/sdk` is a peer dependency — it is not bundled into `@hieco/sdk`.
The SDK's own code is lightweight wrapper logic (type conversions, pipeline
orchestration, middleware), not heavy cryptographic implementations.

Precise bundle size estimates will be measured after the initial implementation.
The tree-shakable entry points ensure that unused action modules are eliminated
by bundlers.

### 18.3 Side Effects Declaration

```json
{
  "sideEffects": false
}
```

Every module is pure. No top-level side effects. Bundlers can safely eliminate
unused exports.

---

## 19. Compatibility with Existing @hieco Packages

### 19.1 Non-Breaking Integration

`@hieco/sdk` wraps existing packages — it does not replace them:

```
@hieco/sdk uses @hieco/mirror (not replaces)
@hieco/sdk uses @hieco/realtime (not replaces)
@hieco/sdk uses @hieco/types (not replaces)
@hieco/sdk-react uses @hieco/mirror-react (re-exports, not replaces)
```

Developers already using `@hieco/mirror` can adopt `@hieco/sdk` incrementally.
Both packages can coexist in the same project.

### 19.2 Interoperability

```typescript
import { createHieroClient } from "@hieco/sdk"
import { createMirrorNodeClient } from "@hieco/mirror"

const hiero = createHieroClient()

// Access the underlying @hieco/mirror client
const mirrorClient: MirrorNodeClient = hiero.raw.mirrorClient

// Or use @hieco/mirror independently (still works)
const mirror = createMirrorNodeClient("testnet")
const account = await mirror.account.getInfo("0.0.1234")
```

### 19.3 Shared Type Foundation

All types flow from `@hieco/types`:

- `EntityId` — template literal type `${number}.${number}.${number}`
- `ApiResult<T, E>` — discriminated success/error union
- `ApiError` — tagged union with `_tag` discriminant
- `NetworkType` — `"mainnet" | "testnet" | "previewnet"`
- `PaginationParams` — shared pagination interface

`@hieco/sdk` extends these (never replaces):

```typescript
export type { EntityId, ApiResult, NetworkType } from "@hieco/types"
export type { SdkError, SdkResult, TransactionReceipt, TokenReceipt, ... }
```

---

## 20. Package Structure

```
packages/sdk/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    # createHieroClient, HieroClient, core types
│   ├── client.ts                   # HieroClient implementation
│   ├── config.ts                   # Configuration resolution (env vars, defaults)
│   ├── environment.ts              # Runtime environment detection (Node vs browser)
│   ├── types.ts                    # SDK-specific types (params, receipts, events)
│   ├── signer/
│   │   ├── index.ts                # Signer interface, privateKeySigner, fromHieroSigner
│   │   ├── types.ts                # Signer interface definition
│   │   ├── private-key-signer.ts   # Built-in private key signer (auto-detects format)
│   │   └── from-hiero-signer.ts    # Adapter: Hiero SDK Signer → @hieco/sdk Signer
│   ├── actions/
│   │   ├── index.ts                # Re-exports all actions + action set decorators
│   │   ├── crypto.ts               # transfer, createAccount, updateAccount, deleteAccount
│   │   ├── token.ts                # createToken, mintToken, burnToken, transferToken, ...
│   │   ├── consensus.ts            # createTopic, submitMessage, deleteTopic, updateTopic
│   │   ├── contract.ts             # deployContract, executeContract, callContract
│   │   ├── schedule.ts             # scheduleTransaction, signSchedule, deleteSchedule
│   │   └── file.ts                 # createFile, appendFile, deleteFile
│   ├── builders/
│   │   ├── index.ts
│   │   ├── token-builder.ts
│   │   ├── topic-builder.ts
│   │   ├── account-builder.ts
│   │   └── contract-builder.ts
│   ├── mirror/
│   │   ├── index.ts
│   │   └── query-client.ts         # MirrorQueryClient wrapping @hieco/mirror
│   ├── pipeline/
│   │   ├── index.ts
│   │   ├── executor.ts             # Transaction pipeline orchestrator
│   │   └── resolver.ts             # Params → native transaction resolver
│   ├── events/
│   │   ├── index.ts
│   │   └── emitter.ts              # Typed event emitter
│   ├── middleware/
│   │   ├── index.ts
│   │   ├── retry.ts                # Retry with exponential backoff + jitter
│   │   ├── logging.ts              # Transaction lifecycle logging
│   │   └── gas-estimation.ts       # Auto gas estimation (Mirror Node default + dry-run escalation)
│   ├── errors/
│   │   ├── index.ts
│   │   ├── types.ts                # SdkError discriminated union
│   │   ├── guards.ts               # Type guard functions
│   │   └── messages.ts             # Human-readable error message generation
│   └── facade/
│       └── index.ts                # Singleton facades
└── tests/

packages/sdk-react/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                    # Re-exports everything
│   ├── provider.tsx                # HieroProvider
│   ├── context.ts                  # React context
│   └── hooks/
│       ├── index.ts
│       ├── use-transfer.ts
│       ├── use-create-token.ts
│       ├── use-mint-token.ts
│       ├── use-create-topic.ts
│       ├── use-submit-message.ts
│       ├── use-deploy-contract.ts
│       ├── use-execute-contract.ts
│       ├── use-operator.ts
│       ├── use-topic-messages.ts
│       └── use-contract-logs.ts
└── tests/
```

### package.json (SDK core)

```json
{
  "name": "@hieco/sdk",
  "version": "0.1.0",
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./signer": {
      "types": "./dist/signer/index.d.ts",
      "import": "./dist/signer/index.js"
    },
    "./actions": {
      "types": "./dist/actions/index.d.ts",
      "import": "./dist/actions/index.js"
    },
    "./actions/crypto": {
      "types": "./dist/actions/crypto.d.ts",
      "import": "./dist/actions/crypto.js"
    },
    "./actions/token": {
      "types": "./dist/actions/token.d.ts",
      "import": "./dist/actions/token.js"
    },
    "./actions/consensus": {
      "types": "./dist/actions/consensus.d.ts",
      "import": "./dist/actions/consensus.js"
    },
    "./actions/contract": {
      "types": "./dist/actions/contract.d.ts",
      "import": "./dist/actions/contract.js"
    },
    "./actions/schedule": {
      "types": "./dist/actions/schedule.d.ts",
      "import": "./dist/actions/schedule.js"
    },
    "./actions/file": {
      "types": "./dist/actions/file.d.ts",
      "import": "./dist/actions/file.js"
    },
    "./builders": {
      "types": "./dist/builders/index.d.ts",
      "import": "./dist/builders/index.js"
    },
    "./mirror": {
      "types": "./dist/mirror/index.d.ts",
      "import": "./dist/mirror/index.js"
    },
    "./events": {
      "types": "./dist/events/index.d.ts",
      "import": "./dist/events/index.js"
    },
    "./middleware": {
      "types": "./dist/middleware/index.d.ts",
      "import": "./dist/middleware/index.js"
    },
    "./errors": {
      "types": "./dist/errors/index.d.ts",
      "import": "./dist/errors/index.js"
    },
    "./facade": {
      "types": "./dist/facade/index.d.ts",
      "import": "./dist/facade/index.js"
    }
  },
  "peerDependencies": {
    "@hiero-ledger/sdk": ">=2.80.0"
  },
  "dependencies": {
    "@hieco/mirror": "workspace:*",
    "@hieco/realtime": "workspace:*",
    "@hieco/types": "workspace:*"
  },
  "devDependencies": {
    "@hiero-ledger/sdk": "^2.80.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 21. API Reference

### 21.1 Client

| Export | Type | Description |
|---|---|---|
| `createHieroClient(config?)` | `(config?: HieroClientConfig) => HieroClient` | Create a configured client |
| `HieroClient` | Interface | Client instance type |
| `HieroClientConfig` | Interface | Configuration options |
| `privateKeySigner(key)` | `(key: string) => Signer` | Create signer from private key (auto-detects format) |
| `fromHieroSigner(signer)` | `(signer: HieroSigner) => Signer` | Adapt a Hiero SDK `Signer` (e.g., WalletConnect `DAppSigner`) |
| `Signer` | Interface | Minimal signing interface (2 methods: `sign`, `getPublicKey`) |
| `GetBalanceParams` | Interface | Balance query params with `source` option |

### 21.2 Crypto Actions

| Export | Params | Result |
|---|---|---|
| `transfer` | `TransferParams` | `SdkResult<TransferReceipt>` |
| `createAccount` | `CreateAccountParams` | `SdkResult<AccountReceipt>` |
| `updateAccount` | `UpdateAccountParams` | `SdkResult<TransactionReceipt>` |
| `deleteAccount` | `DeleteAccountParams` | `SdkResult<TransactionReceipt>` |
| `approveAllowance` | `ApproveAllowanceParams` | `SdkResult<TransactionReceipt>` |

### 21.3 Token Actions

| Export | Params | Result |
|---|---|---|
| `createToken` | `CreateTokenParams` | `SdkResult<TokenReceipt>` |
| `mintToken` | `MintTokenParams` | `SdkResult<MintReceipt>` |
| `burnToken` | `BurnTokenParams` | `SdkResult<TransactionReceipt>` |
| `transferToken` | `TransferTokenParams` | `SdkResult<TransactionReceipt>` |
| `transferNft` | `TransferNftParams` | `SdkResult<TransactionReceipt>` |
| `associateToken` | `AssociateTokenParams` | `SdkResult<TransactionReceipt>` |
| `dissociateToken` | `DissociateTokenParams` | `SdkResult<TransactionReceipt>` |
| `freezeToken` | `FreezeTokenParams` | `SdkResult<TransactionReceipt>` |
| `unfreezeToken` | `UnfreezeTokenParams` | `SdkResult<TransactionReceipt>` |
| `grantKyc` | `GrantKycParams` | `SdkResult<TransactionReceipt>` |
| `revokeKyc` | `RevokeKycParams` | `SdkResult<TransactionReceipt>` |
| `pauseToken` | `PauseTokenParams` | `SdkResult<TransactionReceipt>` |
| `unpauseToken` | `UnpauseTokenParams` | `SdkResult<TransactionReceipt>` |
| `wipeToken` | `WipeTokenParams` | `SdkResult<TransactionReceipt>` |
| `deleteToken` | `DeleteTokenParams` | `SdkResult<TransactionReceipt>` |
| `updateToken` | `UpdateTokenParams` | `SdkResult<TransactionReceipt>` |
| `updateTokenFeeSchedule` | `UpdateTokenFeeScheduleParams` | `SdkResult<TransactionReceipt>` |

### 21.4 Consensus Actions

| Export | Params | Result |
|---|---|---|
| `createTopic` | `CreateTopicParams` | `SdkResult<TopicReceipt>` |
| `updateTopic` | `UpdateTopicParams` | `SdkResult<TransactionReceipt>` |
| `deleteTopic` | `DeleteTopicParams` | `SdkResult<TransactionReceipt>` |
| `submitMessage` | `SubmitMessageParams` | `SdkResult<MessageReceipt>` |

### 21.5 Contract Actions

| Export | Params | Result |
|---|---|---|
| `deployContract` | `DeployContractParams` | `SdkResult<ContractReceipt>` |
| `executeContract` | `ExecuteContractParams` | `SdkResult<ContractExecuteReceipt>` |
| `callContract` | `CallContractParams` | `SdkResult<ContractCallResult>` |
| `deleteContract` | `DeleteContractParams` | `SdkResult<TransactionReceipt>` |
| `updateContract` | `UpdateContractParams` | `SdkResult<TransactionReceipt>` |

### 21.6 Schedule Actions

| Export | Params | Result |
|---|---|---|
| `scheduleTransaction` | `ScheduleTransactionParams` | `SdkResult<ScheduleReceipt>` |
| `signSchedule` | `SignScheduleParams` | `SdkResult<TransactionReceipt>` |
| `deleteSchedule` | `DeleteScheduleParams` | `SdkResult<TransactionReceipt>` |

### 21.7 File Actions

| Export | Params | Result |
|---|---|---|
| `createFile` | `CreateFileParams` | `SdkResult<FileReceipt>` |
| `appendFile` | `AppendFileParams` | `SdkResult<TransactionReceipt>` |
| `updateFile` | `UpdateFileParams` | `SdkResult<TransactionReceipt>` |
| `deleteFile` | `DeleteFileParams` | `SdkResult<TransactionReceipt>` |

### 21.8 Builders

| Builder | Terminal | Result |
|---|---|---|
| `hiero.tokens()` | `.create()` | `SdkResult<TokenReceipt>` |
| `hiero.topics()` | `.create()` | `SdkResult<TopicReceipt>` |
| `hiero.accounts()` | `.create()` | `SdkResult<AccountReceipt>` |
| `hiero.contracts()` | `.deploy()` | `SdkResult<ContractReceipt>` |

### 21.9 Middleware

| Export | Description |
|---|---|
| `retryMiddleware(config?)` | Exponential backoff with jitter (default: enabled) |
| `loggingMiddleware(config?)` | Structured lifecycle logging |
| `gasEstimationMiddleware(config?)` | Gas estimation via Mirror Node REST API (`POST /api/v1/contracts/call` with `estimate: true`), or dry-run via `@hiero-ledger/sdk` |

---

## 22. Before & After

### Raw @hiero-ledger/sdk (35 lines)

```typescript
import {
  Client, PrivateKey, AccountId, TransferTransaction,
  Hbar, TokenCreateTransaction, TokenType, TokenSupplyType,
  TopicCreateTransaction, TopicMessageSubmitTransaction,
} from "@hiero-ledger/sdk"

const client = Client.forTestnet()
client.setOperator(
  AccountId.fromString(process.env.ACCOUNT_ID!),
  PrivateKey.fromStringED25519(process.env.PRIVATE_KEY!),
)

// Transfer HBAR
const transferTx = new TransferTransaction()
  .addHbarTransfer(AccountId.fromString("0.0.1234"), new Hbar(-10))
  .addHbarTransfer(AccountId.fromString("0.0.5678"), new Hbar(10))
  .setMaxTransactionFee(new Hbar(1))
const frozenTransfer = await transferTx.freezeWith(client)
const signedTransfer = await frozenTransfer.sign(PrivateKey.fromStringED25519(process.env.PRIVATE_KEY!))
const transferResponse = await signedTransfer.execute(client)
const transferReceipt = await transferResponse.getReceipt(client)

// Create Token
const tokenTx = new TokenCreateTransaction()
  .setTokenName("Loyalty Points")
  .setTokenSymbol("LOYAL")
  .setDecimals(2)
  .setInitialSupply(1000000)
  .setTreasuryAccountId(AccountId.fromString(process.env.ACCOUNT_ID!))
  .setAdminKey(PrivateKey.fromStringED25519(process.env.PRIVATE_KEY!).publicKey)
  .setSupplyKey(PrivateKey.fromStringED25519(process.env.PRIVATE_KEY!).publicKey)
  .setTokenType(TokenType.FungibleCommon)
  .setSupplyType(TokenSupplyType.Infinite)
  .setMaxTransactionFee(new Hbar(30))
const frozenToken = await tokenTx.freezeWith(client)
const signedToken = await frozenToken.sign(PrivateKey.fromStringED25519(process.env.PRIVATE_KEY!))
const tokenResponse = await signedToken.execute(client)
const tokenReceipt = await tokenResponse.getReceipt(client)

// Create Topic + Submit Message
const topicTx = new TopicCreateTransaction()
  .setTopicMemo("Audit log")
  .setSubmitKey(PrivateKey.fromStringED25519(process.env.PRIVATE_KEY!).publicKey)
const frozenTopic = await topicTx.freezeWith(client)
const signedTopic = await frozenTopic.sign(PrivateKey.fromStringED25519(process.env.PRIVATE_KEY!))
const topicResponse = await signedTopic.execute(client)
const topicReceipt = await topicResponse.getReceipt(client)

const msgTx = new TopicMessageSubmitTransaction()
  .setTopicId(topicReceipt.topicId!)
  .setMessage("Hello, consensus!")
const msgResponse = await msgTx.execute(client)
await msgResponse.getReceipt(client)
```

### @hieco/sdk (10 lines)

```typescript
import { createHieroClient } from "@hieco/sdk"

const hiero = createHieroClient()

await hiero.transfer({ to: "0.0.5678", amount: 10 })

const token = await hiero.createToken({
  name: "Loyalty Points",
  symbol: "LOYAL",
  decimals: 2,
  initialSupply: 1_000_000,
  supplyKey: true,
  adminKey: true,
})

const topic = await hiero.createTopic({ memo: "Audit log", submitKey: true })
await hiero.submitMessage({ topicId: topic.data.topicId, message: "Hello, consensus!" })
```

Same 3 operations. 35 lines → 10 lines. Every operation gets automatic retry,
typed results, human-readable errors, and event emission — for free.

---

## 23. Roadmap

### Phase 1: Client & Transaction Pipeline (Week 1-2)

- [ ] `createHieroClient` with env-var resolution and zero-config defaults
- [ ] Runtime environment detection (Node vs browser)
- [ ] `ConsensusTransport` wrapping `@hiero-ledger/sdk` Client
- [ ] Transaction pipeline: params → build → middleware → freeze → sign → execute → receipt → result
- [ ] Middleware system with composable `TransactionMiddleware` interface
- [ ] Retry middleware with exponential backoff + jitter (enabled by default)
- [ ] Logging middleware
- [ ] Typed event emitter for transaction lifecycle
- [ ] `SdkError` discriminated union with human-readable messages (local context only)
- [ ] Error type guards (`isInsufficientBalanceError`, `isTransactionError`, etc.)
- [ ] Crypto actions: `transfer`, `createAccount`, `updateAccount`, `deleteAccount`
- [ ] `Signer` interface + `privateKeySigner` with auto-detection (ED25519/ECDSA DER, raw hex) + `fromHieroSigner` adapter
- [ ] Browser operator requirement enforcement (`ConfigurationError` on missing operator)

### Phase 2: Token & Consensus Actions (Week 2-3)

- [ ] Token actions: full HTS lifecycle (17 actions — uses `TokenWipeTransaction`, not `TokenWipeAccountTransaction`)
- [ ] Consensus actions: `createTopic`, `submitMessage` with auto-chunking, `updateTopic`, `deleteTopic`
- [ ] Fluent resource builders: `TokenBuilder`, `TopicBuilder`, `AccountBuilder`
- [ ] Per-transaction retry override
- [ ] `approveAllowance` action

### Phase 3: Contracts, Schedules, Mirror & Composition (Week 3-4)

- [ ] Contract actions: `deployContract`, `executeContract`, `callContract`
- [ ] Gas estimation middleware (`"mirror"` via `POST /api/v1/contracts/call` with `{ "estimate": true }`, or `"dry-run"` via `ContractCallQuery`)
- [ ] Schedule actions: `scheduleTransaction`, `signSchedule`, `deleteSchedule`
- [ ] File actions: `createFile`, `appendFile`, `deleteFile`
- [ ] `ContractBuilder` fluent builder
- [ ] `MirrorQueryClient` with fluent query builder facade over `@hieco/mirror`
- [ ] Composable `client.extend()` pattern (viem-style decorator composition)
- [ ] Tree-shakable standalone action imports (`import { transfer } from "@hieco/sdk/actions"`)
- [ ] `watchTopicMessages` (gRPC via `TopicMessageQuery`)
- [ ] `watchContractLogs` (WebSocket via `@hieco/realtime` `eth_subscribe`)

### Phase 4: React Integration (Week 4-5)

- [ ] `@hieco/sdk-react` package
- [ ] `HieroProvider` and `createHieroConfig`
- [ ] Transaction mutation hooks: `useTransfer`, `useCreateToken`, `useMintToken`, `useCreateTopic`, `useSubmitMessage`, `useDeployContract`, `useExecuteContract`
- [ ] `useOperator` hook
- [ ] Re-export all `@hieco/mirror-react` hooks
- [ ] Facade module for script/CLI usage

### Phase 5: Polish & Documentation (Week 5-6)

- [ ] Subscription hooks: `useTopicMessages` (gRPC), `useContractLogs` (WebSocket)
- [ ] Multi-signature transaction flows (`buildTransaction` + `submitTransaction`)
- [ ] `TransactionParamsMap` / `TransactionResultMap` conditional type system
- [ ] Performance benchmarks vs raw `@hiero-ledger/sdk`
- [ ] Bundle size analysis and optimization
- [ ] API documentation

### Planned for v0.2 (Post-hackathon)

- [ ] Relationship loading (`.with("tokens", "nfts")` — parallel Mirror Node requests + response stitching)
- [ ] Mnemonic-to-signer convenience function
- [ ] Advanced gas estimation heuristics (auto-escalation based on contract analysis)
- [ ] Solid.js and Preact integration packages

---

## 24. Architectural Decisions

All previously-unresolved questions have been decided. Each decision is documented
below with its rationale.

### 24.1 Hiero SDK as Peer Dependency

**Decision:** `@hiero-ledger/sdk` is a `peerDependency`.

Tree-shaking and version deduplication are critical in a monorepo where multiple
packages (`@hieco/mirror`, `@hieco/realtime`) may interact with the same underlying
SDK. Bundling creates version conflicts and bloat. The install step is acceptable
friction — developers installing `@hieco/sdk` are already committed to Hedera
development and will have `@hiero-ledger/sdk` in their dependencies.

```bash
bun add @hieco/sdk @hiero-ledger/sdk
```

### 24.2 Gas Estimation: Mirror Node Default with Explicit Dry-Run Option

**Decision:** Default to Mirror Node REST API (`POST /api/v1/contracts/call` with
`{ "estimate": true }`) for gas estimation. Provide an explicit `"dry-run"` strategy
for developers who need it. No automatic escalation.

Mirror Node provides sufficient accuracy for standard contract calls with lower
latency than dry-run execution. Complex state-dependent transactions may need
dry-run for precision, but there is no reliable heuristic to detect this
automatically — the developer must choose. JSON-RPC Relay is not needed since
Mirror Node provides gas estimation directly.

```typescript
gasEstimationMiddleware({
  strategy: "mirror",        // "mirror" (default) | "dry-run"
  bufferPercent: 20,
})
```

The `"mirror"` strategy calls the Mirror Node REST API. The `"dry-run"` strategy
uses `ContractCallQuery` from `@hiero-ledger/sdk` to execute the contract locally
on a consensus node.

### 24.3 Unified Entry Point with Runtime Environment Detection

**Decision:** One import, multiple environments, seamless behavior. No separate
entry points.

The divergence between gRPC (Node) and gRPC-web (browser) is an implementation
detail developers should not manage. `@hieco/sdk` detects the environment at
runtime and instantiates the correct transport automatically. An explicit
`transport` configuration option is available for advanced users needing manual
override.

```typescript
// Works in both Node and browser — transport auto-detected
const hiero = createHieroClient()

// Manual override for edge cases
const hiero = createHieroClient({
  transport: "grpc-web",  // force gRPC-web even in Node (e.g., testing)
})
```

### 24.4 Signer Interface at the SDK Boundary

**Decision:** `@hieco/sdk` defines a minimal 2-method `Signer` interface and ships
a `fromHieroSigner()` adapter for ecosystem wallet integration. No dedicated wallet
connect package.

The SDK provides `privateKeySigner` for Node/scripts and `fromHieroSigner()` as a
bridge for any object implementing the Hiero SDK's full `Signer` interface. The
Hedera wallet ecosystem has standardized on `@hashgraph/hedera-wallet-connect` (used
by HashPack, Kabila, Dropp), which provides `DAppSigner` — a class implementing the
Hiero SDK's `Signer`. Blade Wallet shut down July 2025; its SDK is deprecated.

`@hieco/sdk` does NOT build wallet connectors, does NOT depend on wallet SDKs, and
does NOT ship wallet-specific signer implementations. The ecosystem already solved
wallet connectivity. Our job is to accept the result cleanly.

For custom integrations (HSMs, custodial services, MPC), developers implement the
2-method `Signer` interface directly — no 12-method fat interface to satisfy.

```typescript
interface Signer {
  sign(bytes: Uint8Array): Promise<Uint8Array>
  getPublicKey(): Promise<PublicKey>
}

// Built-in: private key signer (included in @hieco/sdk)
const hiero = createHieroClient({
  operator: {
    accountId: "0.0.1234",
    signer: privateKeySigner("302e020100..."),
  },
})

// Ecosystem wallet: WalletConnect DAppSigner → fromHieroSigner adapter
import { fromHieroSigner } from "@hieco/sdk"
import { DAppConnector } from "@hashgraph/hedera-wallet-connect"

const dAppConnector = new DAppConnector(metadata, ledgerId, projectId)
await dAppConnector.init()
const walletSigner = dAppConnector.getSigner(accountId)

const hiero = createHieroClient({
  operator: {
    accountId: accountId.toString(),
    signer: fromHieroSigner(walletSigner),
  },
})

// Custom: ad-hoc implementation for any signing backend
const hiero = createHieroClient({
  operator: {
    accountId: "0.0.1234",
    signer: {
      async sign(bytes) { return myHsm.sign(bytes) },
      async getPublicKey() { return myHsm.getPublicKey() },
    },
  },
})
```

### 24.5 Explicit Balance Query Source with Mirror Default

**Decision:** `source?: "mirror" | "consensus"` option with `"mirror"` as default.

Consensus queries cost HBAR and impose network load; Mirror Node queries are free
and faster. Defaulting to Mirror Node respects developer resources while the explicit
option preserves access to real-time consensus data when genuinely needed (arbitrage,
high-frequency trading).

```typescript
// Default: Mirror Node (free, fast)
const balance = await hiero.getBalance({ accountId: "0.0.1234" })

// Explicit: consensus node (real-time, costs HBAR)
const balance = await hiero.getBalance({
  accountId: "0.0.1234",
  source: "consensus",
})
```

### 24.6 Package Name: `@hieco/sdk`

**Decision:** `@hieco/sdk`, not `@hieco/core`.

The existing domain packages (`mirror`, `realtime`, `types`) are infrastructure
components. This package is the developer-facing entry point — the
"batteries-included" experience. "SDK" signals a complete toolkit; "core" implies
a foundation requiring additional assembly. The semantic distinction from existing
infrastructure packages is intentional and clear.

### 24.7 Environment-Aware Operator Configuration

**Decision:** Explicit `operator` config required in browser. Environment variable
fallback only in Node.

Security and predictability outweigh convenience. In Node environments only, if
`operator` is omitted, the SDK attempts to construct from `HIERO_OPERATOR_ID` and
`HIERO_PRIVATE_KEY` environment variables. In browser environments, omitting
`operator` throws an explicit `ConfigurationError` requiring operator configuration.
This prevents accidental private key exposure in client-side bundles and forces
intentional signer setup.

```typescript
// Node: zero-config (reads from process.env)
const hiero = createHieroClient()

// Browser: explicit operator required
const hiero = createHieroClient({
  operator: {
    accountId: "0.0.1234",
    signer: fromHieroSigner(walletSigner),  // or custom Signer implementation
  },
})

// Browser: omitting operator throws ConfigurationError
// "Operator configuration is required in browser environments.
//  Provide { operator: { accountId, signer } } to createHieroClient()."
```

---

## 25. Audit Log

This section documents changes made to the proposal after evidence-based auditing
against actual `@hiero-ledger/sdk` exports, Mirror Node REST API endpoints, existing
`@hieco/*` package implementations, and viem architectural patterns.

### Corrections (Factual Errors Fixed)

| Finding | Change |
|---|---|
| `TokenWipeAccountTransaction` doesn't exist in `@hiero-ledger/sdk` | Internal implementation must use `TokenWipeTransaction`. Action name `wipeToken` unchanged. |
| `AccountBalanceQuery` is NOT deprecated in SDK source (no `@deprecated` tag) | Changed "deprecated July 2026" to "planned for deprecation" throughout. |
| `POST /api/v1/contracts/estimateGas` does not exist | Gas estimation uses `POST /api/v1/contracts/call` with `{ "estimate": true }`. All references corrected. |
| `ThresholdKey` doesn't exist as a standalone class | Uses `KeyList` with `threshold` parameter: `new KeyList(keys, 2)`. |

### Deletions

| Feature | Reason |
|---|---|
| Unified `hiero.subscribe("topic:messages", {...})` API | `@hieco/realtime` only supports `eth_subscribe` (logs, newHeads). Topic subscriptions require `TopicMessageQuery` (gRPC) from `@hiero-ledger/sdk` — a completely different transport. Replaced with honest `watchTopicMessages()` and `watchContractLogs()` with documented transport boundaries. |
| `gasEstimationMiddleware` "auto" strategy with bytecode complexity detection | No reliable heuristic exists to detect when Mirror Node estimate will fail. Removed "auto", simplified to explicit `"mirror"` (default) or `"dry-run"`. |
| `count()` terminal method on `MirrorQueryBuilder` | Mirror Node REST API has no count endpoints. Would require fetching all results just to count them — deceptive API surface. |

### Simplifications

| Feature | Change |
|---|---|
| Human-readable error messages | Removed key structure fetching from error handling. Errors now use only locally available context (status code, transaction ID, account ID). Suggests diagnostic Mirror Node queries instead of performing them. |
| `SdkError` type | Removed `required`/`available` from `InsufficientBalanceError` and `expectedKeys`/`providedKeys` from `InvalidSignatureError` — these required additional network queries. |
| `MirrorQueryBuilder` | Added documentation that it's a facade over `@hieco/mirror`'s existing domain APIs, not a new implementation. Removed `with()` from query builder interface. |
| Private key auto-detection | Removed mnemonic auto-detection. Mnemonics require BIP-39 wordlist lookup — a different code path. Keep ED25519/ECDSA DER and raw hex detection only. |
| Bundle size estimates | Removed specific KB estimates (they were speculative). Replaced with commitment to measure after implementation. |

### Postponements (Moved to v0.2)

| Feature | Reason |
|---|---|
| Relationship loading (`.with("tokens", "nfts")`) | Requires parallel Mirror Node requests + response stitching. Feasible but adds implementation complexity without solving an urgent pain point. |
| Mnemonic-to-signer convenience function | Lower priority, clear workaround exists (`Mnemonic` from `@hiero-ledger/sdk`). |
| Advanced gas estimation heuristics | Needs real-world data on when Mirror Node estimates are insufficient. |
| Subscription hooks (`useTopicMessages`, `useContractLogs`) | Moved from Phase 4 to Phase 5 — the two different transport layers (gRPC vs WebSocket) add complexity that should not block core React hooks. |

### Consistency Fixes

| Finding | Change |
|---|---|
| `@hieco/mirror` uses singular (`client.account`), proposal uses plural (`hiero.mirror.accounts`) | Documented the intentional naming divergence with rationale in Section 11.2. |
| `SdkError` type guards incompatible with `@hieco/mirror-shared` `ApiError` guards | Added explicit documentation in Section 13.4 that SDK type guards are separate from `@hieco/mirror-shared` guards. |
| `RelayTransport` listed in key translations table | Removed — `@hieco/realtime` is used directly for WebSocket subscriptions, not through a separate transport abstraction. |
| `relay: RelayTransport` on `HieroClient` interface | Removed — same rationale as above. `watchContractLogs` manages its own connection. |
| `@hieco/connect` phantom package with `hashPackSigner`, `bladeSigner`, `metaMaskSigner` | Removed entirely. Blade Wallet shut down July 2025. Ecosystem standardized on `@hashgraph/hedera-wallet-connect` (`DAppSigner` implements Hiero SDK `Signer`). Added `fromHieroSigner()` adapter to bridge ecosystem signers to our minimal 2-method interface. Architecture diagram, developer journey, Section 6.2, Section 24.4, and all code examples updated. |
