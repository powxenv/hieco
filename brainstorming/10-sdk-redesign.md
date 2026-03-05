# @hieco/sdk ruthless audit + redesign

## 1. Consolidation manifest

### Delete

- `packages/sdk/src/builders/*`
  - Rationale: fluent builders duplicate existing param objects, add new concepts without reducing required knowledge, and are used nowhere in the SDK internals. They increase API surface and cognitive load.
- `packages/sdk/src/actions/decorators.ts`
  - Rationale: thin pass-through wrappers around `HieroClient` methods. They fragment discovery without adding capabilities.
- `packages/sdk/src/default.ts` (`configureHiero`, `hiero`, `getHieroClient`, `resetHiero`)
  - Rationale: global singleton encourages hidden state and makes client lifecycle implicit. Replace with explicit `hiero()` factory and optional memoized default via user-land.
- `packages/sdk/src/events/emitter.ts` and `packages/sdk/src/middleware/*`
  - Rationale: custom middleware/event system is extra infrastructure in a small SDK. It adds ceremony (registering listeners) and makes execution flow harder to reason about. Replace with per-call hooks and structured error objects.
- `packages/sdk/src/flows/scheduled-transaction-flow.ts`
  - Rationale: a bespoke flow object for a single feature. Move to a tiny, direct `schedule` namespace with explicit helpers (`create`, `sign`, `wait`), no implicit state.
- `packages/sdk/src/environment.ts`
  - Rationale: redundant in modern runtimes and used only for env config. Replace with direct checks where needed.

### Simplify / merge

- `packages/sdk/src/pipeline/*`
  - Collapse `resolver.ts` + `executor.ts` into a single `transactions.ts` with `buildTx` and `submitTx` functions. Current separation hides control flow and introduces heavy switch logic.
- `packages/sdk/src/types.ts`
  - Split into focused modules: `types/client.ts`, `types/params.ts`, `types/errors.ts`, `types/results.ts`.
  - Remove `Mutable` and builder-related types.
  - Replace `TransactionType` string union with a discriminated action map to reduce duplication.
- `packages/sdk/src/actions/*`
  - Merge into domain modules with explicit names: `accounts`, `tokens`, `hcs`, `contracts`, `files`, `schedules`.
  - Eliminate per-action wrappers that only forward to `executeTransaction`.
- `packages/sdk/src/client.ts`
  - Reduce 40+ methods on a single class by introducing domain namespaces on the client (`client.tokens.create`, `client.hcs.submit`, etc.). This improves discovery and autocomplete.

### Consolidate API surface

- Single entrypoint: `import { hiero } from "@hieco/sdk"`.
- Remove overloads for `createHieroClient` vs `hiero()`; use one factory.
- Replace `withSigner`/`withoutSigner` with `client.with({ signer })` and `client.as(signer)`.
- Replace `watchTopicMessages` with `client.hcs.watch(topicId, handler, options)`.

## 2. Reimagined API proposal

### Design goals

- One obvious path per operation.
- Minimum setup: no required generics, no manual `Hbar`/`Long` in user code.
- Autocomplete-first: discoverable via `client.{accounts,tokens,hcs,contracts,files,schedules}`.
- Errors are actionable: structured error objects with `code`, `hint`, `transactionId`.

### New public surface (proposed)

```ts
import { hiero } from "@hieco/sdk";

const client = hiero({
  network: "testnet",
  operator: "0.0.123",
  key: process.env.OPERATOR_KEY,
});

await client.accounts.transfer({
  from: "0.0.123",
  to: "0.0.456",
  hbar: 10,
});

await client.tokens.create({
  name: "MyToken",
  symbol: "MYT",
  supply: 1_000_000,
  treasury: "0.0.123",
});

const receipt = await client.contracts.call({
  id: "0.0.789",
  fn: "balanceOf",
  args: ["0.0.456"],
  returns: "uint256",
});

const stop = client.hcs.watch("0.0.9001", (msg) => {
  console.log(msg.json());
});
```

### Before / after examples

#### Transfers

Before:

```ts
const result = await hiero.transfer({
  from: "0.0.123",
  to: "0.0.456",
  amount: 10,
});
```

After:

