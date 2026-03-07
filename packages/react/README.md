# @hieco/react

## Overview

`@hieco/react` brings `@hieco/sdk` into React with a single provider and a full hook surface built on TanStack Query.

Use it when you want:

- typed Hedera query hooks and mutation hooks
- one provider for browser apps, signer-aware apps, and hydrated apps
- React-first access to the same namespaces exposed by `@hieco/sdk`
- optional first-party integration for Reown AppKit through `@hieco/react/appkit`

## Installation

```bash
npm install @hieco/react @hieco/sdk @tanstack/react-query
```

```bash
pnpm add @hieco/react @hieco/sdk @tanstack/react-query
```

```bash
yarn add @hieco/react @hieco/sdk @tanstack/react-query
```

```bash
bun add @hieco/react @hieco/sdk @tanstack/react-query
```

Optional AppKit bridge dependencies:

```bash
npm install @reown/appkit @hashgraph/hedera-wallet-connect
```

```bash
pnpm add @reown/appkit @hashgraph/hedera-wallet-connect
```

```bash
yarn add @reown/appkit @hashgraph/hedera-wallet-connect
```

```bash
bun add @reown/appkit @hashgraph/hedera-wallet-connect
```

Peer dependencies expected from the host app:

- `react >= 18`
- `react-dom >= 18`

## When To Use This Package

Use `@hieco/react` when you are building:

- a React app that reads or writes Hedera data
- a wallet-connected UI where the current `Signer` should drive mutations
- a hydrated app that already owns a `QueryClient`
- a Reown AppKit integration that should feed the active wallet into Hieco automatically

For server-only logic, scripts, or framework loaders, use [`@hieco/sdk`](../sdk/README.md) directly.

## Quick Start

```tsx
"use client";

import { HiecoProvider, useAccountInfo, type EntityId } from "@hieco/react";

function AccountCard({ accountId }: { accountId: EntityId }) {
  const account = useAccountInfo(accountId);

  if (account.isPending) return <div>Loading...</div>;
  if (account.isError) return <div>{account.error.message}</div>;

  return <div>{account.data?.accountId}</div>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <HiecoProvider config={{ network: "testnet" }}>{children}</HiecoProvider>;
}
```

## Core Concepts

### One Provider

`HiecoProvider` is the root provider for the package. It combines:

- the Hieco runtime client
- TanStack Query integration
- optional hydration support
- optional signer scoping

The provider accepts:

- `config`
- `signer`
- `queryClient`
- `queryClientConfig`
- `dehydratedState`

### Query Client Ownership

`HiecoProvider` works in both of these setups:

- create and own a `QueryClient` internally
- reuse an inherited or explicit `QueryClient`

That keeps the public API consistent whether your app is fully client-rendered or already has TanStack Query wiring.

### Hook Conventions

The hook surface mirrors the SDK namespaces:

- query hooks usually look like `useAccountInfo(accountId, options?)`
- mutation hooks usually look like `useAccountSend(options?)`
- read-only Mirror hooks are grouped under `useRead...`

Transaction-capable hooks return mutation objects that preserve SDK behaviors such as `buildTx()` and `queue()`.

### Signer-Aware Runtime

Pass a wallet `Signer` to scope the client to the active wallet session:

```tsx
<HiecoProvider config={{ network: "testnet" }} signer={signer}>
  <App />
</HiecoProvider>
```

The signer is late-bound runtime state. The provider can render once with `undefined` and re-render with a signer after the user connects a wallet.

## Advanced

### Use An Existing QueryClient

```tsx
"use client";

import { QueryClient } from "@tanstack/react-query";
import { HiecoProvider } from "@hieco/react";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HiecoProvider config={{ network: "testnet" }} queryClient={queryClient}>
      {children}
    </HiecoProvider>
  );
}
```

### Hydration And SSR

