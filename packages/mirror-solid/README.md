# @hieco/mirror-solid

Type-safe SolidJS hooks for Hedera Mirror Node API with TanStack Query.

## Features

- **Full API Coverage** - Resources for accounts, tokens, transactions, contracts, topics, schedules, blocks, network
- **Auto-pagination** - List hooks automatically fetch all pages
- **Infinite Queries** - Support for infinite scroll and load-more patterns
- **Network Switching** - Runtime network switching with automatic query refetch
- **Type-Safe** - Full TypeScript support
- **Reactive** - Fine-grained reactivity with SolidJS signals

## Installation

```bash
# bun
bun add @hieco/mirror @hieco/mirror-solid @tanstack/solid-query

# npm
npm install @hieco/mirror @hieco/mirror-solid @tanstack/solid-query

# pnpm
pnpm add @hieco/mirror @hieco/mirror-solid @tanstack/solid-query

# yarn
yarn add @hieco/mirror @hieco/mirror-solid @tanstack/solid-query
```

## Quick Start

### Step 1: Wrap your app with providers

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { MirrorNodeProvider, createNetworkConfig } from "@hieco/mirror-solid";

const queryClient = new QueryClient();

const networkConfig = createNetworkConfig({
  defaultNetwork: "mainnet",
  networks: {
    testnet: "https://testnet.mirrornode.hedera.com",
    custom: "https://custom.mirror-node.com",
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MirrorNodeProvider config={networkConfig}>
        <YourApp />
      </MirrorNodeProvider>
    </QueryClientProvider>
  );
}
```

### Step 2: Use hooks in your components

```tsx
import { createAccountInfo } from "@hieco/mirror-solid";

function AccountBalance(props: { accountId: string }) {
  const query = createAccountInfo(() => ({
    accountId: props.accountId,
  }));

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Show when={query.data}>
        {(data) => (
          <Show when={data().success} fallback={<div>Failed to load</div>}>
            {(result) => <div>Balance: {result().data.balance.balance} tinybars</div>}
          </Show>
        )}
      </Show>
    </Suspense>
  );
}
```

## API Reference

### Provider Hooks

```typescript
// Get current network (reactive)
const network = useNetwork();

// Switch network
const { switchNetwork } = useNetwork();