```ts
await client.accounts.transfer({
  from: "0.0.123",
  to: "0.0.456",
  hbar: 10,
});
```

#### Scheduled transactions

Before:

```ts
const flow = hiero().scheduledTransaction({
  create: { transaction: { type: "transfer", params } },
});
const created = await flow.create();
await flow.sign({ signer });
await flow.waitForExecuted();
```

After:

```ts
const schedule = await client.schedules.create({
  tx: client.accounts.transfer.tx({ from, to, hbar: 5 }),
});

await client.schedules.sign(schedule.id, { signer });
await client.schedules.wait(schedule.id);
```

#### Contracts

Before:

```ts
await hiero.executeContract({
  contractId: "0.0.789",
  functionName: "transfer",
  functionParams: { types: ["address", "uint256"], values: ["0.0.456", 100] },
});
```

After:

```ts
await client.contracts.execute({
  id: "0.0.789",
  fn: "transfer",
  args: ["0.0.456", 100],
});
```

### API structure (proposed)

- `hiero(config)` -> returns `HieroClient`
- `client.accounts.*`
  - `transfer`, `create`, `update`, `delete`, `allowances`
- `client.tokens.*`
  - `create`, `mint`, `burn`, `transfer`, `transferNft`, `associate`, `dissociate`, `freeze`, `unfreeze`, `pause`, `unpause`, `wipe`, `update`, `fees`
- `client.hcs.*`
  - `create`, `update`, `delete`, `submit`, `watch`
- `client.contracts.*`
  - `deploy`, `execute`, `call`, `update`, `delete`
- `client.files.*`
  - `create`, `append`, `update`, `delete`
- `client.schedules.*`
  - `create`, `sign`, `delete`, `info`, `wait`
- `client.mirror.*`
  - unchanged mirror client, but aligned naming with `client.*`

## 3. Magic moments

### Telepathic arguments

- `accounts.transfer({ to, hbar })` infers `from` from `operator` or signer.
- `tokens.transfer({ token, to, amount })` infers `from` the operator.
- `contracts.call({ id, fn, args })` infers gas defaults based on ABI signatures.

### Smart tx builders without builders

- `client.accounts.transfer.tx({...})` returns a typed transaction descriptor usable for schedules.
- `client.schedules.create({ tx })` accepts any typed tx, no manual `type` string.

### Ergonomic amounts

- Accept `number | string | bigint` everywhere; convert internally.
- `hbar: 10` and `tokens: 100` are normalized without `Hbar` or `Long` in user code.

### Structured, actionable errors

- Standard error shape:
  - `code` (stable enum), `message`, `hint`, `transactionId`, `details`
- Example: `INSUFFICIENT_PAYER_BALANCE` includes current balance, requested amount, and suggested fee tweak.

### Autocomplete-first discovery

- Domain namespaces are the primary entrypoints.
- Every action exists in exactly one place.

## 4. Migration path

### Mechanical mapping

- `createHieroClient(...)` -> `hiero(...)`
- `hiero()` -> `hiero()` (same, but no global config)
- `client.transfer(...)` -> `client.accounts.transfer(...)`
- `client.createToken(...)` -> `client.tokens.create(...)`
- `client.submitMessage(...)` -> `client.hcs.submit(...)`
- `client.watchTopicMessages(...)` -> `client.hcs.watch(...)`
- `client.scheduledTransaction(...)` -> `client.schedules.create(...)` + `client.schedules.sign(...)`

### Compatibility layer (optional)

- Keep old method names for one minor release as thin wrappers.
- Emit deprecation warnings once per method via `console.warn` when `logLevel !== "none"`.

### Incremental adoption strategy

- Step 1: Switch to `hiero()` factory and `client.accounts.*` etc.
- Step 2: Replace scheduled flow with `client.schedules.*`.
- Step 3: Remove builders and decorators imports.

### Zero breaking changes for mirror

- `client.mirror.*` stays intact and keeps existing types.

---

This redesign trims the current SDK to an explicit, discoverable core. The client becomes a well-named, auto-completable map of capabilities. Configuration becomes minimal and obvious. Errors become instructional. The result: a Hedera SDK that feels like it reads the developer's intent.