```tsx
"use client";

import { HiecoProvider, type EntityId } from "@hieco/react";
import type { DehydratedState, QueryClient } from "@tanstack/react-query";

export function Providers({
  children,
  queryClient,
  dehydratedState,
}: {
  children: React.ReactNode;
  queryClient: QueryClient;
  dehydratedState: DehydratedState;
}) {
  return (
    <HiecoProvider
      config={{ network: "testnet" }}
      queryClient={queryClient}
      dehydratedState={dehydratedState}
    >
      {children}
    </HiecoProvider>
  );
}
```

Use `@hieco/sdk` in server code to prefetch data, then hydrate the React tree through `dehydratedState`.

### Signer-Driven Apps

```tsx
"use client";

import { HiecoProvider, useAccountSend, type Signer } from "@hieco/react";

function SendButton() {
  const send = useAccountSend();

  return (
    <button
      disabled={send.isPending}
      onClick={() =>
        send.mutate({
          to: "0.0.2002",
          hbar: 1,
        })
      }
    >
      Send HBAR
    </button>
  );
}

export function Providers({
  children,
  signer,
}: {
  children: React.ReactNode;
  signer: Signer | undefined;
}) {
  return (
    <HiecoProvider config={{ network: "testnet" }} signer={signer}>
      {children}
      <SendButton />
    </HiecoProvider>
  );
}
```

### Topic Watchers

```tsx
"use client";

import { useTopicWatch } from "@hieco/react";

export function TopicFeed() {
  useTopicWatch("0.0.3003", (message) => {
    console.log(message.contentsText);
  });

  return null;
}
```

### `@hieco/react/appkit`

Bootstrap AppKit once, then use the AppKit-aware provider:

```tsx
"use client";

import { createHiecoAppKit, HiecoAppKitProvider } from "@hieco/react/appkit";

await createHiecoAppKit({
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  metadata: {
    name: "My App",
    description: "Hieco + AppKit",
    url: "https://example.com",
    icons: ["https://example.com/icon.png"],
  },
  adapters: [],
  networks: [],
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <HiecoAppKitProvider config={{ network: "testnet" }}>{children}</HiecoAppKitProvider>;
}
```

If you already own the AppKit session elsewhere, `useHiecoAppKitSigner()` gives you the resolved Hedera signer directly.

## API Reference

### Root Provider Exports

| Export                   | Kind      | Purpose                                                                 | Usage form                                                                         |
| ------------------------ | --------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `HiecoProvider`          | component | Root provider for runtime, query client, hydration, and signer scoping. | `<HiecoProvider config? signer? queryClient? queryClientConfig? dehydratedState?>` |
| `HiecoProviderProps`     | type      | Props accepted by `HiecoProvider`.                                      | `type HiecoProviderProps`                                                          |
| `HiecoProviderConfig`    | type      | Public client config accepted by the provider.                          | `type HiecoProviderConfig`                                                         |
| `HiecoQueryLayerOptions` | type      | Query client and hydration options shared by the provider.              | `type HiecoQueryLayerOptions`                                                      |
| `HiecoQueryClientConfig` | type      | `QueryClient` constructor config passed to the provider.                | `type HiecoQueryClientConfig`                                                      |
| `HiecoContext`           | context   | Low-level React context for the runtime.                                | `useContext(HiecoContext)`                                                         |
| `HiecoContextValue`      | type      | Context shape exposed by `HiecoContext`.                                | `type HiecoContextValue`                                                           |

### Runtime Hooks And Utilities

