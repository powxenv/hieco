# @hieco/mirror

## Overview

`@hieco/mirror` is the typed REST client for the Hedera Mirror Node API.

It is read-only and domain-first. You get one `MirrorNodeClient` instance with dedicated APIs for:

- accounts
- balances
- blocks
- contracts
- network
- schedules
- tokens
- topics
- transactions

## Installation

```bash
npm install @hieco/mirror
```

```bash
pnpm add @hieco/mirror
```

```bash
yarn add @hieco/mirror
```

```bash
bun add @hieco/mirror
```

## When To Use This Package

Use `@hieco/mirror` when you want to:

- query Hedera data without transaction submission
- build server-side dashboards, explorers, or API routes
- fetch paginated Mirror Node data with typed params and results
- power CLI, MCP, or framework adapter packages from one core client

If you want the same reads inside React, Preact, or Solid components, use one of the framework packages instead of calling this client directly.

## Quick Start

```ts
import { MirrorNodeClient } from "@hieco/mirror";

const client = new MirrorNodeClient({ network: "testnet" });

const account = await client.account.getInfo("0.0.1001");
const transactions = await client.transaction.listPaginated({
  limit: 25,
  order: "desc",
});
```

## Core Concepts

### One Client, Multiple Domain APIs

`MirrorNodeClient` exposes one property per domain:

- `account`
- `balance`
- `block`
- `contract`
- `network`
- `schedule`
- `token`
- `topic`
- `transaction`

### Result Shape

Every call returns `ApiResult<T>`, which keeps success and failure explicit.

```ts
const result = await client.token.getInfo("0.0.2001");

if (result.success) {
  console.log(result.data.symbol);
} else {
  console.error(result.error.message);
}
```

### Pagination Model

List-style APIs usually expose four forms:

- `get...` for one page or one aggregate response
- `listPaginated(...)` to fetch every page and flatten results
- `listPaginatedPage(...)` to fetch one page and preserve cursor links
- `listPaginatedPageByUrl(url)` to follow an existing cursor
- `create...Paginator(...)` to stream results incrementally with `CursorPaginator`

### Network Configuration

You can construct the client with:

- a built-in network name such as `mainnet`, `testnet`, or `previewnet`
- an optional explicit `mirrorNodeUrl`

## Advanced

### Custom Mirror Endpoints

```ts
import { MirrorNodeClient } from "@hieco/mirror";

const client = new MirrorNodeClient({
  network: "testnet",
  mirrorNodeUrl: "https://testnet.mirrornode.hedera.com",
});
```

### Page-By-Page Traversal

```ts
const firstPage = await client.token.listPaginatedPage({ limit: 25 });

if (firstPage.success && firstPage.data.links.next) {
  const secondPage = await client.token.listPaginatedPageByUrl(firstPage.data.links.next);
}
```

### Cursor Paginators

```ts
const paginator = client.transaction.createTransactionPaginator({
  limit: 25,
  order: "desc",
});

for await (const transaction of paginator) {
  console.log(transaction.transaction_id);
}
```

### Contract And Topic Reads

```ts
const logs = await client.contract.getLogs("0.0.5005", {
  topic0: "0x1234",
  limit: 25,
});

const messages = await client.topic.getMessages("0.0.3003", {
  encoding: "utf-8",
  limit: 25,
});
```

## API Reference

### Root Exports

| Export              | Kind  | Purpose                                         | Usage form                            |
| ------------------- | ----- | ----------------------------------------------- | ------------------------------------- |
| `MirrorNodeClient`  | class | Construct the typed Mirror Node client.         | `new MirrorNodeClient(config)`        |
| `CursorPaginator`   | class | Async iterator for cursor-based endpoints.      | `for await (const item of paginator)` |
| `PaginatedResponse` | type  | One-page response with `data` and `links.next`. | `type PaginatedResponse<T>`           |

### Client Domains

