---
title: SDK DX Masterplan for packages/sdk
category: proposal
---

# SDK DX Masterplan for packages/sdk

This document turns the capability gap analysis into a comprehensive, DX-first blueprint for the SDK in `packages/sdk`. The goal is a product-quality TypeScript SDK that can fully replace `@hiero-ledger/sdk` while making developers feel safe, confident, and genuinely happy building on Hiero/Hedera.

## North Star

Build the SDK developers reach for first and never want to leave.

- It feels clear and calming under pressure.
- It makes the right thing easy and the risky thing explicit.
- It scales from copy-paste demos to production systems without rewrites.
- It is fast, stable, and trustworthy by default.

## DX Pillars

1. Instant onboarding
2. Predictable outcomes
3. Confident error handling
4. Unified read and write experience
5. Flow-first workflows for real product needs
6. Safe power-user escape hatches
7. Excellent testing ergonomics
8. Great docs and examples that mirror real apps

## Capability Parity: Required to Replace @hiero-ledger/sdk

Coverage targets based on `packages/sdk/CAPABILITY_GAP_ANALYSIS.md`.

### Missing transactions to add

- `AccountAllowanceAdjustTransaction`
- `EthereumTransaction`
- `LiveHashAddTransaction`
- `LiveHashDeleteTransaction`
- `SystemDeleteTransaction`
- `SystemUndeleteTransaction`

### Missing queries to add

- `LiveHashQuery`

### Missing flows to add

- `EthereumFlow`
- `ContractCreateFlow`
- `AccountInfoFlow`
- `TokenRejectFlow`

### Missing client/runtime parity to add

- network factories: `forMainnet`, `forTestnet`, `forPreviewnet`, async variants
- `fromConfig`, `fromConfigFile`
- `setNetwork`, `setMirrorNetwork`, `setNetworkFromAddressBook`, `updateNetwork`
- `setOperator`, `setOperatorWith` parity
- `setMaxAttempts`, `setMaxNodeAttempts`, backoff and timeout tuning
- health probes: `ping`, `pingAll`

### Missing utility/model parity to add

- key primitives: `PrivateKey`, `PublicKey`, `Mnemonic`, `Key`, `KeyList`
- ID types: `AccountId`, `TokenId`, `NftId`, `TopicId`, `ContractId`, `FileId`, `ScheduleId`, `TransactionId`, `PendingAirdropId`, `EvmAddress`, `LedgerId`
- value types: `Hbar`, `HbarUnit`, fee and custom fee types
- result models: `TransactionReceipt`, `TransactionRecord`, `TransactionResponse`
- error classes: `PrecheckStatusError`, `ReceiptStatusError`, `MaxAttemptsOrTimeoutError`, `MaxQueryPaymentExceeded`

## Product-Quality API Design

The SDK should present a stable, expressive surface that matches how teams build: configure once, compose flows, read from mirror, and handle errors consistently.

### Entry Points

- `hiero(config)` for the simplified path
- `hiero.fromEnv()` for quick start and safe defaults
- `hiero.forTestnet()`, `hiero.forMainnet()`, `hiero.forPreviewnet()` for familiar parity
- `hiero.fromConfig(config)` and `hiero.fromConfigFile(path)` for production boot
- `hiero.raw()` for controlled access to upstream SDK when needed

### Configuration Model

Use one validated config shape that cleanly separates concerns.

- `network`: name, nodes, mirror, ledgerId
- `operator`: accountId, privateKey, or signer
- `transport`: timeouts, retries, backoff, grpc deadline
- `observability`: logger, tracing, hooks
- `safety`: requireOperator, requireMirror, allowLegacy

Validation should be a first-class feature:

- `hiero.validateConfig(config)` returns typed errors
- `hiero.explainConfig(config)` returns a human-friendly summary

### Two-Layer API Surface

1. Direct domain APIs: `client.accounts`, `client.tokens`, `client.contracts`, `client.hcs`, `client.files`, `client.schedules`, `client.network`, `client.transactions`
2. Fluent and flow layers on top of those domains: `client.fluent`, `client.flow`

This keeps simple things simple while enabling expressive workflows.

## Core Enhancements by Domain

### Wallets and Signers (P0)

Add first-class wallet and signer primitives to support onboarding and external signing.

- `client.wallet.fromPrivateKey()`
- `client.wallet.fromMnemonic()`
- `client.wallet.fromSigner()`
- `client.wallet.fromProvider()`
- `client.withWallet(wallet)`

Include `LocalProvider` and compatible adapters for HSM or browser wallets. This unlocks mobile, browser, and enterprise signing without custom glue.

### EVM Relay (P0)

Make EVM workflows feel natural.

- `client.evm.sendRaw({ signedTx })`
- `client.evm.populate({ to, data, value, gas, gasPrice })`
- `client.evm.wait(hash)`
- `client.evm.estimate({ to, data, value })`
- `client.evm.simulate({ to, data, value })`

Add `EthereumFlow` as a unified lifecycle path that returns `receipt`, `record`, and mirror link references.

### Network Health and Runtime Controls (P1)

Provide visible, predictable network behavior.

- `client.net.health()` returns node status and mirror status
- `client.net.pingAll()` measures latency and availability
- `client.net.refreshAddressBook()` updates node list
- `client.net.setNetwork({ nodes })` with validation

### Transport Policy (P1)

Expose safe, documented tuning.

- `transport.retries`, `transport.minBackoffMs`, `transport.maxBackoffMs`
- `transport.requestTimeoutMs`, `transport.grpcDeadlineMs`
- `transport.maxNodeAttempts`, `transport.maxAttempts`

Offer presets like `balanced`, `aggressive`, `conservative`.

### Allowance Lifecycle (P1)

Add missing allowance adjust and full lifecycle APIs.