| Export                   | Kind     | Purpose                                                          | Usage form                                               |
| ------------------------ | -------- | ---------------------------------------------------------------- | -------------------------------------------------------- |
| `useHiecoClient`         | hook     | Access the active `HiecoClient`.                                 | `useHiecoClient()`                                       |
| `useHiecoConfig`         | hook     | Access the resolved provider config.                             | `useHiecoConfig()`                                       |
| `useHiecoContext`        | hook     | Access the low-level provider context.                           | `useHiecoContext()`                                      |
| `useHiecoNetwork`        | hook     | Read the active network and mirror URL context.                  | `useHiecoNetwork()`                                      |
| `useHiecoSession`        | hook     | Read the current runtime session data.                           | `useHiecoSession()`                                      |
| `useHiecoSigner`         | hook     | Read the current signer, if any.                                 | `useHiecoSigner()`                                       |
| `useHiecoAccount`        | hook     | Read the signer-derived account identity, if available.          | `useHiecoAccount()`                                      |
| `useTopicWatch`          | hook     | Start a live topic watcher tied to the component lifecycle.      | `useTopicWatch(topicId, handler, options?)`              |
| `useTopicWatchFrom`      | hook     | Start a topic watcher from a specific timestamp or range.        | `useTopicWatchFrom(topicId, handler, options?)`          |
| `useContractAbi`         | hook     | Resolve or derive a contract ABI helper from the current client. | `useContractAbi(...)`                                    |
| `useFileJson`            | hook     | Read file contents and parse them as JSON.                       | `useFileJson(fileId, options?)`                          |
| `useFileContentsJson`    | hook     | Read file contents JSON through the `file.contentsJson` API.     | `useFileContentsJson(fileId, options?)`                  |
| `createHiecoQueryKey`    | function | Build a stable query key from scope and args.                    | `createHiecoQueryKey(scope, operation, args?)`           |
| `createHiecoMutationKey` | function | Build a stable mutation key from scope and args.                 | `createHiecoMutationKey(scope, operation, args?)`        |
| `HiecoQueryOptions`      | type     | Shared TanStack Query options for query hooks.                   | `type HiecoQueryOptions<TQueryFnData, TData>`            |
| `HiecoQueryResult`       | type     | Shared query result alias.                                       | `type HiecoQueryResult<TData>`                           |
| `HiecoMutationOptions`   | type     | Shared mutation options for mutation hooks.                      | `type HiecoMutationOptions<TData, TVariables, TContext>` |
| `HiecoMutationResult`    | type     | Shared mutation result alias.                                    | `type HiecoMutationResult<TData, TVariables, TContext>`  |

### Hook Families

All query hooks follow the SDK query pattern and all mutation hooks follow the SDK mutation pattern. Read hooks call `client.reads.*`, while runtime hooks call the fluent runtime namespaces such as `client.account.*` or `client.token.*`.

