# `@hieco/react` API Reference

Canonical docs:

- [`@hieco/react` README](https://github.com/powxenv/hieco/tree/main/packages/react)
- Package sources and installed lookup paths: [sources.md](sources.md)

Installed lookup paths:

- `node_modules/@hieco/react/README.md`
- `node_modules/@hieco/react/dist/index.d.ts`
- `node_modules/@hieco/react/dist/index.js`

Use `dist/index.d.ts` as the authoritative source for exact hook signatures, generic defaults, and re-exported SDK types.

## Table Of Contents

- Root provider exports
- Core type definitions
- Runtime hooks and utilities
- Hook conventions
- Hook families
- Read hook families
- SDK re-exports

## Root Provider Exports

| Export          | Purpose                                                                 | Parameters                  | Returns                                                | Notes                                    |
| --------------- | ----------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------ | ---------------------------------------- |
| `HiecoProvider` | Root provider for runtime, query client, hydration, and signer scoping. | `props: HiecoProviderProps` | `ReactNode`                                            | Main entry for React apps.               |
| `HiecoContext`  | Low-level React context for the runtime.                                | none                        | `React.Context` carrying `HiecoContextValue` or `null` | Mostly useful for advanced integrations. |

## Core Type Definitions

### `HiecoProviderConfig`

```ts
type HiecoProviderConfig = Omit<ClientConfig, "key" | "operator" | "signer">;
```

This is the public, browser-safe provider config.

### `HiecoQueryLayerOptions`

```ts
interface HiecoQueryLayerOptions {
  readonly queryClient?: QueryClient;
  readonly queryClientConfig?: ConstructorParameters<typeof QueryClient>[0];
  readonly dehydratedState?: DehydratedState;
}
```

### `HiecoProviderProps`

```ts
type HiecoProviderProps = {
  readonly children: ReactNode;
  readonly config?: HiecoProviderConfig;
  readonly signer?: Signer;
} & HiecoQueryLayerOptions;
```

### `HiecoContextValue`

```ts
interface HiecoContextValue {
  readonly client: HiecoClient;
  readonly clientKey: string;
  readonly config: HiecoProviderConfig;
  readonly session: {
    readonly status: "connected" | "disconnected";
    readonly signer?: Signer;
    readonly accountId?: string;
    readonly ledgerId?: string;
  };
}
```

### Query and mutation helper types

```ts
type HiecoQueryOptions<TQueryFnData, TData = TQueryFnData>
type HiecoQueryResult<TData>

type HiecoMutationOptions<TData, TVariables = void, TContext = unknown>
type HiecoMutationResult<TData, TVariables = void, TContext = unknown>

type HiecoActionMutationResult<TData, TVariables = void, TContext = unknown> =
  HiecoMutationResult<TData, TVariables, TContext> & {
    readonly buildTx:
      TVariables extends void
        ? () => Result<TransactionDescriptor>
        : (variables: TVariables) => Result<TransactionDescriptor>
    readonly queue:
      TVariables extends void
        ? (params?: {
            readonly adminKey?: string | true
            readonly payerAccountId?: string
            readonly expirationTime?: Date
            readonly waitForExpiry?: boolean
            readonly memo?: string
            readonly maxFee?: string | number | bigint
          }) => Promise<ScheduleReceipt>
        : (
            variables: TVariables,
            params?: {
              readonly adminKey?: string | true
              readonly payerAccountId?: string
              readonly expirationTime?: Date
              readonly waitForExpiry?: boolean
              readonly memo?: string
              readonly maxFee?: string | number | bigint
            }
          ) => Promise<ScheduleReceipt>
  }
```

## Runtime Hooks And Utilities

| Export                   | What it does                                           | Parameters                                                                             | Returns                                                       |
| ------------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `useHiecoClient`         | Read the active `HiecoClient` from context.            | none                                                                                   | `HiecoClient`                                                 |
| `useHiecoConfig`         | Read the resolved provider config.                     | none                                                                                   | `HiecoProviderConfig`                                         |
| `useHiecoContext`        | Read the full low-level context object.                | none                                                                                   | `HiecoContextValue`                                           |
| `useHiecoNetwork`        | Read the active network and mirror URL.                | none                                                                                   | object with `network` and `mirrorUrl`                         |
| `useHiecoSession`        | Read signer-derived session data.                      | none                                                                                   | session object with status, signer, account ID, and ledger ID |
| `useHiecoSigner`         | Read the current signer.                               | none                                                                                   | current signer or `undefined`                                 |
| `useHiecoAccount`        | Read signer-derived account identity.                  | none                                                                                   | object with `accountId`, `ledgerId`, and `isConnected`        |
| `useTopicWatch`          | Start a topic watcher for the component lifetime.      | `topicId: string, handler: (message) => void, options?: WatchTopicMessagesOptions`     | `void`                                                        |
| `useTopicWatchFrom`      | Start a topic watcher from a timestamp or range.       | `topicId: string, handler: (message) => void, options?: WatchTopicMessagesFromOptions` | `void`                                                        |
| `useContractAbi`         | Resolve a contract ABI helper from the current client. | ABI-specific parameters                                                                | ABI helper value                                              |
| `useFileJson`            | Read file contents and parse them as JSON.             | `fileId: string, options?: HiecoQueryOptions<...>`                                     | `HiecoQueryResult<TData>`                                     |
| `useFileContentsJson`    | Read file contents JSON through `file.contentsJson`.   | `fileId: string, options?: HiecoQueryOptions<...>`                                     | `HiecoQueryResult<TData>`                                     |
| `createHiecoQueryKey`    | Build a stable query key.                              | `scope: string, operation: string, args?: readonly unknown[]`                          | `readonly unknown[]`                                          |
| `createHiecoMutationKey` | Build a stable mutation key.                           | `scope: string, operation: string, args?: readonly unknown[]`                          | `readonly unknown[]`                                          |

## Hook Conventions

Generated hooks follow consistent rules.

### Query hooks

Pattern:

```ts
useX(arg0?, arg1?, options?) => HiecoQueryResult<TData>
```

- These wrap SDK query handles and call `.now()` internally.
- They return standard TanStack Query results typed with `HieroError`.

### Plain mutation hooks

Pattern:

```ts
useX(options?) => HiecoMutationResult<TData, TVariables, TContext>
```

- These wrap SDK operations that do not expose transaction scheduling helpers.
- They do not include `buildTx` or `queue`.

### Action mutation hooks

Pattern:

```ts
useX(options?) => HiecoActionMutationResult<TData, TVariables, TContext>
```

- These wrap SDK action handles.
- `mutate(variables)` executes immediately.
- `buildTx(variables)` builds a `TransactionDescriptor`.
- `queue(variables, params?)` schedules the transaction.
- If the underlying mutation takes no variables, `buildTx()` and `queue(params?)` are zero-argument.

## Hook Families

Each hook family maps directly to the SDK namespace of the same name.

| Domain       | What the hooks do                                                        | Query hooks                                                                                                                                                                                            | Mutation hooks                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accounts     | Account reads, transfers, lifecycle, and allowances.                     | `useAccountAllowanceSnapshot`, `useAccountBalance`, `useAccountInfo`, `useAccountInfoFlow`, `useAccountRecords`                                                                                        | `useAccountSend`, `useAccountTransfer`, `useAccountCreate`, `useAccountUpdate`, `useAccountDelete`, `useAccountAllow`, `useAccountAllowances`, `useAccountAdjustAllowances`, `useAccountRevokeNftAllowances`, `useAccountAllowancesDeleteNft`, `useAccountEnsureAllowances`                                                                                                                                                                                                                        |
| Batch        | Batch transaction helpers.                                               | none                                                                                                                                                                                                   | `useBatchAtomic`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Contracts    | Contract calls, deploy, execution, logs, estimates, and metadata.        | `useContractCall`, `useContractCallTyped`, `useContractPreflight`, `useContractInfo`, `useContractLogs`, `useContractBytecode`, `useContractSimulate`, `useContractEstimate`, `useContractEstimateGas` | `useContractDeploy`, `useContractDeployArtifact`, `useContractRun`, `useContractExecute`, `useContractRunTyped`, `useContractExecuteTyped`, `useContractDelete`, `useContractUpdate`                                                                                                                                                                                                                                                                                                               |
| EVM          | Raw Ethereum transaction submission.                                     | none                                                                                                                                                                                                   | `useEvmSendRaw`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Files        | File reads plus file mutation flows.                                     | `useFileInfo`, `useFileContents`, `useFileText`, `useFileContentsText`, `useFileJson`, `useFileContentsJson`                                                                                           | `useFileCreate`, `useFileAppend`, `useFileUpdate`, `useFileDelete`, `useFileUpload`, `useFileUpdateLarge`                                                                                                                                                                                                                                                                                                                                                                                          |
| Legacy       | Legacy live-hash helpers.                                                | `useLegacyLiveHashGet`                                                                                                                                                                                 | `useLegacyLiveHashAdd`, `useLegacyLiveHashDelete`                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Network      | Node administration and network metadata.                                | `useNetworkVersion`, `useNetworkAddressBook`, `useNetworkPing`, `useNetworkPingAll`                                                                                                                    | `useNodeCreate`, `useNodeUpdate`, `useNodeDelete`, `useNetworkUpdate`                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Schedules    | Schedule lifecycle, waiting, and signature collection.                   | `useScheduleInfo`, `useScheduleWait`, `useScheduleWaitForExecution`                                                                                                                                    | `useScheduleCreate`, `useScheduleSign`, `useScheduleDelete`, `useScheduleCreateIdempotent`, `useScheduleCollect`, `useScheduleCollectSignatures`                                                                                                                                                                                                                                                                                                                                                   |
| System       | System freeze and delete or undelete flows.                              | none                                                                                                                                                                                                   | `useSystemFreeze`, `useSystemDeleteEntity`, `useSystemUndeleteEntity`                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Tokens       | Token reads, lifecycle, transfers, KYC, fees, airdrops, and NFT updates. | `useTokenInfo`, `useTokenNft`, `useTokenAllowances`                                                                                                                                                    | `useTokenCreate`, `useTokenMint`, `useTokenBurn`, `useTokenSend`, `useTokenTransfer`, `useTokenSendNft`, `useTokenTransferNft`, `useTokenAssociate`, `useTokenDissociate`, `useTokenFreeze`, `useTokenUnfreeze`, `useTokenGrantKyc`, `useTokenRevokeKyc`, `useTokenPause`, `useTokenUnpause`, `useTokenWipe`, `useTokenDelete`, `useTokenUpdate`, `useTokenFees`, `useTokenAirdrop`, `useTokenClaimAirdrop`, `useTokenCancelAirdrop`, `useTokenReject`, `useTokenUpdateNfts`, `useTokenRejectFlow` |
| Topics       | Topic reads, lifecycle, message submission, JSON helpers, and batching.  | `useTopicInfo`, `useTopicMessages`                                                                                                                                                                     | `useTopicCreate`, `useTopicUpdate`, `useTopicDelete`, `useTopicSend`, `useTopicSubmit`, `useTopicSendJson`, `useTopicSubmitJson`, `useTopicSendMany`, `useTopicBatchSubmit`                                                                                                                                                                                                                                                                                                                        |
| Transactions | Transaction record, receipt, and descriptor submission.                  | `useTransactionRecord`, `useTransactionReceipt`                                                                                                                                                        | `useTransactionSubmit`                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Utilities    | Utility transaction helpers.                                             | none                                                                                                                                                                                                   | `useUtilRandom`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

## Read Hook Families

All `useRead*` hooks wrap `client.reads.*` and return `HiecoQueryResult<TData>`.

| Domain               | What the hooks do                                                                    | Exports                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `reads.accounts`     | Account queries, balances, tokens, NFTs, rewards, allowances, airdrops, and history. | `useReadAccountsList`, `useReadAccountsListPageByUrl`, `useReadAccountInfo`, `useReadAccountBalances`, `useReadAccountTokens`, `useReadAccountNfts`, `useReadAccountRewards`, `useReadAccountCryptoAllowances`, `useReadAccountTokenAllowances`, `useReadAccountNftAllowances`, `useReadAccountOutstandingAirdrops`, `useReadAccountPendingAirdrops`, `useReadAccountHistory`, `useReadAccountTransfers` |
| `reads.balances`     | Balance snapshots and paginated balance lists.                                       | `useReadBalancesSnapshot`, `useReadBalancesList`, `useReadBalancesListPageByUrl`                                                                                                                                                                                                                                                                                                                         |
| `reads.blocks`       | Block snapshots, block pages, and single-block lookup.                               | `useReadBlocksSnapshot`, `useReadBlocksList`, `useReadBlocksListPageByUrl`, `useReadBlock`                                                                                                                                                                                                                                                                                                               |
| `reads.contracts`    | Contract metadata, calls, results, state, logs, and traces.                          | `useReadContractsList`, `useReadContractsListPageByUrl`, `useReadContractInfo`, `useReadContractCall`, `useReadContractResults`, `useReadContractResult`, `useReadContractState`, `useReadContractLogs`, `useReadContractsResultsAll`, `useReadContractResultByTransactionIdOrHash`, `useReadContractResultActions`, `useReadContractResultOpcodes`, `useReadContractsLogsAll`                           |
| `reads.network`      | Exchange rate, fees, nodes, stake, and supply.                                       | `useReadNetworkExchangeRate`, `useReadNetworkFees`, `useReadNetworkNodes`, `useReadNetworkNodesPageByUrl`, `useReadNetworkStake`, `useReadNetworkSupply`                                                                                                                                                                                                                                                 |
| `reads.schedules`    | Schedule list and detail queries.                                                    | `useReadSchedulesList`, `useReadSchedulesListPageByUrl`, `useReadScheduleInfo`                                                                                                                                                                                                                                                                                                                           |
| `reads.tokens`       | Token list, balances, NFTs, relationships, and transfers.                            | `useReadTokensList`, `useReadTokensListPageByUrl`, `useReadTokenInfo`, `useReadTokenBalances`, `useReadTokenBalancesSnapshot`, `useReadTokenNfts`, `useReadTokenNft`, `useReadTokenNftTransactions`, `useReadTokenRelationships`, `useReadTokenTransfers`                                                                                                                                                |
| `reads.topics`       | Topic list, message list, and message lookup queries.                                | `useReadTopicsList`, `useReadTopicsListPageByUrl`, `useReadTopicInfo`, `useReadTopicMessages`, `useReadTopicMessage`, `useReadTopicMessageByTimestamp`                                                                                                                                                                                                                                                   |
| `reads.transactions` | Transaction lookup, account activity, lists, and search.                             | `useReadTransaction`, `useReadTransactionsByAccount`, `useReadTransactionsList`, `useReadTransactionsListPageByUrl`, `useReadTransactionsSearch`                                                                                                                                                                                                                                                         |

## SDK Re-Exports

`@hieco/react` re-exports the public surface of `@hieco/sdk`.

Import these from `@hieco/react` when that is the main application package:

- `Signer`
- `Result`
- `HiecoClient`
- `NetworkType`
- all SDK param types
- all SDK result types
- SDK utility exports such as `NETWORK_CONFIGS`, `isDefaultNetwork`, and `isValidEntityId`

## Exact Type Definition Entry Points

When an agent needs the exact hook overloads or generated signatures, read these installed files in order:

1. `node_modules/@hieco/react/dist/index.d.ts`
2. `node_modules/@hieco/react/dist/appkit/index.d.ts` for AppKit subpath types
3. `node_modules/@hieco/react/README.md`
4. [packages/react on GitHub](https://github.com/powxenv/hieco/tree/main/packages/react)
