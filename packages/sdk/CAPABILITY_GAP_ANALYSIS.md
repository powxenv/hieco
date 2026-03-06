# Hiero SDK Capability Audit and Gap Analysis

## Scope and Method

- Upstream audited target: `packages/sdk/node_modules/@hiero-ledger/sdk/src`
- Local SDK compared: `packages/sdk/src`
- Source-of-truth inventory from:
  - `packages/sdk/node_modules/@hiero-ledger/sdk/src/exports.js`
  - `packages/sdk/node_modules/@hiero-ledger/sdk/src/index.js`
  - `packages/sdk/node_modules/@hiero-ledger/sdk/src/browser.js`
  - `packages/sdk/node_modules/@hiero-ledger/sdk/src/client/Client.js`
  - `packages/sdk/node_modules/@hiero-ledger/sdk/src/client/NodeClient.js`
  - `packages/sdk/node_modules/@hiero-ledger/sdk/src/client/WebClient.js`
  - `packages/sdk/src/foundation/params.ts`
  - `packages/sdk/src/core/client.ts`
  - `packages/sdk/src/domains/*/namespace.ts`

## 1) Complete Upstream Functional Surface

### 1.1 Exported Transactions (53)

Account and transfer:

- `TransferTransaction`
- `AccountCreateTransaction`
- `AccountUpdateTransaction`
- `AccountDeleteTransaction`
- `AccountAllowanceAdjustTransaction`
- `AccountAllowanceApproveTransaction`
- `AccountAllowanceDeleteTransaction`
- `LiveHashAddTransaction`
- `LiveHashDeleteTransaction`

Token:

- `TokenCreateTransaction`
- `TokenUpdateTransaction`
- `TokenDeleteTransaction`
- `TokenMintTransaction`
- `TokenBurnTransaction`
- `TokenAssociateTransaction`
- `TokenDissociateTransaction`
- `TokenFreezeTransaction`
- `TokenUnfreezeTransaction`
- `TokenGrantKycTransaction`
- `TokenRevokeKycTransaction`
- `TokenPauseTransaction`
- `TokenUnpauseTransaction`
- `TokenWipeTransaction`
- `TokenFeeScheduleUpdateTransaction`
- `TokenAirdropTransaction`
- `TokenClaimAirdropTransaction`
- `TokenCancelAirdropTransaction`
- `TokenRejectTransaction`
- `TokenUpdateNftsTransaction`

Consensus and schedule:

- `TopicCreateTransaction`
- `TopicUpdateTransaction`
- `TopicDeleteTransaction`
- `TopicMessageSubmitTransaction`
- `ScheduleCreateTransaction`
- `ScheduleSignTransaction`
- `ScheduleDeleteTransaction`

Contract and EVM:

- `ContractCreateTransaction`
- `ContractExecuteTransaction`
- `ContractDeleteTransaction`
- `ContractUpdateTransaction`
- `EthereumTransaction`

File and system:

- `FileCreateTransaction`
- `FileAppendTransaction`
- `FileUpdateTransaction`
- `FileDeleteTransaction`
- `FreezeTransaction`
- `SystemDeleteTransaction`
- `SystemUndeleteTransaction`

Node and utility:

- `NodeCreateTransaction`
- `NodeUpdateTransaction`
- `NodeDeleteTransaction`
- `PrngTransaction`
- `BatchTransaction`

### 1.2 Exported Queries (19 + entrypoint AddressBook query)

- `AccountBalanceQuery`
- `AccountInfoQuery`
- `AccountRecordsQuery`
- `ContractByteCodeQuery`
- `ContractCallQuery`
- `ContractInfoQuery`
- `FileContentsQuery`
- `FileInfoQuery`
- `LiveHashQuery`
- `MirrorNodeContractCallQuery`
- `MirrorNodeContractEstimateQuery`
- `NetworkVersionInfoQuery`
- `ScheduleInfoQuery`
- `TokenInfoQuery`
- `TokenNftInfoQuery`
- `TopicInfoQuery`
- `TopicMessageQuery`
- `TransactionReceiptQuery`
- `TransactionRecordQuery`
- entrypoint-only: `AddressBookQuery` (`index.js`) / `AddressBookQueryWeb` (`browser.js`)

### 1.3 Exported Flows (4)

- `AccountInfoFlow`
- `ContractCreateFlow`
- `EthereumFlow`
- `TokenRejectFlow`

