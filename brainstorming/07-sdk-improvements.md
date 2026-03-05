# SDK Improvements for @hieco/sdk

This document proposes additions that raise @hieco/sdk from a thin wrapper to a DX-first product SDK for Hiero/Hedera. Each item includes a concept and its rationale, focused on the official Hiero TypeScript SDK surface and real-world workflows.

## Design Goals

- Prefer intent-based APIs over raw transaction composition.
- Use mirror-first reads where it improves latency and stability.
- Offer safe defaults, explicit overrides, and deterministic behavior.
- Provide cohesive workflows that map to how teams ship apps.
- Avoid leaky abstractions; expose power without forcing SDK internals.

## Bounty Fit Assessment (Hiero)

This proposal matches the Hiero bounty requirements for a reusable open-source library with a clean API, tests, and documentation. The additions focus on improving developer experience while remaining realistic to implement on top of the official Hiero TypeScript SDK and mirror node APIs. The result is a production-minded SDK layer, aligned with the bounty expectation for ecosystem adoption.

## Feasibility and Utility Review

The items below are implementable using current Hiero SDK capabilities and mirror node endpoints. The value is grounded in common integration pain points: read-heavy data access, allowance lifecycle control, file chunking, contract preflight, HCS streaming resilience, and multi-party scheduling.

Key feasibility anchors:

- Official SDK already supports account, token, file, contract, HCS, and schedule transactions, plus core queries.
- Mirror node APIs already provide historical, paginated, and search-oriented reads.
- Existing @hieco/sdk architecture already composes a domain-first API and mirror client.

User benefit summary:

- Less boilerplate, fewer footguns, and more predictable behavior.
- Faster onboarding with flow-based APIs that map to real app patterns.
- Safer defaults with explicit overrides and visibility into outcomes.

## Existing Package Analysis (Fluency Readiness)

The current SDK already exhibits early fluent traits through composable descriptors and client scoping:

- `client.accounts.transfer.tx()` returns a typed descriptor that can be scheduled or submitted later.
- `client.as(signer)` and `client.with({ signer, operator, key })` provide scoped clients without global state.
- Each domain is isolated and created through a clear `createXNamespace` factory.
- Errors and results are standardized via `Result<T>`, enabling uniform pipeline control.

These patterns make it feasible to introduce a fluent layer without rewriting the core. The fluent layer should be additive and should reuse the existing descriptor/submit pipeline. This keeps implementability high and avoids divergence from the official SDK.

## 1) Mirror-first Read Models

Concept

Expose read-focused namespaces that prioritize mirror node data and return normalized, domain-friendly shapes. Provide typed query options and pagination helpers, while keeping access to raw data when needed.

Rationale

The native SDK queries are powerful but are not optimal for historical data, pagination, or analytics. Mirror node REST is the expected choice for read-heavy workloads. A unified read layer prevents teams from mixing two styles and avoids duplicated client logic.

Additions

- accounts.history(accountId, params)
- accounts.transfers(accountId, params)
- tokens.balances(tokenId, params)
- tokens.relationships(accountId, params)
- tokens.transfers(tokenId, params)
- contracts.results(contractId, params)
- transactions.search(params)

DX Outcome

Developers can implement dashboards, audit trails, and activity feeds with one cohesive API surface instead of stitching mirror node calls manually.

## 2) Allowance Lifecycle + Safety Helpers

Concept

Provide full allowance lifecycle management with query, revoke, and idempotent ensure flows across HBAR, fungible tokens, and NFTs.

Rationale

Approve-only support is a common footgun. Teams need to inspect and revoke allowances as policies change. Idempotent ensure operations reduce duplicate approvals and race conditions.

Additions

- accounts.allowances.list(accountId, params)
- accounts.allowances.revoke(params)
- accounts.allowances.ensure(params)
- tokens.allowances.list(tokenId, params)

DX Outcome

Wallet and treasury flows become safe and auditable without forcing direct SDK query wiring.

## 3) Chunked File Uploads + Data Helpers

Concept

Offer file upload/update utilities that chunk large payloads, plus convenience helpers for text and JSON data.

Rationale

File service operations are verbose and error-prone when data exceeds size limits. Most teams store configs or metadata in JSON; they should not manage chunking by hand.

Additions

- files.upload({ contents, chunkSize?, keys?, memo?, maxFee? })
- files.updateLarge({ fileId, contents, chunkSize? })
- files.contentsText(fileId)
- files.contentsJson(fileId)

