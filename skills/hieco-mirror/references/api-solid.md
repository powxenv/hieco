# `@hieco/mirror-solid` API Reference

Canonical docs:

- [`@hieco/mirror-solid` README](https://github.com/powxenv/hieco/tree/main/packages/mirror-solid)
- Package sources and installed lookup paths: [sources.md](sources.md)

Installed lookup paths:

- `node_modules/@hieco/mirror-solid/README.md`
- `node_modules/@hieco/mirror-solid/dist/index.d.ts`

## Provider And Context

| Export                 | What it does                                                                | Parameters                       | Returns                                                                         |
| ---------------------- | --------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------- |
| `MirrorNodeProvider`   | Provide a `MirrorNodeClient` plus active network state to Solid components. | `props: MirrorNodeProviderProps` | `JSX.Element`                                                                   |
| `useMirrorNodeContext` | Read the full mirror context.                                               | none                             | `MirrorNodeContextValue`                                                        |
| `useMirrorNodeClient`  | Read the client accessor.                                                   | none                             | `() => MirrorNodeClient`                                                        |
| `useNetwork`           | Read the network accessor, URL accessor, and network switch callback.       | none                             | `Pick<MirrorNodeContextValue, "network" \| "mirrorNodeUrl" \| "switchNetwork">` |

### `NetworkConfig`

```ts
interface NetworkConfig {
  defaultNetwork: string;
  networks?: Record<string, string>;
}
```

### `MirrorNodeProviderProps`

```ts
interface MirrorNodeProviderProps {
  children: JSX.Element;
  config: NetworkConfig;
}
```

### `MirrorNodeContextValue`

```ts
interface MirrorNodeContextValue {
  client: Accessor<MirrorNodeClient>;
  network: Accessor<string>;
  mirrorNodeUrl: Accessor<string | undefined>;
  switchNetwork: (network: string) => void;
}
```

## Query Conventions

Solid exports `create*` query factories instead of React-style hooks.

### Standard query factory

Pattern:

```ts
createX(args?, options?) => UseQueryResult<TData, ApiError>
```

### Infinite query factory

Pattern:

```ts
createXInfinite(params?, options?) => infinite-query style result
```

### Polling helpers

- `createPollTransaction` polls a transaction until it resolves or the polling contract stops

### Error boundary helpers

- `ApiErrorBoundary` and related props are Solid error-boundary helpers for mirror failures

## Query Families

| Domain         | What the factories do                                                                              | Exports                                                                                                                                                                                                                                                                                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accounts       | Account info, balances, tokens, NFTs, staking rewards, allowances, airdrops, and account overview. | `createAccountInfo`, `createAccountBalances`, `createAccountTokens`, `createAccountNfts`, `createAccountStakingRewards`, `createAccountCryptoAllowances`, `createAccountTokenAllowances`, `createAccountNftAllowances`, `createAccounts`, `createAccountsInfinite`, `createAccountOutstandingAirdrops`, `createAccountPendingAirdrops`, `createAccountOverview` |
| Balances       | Balance list queries.                                                                              | `createBalances`                                                                                                                                                                                                                                                                                                                                                |
| Blocks         | Block list and single block queries.                                                               | `createBlocks`, `createBlock`                                                                                                                                                                                                                                                                                                                                   |
| Contracts      | Contract info, call, results, state, logs, all-results, and trace queries.                         | `createContractInfo`, `createContractCall`, `createContractResults`, `createContractResult`, `createContractState`, `createContractLogs`, `createContracts`, `createContractsInfinite`, `createContractAllResults`, `createContractResultByTransactionIdOrHash`, `createContractResultActions`, `createContractResultOpcodes`, `createContractAllLogs`          |
| Network        | Exchange rate, fees, nodes, stake, and supply queries.                                             | `createNetworkExchangeRate`, `createNetworkFees`, `createNetworkNodes`, `createNetworkStake`, `createNetworkSupply`                                                                                                                                                                                                                                             |
| Polling        | Transaction polling helpers.                                                                       | `createPollTransaction`                                                                                                                                                                                                                                                                                                                                         |
| Error Handling | API error boundaries for mirror-driven UI sections.                                                | `ApiErrorBoundary`, `ApiErrorBoundaryProps`, `ApiErrorFallbackProps`                                                                                                                                                                                                                                                                                            |
| Schedules      | Schedule info and paginated schedule lists.                                                        | `createScheduleInfo`, `createSchedules`, `createSchedulesInfinite`                                                                                                                                                                                                                                                                                              |
| Tokens         | Token info, balances, NFTs, NFT transactions, and token lists.                                     | `createTokenInfo`, `createTokenBalances`, `createTokenBalancesSnapshot`, `createTokenNfts`, `createTokenNft`, `createTokenNftTransactions`, `createTokens`, `createTokensInfinite`                                                                                                                                                                              |
| Topics         | Topic info, topic messages, message lookup, and topic lists.                                       | `createTopicInfo`, `createTopicMessages`, `createTopicMessage`, `createTopics`, `createTopicsInfinite`, `createTopicMessageByTimestamp`                                                                                                                                                                                                                         |
| Transactions   | Single transaction reads, account transaction lists, and paginated transaction queries.            | `createTransaction`, `createTransactionsByAccount`, `createTransactions`, `createTransactionsInfinite`                                                                                                                                                                                                                                                          |

## Shared Types

Use `@hieco/mirror` for shared entity types, query parameter types, result helpers, and query keys. `@hieco/mirror-solid` is the Solid wrapper layer.

## Exact Type Definition Entry Points

When an agent needs exact factory options or Solid accessor return shapes, read these installed files in order:

1. `node_modules/@hieco/mirror-solid/dist/index.d.ts`
2. `node_modules/@hieco/mirror-solid/README.md`
3. `node_modules/@hieco/mirror/dist/index.d.ts`