### 1.4 Client Method Surface

`Client` core capabilities include:

- network and mirror configuration: `setNetwork`, `setMirrorNetwork`, `setNetworkFromAddressBook`, `setLedgerId`
- operator and signing controls: `setOperator`, `setOperatorWith`, `operatorAccountId`, `operatorPublicKey`
- retry and request policies: `setMaxAttempts`, `setMaxNodeAttempts`, backoff/readmit controls, request/grpc deadlines
- execution behavior: `setDefaultMaxTransactionFee`, `setDefaultMaxQueryPayment`, `setDefaultRegenerateTransactionId`, `setMaxNodesPerTransaction`
- runtime utilities: `ping`, `pingAll`, `updateNetwork`, `close`, logger attachment

`NodeClient` adds constructor factories and config loaders:

- `fromConfig`, `fromConfigFile`, `forNetwork`, `forName`, `forMainnet`, `forTestnet`, `forPreviewnet`, `forLocalNode`
- async variants: `forMainnetAsync`, `forTestnetAsync`, `forPreviewnetAsync`, `forNameAsync`, `forMirrorNetwork`

`WebClient` adds browser-specific factories:

- `fromConfig`, `forNetwork`, `forName`, `forMainnet`, `forTestnet`, `forPreviewnet`, `forLocalNode`
- async variants: `forMainnetAsync`, `forTestnetAsync`, `forPreviewnetAsync`, `forNameAsync`, `forMirrorNetwork`

### 1.5 Utility and Model Surface (non tx/query/flow)

High-signal exported runtime/model classes include:

- key and identity: `PrivateKey`, `PublicKey`, `Key`, `KeyList`, `Mnemonic`, `AccountId`, `TokenId`, `NftId`, `TopicId`, `ContractId`, `FileId`, `ScheduleId`, `TransactionId`, `PendingAirdropId`, `EvmAddress`, `LedgerId`
- signer/provider/runtime: `Signer`, `SignerSignature`, `Provider`, `Wallet`, `WebClient`, `Cache`, `Executable`
- status/errors: `Status`, `StatusError`, `PrecheckStatusError`, `ReceiptStatusError`, `MaxAttemptsOrTimeoutError`, `MaxQueryPaymentExceeded`
- fees and value objects: `Hbar`, `HbarUnit`, `FeeData`, `FeeSchedule`, `CustomFee`, `CustomFixedFee`, `CustomFractionalFee`, `CustomRoyaltyFee`, `CustomFeeLimit`
- contract/topic/token/file models and helpers: `ContractFunctionParameters`, `ContractFunctionResult`, `TransactionReceipt`, `TransactionRecord`, `TransactionResponse`, `NodeAddressBook`, `NetworkVersionInfo`, `ServiceEndpoint`, `TokenType`, `TokenSupplyType`

## 2) Comparison Matrix (Upstream vs Our SDK)

### 2.1 Transactions