// Get client instance
const client = useMirrorNodeClient();
```

### Account Resources

```typescript
createAccountInfo(() => ({ accountId: string }))
createAccountBalances(() => ({ accountId: string }))
createAccountTokens(() => ({ accountId: string; params?: AccountNftsParams }))
createAccountNfts(() => ({ accountId: string; params?: AccountNftsParams }))
createAccountStakingRewards(() => ({ accountId: string; params?: PaginationParams }))
createAccountCryptoAllowances(() => ({ accountId: string }))
createAccountTokenAllowances(() => ({ accountId: string; params?: TokenAllowancesParams }))
createAccountNftAllowances(() => ({ accountId: string }))
createAccountOutstandingAirdrops(() => ({ accountId: string }))
createAccountPendingAirdrops(() => ({ accountId: string }))
createAccounts(() => ({ params?: AccountListParams }))
createAccountsInfinite(() => ({ params?: AccountListParams }))
```

### Token Resources

```typescript
createTokenInfo(() => ({ tokenId: string }))
createTokenBalances(() => ({ tokenId: string; params?: TokenBalancesParams }))
createTokenNfts(() => ({ tokenId: string }))
createTokenNft(() => ({ tokenId: string; serialNumber: number }))
createTokenNftTransactions(() => ({ tokenId: string; serialNumber: number }))
createTokens(() => ({ params?: TokenListParams }))
createTokensInfinite(() => ({ params?: TokenListParams }))
```

### Transaction Resources

```typescript
createTransaction(() => ({ transactionId: string }))
createTransactions(() => ({ params?: TransactionListParams }))
createTransactionsByAccount(() => ({ accountId: string; params?: TransactionsByAccountParams }))
createTransactionsInfinite(() => ({ params?: TransactionListParams }))
createPollTransaction(() => ({ transactionId: string }))
```

### Contract Resources

```typescript
createContractInfo(() => ({ contractId: string }))
createContractCall(() => (params: ContractCallParams))
createContractResults(() => ({ contractId: string }))
createContractResult(() => ({ contractId: string; resultId: string }))
createContractAllResults(() => ({ params?: ContractResultsParams }))
createContractResultByTransactionIdOrHash(() => ({ txIdOrHash: string }))
createContractResultActions(() => ({ resultId: string }))
createContractResultOpcodes(() => ({ resultId: string }))
createContractState(() => ({ contractId: string; params?: ContractStateParams }))
createContractLogs(() => ({ contractId: string }))
createContractAllLogs(() => ({ params?: ContractLogsParams }))
createContracts(() => ({ params?: ContractListParams }))
createContractsInfinite(() => ({ params?: ContractListParams }))
```

### Topic Resources

```typescript
createTopicInfo(() => ({ topicId: string }))
createTopicMessages(() => ({ topicId: string; params?: TopicMessagesParams }))
createTopicMessage(() => ({ topicId: string; sequenceNumber: number }))
createTopicMessageByTimestamp(() => ({ timestamp: string }))
createTopics(() => ({ params?: PaginationParams }))
createTopicsInfinite(() => ({ params?: PaginationParams }))
```

### Schedule Resources

```typescript
createScheduleInfo(() => ({ scheduleId: string }))
createSchedules(() => ({ params?: ScheduleListParams }))
createSchedulesInfinite(() => ({ params?: ScheduleListParams }))
```

### Block Resources

```typescript
createBlock(() => ({ blockNumberOrHash: string | number }))
createBlocks(() => ({ params?: BlocksListParams }))
```

### Balance Resources

```typescript
createBalances(() => ({ params?: BalancesListParams }))
```

### Network Resources

```typescript
createNetworkExchangeRate(() => ({ params?: { timestamp?: Timestamp } }))
createNetworkFees(() => ({ params?: PaginationParams & { timestamp?: Timestamp } }))
createNetworkNodes(() => ({ params?: NetworkNodesParams }))
createNetworkStake()
createNetworkSupply()
```

## Examples

### Reactive Options

```tsx
import { createAccountInfo } from "@hieco/mirror-solid";

function AccountComponent() {
  const [accountId, setAccountId] = createSignal("0.0.123");

  const query = createAccountInfo(() => ({
    accountId: accountId(),
  }));

  return (
    <div>
      <Show when={query.data?.success}>{(data) => <div>{data().data.balance.balance}</div>}</Show>
      <button onClick={() => setAccountId("0.0.456")}>Change Account</button>
    </div>
  );
}
```

### Infinite Scroll

```tsx
import { createTokensInfinite } from "@hieco/mirror-solid";
import { Show, For } from "solid-js";

function TokenList() {
  const query = createTokensInfinite(() => ({}));

  return (
    <div>
      <For each={query.data?.pages ?? []}>
        {(page) => (
          <Show when={page.success}>
            {(result) => <For each={result().data.data}>{(token) => <div>{token.name}</div>}</For>}
          </Show>
        )}
      </For>
      <Show when={query.hasNextPage}>
        <button onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage()}>
          {query.isFetchingNextPage() ? "Loading..." : "Load More"}
        </button>
      </Show>
    </div>
  );
}
```

## Related Packages

- [`@hieco/mirror`](https://www.npmjs.com/package/@hieco/mirror) - Core REST API client
- [`@hieco/mirror-shared`](https://github.com/powxenv/hieco/tree/main/packages/mirror-shared) - Shared utilities (internal)
- [`@hieco/realtime`](https://www.npmjs.com/package/@hieco/realtime) - WebSocket streaming client

## License

MIT
