# @hieco/mirror-react

## Overview

`@hieco/mirror-react` adds React hooks on top of `@hieco/mirror` using TanStack Query.

It provides:

- one `MirrorNodeProvider` for network and client ownership
- query hooks for every exported mirror domain
- infinite-query helpers for cursor-based endpoints
- transaction polling helpers and reusable API error boundaries

## Installation

```bash
npm install @hieco/mirror @hieco/mirror-react @tanstack/react-query
```

```bash
pnpm add @hieco/mirror @hieco/mirror-react @tanstack/react-query
```

```bash
yarn add @hieco/mirror @hieco/mirror-react @tanstack/react-query
```

```bash
bun add @hieco/mirror @hieco/mirror-react @tanstack/react-query
```

Peer dependencies expected from the host app:

- `react >= 18`
- `react-dom >= 18`

## When To Use This Package

Use `@hieco/mirror-react` when you want to:

- query Mirror Node data from React components
- switch networks at runtime without rebuilding the app shell
- use TanStack Query caches, retries, and invalidation with Hedera reads
- build dashboards, explorers, or activity feeds without transaction execution

If you need transactions or wallet-scoped writes, pair React with [`@hieco/react`](../react/README.md).

## Quick Start

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MirrorNodeProvider, useAccountInfo } from "@hieco/mirror-react";

const queryClient = new QueryClient();

function AccountCard() {
  const account = useAccountInfo({ accountId: "0.0.1001" });

  if (account.isPending) return <div>Loading...</div>;
  if (account.isError) return <div>{account.error.message}</div>;

  return <pre>{JSON.stringify(account.data, null, 2)}</pre>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <MirrorNodeProvider config={{ defaultNetwork: "testnet" }}>
        {children}
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
"use client";

import { useNetwork } from "@hieco/mirror-react";

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
"use client";

import { useTokensInfinite } from "@hieco/mirror-react";

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
"use client";

import { usePollTransaction } from "@hieco/mirror-react";

export function TransactionStatus({ transactionId }: { transactionId: string }) {
  const tx = usePollTransaction({ transactionId, intervalMs: 1_000 });

  return <pre>{JSON.stringify(tx.data, null, 2)}</pre>;
}
```

### Error Boundaries

```tsx
"use client";

import { ApiErrorBoundary } from "@hieco/mirror-react";

export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <ApiErrorBoundary
      fallback={({ error, reset }) => <button onClick={reset}>{error.message}</button>}
    >
      {children}
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

Use `@hieco/mirror` for shared entity types, query parameter types, result helpers, and query keys. `@hieco/mirror-react` focuses on the React provider, context hooks, and query hooks.

## Related Packages

- [`@hieco/mirror`](../mirror/README.md) for the underlying Mirror Node client
- [`@hieco/mirror-preact`](../mirror-preact/README.md) for the same API shape in Preact
- [`@hieco/mirror-solid`](../mirror-solid/README.md) for the same API shape in Solid
- [`@hieco/react`](../react/README.md) for transaction-capable React bindings
