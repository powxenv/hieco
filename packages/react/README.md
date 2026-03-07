# @hieco/react

`@hieco/react` brings `@hieco/sdk` into React with:

- TanStack Query-powered hooks for reads and writes
- wallet-aware client scoping through `signer`
- optional AppKit integration for Hedera wallets

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

If you use Reown AppKit with Hedera WalletConnect:

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

Peer dependencies:

- `react >= 18`
- `react-dom >= 18`

## Choose Your Workflow

Pick the workflow that matches what you are building:

| You are building                                                   | Start here                                               |
| ------------------------------------------------------------------ | -------------------------------------------------------- |
| A React app that reads Hedera data and runs public SDK operations  | `HiecoProvider`                                          |
| A wallet-connected app where the current wallet signs user actions | `HiecoProvider` with a wallet `signer`                   |
| A Reown AppKit app for Hedera wallets                              | `createHiecoAppKit()` with `HiecoAppKitProvider`         |
| A full-stack app with server-side credentials and a React frontend | `@hieco/react` in the UI and `@hieco/sdk` in server code |

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

## Provider

`HiecoProvider` is the root provider for React apps.

Props:

- `config`
- `signer`
- `queryClient`
- `queryClientConfig`
- `dehydratedState`

`config` is client-safe runtime config such as:

- `network`
- `mirrorUrl`
- retry and timeout settings

Typical app setup:

```tsx
"use client";

import { HiecoProvider } from "@hieco/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HiecoProvider
      config={{
        network: "testnet",
        mirrorUrl: "https://testnet.mirrornode.hedera.com",
      }}
    >
      {children}
    </HiecoProvider>
  );
}
```

## Wallet-Aware Apps

When your app has a connected wallet, pass the current `Signer` into `HiecoProvider`.

```tsx
"use client";

import { HiecoProvider, type Signer } from "@hieco/react";

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
    </HiecoProvider>
  );
}
```

This works well when:

- a wallet provider above Hieco owns connect and disconnect state
- the wallet hook exposes `Signer | undefined`
- your Hieco client should follow the current wallet session

The `signer` prop is late-bound session state. The provider can render with `undefined` first and receive a signer later after the user connects.

### Wallet Mutation Example

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
      Send
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

## Query Client Integration

`HiecoProvider` works with or without an existing `QueryClientProvider`.

### Let Hieco Create The Query Client

```tsx
"use client";

import { HiecoProvider } from "@hieco/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <HiecoProvider config={{ network: "testnet" }}>{children}</HiecoProvider>;
}
```

### Reuse Your Existing Query Client

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HiecoProvider } from "@hieco/react";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <HiecoProvider config={{ network: "testnet" }}>{children}</HiecoProvider>
    </QueryClientProvider>
  );
}
```

### Hydrate Prefetched State

```tsx
"use client";

import type { DehydratedState } from "@tanstack/react-query";
import { HiecoProvider } from "@hieco/react";

export function Providers({
  children,
  dehydratedState,
}: {
  children: React.ReactNode;
  dehydratedState: DehydratedState;
}) {
  return (
    <HiecoProvider config={{ network: "testnet" }} dehydratedState={dehydratedState}>
      {children}
    </HiecoProvider>
  );
}
```

## Framework Recipes

### Next.js

Use `@hieco/react` in client-side provider and component code.

```tsx
// app/providers.tsx
"use client";

import { HiecoProvider } from "@hieco/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <HiecoProvider config={{ network: "testnet" }}>{children}</HiecoProvider>;
}
```

Use `@hieco/sdk` in server-only modules, Route Handlers, or Server Actions when you want server-side authority.

### TanStack Start

Use `@hieco/react` in route components and UI providers.

```tsx
import { HiecoProvider } from "@hieco/react";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <HiecoProvider config={{ network: "testnet" }}>{children}</HiecoProvider>;
}
```

Use `@hieco/sdk` inside `createServerFn()` when you want server-side execution.

### React Router Framework Mode

Use `@hieco/react` in route components and app providers.

```tsx
import { HiecoProvider } from "@hieco/react";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <HiecoProvider config={{ network: "testnet" }}>{children}</HiecoProvider>;
}
```

Use `@hieco/sdk` in route `loader` and `action` for server-side work.

## AppKit

If you use Reown AppKit, keep `HiecoProvider` as the app provider and add the AppKit bridge inside it.

Initialize AppKit once:

```tsx
"use client";

import {
  HederaAdapter,
  HederaChainDefinition,
  hederaNamespace,
} from "@hashgraph/hedera-wallet-connect";
import { createHiecoAppKit } from "@hieco/react/bridge/appkit";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
const metadata = {
  name: "My Hieco App",
  description: "Hieco + AppKit",
  url: "https://example.com",
  icons: ["https://example.com/icon.png"],
};
const networks = [HederaChainDefinition.Native.Testnet];

const appKitPromise = createHiecoAppKit({
  projectId,
  metadata,
  networks,
  adapters: [
    new HederaAdapter({
      projectId,
      networks,
      namespace: hederaNamespace,
    }),
  ],
});