| Upstream capability                                                                                                                                | Our SDK status | Our surface                                                   | Quality | Notes                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------- | ------- | -------------------------------------------------------------------- |
| `TransferTransaction`, `AccountCreateTransaction`, `AccountUpdateTransaction`, `AccountDeleteTransaction`                                          | Implemented    | `accounts.transfer/create/update/delete` + fluent `account.*` | High    | Strong typing, fluent + classic, account inference where safe        |
| `AccountAllowanceApproveTransaction`, `AccountAllowanceDeleteTransaction`                                                                          | Implemented    | `accounts.allowances`, `accounts.allowancesDeleteNft`         | Medium  | Good coverage; delete scope is NFT-only wrapper                      |
| `AccountAllowanceAdjustTransaction`                                                                                                                | Missing        | n/a                                                           | n/a     | No delta-style allowance adjustment API                              |
| `LiveHashAddTransaction`, `LiveHashDeleteTransaction`                                                                                              | Missing        | n/a                                                           | n/a     | No LiveHash surface                                                  |
| Token transaction family (`create/update/delete/mint/burn/associate/dissociate/freeze/unfreeze/grantKyc/revokeKyc/pause/unpause/wipe`)             | Implemented    | `tokens.*` + fluent `token.*`                                 | High    | Full mainstream token admin and transfer coverage                    |
| `TokenFeeScheduleUpdateTransaction`                                                                                                                | Implemented    | `tokens.fees`                                                 | High    | Clean mapping with typed custom fee params                           |
| `TokenAirdropTransaction`, `TokenClaimAirdropTransaction`, `TokenCancelAirdropTransaction`, `TokenRejectTransaction`, `TokenUpdateNftsTransaction` | Implemented    | `tokens.airdrop/claimAirdrop/cancelAirdrop/reject/updateNfts` | Medium  | Coverage is strong but currently thin wrappers around advanced forms |
| `TopicCreateTransaction`, `TopicUpdateTransaction`, `TopicDeleteTransaction`, `TopicMessageSubmitTransaction`                                      | Implemented    | `hcs.*` + fluent `topic.*`                                    | High    | Includes batch submit/json helpers and watch APIs                    |
| `ScheduleCreateTransaction`, `ScheduleSignTransaction`, `ScheduleDeleteTransaction`                                                                | Implemented    | `schedules.*` + fluent `schedule.*`                           | High    | Includes idempotent create and multi-signer collect helper           |
| `ContractCreateTransaction`, `ContractExecuteTransaction`, `ContractDeleteTransaction`, `ContractUpdateTransaction`                                | Implemented    | `contracts.*` + fluent `contract.*`                           | High    | Adds typed ABI, preflight, simulate, estimate abstractions           |
| `EthereumTransaction`                                                                                                                              | Missing        | n/a                                                           | n/a     | No raw Ethereum tx relay support                                     |
| `FileCreateTransaction`, `FileAppendTransaction`, `FileUpdateTransaction`, `FileDeleteTransaction`                                                 | Implemented    | `files.*` + fluent `file.*`                                   | High    | Adds chunked upload/update-large DX                                  |
| `FreezeTransaction`                                                                                                                                | Implemented    | `submit({ kind: "system.freeze" })`, fluent `system.freeze`   | Medium  | Works, but thin vs full upstream feature ergonomics                  |
| `SystemDeleteTransaction`, `SystemUndeleteTransaction`                                                                                             | Missing        | n/a                                                           | n/a     | No system delete/undelete wrappers                                   |
| `NodeCreateTransaction`, `NodeUpdateTransaction`, `NodeDeleteTransaction`                                                                          | Implemented    | `submit({ kind: "nodes.*" })`, fluent `node.*`                | Medium  | Functional but thin; not domain-namespaced in classic client         |
| `PrngTransaction`                                                                                                                                  | Implemented    | `submit({ kind: "util.random" })`, fluent `util.random`       | Medium  | Thin wrapper                                                         |
| `BatchTransaction`                                                                                                                                 | Implemented    | `submit({ kind: "batch.atomic" })`, fluent `batch.atomic`     | Medium  | Functional, room for richer composition APIs                         |

Transaction coverage summary:

- Implemented: 47/53 upstream transaction classes
- Missing: 6/53 (`AccountAllowanceAdjustTransaction`, `EthereumTransaction`, `LiveHashAddTransaction`, `LiveHashDeleteTransaction`, `SystemDeleteTransaction`, `SystemUndeleteTransaction`)

### 2.2 Queries

