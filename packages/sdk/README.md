# @hieco/sdk

## Overview

`@hieco/sdk` is the core Hieco client for Hedera.

It gives you one factory, `hieco(...)`, and one fluent client surface for:

- server-side transaction execution
- browser apps that receive a wallet `Signer`
- scripts, workers, and CLIs
- framework loaders, actions, server functions, and route handlers

The client is domain-first. You work through namespaces such as `account`, `token`, `topic`, `contract`, `file`, `schedule`, `reads`, and `tx`.

## Installation

```bash
npm install @hieco/sdk
```

```bash
pnpm add @hieco/sdk
```

```bash
yarn add @hieco/sdk
```

```bash
bun add @hieco/sdk
```

## When To Use This Package

Use `@hieco/sdk` when you want to:

- submit Hedera transactions from server code
- scope a client to a connected wallet signer in the browser
- build scripts or jobs with the same API your app uses
- access low-level fluent helpers such as `.tx()`, `.now()`, and `.queue()`
- read Mirror Node data through the same client that executes transactions

If you are building a React UI, use [`@hieco/react`](../react/README.md) on the client and keep `@hieco/sdk` in server-only or shared runtime code.

## Quick Start

### Server Runtime

```ts
import { hieco } from "@hieco/sdk";

const client = hieco.fromEnv();

const account = await client.account.info("0.0.1001").now();

if (account.ok) {
  console.log(account.value.accountId);
}
```

Environment variables used by `hieco.fromEnv()`:

- `HIERO_NETWORK`
- `HIERO_OPERATOR_ID` or `HIERO_ACCOUNT_ID`
- `HIERO_PRIVATE_KEY`
- `HIERO_MIRROR_URL`

### Browser Signer Runtime

```ts
import { hieco, type Signer } from "@hieco/sdk";

export function createWalletClient(signer: Signer) {
  return hieco({ network: "testnet" }).as(signer);
}
```

```ts
const client = createWalletClient(signer);
const receipt = await client.account.send({ to: "0.0.2002", hbar: 1 }).now();
```

## Core Concepts

### The Factory

`hieco(...)` returns the fluent Hieco client. Helper constructors are available for common cases:

- `hieco(config?)`
- `hieco.fromEnv(options?)`
- `hieco.forTestnet()`
- `hieco.forMainnet()`
- `hieco.forPreviewnet()`
- `hieco.withSigner(signer, config?)`
- `hieco.validateConfig(config?)`

### Fluent Handles

Transaction-capable operations return a fluent handle. The common endings are:

- `.now()` to execute immediately
- `.tx()` to build a transaction descriptor without submitting it
- `.queue()` to collect descriptors for batch or schedule flows

```ts
const handle = client.token.transfer({
  tokenId: "0.0.2001",
  from: "0.0.1001",
  to: "0.0.1002",
  amount: 10,
});

const receipt = await handle.now();
const descriptor = handle.tx();
```

### Domain Namespaces

The fluent client is organized around business domains:

- `account`
- `token`
- `topic`
- `contract`
- `file`
- `schedule`
- `node`
- `system`
- `util`
- `batch`
- `net`
- `evm`
- `legacy`
- `reads`
- `tx`

### Result Model

Queries and mutations resolve to `Result<T>` values:

```ts
import { unwrap } from "@hieco/sdk";

const receipt = unwrap(await client.account.send({ to: "0.0.2002", hbar: 1 }).now());
```

Use `unwrap()` when failure should throw, or inspect `result.ok` manually when you want to branch.

### Client Scoping

The fluent client can be rebound without rebuilding your application architecture:

- `.as(signer)` for wallet-scoped authority
- `.with({ signer, operator, key })` for explicit overrides
- `.setOperator(operator, key)` for server-side operator rebinding
- `.setNetwork(...)` and mirror/network tuning through `net`

## Advanced

### Build Transactions Without Executing Them

