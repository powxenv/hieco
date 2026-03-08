# `@hieco/mirror-preact` API Reference

Canonical docs:

- [`@hieco/mirror-preact` README](https://github.com/powxenv/hieco/tree/main/packages/mirror-preact)
- Package sources and installed lookup paths: [sources.md](sources.md)

Installed lookup paths:

- `node_modules/@hieco/mirror-preact/README.md`
- `node_modules/@hieco/mirror-preact/dist/index.d.ts`

## Provider And Context

| Export                 | What it does                                                                 | Parameters                       | Returns                                                                         |
| ---------------------- | ---------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------- |
| `MirrorNodeProvider`   | Provide a `MirrorNodeClient` plus active network state to Preact components. | `props: MirrorNodeProviderProps` | `VNode`                                                                         |
| `useMirrorNodeContext` | Read the full mirror context.                                                | none                             | `MirrorNodeContextValue`                                                        |
| `useMirrorNodeClient`  | Read the active `MirrorNodeClient`.                                          | none                             | `MirrorNodeClient`                                                              |
| `useNetwork`           | Read the active network, resolved URL, and network switch callback.          | none                             | `Pick<MirrorNodeContextValue, "network" \| "mirrorNodeUrl" \| "switchNetwork">` |

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
  children: VNode;
  config: NetworkConfig;
}
```

### `MirrorNodeContextValue`

```ts
interface MirrorNodeContextValue {
  client: MirrorNodeClient;
  network: string;
  mirrorNodeUrl: string | undefined;
  switchNetwork: (network: string) => void;
}
```

## Hook Conventions

The Preact wrapper mirrors the React wrapper closely.

- standard hooks return Preact-compatible query results
- infinite hooks return paginated infinite-query results
- polling helpers wrap repeated transaction lookups

## Hook Families

| Domain       | What the hooks do                                                                                  | Exports                                                                                                                                                                                                                                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Accounts     | Account info, balances, tokens, NFTs, staking rewards, allowances, airdrops, and account overview. | `useAccountInfo`, `useAccountBalances`, `useAccountTokens`, `useAccountNfts`, `useAccountStakingRewards`, `useAccountCryptoAllowances`, `useAccountTokenAllowances`, `useAccountNftAllowances`, `useAccounts`, `useAccountsInfinite`, `useAccountOutstandingAirdrops`, `useAccountPendingAirdrops`, `useAccountOverview` |
| Balances     | Balance list queries.                                                                              | `useBalances`                                                                                                                                                                                                                                                                                                            |
| Blocks       | Block list and single block queries.                                                               | `useBlocks`, `useBlock`                                                                                                                                                                                                                                                                                                  |
| Contracts    | Contract info, call, results, state, logs, all-results, and trace queries.                         | `useContractInfo`, `useContractCall`, `useContractResults`, `useContractResult`, `useContractState`, `useContractLogs`, `useContracts`, `useContractsInfinite`, `useContractAllResults`, `useContractResultByTransactionIdOrHash`, `useContractResultActions`, `useContractResultOpcodes`, `useContractAllLogs`          |
| Network      | Exchange rate, fees, nodes, stake, and supply queries.                                             | `useNetworkExchangeRate`, `useNetworkFees`, `useNetworkNodes`, `useNetworkStake`, `useNetworkSupply`                                                                                                                                                                                                                     |
| Polling      | Transaction polling helpers.                                                                       | `usePollTransaction`                                                                                                                                                                                                                                                                                                      |
| Error Handling | API error boundaries for mirror-driven UI sections.                                              | `ApiErrorFallback`, `ApiErrorBoundary`, `withApiErrorBoundary`                                                                                                                                                                                                                                                             |
| Schedules    | Schedule info and paginated schedule lists.                                                        | `useScheduleInfo`, `useSchedules`, `useSchedulesInfinite`                                                                                                                                                                                                                                                                |
| Tokens       | Token info, balances, NFTs, NFT transactions, and token lists.                                     | `useTokenInfo`, `useTokenBalances`, `useTokenBalancesSnapshot`, `useTokenNfts`, `useTokenNft`, `useTokenNftTransactions`, `useTokens`, `useTokensInfinite`                                                                                                                                                               |
| Topics       | Topic info, topic messages, message lookup, and topic lists.                                       | `useTopicInfo`, `useTopicMessages`, `useTopicMessage`, `useTopics`, `useTopicsInfinite`, `useTopicMessageByTimestamp`                                                                                                                                                                                                    |
| Transactions | Single transaction reads, account transaction lists, and paginated transaction queries.            | `useTransaction`, `useTransactionsByAccount`, `useTransactions`, `useTransactionsInfinite`                                                                                                                                                                                                                               |

## Shared Types

Use `@hieco/mirror` for shared entity types, query parameter types, result helpers, and query keys. `@hieco/mirror-preact` is the Preact wrapper layer.

## Exact Type Definition Entry Points

When an agent needs exact hook signatures or return generics, read these installed files in order:

1. `node_modules/@hieco/mirror-preact/dist/index.d.ts`
2. `node_modules/@hieco/mirror-preact/README.md`
3. `node_modules/@hieco/mirror/dist/index.d.ts`
