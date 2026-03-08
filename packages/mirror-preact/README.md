# @hieco/mirror-preact

## Overview

`@hieco/mirror-preact` adds Preact hooks on top of `@hieco/mirror` using TanStack Query for Preact.

It provides:

- one `MirrorNodeProvider` for network and client ownership
- query hooks for every exported mirror domain
- infinite-query helpers for cursor-based endpoints
- transaction polling helpers and reusable API error boundaries

## Installation

```bash
npm install @hieco/mirror @hieco/mirror-preact @tanstack/preact-query
```

```bash
pnpm add @hieco/mirror @hieco/mirror-preact @tanstack/preact-query
```

```bash
yarn add @hieco/mirror @hieco/mirror-preact @tanstack/preact-query
```

```bash
bun add @hieco/mirror @hieco/mirror-preact @tanstack/preact-query
```

Peer dependency expected from the host app:

- `preact >= 10`

## When To Use This Package

Use `@hieco/mirror-preact` when you want to:

- query Mirror Node data from Preact components
- switch networks at runtime without rebuilding the app shell
- use TanStack Query caches, retries, and invalidation with Hedera reads
- build dashboards, explorers, or activity feeds without transaction execution

## Quick Start

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/preact-query";
import { MirrorNodeProvider, useAccountInfo } from "@hieco/mirror-preact";

const queryClient = new QueryClient();

function AccountCard() {
  const account = useAccountInfo({ accountId: "0.0.1001" });

  if (account.isPending) return <div>Loading...</div>;
  if (account.isError) return <div>{account.error.message}</div>;

  return <pre>{JSON.stringify(account.data, null, 2)}</pre>;
}

export function Providers() {
  return (
    <QueryClientProvider client={queryClient}>
      <MirrorNodeProvider config={{ defaultNetwork: "testnet" }}>
        <AccountCard />
      </MirrorNodeProvider>
    </QueryClientProvider>
  );
}
```

## Core Concepts

### Provider-Owned Mirror Client

`MirrorNodeProvider` creates a `MirrorNodeClient` from:

- `defaultNetwork`
- optional `networks`

Built-in networks such as `mainnet`, `testnet`, and `previewnet` work without extra setup. Custom network names must be present in `config.networks`, and the provider now fails immediately if a custom `defaultNetwork` or `switchNetwork(...)` target has no configured URL.

The context also exposes:

- `network`
- `mirrorNodeUrl`
- `switchNetwork(...)`

### Hook Pattern

Most hooks take a single options object:

```tsx
useAccountInfo({ accountId: "0.0.1001" });
useTokenInfo({ tokenId: "0.0.2001" });
useTransactions({ params: { limit: 25 } });
```

Infinite hooks end in `Infinite` and return TanStack infinite-query results.

### Result Model

Hook `data` values are still `ApiResult<T>`, so you can keep success and failure handling explicit:

```tsx
if (query.data?.success) {
  console.log(query.data.data);
}
```

## Advanced

### Network Switching

```tsx
import { useNetwork } from "@hieco/mirror-preact";

export function NetworkSwitcher() {
  const { network, switchNetwork } = useNetwork();

  return (
    <div>
      <span>{network}</span>
      <button onClick={() => switchNetwork("mainnet")}>Mainnet</button>
      <button onClick={() => switchNetwork("testnet")}>Testnet</button>
    </div>
  );
}
```

`switchNetwork(...)` accepts plain network names, but custom names must exist in `config.networks`.

### Infinite Queries

```tsx
import { useTokensInfinite } from "@hieco/mirror-preact";

export function TokenFeed() {
  const tokens = useTokensInfinite({ params: { limit: 25 } });

  return (
    <button
      disabled={!tokens.hasNextPage || tokens.isFetchingNextPage}
      onClick={() => void tokens.fetchNextPage()}
    >
      Load more
    </button>
  );
}
```

### Polling Transactions

```tsx
import { usePollTransaction } from "@hieco/mirror-preact";

export function TransactionStatus({ transactionId }: { transactionId: string }) {
  const tx = usePollTransaction({ transactionId, intervalMs: 1_000 });

  return <pre>{JSON.stringify(tx.data, null, 2)}</pre>;
}
```

### Error Boundaries

```tsx
import { ApiErrorBoundary } from "@hieco/mirror-preact";

