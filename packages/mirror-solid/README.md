# @hieco/mirror-solid

## Overview

`@hieco/mirror-solid` adds Solid bindings on top of `@hieco/mirror` using TanStack Query for Solid.

It provides:

- one `MirrorNodeProvider` for network and client ownership
- `create*` query helpers for every exported mirror domain
- infinite-query helpers for cursor-based endpoints
- transaction polling helpers and reusable API error boundaries

## Installation

```bash
npm install @hieco/mirror @hieco/mirror-solid @tanstack/solid-query
```

```bash
pnpm add @hieco/mirror @hieco/mirror-solid @tanstack/solid-query
```

```bash
yarn add @hieco/mirror @hieco/mirror-solid @tanstack/solid-query
```

```bash
bun add @hieco/mirror @hieco/mirror-solid @tanstack/solid-query
```

Peer dependencies expected from the host app:

- `solid-js >= 1.8`

## When To Use This Package

Use `@hieco/mirror-solid` when you want to:

- query Mirror Node data from Solid components
- keep query inputs reactive with accessor-based APIs
- switch networks at runtime without rebuilding the app shell
- use TanStack Query caches, retries, and infinite queries with Hedera reads

If you need transaction execution or wallet-scoped writes, use [`@hieco/sdk`](../sdk/README.md) directly or pair a React app with [`@hieco/react`](../react/README.md).

## Quick Start

```tsx
import type { JSX } from "solid-js";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { MirrorNodeProvider, createAccountInfo } from "@hieco/mirror-solid";

const queryClient = new QueryClient();

function AccountCard(): JSX.Element {
  const account = createAccountInfo(() => ({ accountId: "0.0.1001" }));

  return <pre>{JSON.stringify(account.data ?? null, null, 2)}</pre>;
}

export function Providers(props: { children: JSX.Element }): JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <MirrorNodeProvider config={{ defaultNetwork: "testnet" }}>
        {props.children}
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

- `network()`
- `mirrorNodeUrl()`
- `switchNetwork(...)`

### Accessor-Driven Queries

Every `create*` helper takes an accessor so query inputs can stay reactive:

```tsx
createAccountInfo(() => ({ accountId: "0.0.1001" }));
createTokenInfo(() => ({ tokenId: "0.0.2001" }));
createTransactions(() => ({ params: { limit: 25 } }));
```

Infinite helpers end in `Infinite` and return TanStack infinite-query results for Solid.

### Result Model

The query `data` value is still `ApiResult<T>`, so success and failure stay explicit:

```tsx
if (account.data?.success) {
  console.log(account.data.data);
}
```

## Advanced

### Network Switching

```tsx
import type { JSX } from "solid-js";
import { useNetwork } from "@hieco/mirror-solid";

export function NetworkSwitcher(): JSX.Element {
  const { network, switchNetwork } = useNetwork();

  return (
    <div>
      <span>{network()}</span>
      <button onClick={() => switchNetwork("mainnet")}>Mainnet</button>
      <button onClick={() => switchNetwork("testnet")}>Testnet</button>
    </div>
  );
}
```

`switchNetwork(...)` accepts plain network names, but custom names must exist in `config.networks`.

### Infinite Queries

```tsx
import type { JSX } from "solid-js";
import { createTokensInfinite } from "@hieco/mirror-solid";