- `accounts.allowances.adjust({ owner, spender, hbarDelta, tokenDeltas })`
- `accounts.allowances.list(owner)`
- `accounts.allowances.revoke({ owner, spender, tokenId?, nftId? })`
- `accounts.allowances.ensure({ owner, spender, hbar?, tokens?, nfts? })`

### Contract Deploy and Preflight (P1)

Deploy should be one clean action with built-in preflight.

- `contracts.deployArtifact({ abi, bytecode, constructorArgs, gasBuffer? })`
- `contracts.preflight({ id, fn, args, value })`
- `contracts.withAbi(abi).call(fn, args)`
- `contracts.withAbi(abi).execute(fn, args, options)`

### Mirror-First Reads (P1)

Unify read access behind a single, typed layer.

- `reads.accounts.history(accountId, params)`
- `reads.accounts.transfers(accountId, params)`
- `reads.tokens.balances(tokenId, params)`
- `reads.tokens.relationships(accountId, params)`
- `reads.tokens.transfers(tokenId, params)`
- `reads.contracts.results(contractId, params)`
- `reads.transactions.search(params)`

Add pagination helpers and normalized result shapes so teams do not build ad hoc REST clients.

### HCS Streaming (P1)

Make message streaming reliable and resilient.

- `hcs.watchFrom(topicId, { sinceSequence, sinceTimestamp, resume })`
- `hcs.submitJson({ topicId, data, chunkSize })`
- `hcs.batchSubmit({ topicId, messages, concurrency })`

### Files and Data Helpers (P1)

- `files.upload({ contents, chunkSize, keys, memo, maxFee })`
- `files.updateLarge({ fileId, contents, chunkSize })`
- `files.contentsText(fileId)`
- `files.contentsJson(fileId)`

### System Ops and Legacy (P2)

- `system.deleteEntity({ id, kind })`
- `system.undeleteEntity({ id, kind })`
- `legacy.liveHash.*` namespace to isolate deprecated features

## Fluent Layer

Add an optional, chainable layer that compiles to existing descriptors.

- `client.fluent.accounts.transfer()`
- `client.fluent.tokens.create()`
- `client.fluent.hcs.submit()`
- `client.fluent.contracts.execute()`
- `client.fluent.files.upload()`
- `client.fluent.schedules.create()`

Each builder supports:

- `params()` returns current params
- `descriptor()` returns a `TransactionDescriptor`
- `submit()` executes via the standard pipeline

The fluent layer must remain thin and deterministic.

## Flow Layer

Provide intent-driven, multi-step workflows that map to real app needs.

- `flow.tokenLaunchFixedSupply({ name, symbol, treasury, decimals, supply, customFees, distributeTo })`
- `flow.allowanceEnsure({ owner, spender, hbar, tokens, nfts })`
- `flow.fileUploadJson({ data, keys, memo, chunkSize })`
- `flow.contractWriteWithPreflight({ id, fn, args, value, gasBuffer })`
- `flow.hcsConsumeWithResume({ topicId, cursorStore, onMessage })`
- `flow.scheduleMultiParty({ tx, payer, signers, waitOptions })`
- `flow.accountBootstrap({ publicKey, initialHbar, tokenIds, memo })`

Every flow must provide a way to access the underlying descriptors and raw results.

## Error Handling and Results

Errors should be consistent, structured, and helpful.

- `Result<T>` for success or failure, no ambiguous exceptions
- `errors.classify(error)` returns `{ kind, status, retryable, message }`
- `errors.format(error)` returns a clear, human-readable string

Add error mapping for common cases with actionable suggestions.

## Observability and Safety

Provide hooks and logging that make production apps easy to debug.

- `client.on('transaction:submitted', handler)`
- `client.on('transaction:receipt', handler)`
- `client.on('network:refresh', handler)`
- `client.on('mirror:error', handler)`

Expose a `client.trace()` helper that returns correlated IDs for logs.

## Testing and Local Development

Make it easy to test without a network.

- `createMockClient()` for deterministic tests
- `createMirrorMock()` for read API tests
- `fixtures` for accounts, tokens, and contracts

Support a local node setup guide with a single command that validates configuration and connectivity.

## Documentation and Examples

Docs should teach the intent-first paths and eliminate guesswork.

### Required example set

- First transaction in 3 minutes
- Token launch with custom fees
- Contract deploy and preflight
- HCS consumer with resume
- Allowance lifecycle
- File upload and JSON retrieval
- Schedule multi-sig flow

All examples should be runnable, include expected outputs, and avoid hidden setup.

## Migration and Compatibility

Provide a deliberate migration path from `@hiero-ledger/sdk` and the current SDK API.

- `client.raw()` for edge-case power users
- compatibility guide with side-by-side API examples
- codemods for common migrations
- stable deprecation policy for any future changes

## Success Metrics

- 100 percent parity with `@hiero-ledger/sdk`
- 90 percent of common workflows achievable in three lines or fewer
- under 5 minutes from install to first successful receipt
- error messages rated helpful by users
- strong adoption in new projects and hackathon winners

## Roadmap

### Phase 0: Foundations

- config validation
- network presets
- improved error classification
- mirror-first read baseline

### Phase 1: Parity and Wallets

- missing transactions, queries, flows
- wallet/provider layer
- EVM relay surface

### Phase 2: DX and Flows

- fluent layer
- flow layer
- docs and examples

### Phase 3: Reliability and Observability

- transport policies
- health checks
- tracing hooks

### Phase 4: Adoption

- migration tooling
- sample apps
- community templates

## Final Promise

This SDK should feel like a trusted partner: clear, resilient, and joyful. The architecture above keeps the SDK lean at the core while delivering a rich, lovable experience for developers who build on Hiero/Hedera every day.