DX Outcome

Developers can store and retrieve files with one call and avoid subtle chunking failures.

## 4) Contract Preflight + ABI-first Calls

Concept

Bundle contract preflight (simulate + estimate) into a single workflow and provide ABI-first call/execute helpers with typed return decoding.

Rationale

Contract interactions require gas estimation, simulation, and ABI encoding/decoding. These steps are repetitive and tricky. The SDK should handle preflight and present predictable errors.

Additions

- contracts.preflight({ id, fn, args?, value?, gas?, gasPrice?, senderEvmAddress? })
- contracts.callTyped(abi, fn, args)
- contracts.executeTyped(abi, fn, args, options?)
- contracts.withAbi(abi) -> { call, execute, estimate, simulate }

DX Outcome

Teams can ship contract flows without manual ABI plumbing or inconsistent gas logic across codebases.

## 5) HCS Stream Ergonomics

Concept

Provide mirror-based streaming with resume support, structured message decoding, and backoff strategy. Add JSON-aware publish helpers.

Rationale

Topic subscriptions are core to HCS use cases. Real-world consumers need resume and reliable processing; the raw SDK subscription lacks these guardrails.

Additions

- hcs.watchFrom(topicId, { sinceSequence?, sinceTimestamp?, resume?, onError? })
- hcs.submitJson({ topicId, data, chunkSize?, maxChunks? })
- hcs.batchSubmit({ topicId, messages, concurrency? })

DX Outcome

HCS becomes production-ready without bespoke consumer frameworks.

## 6) Schedule Workflows for Multi-party Signing

Concept

Add schedule convenience flows that encapsulate multi-party collection, execution confirmation, and idempotent creation.

Rationale

Schedules are a key multi-sig pattern but are verbose to orchestrate. A high-level workflow reduces errors and improves clarity.

Additions

- schedules.createIdempotent({ tx, memo, payerAccountId })
- schedules.collectSignatures(scheduleId, signers, options?)
- schedules.waitForExecution(scheduleId, { timeoutMs?, pollIntervalMs? })

DX Outcome

Multi-signature flows become straightforward and predictable for app developers.

## 7) Key + ID Utilities

Concept

Add small helpers for common key and ID conversions, detection, and validation to reduce external dependencies.

Rationale

Teams repeatedly re-implement key type detection, EVM address conversion, and validation. Providing these utilities prevents inconsistency and mistakes.

Additions

- keys.publicKeyFromPrivate(privateKey)
- keys.detectType(key)
- accounts.toEvmAddress(accountId)
- accounts.fromEvmAddress(evmAddress)
- ids.validate(id)

DX Outcome

Developers stay inside the SDK for common identity operations and avoid mismatched formats.

## 8) Configuration + Environment Guards

Concept

Expose explicit configuration validation, environment loading, and network presets with clear failure modes.

Rationale

Implicit config is convenient but can hide misconfigurations. A validation path allows teams to fail fast and build safer bootstrap routines.

Additions

- hiero.fromEnv({ allowMissingSigner? })
- hiero.validateConfig(config)
- hiero.forNetwork({ nodes, mirrorUrl, name? })

DX Outcome

Developers gain confidence that a client is ready before sending transactions.

## 9) Transaction Pipeline Improvements

Concept

Provide workflow helpers for common execution patterns: pre-check, sign, submit, and confirm. Include standardized error handling and retry profiles.

Rationale

Every transaction flow repeats similar boilerplate around retries, receipt validation, and error mapping. A high-level pipeline reduces cognitive load and standardizes outcomes.

Additions

- client.submitAndWait(descriptor, { validateStatus?, timeoutMs? })
- client.submitWithRetry(descriptor, { attempts?, backoffMs? })
- errors.classify(error)

DX Outcome

Consistent, production-grade transaction execution without custom infrastructure.

## 10) DX-first Docs + Examples Pack

Concept

Ship a tightly curated example set that mirrors the new workflows, not just raw transactions. Provide runnable recipes and failure-mode guidance.

Rationale

Documentation defines developer expectations. The SDK should teach the high-level workflows it provides, with practical recipes aligned to real-world use cases.

Additions

- Example: Token launch with treasury + fee schedule
- Example: Contract deploy + preflight + execute
- Example: HCS consumer with resume
- Example: Allowance lifecycle management
- Example: Chunked file upload and JSON retrieval