| Upstream query                             | Our SDK status | Our surface                                                       | Quality | Notes                                                     |
| ------------------------------------------ | -------------- | ----------------------------------------------------------------- | ------- | --------------------------------------------------------- |
| `AccountBalanceQuery`                      | Implemented    | `accounts.balance`, fluent `account.balance`                      | High    | Supports signer/native/mirror fallback                    |
| `AccountInfoQuery`                         | Implemented    | `accounts.info`, fluent `account.info`                            | High    | Stable                                                    |
| `AccountRecordsQuery`                      | Implemented    | `accounts.records`, fluent `account.records`                      | High    | Requires signer/operator context as expected              |
| `ContractByteCodeQuery`                    | Implemented    | `contracts.bytecode`, fluent `contract.bytecode`                  | High    | Wrapped with result typing                                |
| `ContractCallQuery`                        | Implemented    | `contracts.call`, `contracts.callTyped`, fluent equivalents       | High    | Adds typed decode flow                                    |
| `ContractInfoQuery`                        | Implemented    | `contracts.info`, fluent `contract.info`                          | High    | Stable                                                    |
| `FileContentsQuery`                        | Implemented    | `files.contents`, fluent `file.contents`/`file.text`/`file.json`  | High    | Adds text/json convenience                                |
| `FileInfoQuery`                            | Implemented    | `files.info`, fluent `file.info`                                  | High    | Stable                                                    |
| `LiveHashQuery`                            | Missing        | n/a                                                               | n/a     | No LiveHash query surface                                 |
| `MirrorNodeContractCallQuery`              | Implemented    | `contracts.simulate`, fluent `contract.simulate`                  | High    | Great DX wrapper                                          |
| `MirrorNodeContractEstimateQuery`          | Implemented    | `contracts.estimateGas`, fluent `contract.estimate`/`estimateGas` | High    | Great DX wrapper                                          |
| `NetworkVersionInfoQuery`                  | Implemented    | `network.version`, fluent `net.version`                           | High    | Stable                                                    |
| `ScheduleInfoQuery`                        | Implemented    | `schedules.info`, fluent `schedule.info`                          | High    | Stable                                                    |
| `TokenInfoQuery`                           | Implemented    | `tokens.info`, fluent `token.info`                                | High    | Stable                                                    |
| `TokenNftInfoQuery`                        | Implemented    | `tokens.nftInfo`, fluent `token.nft`                              | High    | Stable                                                    |
| `TopicInfoQuery`                           | Implemented    | `hcs.info`, fluent `topic.info`                                   | High    | Stable                                                    |
| `TopicMessageQuery`                        | Implemented    | `hcs.watch`, `hcs.watchFrom`, fluent equivalents                  | Medium  | Streaming-focused abstraction instead of raw query object |
| `TransactionReceiptQuery`                  | Implemented    | `transactions.receipt`, fluent `tx.receipt`                       | High    | Stable                                                    |
| `TransactionRecordQuery`                   | Implemented    | `transactions.record`, fluent `tx.record`                         | High    | Stable                                                    |
| `AddressBookQuery` / `AddressBookQueryWeb` | Implemented    | `network.addressBook`, fluent `net.addressBook`                   | Medium  | Simplified options vs full raw query object ergonomics    |

Query coverage summary:

- Implemented: 19/20 query classes (plus entrypoint `AddressBookQuery` covered)
- Missing: `LiveHashQuery`

### 2.3 Flows

| Upstream flow        | Our SDK status | Notes                                                                                           |
| -------------------- | -------------- | ----------------------------------------------------------------------------------------------- |
| `AccountInfoFlow`    | Partial        | Equivalent outcomes via `accounts.info` and `reads.accounts.info`, but no dedicated flow object |
| `ContractCreateFlow` | Partial        | `files.upload` + `contracts.deploy` covers behavior but not one cohesive abstraction            |
| `EthereumFlow`       | Missing        | No Ethereum relay/flow API                                                                      |
| `TokenRejectFlow`    | Partial        | `tokens.reject` exists, but flow-specific helper semantics are not exposed                      |

### 2.4 Client Method and Runtime Parity

| Upstream client area                                                                                      | Our SDK status     | Notes                                                                                                   |
| --------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------- |
| Node/Web factory constructors (`forMainnet`, `forTestnet`, async variants, `fromConfigFile`)              | Missing direct API | Our `hiero(config)` is intentionally simplified but less discoverable for env-specific startup patterns |
| Network runtime controls (`setNetwork`, `setMirrorNetwork`, `setNetworkFromAddressBook`, `updateNetwork`) | Partial            | We expose high-level config + `network.addressBook`; no direct runtime reconfiguration/update methods   |
| Operator/signing controls (`setOperator`, `setOperatorWith`)                                              | Partial            | `with(...)`/`as(...)` solve common cases but not full transactionSigner-level control                   |
| Retry/backoff/timeouts (`setMaxAttempts`, node backoffs, grpc/request timeout)                            | Missing direct API | No public tuning knobs in our SDK                                                                       |
| Health and connectivity (`ping`, `pingAll`)                                                               | Missing            | No explicit client health probe API                                                                     |
| Lifecycle (`close`)                                                                                       | Implemented        | `destroy()`                                                                                             |

### 2.5 Utility/Model Exposure Parity