```ts
const descriptor = client.contract
  .execute({
    id: "0.0.5005",
    fn: "setValue",
    params: [123],
  })
  .tx();

const receipt = await client.tx.submit(descriptor).now();
```

### Queue Operations For Scheduling Or Later Submission

```ts
const queue = client.batch.atomic({
  items: [
    client.token
      .transfer({
        tokenId: "0.0.2001",
        from: "0.0.1001",
        to: "0.0.1002",
        amount: 1,
      })
      .queue(),
    client.account
      .send({
        to: "0.0.1002",
        hbar: 1,
      })
      .queue(),
  ],
});

const receipt = await queue.now();
```

### Topic Watchers

```ts
const stop = client.topic.watch(
  "0.0.3003",
  (message) => {
    console.log(message.contentsText);
  },
  { limit: 25 },
);

setTimeout(() => {
  stop();
}, 10_000);
```

`watchFrom()` uses the same callback model and starts from a specific timestamp or range.

### Read-Only Mirror Queries

```ts
const page = await client.reads.accounts.list({ limit: 25 }).now();

if (page.ok) {
  console.log(page.value.items.length);
}
```

Use `listPageByUrl(url)` when you already have a pagination cursor from a previous page.

### Framework Recipes

#### Next.js

```ts
import "server-only";
import { hieco } from "@hieco/sdk";

export const serverHieco = hieco.fromEnv();
```

Use the SDK in Route Handlers, Server Actions, and other server-only modules. In client components, pass a wallet `Signer` instead of operator credentials.

#### TanStack Start

```ts
import { createServerFn } from "@tanstack/react-start";
import { hieco } from "@hieco/sdk";

export const getVersion = createServerFn().handler(async () => {
  return hieco.fromEnv().net.version().now();
});
```

Use `hieco.fromEnv()` inside server functions and use signer-scoped clients in browser code.

#### React Router Framework Mode

```ts
import { hieco } from "@hieco/sdk";

export async function loader() {
  return hieco.fromEnv().reads.network.supply().now();
}
```

Loaders and actions are a natural place for server-owned credentials. Client components should stay signer-based.

## API Reference

### Factory Exports

| Export                 | Kind     | Purpose                                                   | Usage form                          |
| ---------------------- | -------- | --------------------------------------------------------- | ----------------------------------- |
| `hieco`                | function | Create the fluent client.                                 | `hieco(config?)`                    |
| `hieco.fromEnv`        | function | Create a server-scoped client from environment variables. | `hieco.fromEnv(options?)`           |
| `hieco.forTestnet`     | function | Create a testnet client.                                  | `hieco.forTestnet()`                |
| `hieco.forMainnet`     | function | Create a mainnet client.                                  | `hieco.forMainnet()`                |
| `hieco.forPreviewnet`  | function | Create a previewnet client.                               | `hieco.forPreviewnet()`             |
| `hieco.withSigner`     | function | Create a signer-scoped client in one call.                | `hieco.withSigner(signer, config?)` |
| `hieco.validateConfig` | function | Validate client config without creating a client.         | `hieco.validateConfig(config?)`     |
| `HiecoClient`          | type     | The fluent client returned by `hieco(...)`.               | `type HiecoClient`                  |
| `Signer`               | type     | Hedera signer type re-exported from `@hiero-ledger/sdk`.  | `type Signer`                       |

### Client Surface

