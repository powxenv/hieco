# `@hieco/mirror` API Reference

Canonical docs:

- [`@hieco/mirror` README](https://github.com/powxenv/hieco/tree/main/packages/mirror)
- Package sources and installed lookup paths: [sources.md](sources.md)

Installed lookup paths:

- `node_modules/@hieco/mirror/README.md`
- `node_modules/@hieco/mirror/dist/index.d.ts`
- `node_modules/@hieco/mirror/dist/index.js`

Use `dist/index.d.ts` as the authoritative source for exact entity fields, param types, and paginator signatures.

## Table Of Contents

- Root exports
- Core type definitions
- Client domains
- Domain API method patterns
- Exported param types
- Exported entity types
- Utility re-exports

## Root Exports

| Export              | What it does                                                | Parameters                                        | Returns                   |
| ------------------- | ----------------------------------------------------------- | ------------------------------------------------- | ------------------------- |
| `MirrorNodeClient`  | Construct the typed Mirror Node client.                     | `config: MirrorNodeConfig`                        | `MirrorNodeClient`        |
| `CursorPaginator`   | Iterate cursor-based endpoints page by page.                | constructor params depend on the endpoint adapter | async iterator over items |
| `PaginatedResponse` | One-page response wrapper with data and next-link metadata. | none                                              | type only                 |

## Core Type Definitions

### `MirrorNodeConfig`

Use the installed `dist/index.d.ts` for the exact contract. At a high level, it includes:

- `network?: NetworkType`
- `mirrorNodeUrl?: string`

### `PaginatedResponse<T>`

```ts
type PaginatedResponse<T> = {
  readonly data: readonly T[];
  readonly links: {
    readonly next: string | null;
  };
};
```

### Shared utility types

| Type               | Definition                                              |
| ------------------ | ------------------------------------------------------- |
| `NetworkType`      | built-in network name union                             |
| `TimestampFilter`  | timestamp filter string or `{ from?, to? }` object      |
| `PaginationParams` | shared page size and ordering params for list endpoints |
| `ApiResult<T>`     | success or failure wrapper used by the mirror packages  |
| `ApiError`         | normalized mirror error shape                           |

## Client Domains

| Property             | What it does                                         | Value type       |
| -------------------- | ---------------------------------------------------- | ---------------- |
| `client.account`     | Account and allowance reads.                         | `AccountApi`     |
| `client.balance`     | Balance snapshot and paginated balance lists.        | `BalanceApi`     |
| `client.block`       | Block reads.                                         | `BlockApi`       |
| `client.contract`    | Contract metadata, calls, logs, results, and traces. | `ContractApi`    |
| `client.network`     | Exchange rate, fees, nodes, stake, and supply reads. | `NetworkApi`     |
| `client.schedule`    | Schedule reads.                                      | `ScheduleApi`    |
| `client.token`       | Token metadata, balances, and NFT reads.             | `TokenApi`       |
| `client.topic`       | Topic metadata and message reads.                    | `TopicApi`       |
| `client.transaction` | Transaction reads.                                   | `TransactionApi` |
| `client.networkType` | Built-in network used by the client.                 | `NetworkType`    |
| `client.baseUrl`     | Effective Mirror Node base URL.                      | `string`         |

## Domain API Method Patterns

The domain APIs are consistent.

### Single-resource reads

Pattern:

```ts
getX(id, params?) => Promise<ApiResult<T>>
```

Examples:

- `account.getInfo(accountId)`
- `token.getInfo(tokenId)`
- `topic.getMessage(topicId, sequenceNumber)`
- `transaction.getById(transactionId)`

### List reads

Pattern:

```ts
listPaginated(params?) => Promise<ApiResult<readonly T[]>>
listPaginatedPage(params?) => Promise<ApiResult<PaginatedResponse<T>>>
listPaginatedPageByUrl(url) => Promise<ApiResult<PaginatedResponse<T>>>
createXPaginator(params?) => CursorPaginator<T>
```

Use:

- `listPaginated` when you want a single flattened list request
- `listPaginatedPage` when you need `links.next`
- `listPaginatedPageByUrl` when continuing from an existing page URL
- `createXPaginator` when you want async iteration

### Domain method coverage

| API              | Methods                                                                                                                                                                                                                                                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AccountApi`     | `getInfo`, `getBalances`, `getTokens`, `getNfts`, `getStakingRewards`, `getCryptoAllowances`, `getTokenAllowances`, `getNftAllowances`, `getOutstandingAirdrops`, `getPendingAirdrops`, `listPaginated`, `listPaginatedPage`, `listPaginatedPageByUrl`, `createAccountPaginator` |
| `BalanceApi`     | `getBalances`, `listPaginated`, `listPaginatedPage`, `listPaginatedPageByUrl`, `createBalancesPaginator`                                                                                                                                                                         |
| `BlockApi`       | `getBlocks`, `getBlock`, `listPaginated`, `listPaginatedPage`, `listPaginatedPageByUrl`, `createBlocksPaginator`                                                                                                                                                                 |
| `ContractApi`    | `getInfo`, `call`, `getResults`, `getResult`, `getState`, `getLogs`, `getAllResults`, `getResultByTransactionIdOrHash`, `getResultActions`, `getResultOpcodes`, `getAllContractLogs`, `listPaginated`, `listPaginatedPage`, `listPaginatedPageByUrl`, `createContractPaginator`  |
| `NetworkApi`     | `getExchangeRate`, `getFees`, `getNodes`, `listPaginated`, `listPaginatedPage`, `listPaginatedPageByUrl`, `createNetworkNodesPaginator`, `getStake`, `getSupply`                                                                                                                 |
| `ScheduleApi`    | `getInfo`, `listPaginated`, `listPaginatedPage`, `listPaginatedPageByUrl`, `createSchedulePaginator`                                                                                                                                                                             |
| `TokenApi`       | `getInfo`, `getBalances`, `getBalancesSnapshot`, `getNfts`, `getNft`, `getNftTransactions`, `listPaginated`, `listPaginatedPage`, `listPaginatedPageByUrl`, `createTokenPaginator`                                                                                               |
| `TopicApi`       | `getInfo`, `getMessages`, `getMessage`, `getMessageByTimestamp`, `listPaginated`, `listPaginatedPage`, `listPaginatedPageByUrl`, `createTopicPaginator`                                                                                                                          |
| `TransactionApi` | `getById`, `listByAccount`, `listPaginated`, `listPaginatedPage`, `listPaginatedPageByUrl`, `createTransactionPaginator`                                                                                                                                                         |

## Exported Param Types

These are the public input contracts for mirror endpoints.

| Group        | Exports                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| Accounts     | `AccountListParams`, `AccountNftsParams`, `AccountTokenAllowancesParams`, `AccountNftAllowancesParams`           |
| Balances     | `BalancesListParams`                                                                                             |
| Blocks       | `BlocksListParams`                                                                                               |
| Contracts    | `ContractListParams`, `ContractLogsParams`, `ContractResultsParams`, `ContractStateParams`, `ContractCallParams` |
| Network      | `NetworkNodesParams`                                                                                             |
| Schedules    | `ScheduleListParams`                                                                                             |
| Tokens       | `TokenListParams`, `TokenBalancesParams`, `TokenNftsParams`                                                      |
| Topics       | `TopicMessagesParams`                                                                                            |
| Transactions | `TransactionListParams`, `TransactionsByAccountParams`                                                           |

## Exported Entity Types

These are the public mirror response shapes. Read the installed `dist/index.d.ts` for every field.

| Group                | Exports                                                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Accounts             | `AccountInfo`, `Balance`, `CryptoAllowance`, `NftAllowance`, `StakingReward`, `TokenAllowance`, `TokenAirdropsResponse`, `TokenRelationship`                                                                 |
| Contracts            | `ContractAction`, `ContractCallResult`, `ContractInfo`, `ContractLog`, `ContractOpcodesResponse`, `ContractResult`, `ContractResultDetails`, `ContractResultsResponse`, `ContractState`                      |
| Network and balances | `AccountBalance`, `BalancesResponse`, `Block`, `BlocksResponse`, `ExchangeRate`, `NetworkFee`, `NetworkNode`, `NetworkStake`, `NetworkSupply`, `ServiceEndpoint`, `TimestampRange`, `TimestampRangeNullable` |
| Schedules            | `Schedule`, `ScheduleSignature`                                                                                                                                                                              |
| Tokens               | `CustomFees`, `FixedFee`, `FractionalFee`, `RoyaltyFee`, `TokenDistribution`, `TokenBalancesResponse`, `TokenInfo`, `Nft`                                                                                    |
| Topics               | `ChunkInfo`, `ConsensusCustomFees`, `FixedCustomFee`, `Topic`, `TopicMessage`                                                                                                                                |
| Transactions         | `AssessedCustomFee`, `NftTransfer`, `StakingRewardTransfer`, `TokenTransfer`, `Transaction`, `TransactionDetails`, `TransactionType`, `Transfer`                                                             |

## Utility Re-Exports

| Export                | Kind  | What it does                             |
| --------------------- | ----- | ---------------------------------------- |
| `ApiResult`           | type  | Shared success or failure wrapper.       |
| `ApiError`            | type  | Shared mirror error shape.               |
| `ApiErrorFactory`     | const | Helpers for constructing mirror errors.  |
| `Key`                 | type  | Hedera key metadata.                     |
| `MirrorNetworkConfig` | type  | Built-in network config shape.           |
| `MirrorNodeConfig`    | type  | Mirror client construction config.       |
| `NetworkType`         | type  | Built-in network names.                  |
| `PaginationParams`    | type  | Shared list pagination params.           |
| `QueryOperator`       | type  | Range and comparison helper for filters. |
| `TimestampFilter`     | type  | Timestamp range filter type.             |
| `NETWORK_CONFIGS`     | const | Default network URLs.                    |

## Exact Type Definition Entry Points

When an agent needs every field, overload, or paginator contract, read these installed files in order:

1. `node_modules/@hieco/mirror/dist/index.d.ts`
2. `node_modules/@hieco/mirror/README.md`
3. [packages/mirror on GitHub](https://github.com/powxenv/hieco/tree/main/packages/mirror)