| Utility domain                                                                                 | Our SDK status           | Notes                                              |
| ---------------------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------------- |
| Key primitives (`PrivateKey`, `PublicKey`, `Mnemonic`, `Key`, `KeyList`)                       | Missing direct re-export | We currently re-export `Signer` type only          |
| Wallet/provider (`Wallet`, `Provider`, `LocalProvider`, `LocalProviderWeb`)                    | Missing                  | No first-class wallet/provider bridge API          |
| ID/value classes (`AccountId`, `TokenId`, `NftId`, `ScheduleId`, `FileId`, `Hbar`, `LedgerId`) | Missing direct re-export | We use `EntityId` strings for ergonomic uniformity |
| Fee/model classes (`CustomFee*`, `Fee*`, `TransactionReceipt`, `TransactionRecord`)            | Missing direct re-export | We wrap responses into SDK-owned result shapes     |
| Error classes (`PrecheckStatusError`, `ReceiptStatusError`, etc.)                              | Missing direct re-export | Wrapped into structured `HieroError` surface       |

## 3) Prioritized Gap Analysis and Magical Abstractions

| Priority | Capability gap                                                           | Developer impact                                    | Suggested magical abstraction                                                                                                       |
| -------- | ------------------------------------------------------------------------ | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| P0       | Ethereum relay support (`EthereumTransaction`, `EthereumFlow`)           | High for EVM-heavy apps and wallet interoperability | `client.evm.sendRaw({ signedTx }).now()`, `client.evm.populateAndSign({ txData, signer }).now()`, `client.evm.wait(hash).receipt()` |
| P0       | Wallet/provider primitives (`Wallet`, `Provider`, key management bridge) | High for onboarding and signer integration          | `hiero.wallet.fromMnemonic(...)`, `hiero.wallet.fromPrivateKey(...)`, `client.withWallet(wallet)`                                   |
| P1       | Contract creation flow parity (`ContractCreateFlow`)                     | High for deploy workflows with large bytecode       | `client.contract.deployArtifact({ abi, bytecode, constructor }).now()` with auto file upload + gas preflight                        |
| P1       | Runtime network operations (`updateNetwork`, node ping/health)           | High for production reliability tooling             | `client.net.health().now()`, `client.net.pingAll().now()`, `client.net.refreshAddressBook().now()`                                  |
| P1       | Fine-grained client tuning (timeouts, retries, backoff)                  | Medium-high for high-throughput backends            | `hiero({ transport: { requestTimeoutMs, grpcDeadlineMs, retries, backoff } })` with validated policy object                         |
| P1       | Allowance delta semantics (`AccountAllowanceAdjustTransaction`)          | Medium for treasury/payment engines                 | `client.account.allowances.adjust({ owner, spender, hbarDelta, tokenDeltas }).now()`                                                |
| P2       | System delete/undelete support                                           | Medium for operators and maintenance tooling        | `client.system.deleteEntity(...)`, `client.system.undeleteEntity(...)` with strong safeguards                                       |
| P2       | Flow ergonomics for account/token (`AccountInfoFlow`, `TokenRejectFlow`) | Medium for convenience and readability              | `client.account.infoFlow(accountId).watch(...)`, `client.token.rejectFlow({ owner }).autoResolve().now()`                           |
| P3       | LiveHash support (`LiveHash*`)                                           | Low and mostly legacy                               | `client.legacy.liveHash.*` namespace to isolate deprecated functionality                                                            |
| P3       | Direct raw class escape hatch                                            | Low but useful for edge users                       | `client.raw()` returning controlled access to underlying `@hiero-ledger/sdk` classes and client                                     |

## 4) Existing DX Advantages Where We Already Exceed Raw SDK

- Fluent and classic dual-surface on one client (`hiero`) with aliases and ergonomic builders
- Structured `Result<T>` and normalized error surface instead of exception-heavy flow
- Descriptor-driven transaction submission enabling composition, scheduling, and batch patterns
- Convenience abstractions not present as first-class upstream patterns:
  - file chunking (`upload`, `updateLarge`)
  - schedule idempotency and signer collection
  - contract preflight and typed ABI call helpers
  - mirror reads consolidated under `reads.*`

## 5) Recommended Execution Plan

1. Implement P0 EVM + wallet/provider bridge in a dedicated `evm` and `wallet` namespace.
2. Add P1 deploy/runtime operations (`deployArtifact`, `net.health`, `net.refreshAddressBook`).
3. Expose transport policy config with safe defaults and runtime introspection.
4. Add P2 system delete/undelete and flow-style convenience wrappers.
5. Keep P3 legacy/livehash behind explicit `legacy` or `advanced` opt-in namespace.