| Namespace or method  | Kind      | Purpose                                                                           | Members                                                                                                                                                                                                                                                                                                                 |
| -------------------- | --------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tx`                 | namespace | Submit or inspect transaction descriptors.                                        | `submit`, `record`, `receipt`                                                                                                                                                                                                                                                                                           |
| `account`            | namespace | HBAR transfers, account lifecycle, allowances, and account queries.               | `send`, `transfer`, `create`, `update`, `delete`, `allow`, `allowances`, `adjustAllowances`, `revokeNftAllowances`, `allowancesDeleteNft`, `allowanceSnapshot`, `ensureAllowances`, `balance`, `info`, `infoFlow`, `records`                                                                                            |
| `token`              | namespace | Token creation, transfers, KYC, freeze, pause, airdrops, and token reads.         | `create`, `mint`, `burn`, `send`, `transfer`, `sendNft`, `transferNft`, `associate`, `dissociate`, `freeze`, `unfreeze`, `grantKyc`, `revokeKyc`, `pause`, `unpause`, `wipe`, `delete`, `update`, `fees`, `airdrop`, `claimAirdrop`, `cancelAirdrop`, `reject`, `rejectFlow`, `updateNfts`, `info`, `nft`, `allowances` |
| `topic`              | namespace | Topic lifecycle, message submission, JSON helpers, watchers, and message reads.   | `create`, `update`, `delete`, `send`, `submit`, `sendJson`, `submitJson`, `sendMany`, `batchSubmit`, `watch`, `watchFrom`, `info`, `messages`                                                                                                                                                                           |
| `contract`           | namespace | Contract deployment, execution, ABI-aware calls, mirror simulation, and metadata. | `deploy`, `deployArtifact`, `run`, `execute`, `runTyped`, `executeTyped`, `call`, `callTyped`, `preflight`, `withAbi`, `delete`, `update`, `info`, `logs`, `bytecode`, `simulate`, `estimate`, `estimateGas`                                                                                                            |
| `file`               | namespace | File create, append, update, upload, delete, and content helpers.                 | `create`, `append`, `update`, `delete`, `upload`, `updateLarge`, `info`, `contents`, `text`, `contentsText`, `json`, `contentsJson`                                                                                                                                                                                     |
| `schedule`           | namespace | Schedule creation, signing, collection, waiting, and idempotent create flows.     | `create`, `sign`, `delete`, `info`, `wait`, `createIdempotent`, `collect`, `collectSignatures`, `waitForExecution`                                                                                                                                                                                                      |
| `node`               | namespace | Node administration transactions.                                                 | `create`, `update`, `delete`                                                                                                                                                                                                                                                                                            |
| `system`             | namespace | System freeze and entity delete or undelete operations.                           | `freeze`, `deleteEntity`, `undeleteEntity`                                                                                                                                                                                                                                                                              |
| `util`               | namespace | Utility transaction helpers.                                                      | `random`                                                                                                                                                                                                                                                                                                                |
| `batch`              | namespace | Batch transaction helpers.                                                        | `atomic`                                                                                                                                                                                                                                                                                                                |
| `net`                | namespace | Network metadata, ping helpers, and network switching.                            | `version`, `addressBook`, `ping`, `pingAll`, `update`, `setNetwork`, `setMirrorNetwork`                                                                                                                                                                                                                                 |
| `evm`                | namespace | Raw Ethereum transaction submission.                                              | `sendRaw`                                                                                                                                                                                                                                                                                                               |
| `legacy`             | namespace | Legacy live hash helpers.                                                         | `liveHash.add`, `liveHash.delete`, `liveHash.get`                                                                                                                                                                                                                                                                       |
| `reads`              | namespace | Read-only Mirror Node queries.                                                    | `accounts`, `tokens`, `contracts`, `transactions`, `topics`, `schedules`, `network`, `balances`, `blocks`                                                                                                                                                                                                               |
| `do`                 | namespace | Immediate-execution shortcuts for the fluent namespaces.                          | mirrors the client surface without `.do`                                                                                                                                                                                                                                                                                |
| `as`                 | method    | Scope the client to a signer.                                                     | `client.as(signer)`                                                                                                                                                                                                                                                                                                     |
| `with`               | method    | Override signer or operator credentials.                                          | `client.with({ signer, operator, key })`                                                                                                                                                                                                                                                                                |
| `setOperator`        | method    | Rebind operator credentials.                                                      | `client.setOperator(operator, key)`                                                                                                                                                                                                                                                                                     |
| `setMaxAttempts`     | method    | Update retry attempts for the gRPC client.                                        | `client.setMaxAttempts(maxAttempts)`                                                                                                                                                                                                                                                                                    |
| `setMaxNodeAttempts` | method    | Update node retry attempts.                                                       | `client.setMaxNodeAttempts(maxNodeAttempts)`                                                                                                                                                                                                                                                                            |
| `setRequestTimeout`  | method    | Update request timeout.                                                           | `client.setRequestTimeout(ms)`                                                                                                                                                                                                                                                                                          |
| `setGrpcDeadline`    | method    | Update gRPC deadline.                                                             | `client.setGrpcDeadline(ms)`                                                                                                                                                                                                                                                                                            |
| `setMinBackoff`      | method    | Update minimum backoff.                                                           | `client.setMinBackoff(ms)`                                                                                                                                                                                                                                                                                              |
| `setMaxBackoff`      | method    | Update maximum backoff.                                                           | `client.setMaxBackoff(ms)`                                                                                                                                                                                                                                                                                              |
| `destroy`            | method    | Tear down the underlying client resources.                                        | `client.destroy()`                                                                                                                                                                                                                                                                                                      |

### Read Namespaces

| Namespace            | Kind      | Purpose                                                               | Members                                                                                                                                                                                                 |
| -------------------- | --------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reads.accounts`     | namespace | Mirror account reads and derived transfer history.                    | `list`, `listPageByUrl`, `info`, `balances`, `tokens`, `nfts`, `rewards`, `allowances.crypto`, `allowances.token`, `allowances.nft`, `airdrops.outstanding`, `airdrops.pending`, `history`, `transfers` |
| `reads.tokens`       | namespace | Token lists, balances, NFTs, relationships, and transfer activity.    | `list`, `listPageByUrl`, `info`, `balances`, `balancesSnapshot`, `nfts`, `nft`, `nftTransactions`, `relationships`, `transfers`                                                                         |
| `reads.contracts`    | namespace | Contract metadata, calls, results, state, logs, and execution traces. | `list`, `listPageByUrl`, `info`, `call`, `results`, `result`, `state`, `logs`, `resultsAll`, `resultByTransactionIdOrHash`, `resultActions`, `resultOpcodes`, `logsAll`                                 |
| `reads.transactions` | namespace | Transaction lookup, account activity, and search.                     | `transaction`, `byAccount`, `list`, `listPageByUrl`, `search`                                                                                                                                           |
| `reads.topics`       | namespace | Topic and message reads.                                              | `list`, `listPageByUrl`, `info`, `messages`, `message`, `messageByTimestamp`                                                                                                                            |
| `reads.schedules`    | namespace | Schedule list and detail queries.                                     | `list`, `listPageByUrl`, `info`                                                                                                                                                                         |
| `reads.network`      | namespace | Exchange rate, fees, nodes, stake, and supply reads.                  | `exchangeRate`, `fees`, `nodes`, `nodesPageByUrl`, `stake`, `supply`                                                                                                                                    |
| `reads.balances`     | namespace | Balance snapshots and paginated balance lists.                        | `snapshot`, `list`, `listPageByUrl`                                                                                                                                                                     |
| `reads.blocks`       | namespace | Block snapshots, lists, page-by-url, and single-block lookup.         | `snapshot`, `list`, `listPageByUrl`, `block`                                                                                                                                                            |