export function ensureAppKit() {
  return appKitPromise;
}
```

Wrap AppKit and Hieco together:

```tsx
"use client";

import { useEffect } from "react";
import { HiecoAppKitProvider } from "@hieco/react/bridge/appkit";
import { ensureAppKit } from "./appkit";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    void ensureAppKit();
  }, []);

  return <HiecoAppKitProvider config={{ network: "testnet" }}>{children}</HiecoAppKitProvider>;
}
```

## Hooks

Hooks follow the SDK structure.

Examples:

- `client.account.info(id).now()` becomes `useAccountInfo(id)`
- `client.account.send(input).now()` becomes `useAccountSend()`
- `client.reads.transactions.list(input).now()` becomes `useReadTransactionsList(input)`

### Query Example

```tsx
import { useAccountInfo } from "@hieco/react";

function Balance({ accountId }: { accountId: `${number}.${number}.${number}` }) {
  const account = useAccountInfo(accountId, {
    staleTime: 30_000,
  });

  if (account.isPending) return <div>Loading...</div>;
  if (account.isError) return <div>{account.error.message}</div>;

  return <div>{account.data?.balance?.hbars ?? 0} HBAR</div>;
}
```

### Mutation Example

```tsx
import { useAccountSend } from "@hieco/react";

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
      Send
    </button>
  );
}
```

Transaction-capable mutation hooks also expose:

- `buildTx()`
- `queue()`

## API Reference

`@hieco/react` exports a single React-first surface built around `HiecoProvider`, typed hooks, and `@hieco/sdk` re-exports.

### `@hieco/react`

#### Providers

- `HiecoProvider`

#### Provider Types

- `HiecoProviderProps`
- `HiecoProviderConfig`
- `HiecoQueryLayerOptions`
- `HiecoQueryClientConfig`
- `HiecoContextValue`

#### Query and Mutation Types

- `HiecoQueryOptions<TQueryFnData, TData = TQueryFnData>`
- `HiecoQueryResult<TData>`
- `HiecoMutationOptions<TData, TVariables = void, TContext = unknown>`
- `HiecoMutationResult<TData, TVariables = void, TContext = unknown>`

#### Query and Mutation Utilities

- `createHiecoQueryKey()`
- `createHiecoMutationKey()`

#### Runtime Hooks

- `useHiecoClient()`
- `useHiecoContext()`
- `useHiecoSession()`
- `useHiecoSigner()`
- `useHiecoAccount()`
- `useHiecoConfig()`
- `useHiecoNetwork()`

#### Helper Hooks

- `useContractAbi()`
- `useFileJson()`
- `useFileContentsJson()`
- `useTopicWatch()`
- `useTopicWatchFrom()`

#### Transaction Hooks

- `useTransactionRecord()`
- `useTransactionReceipt()`
- `useTransactionSubmit()`

#### Account Hooks

- `useAccountAllowanceSnapshot()`
- `useAccountBalance()`
- `useAccountInfo()`
- `useAccountInfoFlow()`
- `useAccountRecords()`
- `useAccountSend()`
- `useAccountTransfer()`
- `useAccountCreate()`
- `useAccountUpdate()`
- `useAccountDelete()`
- `useAccountAllow()`
- `useAccountAllowances()`
- `useAccountAdjustAllowances()`
- `useAccountRevokeNftAllowances()`
- `useAccountAllowancesDeleteNft()`
- `useAccountEnsureAllowances()`

#### Token Hooks

- `useTokenInfo()`
- `useTokenNft()`
- `useTokenAllowances()`
- `useTokenCreate()`
- `useTokenMint()`
- `useTokenBurn()`
- `useTokenSend()`
- `useTokenTransfer()`
- `useTokenSendNft()`
- `useTokenTransferNft()`
- `useTokenAssociate()`
- `useTokenDissociate()`
- `useTokenFreeze()`
- `useTokenUnfreeze()`
- `useTokenGrantKyc()`
- `useTokenRevokeKyc()`
- `useTokenPause()`
- `useTokenUnpause()`
- `useTokenWipe()`
- `useTokenDelete()`
- `useTokenUpdate()`
- `useTokenFees()`
- `useTokenAirdrop()`
- `useTokenClaimAirdrop()`
- `useTokenCancelAirdrop()`
- `useTokenReject()`
- `useTokenUpdateNfts()`
- `useTokenRejectFlow()`

#### Topic Hooks

- `useTopicInfo()`
- `useTopicMessages()`
- `useTopicCreate()`
- `useTopicUpdate()`
- `useTopicDelete()`
- `useTopicSend()`
- `useTopicSubmit()`
- `useTopicSendJson()`
- `useTopicSubmitJson()`
- `useTopicSendMany()`
- `useTopicBatchSubmit()`

#### Contract Hooks

- `useContractCall()`
- `useContractCallTyped()`
- `useContractPreflight()`
- `useContractInfo()`
- `useContractLogs()`
- `useContractBytecode()`
- `useContractSimulate()`
- `useContractEstimate()`
- `useContractEstimateGas()`
- `useContractDeploy()`
- `useContractDeployArtifact()`
- `useContractRun()`
- `useContractExecute()`
- `useContractRunTyped()`
- `useContractExecuteTyped()`
- `useContractDelete()`
- `useContractUpdate()`

#### File Hooks

- `useFileInfo()`
- `useFileContents()`
- `useFileText()`
- `useFileContentsText()`
- `useFileCreate()`
- `useFileAppend()`
- `useFileUpdate()`
- `useFileDelete()`
- `useFileUpload()`
- `useFileUpdateLarge()`

#### Schedule Hooks

- `useScheduleInfo()`
- `useScheduleWait()`
- `useScheduleWaitForExecution()`
- `useScheduleCreate()`
- `useScheduleSign()`
- `useScheduleDelete()`
- `useScheduleCreateIdempotent()`
- `useScheduleCollect()`
- `useScheduleCollectSignatures()`

#### Node, System, Utility, Batch, Network, Legacy, and EVM Hooks

- `useNodeCreate()`
- `useNodeUpdate()`
- `useNodeDelete()`
- `useSystemFreeze()`
- `useSystemDeleteEntity()`
- `useSystemUndeleteEntity()`
- `useUtilRandom()`
- `useBatchAtomic()`
- `useNetworkVersion()`
- `useNetworkAddressBook()`
- `useNetworkPing()`
- `useNetworkPingAll()`
- `useNetworkUpdate()`
- `useEvmSendRaw()`
- `useLegacyLiveHashGet()`
- `useLegacyLiveHashAdd()`
- `useLegacyLiveHashDelete()`

#### Mirror Read Hooks

Accounts:

- `useReadAccountsList()`
- `useReadAccountsListPageByUrl()`
- `useReadAccountInfo()`
- `useReadAccountBalances()`
- `useReadAccountTokens()`
- `useReadAccountNfts()`
- `useReadAccountRewards()`
- `useReadAccountCryptoAllowances()`
- `useReadAccountTokenAllowances()`
- `useReadAccountNftAllowances()`
- `useReadAccountOutstandingAirdrops()`
- `useReadAccountPendingAirdrops()`
- `useReadAccountHistory()`
- `useReadAccountTransfers()`

Tokens:

- `useReadTokensList()`
- `useReadTokensListPageByUrl()`
- `useReadTokenInfo()`
- `useReadTokenBalances()`
- `useReadTokenBalancesSnapshot()`
- `useReadTokenNfts()`
- `useReadTokenNft()`
- `useReadTokenNftTransactions()`
- `useReadTokenRelationships()`
- `useReadTokenTransfers()`

Contracts:

- `useReadContractsList()`
- `useReadContractsListPageByUrl()`
- `useReadContractInfo()`
- `useReadContractCall()`
- `useReadContractResults()`
- `useReadContractResult()`
- `useReadContractState()`
- `useReadContractLogs()`
- `useReadContractsResultsAll()`
- `useReadContractResultByTransactionIdOrHash()`
- `useReadContractResultActions()`
- `useReadContractResultOpcodes()`
- `useReadContractsLogsAll()`

Transactions:

- `useReadTransaction()`
- `useReadTransactionsByAccount()`
- `useReadTransactionsList()`
- `useReadTransactionsListPageByUrl()`
- `useReadTransactionsSearch()`

Topics:

- `useReadTopicsList()`
- `useReadTopicsListPageByUrl()`
- `useReadTopicInfo()`
- `useReadTopicMessages()`
- `useReadTopicMessage()`
- `useReadTopicMessageByTimestamp()`

Schedules:

- `useReadSchedulesList()`
- `useReadSchedulesListPageByUrl()`
- `useReadScheduleInfo()`

Network:

- `useReadNetworkExchangeRate()`
- `useReadNetworkFees()`
- `useReadNetworkNodes()`
- `useReadNetworkNodesPageByUrl()`
- `useReadNetworkStake()`
- `useReadNetworkSupply()`

Balances:

- `useReadBalancesSnapshot()`
- `useReadBalancesList()`
- `useReadBalancesListPageByUrl()`

Blocks:

- `useReadBlocksSnapshot()`
- `useReadBlocksList()`
- `useReadBlocksListPageByUrl()`
- `useReadBlock()`

#### SDK Re-Exports

The root package also re-exports the full `@hieco/sdk` surface, so SDK types and helpers such as `Signer`, `HiecoClient`, `Result`, `EntityId`, `NetworkType`, `isValidEntityId()`, and `formatEntityId()` are available from `@hieco/react`.

### `@hieco/react/bridge/appkit`

Use this subpath when your app uses Reown AppKit with Hedera WalletConnect.

#### Functions

- `createHiecoAppKit()`

#### Components

- `HiecoAppKitProvider`

#### Hooks

- `useHiecoAppKitSigner()`

#### Types

- `CreateHiecoAppKitOptions`
- `HiecoAppKitProviderProps`
- `UseHiecoAppKitSignerOptions`