DX Outcome

Developers learn the intended patterns and get to production faster.

## Summary

These improvements turn @hieco/sdk into a product-quality TypeScript SDK that aligns with real Hiero workflows, not just the underlying transaction APIs. The emphasis is on intent-based calls, mirror-aware reads, and safe defaults, while still allowing full control when needed.

## DX Flow Functions

These flow functions are high-level workflows that orchestrate multiple lower-level operations into one intent-driven call. They are designed to be implementable with the current Hiero SDK and mirror node capabilities and to provide a clear developer benefit.

### 1) flow.tokenLaunchFixedSupply

Concept

Create a token, configure fees, and optionally distribute initial supply in a single intent-based flow.

Rationale

Token launches are a multi-step process that are frequently mis-ordered or partially implemented. A single flow reduces complexity and ensures required fields are captured.

Proposed API

- flow.tokenLaunchFixedSupply({ name, symbol, treasury, decimals, supply, customFees?, distributeTo? })

Implementation Notes

- Wraps tokens.create + tokens.fees + tokens.transfer.
- Uses existing transaction descriptors and submit flow.

User Benefit

- One function for a common onboarding task, fewer deployment errors.

### 2) flow.allowanceEnsure

Concept

Idempotent allowance setup that only submits approvals when required.

Rationale

Developers often over-approve or spam approvals. This flow checks mirror state and only submits if needed.

Proposed API

- flow.allowanceEnsure({ owner, spender, hbar?, tokens?, nfts?, maxAllowance? })

Implementation Notes

- Uses accounts.allowances.list + accounts.allowances.ensure.
- Falls back to submit only when current allowance is insufficient.

User Benefit

- Safer permissions and fewer transactions.

### 3) flow.fileUploadJson

Concept

Upload JSON content to file service with chunking and typed retrieval.

Rationale

Teams store configs and metadata. Chunking and parsing should be built-in.

Proposed API

- flow.fileUploadJson({ data, keys?, memo?, chunkSize? })
- flow.fileReadJson(fileId)

Implementation Notes

- Wraps files.create + files.append + files.contentsJson.

User Benefit

- Reliable file storage without manual chunk logic.

### 4) flow.contractWriteWithPreflight

Concept

Run simulate + estimateGas before executing a contract write. Surface a clear result with gas suggestion.

Rationale

Contract execution failures are costly. Preflight avoids many errors and yields consistent gas behavior.

Proposed API

- flow.contractWriteWithPreflight({ id, fn, args, value?, gasBuffer?, senderEvmAddress? })

Implementation Notes

- Uses contracts.simulate + contracts.estimateGas + contracts.execute.
- Applies a buffer and returns a combined result structure.

User Benefit

- Fewer failed transactions and less manual tuning.

### 5) flow.hcsConsumeWithResume

Concept

Consume topic messages with resume state (sequence or timestamp) and retry/backoff.

Rationale

Stream consumers require durability. Resume logic is a major DX gap.

Proposed API

- flow.hcsConsumeWithResume({ topicId, cursorStore, onMessage, onError? })

Implementation Notes

- Wraps mirror-based queries with pagination and stored cursor.
- Uses @hieco/mirror topic messages endpoints.

User Benefit

- Reliable consumption without external infra.

### 6) flow.scheduleMultiParty

Concept

Create a schedule, collect signatures, and wait for execution as one workflow.

Rationale

Multi-party signing is one of the most error-prone flows. Encapsulation increases success rate.

Proposed API

- flow.scheduleMultiParty({ tx, payer, signers, waitOptions? })

Implementation Notes

- Wraps schedules.create + schedules.sign + schedules.wait.

User Benefit

- Faster multi-sig integrations with fewer edge-case errors.

### 7) flow.accountBootstrap

Concept

Create an account, associate tokens, and fund it in one flow.

Rationale

New-user onboarding frequently needs multiple transactions with ordering and account ID extraction.

Proposed API

- flow.accountBootstrap({ publicKey, initialHbar, tokenIds?, memo? })

Implementation Notes

- Wraps accounts.create + tokens.associate + accounts.transfer.
- Uses create receipt to infer accountId.

User Benefit

- One call for onboarding flows, fewer manual steps.

## Fluent SDK Design

The fluent SDK should be an optional layer that offers chainable intent while preserving access to the existing direct APIs. The goal is flexibility: developers can pick direct calls, descriptors, or fluent chains based on their preferences.