### Exported Param Types

| Group        | Kind  | Purpose                                                                     | Exports                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------ | ----- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client       | types | Runtime configuration and shared amount primitives.                         | `ClientConfig`, `Amount`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Accounts     | types | Account transfers, lifecycle, and allowance params.                         | `TransferParams`, `CreateAccountParams`, `UpdateAccountParams`, `DeleteAccountParams`, `HbarAllowanceParams`, `TokenAllowanceParams`, `NftAllowanceParams`, `TokenAllowancesQueryParams`, `ApproveAllowanceParams`, `DeleteHbarAllowanceParams`, `DeleteTokenAllowanceParams`, `DeleteNftAllowanceParams`, `DeleteAllowanceParams`, `DeleteNftAllowancesParams`, `AdjustHbarAllowanceParams`, `AdjustTokenAllowanceParams`, `AdjustNftAllowanceParams`, `AdjustAllowanceParams`                                                                                                                                                                                                                                                                      |
| Contracts    | types | ABI helpers, deploy, execute, call, and update params.                      | `ConstructorParamsConfig`, `FunctionParamsConfig`, `DeployContractParams`, `DeployArtifactParams`, `AccountInfoFlowOptions`, `ExecuteContractParams`, `ExecuteContractParamsTyped`, `CallContractParams`, `DeleteContractParams`, `UpdateContractParams`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Files        | types | File lifecycle and large-file helpers.                                      | `CreateFileParams`, `AppendFileParams`, `UpdateFileParams`, `UploadFileParams`, `UpdateLargeFileParams`, `DeleteFileParams`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Network      | types | Node and system administration params.                                      | `NodeServiceEndpointParams`, `NodeCreateParams`, `NodeUpdateParams`, `NodeDeleteParams`, `FreezeIntent`, `FreezeNetworkParams`, `SystemDeleteParams`, `SystemUndeleteParams`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Schedules    | types | Schedule creation, signing, waiting, and collection params.                 | `ScheduleCreateParams`, `ScheduleSignParams`, `ScheduleDeleteParams`, `ScheduleWaitOptions`, `ScheduleIdempotentCreateParams`, `ScheduleCollectSignaturesParams`, `ScheduleWaitExecutionOptions`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Tokens       | types | Token creation, transfers, fees, airdrops, and NFT update params.           | `TokenTypeParam`, `TokenSupplyTypeParam`, `CustomFixedFeeParams`, `CustomFractionalFeeParams`, `CustomRoyaltyFeeParams`, `CustomFeeParams`, `CreateTokenParams`, `MintTokenParams`, `BurnTokenParams`, `TransferTokenParams`, `TransferNftParams`, `AssociateTokenParams`, `DissociateTokenParams`, `FreezeTokenParams`, `UnfreezeTokenParams`, `GrantKycParams`, `RevokeKycParams`, `PauseTokenParams`, `UnpauseTokenParams`, `WipeTokenParams`, `DeleteTokenParams`, `UpdateTokenParams`, `UpdateTokenFeeScheduleParams`, `TokenAirdropTokenTransferParams`, `TokenAirdropNftTransferParams`, `TokenAirdropParams`, `PendingAirdropReference`, `TokenClaimAirdropParams`, `TokenCancelAirdropParams`, `TokenRejectParams`, `TokenUpdateNftsParams` |
| Topics       | types | Topic create, update, submit, JSON submit, and watcher params.              | `CreateTopicParams`, `UpdateTopicParams`, `DeleteTopicParams`, `SubmitMessageParams`, `WatchTopicMessagesOptions`, `WatchTopicMessagesFromOptions`, `SubmitJsonMessageParams`, `BatchSubmitMessagesParams`, `TopicMessageData`, `TopicWatchHandle`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Transactions | types | Legacy live hash, raw EVM, random, batch, and transaction descriptor types. | `LiveHashAddParams`, `LiveHashDeleteParams`, `LiveHashQueryParams`, `EthereumSendRawParams`, `PrngParams`, `BatchAtomicParams`, `TransactionDescriptor`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