export function Screen() {
  return (
    <ApiErrorBoundary
      fallback={({ error, reset }) => <button onClick={reset}>{error.message}</button>}
    >
      <div>Content</div>
    </ApiErrorBoundary>
  );
}
```

## API Reference

### Provider And Context

| Export                    | Kind      | Purpose                                                 | Usage form                          |
| ------------------------- | --------- | ------------------------------------------------------- | ----------------------------------- |
| `MirrorNodeProvider`      | component | Root provider for the mirror client and active network. | `<MirrorNodeProvider config={...}>` |
| `MirrorNodeProviderProps` | type      | Props accepted by `MirrorNodeProvider`.                 | `type MirrorNodeProviderProps`      |
| `MirrorNodeContextValue`  | type      | Context value exposed by the provider.                  | `type MirrorNodeContextValue`       |
| `useMirrorNodeContext`    | hook      | Access the full mirror context.                         | `useMirrorNodeContext()`            |
| `useMirrorNodeClient`     | hook      | Access the underlying `MirrorNodeClient`.               | `useMirrorNodeClient()`             |
| `useNetwork`              | hook      | Access the active network, URL, and `switchNetwork`.    | `useNetwork()`                      |
| `NetworkConfig`           | type      | Provider network config type exported by this package.  | `type NetworkConfig`                |

### Hook Families

| Domain         | Kind       | Purpose                                                                                  | Exports                                                                                                                                                                                                                                                                                                                  |
| -------------- | ---------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Accounts       | hooks      | Account lookup, balances, token relationships, rewards, allowances, lists, and airdrops. | `useAccountInfo`, `useAccountBalances`, `useAccountTokens`, `useAccountNfts`, `useAccountStakingRewards`, `useAccountCryptoAllowances`, `useAccountTokenAllowances`, `useAccountNftAllowances`, `useAccounts`, `useAccountsInfinite`, `useAccountOutstandingAirdrops`, `useAccountPendingAirdrops`, `useAccountOverview` |
| Balances       | hooks      | Balance snapshots and filtered balance reads.                                            | `useBalances`                                                                                                                                                                                                                                                                                                            |
| Blocks         | hooks      | Block list and single-block lookups.                                                     | `useBlocks`, `useBlock`                                                                                                                                                                                                                                                                                                  |
| Contracts      | hooks      | Contract info, calls, results, state, logs, traces, and contract lists.                  | `useContractInfo`, `useContractCall`, `useContractResults`, `useContractResult`, `useContractState`, `useContractLogs`, `useContracts`, `useContractsInfinite`, `useContractAllResults`, `useContractResultByTransactionIdOrHash`, `useContractResultActions`, `useContractResultOpcodes`, `useContractAllLogs`          |
| Network        | hooks      | Exchange rate, fees, nodes, stake, and supply reads.                                     | `useNetworkExchangeRate`, `useNetworkFees`, `useNetworkNodes`, `useNetworkStake`, `useNetworkSupply`                                                                                                                                                                                                                     |
| Polling        | hooks      | Transaction polling helpers.                                                             | `usePollTransaction`                                                                                                                                                                                                                                                                                                     |
| Error Handling | components | API error boundaries for mirror-driven UI sections.                                      | `ApiErrorFallback`, `ApiErrorBoundary`, `withApiErrorBoundary`                                                                                                                                                                                                                                                           |
| Schedules      | hooks      | Schedule lookup and paginated schedule reads.                                            | `useScheduleInfo`, `useSchedules`, `useSchedulesInfinite`                                                                                                                                                                                                                                                                |
| Tokens         | hooks      | Token info, balances, NFTs, NFT transactions, and token lists.                           | `useTokenInfo`, `useTokenBalances`, `useTokenBalancesSnapshot`, `useTokenNfts`, `useTokenNft`, `useTokenNftTransactions`, `useTokens`, `useTokensInfinite`                                                                                                                                                               |
| Topics         | hooks      | Topic info, messages, message lookup, and topic lists.                                   | `useTopicInfo`, `useTopicMessages`, `useTopicMessage`, `useTopics`, `useTopicsInfinite`, `useTopicMessageByTimestamp`                                                                                                                                                                                                    |
| Transactions   | hooks      | Transaction lookup and transaction list flows.                                           | `useTransaction`, `useTransactionsByAccount`, `useTransactions`, `useTransactionsInfinite`                                                                                                                                                                                                                               |

### Shared Types

Use `@hieco/mirror` for shared entity types, query parameter types, result helpers, and query keys. `@hieco/mirror-preact` focuses on the Preact provider, context hooks, and query hooks.

## Related Packages

- [`@hieco/mirror`](../mirror/README.md) for the underlying Mirror Node client
- [`@hieco/mirror-react`](../mirror-react/README.md) for the same API shape in React
- [`@hieco/mirror-solid`](../mirror-solid/README.md) for the same API shape in Solid