| Domain       | Kind  | Purpose                                                                         | Exports                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------ | ----- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accounts     | hooks | Account reads, transfers, lifecycle, and allowance flows.                       | `useAccountAllowanceSnapshot`, `useAccountBalance`, `useAccountInfo`, `useAccountInfoFlow`, `useAccountRecords`, `useAccountSend`, `useAccountTransfer`, `useAccountCreate`, `useAccountUpdate`, `useAccountDelete`, `useAccountAllow`, `useAccountAllowances`, `useAccountAdjustAllowances`, `useAccountRevokeNftAllowances`, `useAccountAllowancesDeleteNft`, `useAccountEnsureAllowances`                                                                                                                                                            |
| Batch        | hooks | Batch transaction helpers.                                                      | `useBatchAtomic`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Contracts    | hooks | Contract calls, typed execution, deploy, logs, estimates, and mutation flows.   | `useContractCall`, `useContractCallTyped`, `useContractPreflight`, `useContractInfo`, `useContractLogs`, `useContractBytecode`, `useContractSimulate`, `useContractEstimate`, `useContractEstimateGas`, `useContractDeploy`, `useContractDeployArtifact`, `useContractRun`, `useContractExecute`, `useContractRunTyped`, `useContractExecuteTyped`, `useContractDelete`, `useContractUpdate`                                                                                                                                                            |
| EVM          | hooks | Raw EVM transaction submission.                                                 | `useEvmSendRaw`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Files        | hooks | File reads, text and JSON helpers, and file mutation flows.                     | `useFileInfo`, `useFileContents`, `useFileText`, `useFileContentsText`, `useFileCreate`, `useFileAppend`, `useFileUpdate`, `useFileDelete`, `useFileUpload`, `useFileUpdateLarge`                                                                                                                                                                                                                                                                                                                                                                       |
| Legacy       | hooks | Legacy live-hash helpers.                                                       | `useLegacyLiveHashGet`, `useLegacyLiveHashAdd`, `useLegacyLiveHashDelete`                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Network      | hooks | Node administration and network metadata operations.                            | `useNodeCreate`, `useNodeUpdate`, `useNodeDelete`, `useNetworkVersion`, `useNetworkAddressBook`, `useNetworkPing`, `useNetworkPingAll`, `useNetworkUpdate`                                                                                                                                                                                                                                                                                                                                                                                              |
| Schedules    | hooks | Schedule lifecycle, waiting, and signature collection.                          | `useScheduleInfo`, `useScheduleWait`, `useScheduleWaitForExecution`, `useScheduleCreate`, `useScheduleSign`, `useScheduleDelete`, `useScheduleCreateIdempotent`, `useScheduleCollect`, `useScheduleCollectSignatures`                                                                                                                                                                                                                                                                                                                                   |
| System       | hooks | System freeze and entity delete or undelete flows.                              | `useSystemFreeze`, `useSystemDeleteEntity`, `useSystemUndeleteEntity`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Tokens       | hooks | Token reads, lifecycle, transfers, KYC, fees, airdrops, and NFT updates.        | `useTokenInfo`, `useTokenNft`, `useTokenAllowances`, `useTokenCreate`, `useTokenMint`, `useTokenBurn`, `useTokenSend`, `useTokenTransfer`, `useTokenSendNft`, `useTokenTransferNft`, `useTokenAssociate`, `useTokenDissociate`, `useTokenFreeze`, `useTokenUnfreeze`, `useTokenGrantKyc`, `useTokenRevokeKyc`, `useTokenPause`, `useTokenUnpause`, `useTokenWipe`, `useTokenDelete`, `useTokenUpdate`, `useTokenFees`, `useTokenAirdrop`, `useTokenClaimAirdrop`, `useTokenCancelAirdrop`, `useTokenReject`, `useTokenUpdateNfts`, `useTokenRejectFlow` |
| Topics       | hooks | Topic reads, lifecycle, message submission, JSON helpers, and batch submission. | `useTopicInfo`, `useTopicMessages`, `useTopicCreate`, `useTopicUpdate`, `useTopicDelete`, `useTopicSend`, `useTopicSubmit`, `useTopicSendJson`, `useTopicSubmitJson`, `useTopicSendMany`, `useTopicBatchSubmit`                                                                                                                                                                                                                                                                                                                                         |
| Transactions | hooks | Transaction record, receipt, and descriptor submission helpers.                 | `useTransactionRecord`, `useTransactionReceipt`, `useTransactionSubmit`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Utilities    | hooks | Utility transaction helpers.                                                    | `useUtilRandom`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

### Read Hook Families