### Exported Result Types

| Group        | Kind  | Purpose                                                   | Exports                                                                                                                                                                                                                                            |
| ------------ | ----- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Result model | types | Generic success and failure wrappers.                     | `Result`, `Ok`, `Err`, `ok`, `err`                                                                                                                                                                                                                 |
| Accounts     | types | Account receipts and read results.                        | `TransferResult`, `CreateAccountResult`, `UpdateAccountResult`, `DeleteAccountResult`, `AccountInfoData`, `AccountRecordsData`                                                                                                                     |
| Contracts    | types | Contract receipts, mirror call results, and metadata.     | `ContractReceipt`, `ContractDeployArtifactResult`, `ContractExecuteReceipt`, `ContractCallResult`, `ContractInfoData`, `ContractLogsData`, `ContractBytecodeData`, `MirrorContractCallData`, `MirrorContractEstimateData`, `ContractPreflightData` |
| Files        | types | File receipts, chunked uploads, and file reads.           | `FileReceipt`, `FileChunkedReceipt`, `FileInfoData`, `FileContentsData`                                                                                                                                                                            |
| Network      | types | Version, address book, and ping results.                  | `NetworkVersionData`, `AddressBookData`, `PingNodeResult`, `PingAllData`                                                                                                                                                                           |
| Legacy       | types | Legacy live hash data.                                    | `LiveHashData`                                                                                                                                                                                                                                     |
| Transactions | types | Receipt, record, and receipt-query result shapes.         | `TransactionReceiptData`, `TransactionRecordData`, `TransactionReceiptQueryData`                                                                                                                                                                   |
| Schedules    | types | Schedule receipts and schedule reads.                     | `ScheduleReceipt`, `ScheduleInfoData`                                                                                                                                                                                                              |
| Tokens       | types | Token receipts, mint receipts, and token read results.    | `TokenReceipt`, `MintReceipt`, `TokenInfoData`, `TokenNftInfoData`                                                                                                                                                                                 |
| Topics       | types | Topic receipts, message receipts, and topic read results. | `TopicReceipt`, `MessageReceipt`, `TopicInfoData`, `TopicMessagesData`                                                                                                                                                                             |