| Property             | Kind     | Purpose                                              | Value            |
| -------------------- | -------- | ---------------------------------------------------- | ---------------- |
| `client.account`     | property | Account and allowance reads.                         | `AccountApi`     |
| `client.balance`     | property | Balance snapshot and balance list reads.             | `BalanceApi`     |
| `client.block`       | property | Block reads.                                         | `BlockApi`       |
| `client.contract`    | property | Contract metadata, calls, logs, results, and traces. | `ContractApi`    |
| `client.network`     | property | Exchange rate, fees, nodes, stake, and supply reads. | `NetworkApi`     |
| `client.schedule`    | property | Schedule reads.                                      | `ScheduleApi`    |
| `client.token`       | property | Token metadata, balances, and NFT reads.             | `TokenApi`       |
| `client.topic`       | property | Topic metadata and message reads.                    | `TopicApi`       |
| `client.transaction` | property | Transaction reads.                                   | `TransactionApi` |
| `client.networkType` | property | Built-in network used by the client.                 | `NetworkType`    |
| `client.baseUrl`     | property | Effective Mirror Node base URL.                      | `string`         |

### Domain APIs

| API              | Kind  | Purpose                                                                       | Methods                                                                                                                                                                                                                                                                          |
| ---------------- | ----- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AccountApi`     | class | Account, balance, token relationship, reward, allowance, and airdrop reads.   | `getInfo`, `getBalances`, `getTokens`, `getNfts`, `getStakingRewards`, `getCryptoAllowances`, `getTokenAllowances`, `getNftAllowances`, `getOutstandingAirdrops`, `getPendingAirdrops`, `listPaginated`, `listPaginatedPage`, `listPaginatedPageByUrl`, `createAccountPaginator` |
| `BalanceApi`     | class | Balance snapshots and paginated account balances.                             | `getBalances`, `listPaginated`, `listPaginatedPage`, `listPaginatedPageByUrl`, `createBalancesPaginator`                                                                                                                                                                         |
| `BlockApi`       | class | Single block lookup and block pagination.                                     | `getBlocks`, `getBlock`, `listPaginated`, `listPaginatedPage`, `listPaginatedPageByUrl`, `createBlocksPaginator`                                                                                                                                                                 |
| `ContractApi`    | class | Contract metadata, local calls, results, state, logs, traces, and pagination. | `getInfo`, `call`, `getResults`, `getResult`, `getState`, `getLogs`, `getAllResults`, `getResultByTransactionIdOrHash`, `getResultActions`, `getResultOpcodes`, `getAllContractLogs`, `listPaginated`, `listPaginatedPage`, `listPaginatedPageByUrl`, `createContractPaginator`  |
| `NetworkApi`     | class | Network exchange rate, fees, nodes, stake, and supply.                        | `getExchangeRate`, `getFees`, `getNodes`, `listPaginated`, `listPaginatedPage`, `listPaginatedPageByUrl`, `createNetworkNodesPaginator`, `getStake`, `getSupply`                                                                                                                 |
| `ScheduleApi`    | class | Schedule lookup and pagination.                                               | `getInfo`, `listPaginated`, `listPaginatedPage`, `listPaginatedPageByUrl`, `createSchedulePaginator`                                                                                                                                                                             |
| `TokenApi`       | class | Token metadata, balances, NFTs, NFT transactions, and token pagination.       | `getInfo`, `getBalances`, `getBalancesSnapshot`, `getNfts`, `getNft`, `getNftTransactions`, `listPaginated`, `listPaginatedPage`, `listPaginatedPageByUrl`, `createTokenPaginator`                                                                                               |
| `TopicApi`       | class | Topic lookup, topic messages, and topic pagination.                           | `getInfo`, `getMessages`, `getMessage`, `getMessageByTimestamp`, `listPaginated`, `listPaginatedPage`, `listPaginatedPageByUrl`, `createTopicPaginator`                                                                                                                          |
| `TransactionApi` | class | Transaction lookup, per-account activity, and transaction pagination.         | `getById`, `listByAccount`, `listPaginated`, `listPaginatedPage`, `listPaginatedPageByUrl`, `createTransactionPaginator`                                                                                                                                                         |

### Exported Param Types

| Group        | Kind  | Purpose                                                                | Exports                                                                                                          |
| ------------ | ----- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Accounts     | types | Filters for account lists, NFT lists, and allowance queries.           | `AccountListParams`, `AccountNftsParams`, `AccountTokenAllowancesParams`, `AccountNftAllowancesParams`           |
| Balances     | types | Filters for balance endpoints.                                         | `BalancesListParams`                                                                                             |
| Blocks       | types | Filters for block endpoints.                                           | `BlocksListParams`                                                                                               |
| Contracts    | types | Filters for contracts, contract results, state, logs, and local calls. | `ContractListParams`, `ContractLogsParams`, `ContractResultsParams`, `ContractStateParams`, `ContractCallParams` |
| Network      | types | Filters for network node queries.                                      | `NetworkNodesParams`                                                                                             |
| Schedules    | types | Filters for schedule endpoints.                                        | `ScheduleListParams`                                                                                             |
| Tokens       | types | Filters for token lists, balances, and NFT reads.                      | `TokenListParams`, `TokenBalancesParams`, `TokenNftsParams`                                                      |
| Topics       | types | Filters for topic message reads.                                       | `TopicMessagesParams`                                                                                            |
| Transactions | types | Filters for transaction lists and account activity.                    | `TransactionListParams`, `TransactionsByAccountParams`                                                           |

### Exported Entity Types

| Group                | Kind  | Purpose                                                   | Exports                                                                                                                                                                                                      |
| -------------------- | ----- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Accounts             | types | Account and allowance entities.                           | `AccountInfo`, `Balance`, `CryptoAllowance`, `NftAllowance`, `StakingReward`, `TokenAllowance`, `TokenAirdropsResponse`, `TokenRelationship`                                                                 |
| Contracts            | types | Contract metadata and execution entities.                 | `ContractAction`, `ContractCallResult`, `ContractInfo`, `ContractLog`, `ContractOpcodesResponse`, `ContractResult`, `ContractResultDetails`, `ContractResultsResponse`, `ContractState`                      |
| Network and balances | types | Network-wide data, block shapes, and balance responses.   | `AccountBalance`, `BalancesResponse`, `Block`, `BlocksResponse`, `ExchangeRate`, `NetworkFee`, `NetworkNode`, `NetworkStake`, `NetworkSupply`, `ServiceEndpoint`, `TimestampRange`, `TimestampRangeNullable` |
| Schedules            | types | Schedule entities.                                        | `Schedule`, `ScheduleSignature`                                                                                                                                                                              |
| Tokens               | types | Token metadata, balances, fees, and NFTs.                 | `CustomFees`, `FixedFee`, `FractionalFee`, `RoyaltyFee`, `TokenDistribution`, `TokenBalancesResponse`, `TokenInfo`, `Nft`                                                                                    |
| Topics               | types | Topic metadata and messages.                              | `ChunkInfo`, `ConsensusCustomFees`, `FixedCustomFee`, `Topic`, `TopicMessage`                                                                                                                                |
| Transactions         | types | Transfers, transaction metadata, and transaction details. | `AssessedCustomFee`, `NftTransfer`, `StakingRewardTransfer`, `TokenTransfer`, `Transaction`, `TransactionDetails`, `TransactionType`, `Transfer`                                                             |

### Utility Re-Exports

| Export                | Kind  | Purpose                                       | Usage form                      |
| --------------------- | ----- | --------------------------------------------- | ------------------------------- |
| `ApiResult`           | type  | Shared success or failure wrapper.            | `type ApiResult<T>`             |
| `ApiError`            | type  | Shared API error shape.                       | `type ApiError`                 |
| `ApiErrorFactory`     | const | Helpers for constructing API errors.          | `ApiErrorFactory.notFound(...)` |
| `Key`                 | type  | Hedera key metadata.                          | `type Key`                      |
| `MirrorNetworkConfig` | type  | Built-in mirror network configuration.        | `type MirrorNetworkConfig`      |
| `MirrorNodeConfig`    | type  | Mirror client construction config.            | `type MirrorNodeConfig`         |
| `NetworkType`         | type  | Built-in network names.                       | `type NetworkType`              |
| `PaginationParams`    | type  | Shared list pagination params.                | `type PaginationParams`         |
| `QueryOperator`       | type  | Range and comparison helper type for filters. | `type QueryOperator<T>`         |
| `TimestampFilter`     | type  | Timestamp range filter type.                  | `type TimestampFilter`          |
| `NETWORK_CONFIGS`     | const | Default network URLs.                         | `NETWORK_CONFIGS.testnet`       |

## Related Packages

- [`@hieco/mirror-react`](../mirror-react/README.md) for React hooks over this client
- [`@hieco/mirror-preact`](../mirror-preact/README.md) for Preact hooks over this client
- [`@hieco/mirror-solid`](../mirror-solid/README.md) for Solid query resources over this client
- [`@hieco/mirror-cli`](../mirror-cli/README.md) for a command-line interface built on this client
- [`@hieco/mirror-mcp`](../mirror-mcp/README.md) for an MCP server built on this client