### Design Principles

- Keep fluent chains thin and deterministic; they should compile to existing descriptors or queries.
- Maintain type inference by binding domain-specific builders to known parameter shapes.
- Allow extraction of a descriptor at any point for scheduling or advanced composition.
- Provide a single `execute()` or `submit()` terminal that maps to existing `client.submit`.

### Proposed Entry Points

- `client.fluent` exposes chainable builders for transactions and queries.
- `client.fluent.accounts`, `client.fluent.tokens`, `client.fluent.hcs`, `client.fluent.contracts`, `client.fluent.files`, `client.fluent.schedules`.

### Example Chains

```typescript
const receipt = await client.fluent.accounts
  .transfer()
  .from("0.0.1001")
  .to("0.0.2002")
  .hbar(2)
  .memo("tip")
  .submit();

const scheduled = await client.fluent.tokens
  .transfer()
  .token("0.0.3003")
  .from("0.0.1001")
  .to("0.0.2002")
  .amount(25)
  .descriptor();

await client.schedules.create({ tx: scheduled });
```

```typescript
const info = await client.fluent.hcs.topic("0.0.4004").messages().limit(50).execute();
```

### Builder Shapes

Builders are lightweight wrappers over parameter objects with chainable setters and a terminal action.

- `descriptor()` returns a `TransactionDescriptor`.
- `submit()` calls `client.submit(descriptor())`.
- `execute()` for queries resolves to the current query method.

### Fluent Types (Illustrative)

```typescript
type TxBuilder<TParams> = {
  params(): Readonly<TParams>;
  descriptor(): TransactionDescriptor;
  submit(): Promise<Result<TransactionReceiptData>>;
};

type AccountTransferBuilder = TxBuilder<TransferParams> & {
  from(id: EntityId): AccountTransferBuilder;
  to(id: EntityId): AccountTransferBuilder;
  hbar(amount: number | string | bigint): AccountTransferBuilder;
  memo(value: string): AccountTransferBuilder;
  maxFee(value: number | string | bigint): AccountTransferBuilder;
};
```

### Mapping to Existing Architecture

- Builders live in a `fluent/` directory and delegate to existing domain APIs.
- Each builder composes a `TransactionDescriptor` using the same `kind` values.
- Query builders call `client.*.info`, `client.*.messages`, and mirror methods directly.

### Minimal Surface to Start

- Accounts: `transfer`, `create`, `update`.
- Tokens: `create`, `transfer`, `mint`.
- HCS: `submit`, `watchFrom`, `messages`.
- Contracts: `call`, `execute`, `preflight`.
- Files: `create`, `append`, `upload`.
- Schedules: `create`, `sign`, `wait`.

This scope keeps the fluent layer small, but immediately useful, and can expand as the core API grows.

## Implementation Blueprint (No Test Suite)

This blueprint outlines a practical, incremental path to ship the DX improvements and fluent layer without introducing tests in this phase. It focuses on minimal risk, maximum reuse of current @hieco/sdk patterns, and alignment with the Hiero bounty requirements.

### Phase 0: Ground Rules

- All new APIs must compile to existing transaction descriptors or mirror queries.
- No breaking changes to existing `client.*` namespaces.
- Every new flow has a direct escape hatch to the underlying descriptor or raw call.
- Prefer mirror-first reads with explicit fallback to native SDK queries.

### Phase 1: Mirror-first Read Models

Add a dedicated read namespace that formalizes mirror usage and pagination.

Files

- `packages/sdk/src/domains/reads/namespace.ts`
- `packages/sdk/src/domains/reads/api.ts`

New API

- `client.reads.accounts.history(accountId, params)`
- `client.reads.accounts.transfers(accountId, params)`
- `client.reads.tokens.balances(tokenId, params)`
- `client.reads.tokens.relationships(accountId, params)`
- `client.reads.tokens.transfers(tokenId, params)`
- `client.reads.contracts.results(contractId, params)`
- `client.reads.transactions.search(params)`

Dependencies

- Use `@hieco/mirror` for all calls. Normalize pagination into a common shape.

### Phase 2: Allowance Lifecycle Helpers

Add full allowance lifecycle operations and idempotent ensure.

Files

- `packages/sdk/src/domains/accounts/allowances.ts`
- `packages/sdk/src/domains/accounts/api.ts`

New API