| Domain               | Kind  | Purpose                                                                   | Exports                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------- | ----- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reads.accounts`     | hooks | Read-only account queries and derived history.                            | `useReadAccountsList`, `useReadAccountsListPageByUrl`, `useReadAccountInfo`, `useReadAccountBalances`, `useReadAccountTokens`, `useReadAccountNfts`, `useReadAccountRewards`, `useReadAccountCryptoAllowances`, `useReadAccountTokenAllowances`, `useReadAccountNftAllowances`, `useReadAccountOutstandingAirdrops`, `useReadAccountPendingAirdrops`, `useReadAccountHistory`, `useReadAccountTransfers` |
| `reads.balances`     | hooks | Balance snapshots and balance pages.                                      | `useReadBalancesSnapshot`, `useReadBalancesList`, `useReadBalancesListPageByUrl`                                                                                                                                                                                                                                                                                                                         |
| `reads.blocks`       | hooks | Block snapshots, block pages, and single-block lookup.                    | `useReadBlocksSnapshot`, `useReadBlocksList`, `useReadBlocksListPageByUrl`, `useReadBlock`                                                                                                                                                                                                                                                                                                               |
| `reads.contracts`    | hooks | Contract metadata, calls, results, state, logs, and traces.               | `useReadContractsList`, `useReadContractsListPageByUrl`, `useReadContractInfo`, `useReadContractCall`, `useReadContractResults`, `useReadContractResult`, `useReadContractState`, `useReadContractLogs`, `useReadContractsResultsAll`, `useReadContractResultByTransactionIdOrHash`, `useReadContractResultActions`, `useReadContractResultOpcodes`, `useReadContractsLogsAll`                           |
| `reads.network`      | hooks | Exchange rate, fees, nodes, stake, and supply queries.                    | `useReadNetworkExchangeRate`, `useReadNetworkFees`, `useReadNetworkNodes`, `useReadNetworkNodesPageByUrl`, `useReadNetworkStake`, `useReadNetworkSupply`                                                                                                                                                                                                                                                 |
| `reads.schedules`    | hooks | Schedule list and detail queries.                                         | `useReadSchedulesList`, `useReadSchedulesListPageByUrl`, `useReadScheduleInfo`                                                                                                                                                                                                                                                                                                                           |
| `reads.tokens`       | hooks | Token list, balances, NFTs, relationships, and transfer activity queries. | `useReadTokensList`, `useReadTokensListPageByUrl`, `useReadTokenInfo`, `useReadTokenBalances`, `useReadTokenBalancesSnapshot`, `useReadTokenNfts`, `useReadTokenNft`, `useReadTokenNftTransactions`, `useReadTokenRelationships`, `useReadTokenTransfers`                                                                                                                                                |
| `reads.topics`       | hooks | Topic list, message list, and message lookup queries.                     | `useReadTopicsList`, `useReadTopicsListPageByUrl`, `useReadTopicInfo`, `useReadTopicMessages`, `useReadTopicMessage`, `useReadTopicMessageByTimestamp`                                                                                                                                                                                                                                                   |
| `reads.transactions` | hooks | Transaction lookup, account activity, lists, and search.                  | `useReadTransaction`, `useReadTransactionsByAccount`, `useReadTransactionsList`, `useReadTransactionsListPageByUrl`, `useReadTransactionsSearch`                                                                                                                                                                                                                                                         |

### `@hieco/react/appkit`

| Export                        | Kind      | Purpose                                                       | Usage form                                                    |
| ----------------------------- | --------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
| `createHiecoAppKit`           | function  | Initialize Reown AppKit with Hedera provider wiring.          | `await createHiecoAppKit(options)`                            |
| `CreateHiecoAppKitOptions`    | type      | Options accepted by `createHiecoAppKit`.                      | `type CreateHiecoAppKitOptions`                               |
| `HiecoAppKitProvider`         | component | `HiecoProvider` variant that resolves the signer from AppKit. | `<HiecoAppKitProvider config? queryClient? dehydratedState?>` |
| `HiecoAppKitProviderProps`    | type      | Props accepted by `HiecoAppKitProvider`.                      | `type HiecoAppKitProviderProps`                               |
| `useHiecoAppKitSigner`        | hook      | Resolve the current Hedera AppKit signer.                     | `useHiecoAppKitSigner(options?)`                              |
| `UseHiecoAppKitSignerOptions` | type      | Namespace options for the AppKit signer hook.                 | `type UseHiecoAppKitSignerOptions`                            |

### SDK Re-Exports

`@hieco/react` re-exports the public surface of [`@hieco/sdk`](../sdk/README.md). Import shared types such as `EntityId`, `Signer`, `Result`, `HiecoClient`, and all SDK param or result types directly from `@hieco/react` when that is your main app dependency.

## Related Packages

- [`@hieco/sdk`](../sdk/README.md) for the core runtime and fluent client
- [`@hieco/react/appkit`](./README.md#hiecoreactappkit) for the AppKit bridge exported by this package
- [`@hieco/mirror-react`](../mirror-react/README.md) for direct Mirror Node hooks without transaction runtime