export function TokenFeed(): JSX.Element {
  const tokens = createTokensInfinite(() => ({ params: { limit: 25 } }));

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
import type { JSX } from "solid-js";
import { createPollTransaction } from "@hieco/mirror-solid";

export function TransactionStatus(props: { transactionId: string }): JSX.Element {
  const transaction = createPollTransaction(() => ({
    transactionId: props.transactionId,
    intervalMs: 1_000,
  }));

  return <pre>{JSON.stringify(transaction.data ?? null, null, 2)}</pre>;
}
```

### Error Boundaries

```tsx
import type { JSX } from "solid-js";
import { ApiErrorBoundary } from "@hieco/mirror-solid";

export function Screen(props: { children: JSX.Element }): JSX.Element {
  return (
    <ApiErrorBoundary
      fallback={({ error, reset }) => <button onClick={reset}>{error.message}</button>}
    >
      {props.children}
    </ApiErrorBoundary>
  );
}
```

## API Reference

### Provider And Context

| Export                    | Kind      | Purpose                                                                | Usage form                          |
| ------------------------- | --------- | ---------------------------------------------------------------------- | ----------------------------------- |
| `MirrorNodeProvider`      | component | Root provider for the mirror client and active network.                | `<MirrorNodeProvider config={...}>` |
| `MirrorNodeProviderProps` | type      | Props accepted by `MirrorNodeProvider`.                                | `type MirrorNodeProviderProps`      |
| `MirrorNodeContextValue`  | type      | Context value exposed by the provider.                                 | `type MirrorNodeContextValue`       |
| `useMirrorNodeContext`    | function  | Access the full mirror context.                                        | `useMirrorNodeContext()`            |
| `useMirrorNodeClient`     | function  | Access the underlying `MirrorNodeClient` accessor.                     | `useMirrorNodeClient()`             |
| `useNetwork`              | function  | Access the active network accessor, URL accessor, and `switchNetwork`. | `useNetwork()`                      |
| `NetworkConfig`           | type      | Provider network config type exported by this package.                 | `type NetworkConfig`                |

### Query Families

Each `create*` export also has matching `Create*Options` and `Create*Result` types.

| Domain         | Kind       | Purpose                                                                                                                   | Exports                                                                                                                                                                                                                                                                                                                                                         |
| -------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accounts       | functions  | Account lookup, balances, token relationships, rewards, allowances, lists, airdrops, and composite account overview data. | `createAccountInfo`, `createAccountBalances`, `createAccountTokens`, `createAccountNfts`, `createAccountStakingRewards`, `createAccountCryptoAllowances`, `createAccountTokenAllowances`, `createAccountNftAllowances`, `createAccounts`, `createAccountsInfinite`, `createAccountOutstandingAirdrops`, `createAccountPendingAirdrops`, `createAccountOverview` |
| Balances       | functions  | Balance snapshots and filtered balance reads.                                                                             | `createBalances`                                                                                                                                                                                                                                                                                                                                                |
| Blocks         | functions  | Block list and single-block lookups.                                                                                      | `createBlocks`, `createBlock`                                                                                                                                                                                                                                                                                                                                   |
| Contracts      | functions  | Contract info, local calls, results, state, logs, traces, and contract lists.                                             | `createContractInfo`, `createContractCall`, `createContractResults`, `createContractResult`, `createContractState`, `createContractLogs`, `createContracts`, `createContractsInfinite`, `createContractAllResults`, `createContractResultByTransactionIdOrHash`, `createContractResultActions`, `createContractResultOpcodes`, `createContractAllLogs`          |
| Network        | functions  | Exchange rate, fees, nodes, stake, and supply reads.                                                                      | `createNetworkExchangeRate`, `createNetworkFees`, `createNetworkNodes`, `createNetworkStake`, `createNetworkSupply`                                                                                                                                                                                                                                             |
| Polling        | functions  | Transaction polling helpers for query-driven views.                                                                       | `createPollTransaction`                                                                                                                                                                                                                                                                                                                                         |
| Error Handling | components | API error boundaries for mirror-driven UI sections.                                                                       | `ApiErrorBoundary`, `ApiErrorBoundaryProps`, `ApiErrorFallbackProps`                                                                                                                                                                                                                                                                                            |
| Schedules      | functions  | Schedule lookup and paginated schedule reads.                                                                             | `createScheduleInfo`, `createSchedules`, `createSchedulesInfinite`                                                                                                                                                                                                                                                                                              |
| Tokens         | functions  | Token info, balances, NFTs, NFT transactions, and token lists.                                                            | `createTokenInfo`, `createTokenBalances`, `createTokenBalancesSnapshot`, `createTokenNfts`, `createTokenNft`, `createTokenNftTransactions`, `createTokens`, `createTokensInfinite`                                                                                                                                                                              |
| Topics         | functions  | Topic info, messages, message lookup, and topic lists.                                                                    | `createTopicInfo`, `createTopicMessages`, `createTopicMessage`, `createTopics`, `createTopicsInfinite`, `createTopicMessageByTimestamp`                                                                                                                                                                                                                         |
| Transactions   | functions  | Transaction lookup and transaction list flows.                                                                            | `createTransaction`, `createTransactionsByAccount`, `createTransactions`, `createTransactionsInfinite`                                                                                                                                                                                                                                                          |

### Shared Types

Use `@hieco/mirror` for shared entity types, query parameter types, result helpers, and query keys. `@hieco/mirror-solid` focuses on the Solid provider, context hooks, and query factories.

## Related Packages

- [`@hieco/mirror`](../mirror/README.md) for the underlying Mirror Node client
- [`@hieco/mirror-react`](../mirror-react/README.md) for the same API shape in React
- [`@hieco/mirror-preact`](../mirror-preact/README.md) for the same API shape in Preact
- [`@hieco/react`](../react/README.md) for transaction-capable React bindings