- `client.accounts.allowances.list(accountId, params)`
- `client.accounts.allowances.revoke(params)`
- `client.accounts.allowances.ensure(params)`
- `client.tokens.allowances.list(tokenId, params)`

Notes

- Implement `ensure` by checking mirror state first and only submitting if needed.

### Phase 3: Chunked File Utilities

Files

- `packages/sdk/src/domains/files/flows.ts`
- `packages/sdk/src/domains/files/api.ts`

New API

- `client.files.upload({ contents, chunkSize?, keys?, memo?, maxFee? })`
- `client.files.updateLarge({ fileId, contents, chunkSize? })`
- `client.files.contentsText(fileId)`
- `client.files.contentsJson(fileId)`

Notes

- Build on existing `create`, `append`, `update`, and `contents` methods.

### Phase 4: Contract Preflight + ABI-first Helpers

Files

- `packages/sdk/src/domains/contracts/abi.ts`
- `packages/sdk/src/domains/contracts/api.ts`

New API

- `client.contracts.preflight({ id, fn, args?, value?, gas?, gasPrice?, senderEvmAddress? })`
- `client.contracts.callTyped(abi, fn, args)`
- `client.contracts.executeTyped(abi, fn, args, options?)`
- `client.contracts.withAbi(abi)`

Notes

- Preflight should use existing `simulate` and `estimateGas` methods.
- ABI helpers should be optional and keep current call/execute intact.

### Phase 5: HCS Stream Ergonomics

Files

- `packages/sdk/src/domains/hcs/flows.ts`
- `packages/sdk/src/domains/hcs/api.ts`

New API

- `client.hcs.watchFrom(topicId, { sinceSequence?, sinceTimestamp?, resume?, onError? })`
- `client.hcs.submitJson({ topicId, data, chunkSize?, maxChunks? })`
- `client.hcs.batchSubmit({ topicId, messages, concurrency? })`

Notes

- Use mirror-based `topic/messages` reads for resume.

### Phase 6: Schedule Workflows

Files

- `packages/sdk/src/domains/schedules/flows.ts`
- `packages/sdk/src/domains/schedules/api.ts`

New API

- `client.schedules.createIdempotent({ tx, memo, payerAccountId })`
- `client.schedules.collectSignatures(scheduleId, signers, options?)`
- `client.schedules.waitForExecution(scheduleId, { timeoutMs?, pollIntervalMs? })`

Notes

- Build on current `create`, `sign`, `wait`.

### Phase 7: Fluent Layer (Additive)

Files

- `packages/sdk/src/fluent/index.ts`
- `packages/sdk/src/fluent/accounts.ts`
- `packages/sdk/src/fluent/tokens.ts`
- `packages/sdk/src/fluent/hcs.ts`
- `packages/sdk/src/fluent/contracts.ts`
- `packages/sdk/src/fluent/files.ts`
- `packages/sdk/src/fluent/schedules.ts`

Integration

- Add `client.fluent` in `packages/sdk/src/core/client.ts`.
- Builders delegate to existing domain methods or descriptors.

Minimal Fluent Surface

- Accounts: `transfer`, `create`, `update`.
- Tokens: `create`, `transfer`, `mint`.
- HCS: `submit`, `messages`, `watchFrom`.
- Contracts: `call`, `execute`, `preflight`.
- Files: `create`, `append`, `upload`.
- Schedules: `create`, `sign`, `wait`.

### Phase 8: Flow Functions Layer

Files

- `packages/sdk/src/flows/index.ts`
- `packages/sdk/src/flows/token-launch.ts`
- `packages/sdk/src/flows/allowance-ensure.ts`
- `packages/sdk/src/flows/file-upload-json.ts`
- `packages/sdk/src/flows/contract-preflight.ts`
- `packages/sdk/src/flows/hcs-consume-resume.ts`
- `packages/sdk/src/flows/schedule-multi-party.ts`
- `packages/sdk/src/flows/account-bootstrap.ts`

Integration

- Add `client.flow` namespace on `HieroClient`.

### Phase 9: Documentation Updates

Files

- `packages/sdk/README.md`

Additions

- Fluent usage examples.
- Flow usage examples.
- Mirror-first read examples.

### Success Criteria

- Existing API remains unchanged and fully supported.
- Fluent and flow layers are optional and thin.
- Mirror-first reads provide predictable pagination and normalized results.
- Contract preflight yields consistent, debuggable outcomes.