### Error Exports

| Export                | Kind     | Purpose                                         | Usage form                 |
| --------------------- | -------- | ----------------------------------------------- | -------------------------- |
| `HieroErrorShape`     | type     | Base serializable error shape.                  | `type HieroErrorShape`     |
| `ErrorCode`           | type     | Stable error code union.                        | `type ErrorCode`           |
| `ErrorDetails`        | type     | Structured error metadata.                      | `type ErrorDetails`        |
| `ErrorKind`           | type     | High-level error classification.                | `type ErrorKind`           |
| `ErrorClassification` | type     | Enriched error classification result.           | `type ErrorClassification` |
| `createError`         | function | Create an SDK error shape.                      | `createError(input)`       |
| `HieroError`          | class    | Runtime error class used by the SDK.            | `new HieroError(...)`      |
| `toHieroError`        | function | Convert a shape into `HieroError`.              | `toHieroError(error)`      |
| `unwrap`              | function | Throw on failure and return `value` on success. | `unwrap(result)`           |
| `classifyError`       | function | Normalize unknown errors into a classification. | `classifyError(error)`     |
| `formatError`         | function | Create a readable error string.                 | `formatError(error)`       |

### Utility Exports

| Export             | Kind     | Purpose                                                 | Usage form                |
| ------------------ | -------- | ------------------------------------------------------- | ------------------------- |
| `EntityId`         | type     | Hedera entity identifier string alias.                  | `type EntityId`           |
| `NetworkType`      | type     | Supported default network names.                        | `type NetworkType`        |
| `NETWORK_CONFIGS`  | const    | Default network and mirror endpoint definitions.        | `NETWORK_CONFIGS.testnet` |
| `isDefaultNetwork` | function | Check whether a network string is one of the built-ins. | `isDefaultNetwork(value)` |
| `isValidEntityId`  | function | Validate an entity ID string.                           | `isValidEntityId(value)`  |

## Related Packages

- [`@hieco/react`](../react/README.md) for React bindings built on this SDK
- [`@hieco/mirror`](../mirror/README.md) for direct Mirror Node REST reads
- [`@hieco/realtime`](../realtime/README.md) for Relay WebSocket subscriptions
