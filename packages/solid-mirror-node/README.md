# @hiecom/solid-mirror-node

Type-safe SolidJS hooks for Hedera Mirror Node API with TanStack Query.

## Installation

```bash
bun add @hiecom/mirror-node @hiecom/solid-mirror-node @tanstack/solid-query
```

## Quick Start

### Step 1: Wrap your app with providers

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { MirrorNodeProvider, createNetworkConfig } from "@hiecom/solid-mirror-node";

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
import { createAccountInfo } from "@hiecom/solid-mirror-node";
import { Show, Suspense } from "solid-js";

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

## Switching Networks

Switch networks at runtime. All queries automatically refetch with the new network:

```tsx
import { useNetwork } from "@hiecom/solid-mirror-node";

function NetworkSelector() {
  const { network, switchNetwork } = useNetwork();

  return (
    <div>
      <span>Current: {network()}</span>
      <button onClick={() => switchNetwork("mainnet")}>Mainnet</button>
      <button onClick={() => switchNetwork("testnet")}>Testnet</button>
    </div>
  );
}
```

## Pagination

The Hedera Mirror Node API uses cursor-based pagination. The hooks handle this automatically.

### List Queries

List hooks fetch all items across all pages by default:

```tsx
import { createTokens } from "@hiecom/solid-mirror-node";
import { Show } from "solid-js";

function TokenList() {
  const query = createTokens(() => ({
    params: { limit: 25, order: "desc" },
  }));

  return (
    <Show when={query.data?.success} fallback={<div>Loading...</div>}>
      {(data) => (
        <div>
          <p>Showing {data().data.length} tokens</p>
          <ul>
            {data().data.map((token) => (
              <li key={token.token_id}>{token.name}</li>
            ))}
          </ul>
        </div>
      )}
    </Show>
  );
}
```

The `limit` parameter controls how many items per page to fetch from the API. The hooks automatically follow the pagination cursor (`links.next`) to fetch all pages and combine the results.

### Infinite Queries

For infinite scroll with manual page-by-page loading:

```tsx
import { createTokensInfinite } from "@hiecom/solid-mirror-node";
import { Show, For } from "solid-js";

function TokenInfiniteList() {
  const query = createTokensInfinite(() => ({}));

  return (
    <Show when={query.data}>
      {(data) => (
        <div>
          <For each={data().pages}>
            {(page) => (
              <Show when={page.success}>
                {(result) => (
                  <For each={result().data.data}>{(token) => <div>{token.name}</div>}</For>
                )}
              </Show>
            )}
          </For>
          <Show when={query.hasNextPage}>
            <button onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage()}>
              {query.isFetchingNextPage() ? "Loading..." : "Load More"}
            </button>
          </Show>
        </div>
      )}
    </Show>
  );
}
```

Available return values:

- `data().pages` - Array of fetched pages
- `fetchNextPage()` - Call to fetch the next page
- `hasNextPage()` - Boolean indicating if more pages exist
- `isFetchingNextPage()` - Boolean indicating if next page is loading

## Available Hooks

All hooks use `create` prefix and accept reactive `Accessor<T>` options.

### Accounts

- `createAccountInfo` - Get account details
- `createAccountBalances` - Get account balances
- `createAccountTokens` - Get associated tokens
- `createAccountNfts` - Get associated NFTs
- `createAccountStakingRewards` - Get staking rewards
- `createAccountCryptoAllowances` - Get crypto allowances
- `createAccountTokenAllowances` - Get token allowances
- `createAccountNftAllowances` - Get NFT allowances
- `createAccountOutstandingAirdrops` - Get outstanding airdrops
- `createAccountPendingAirdrops` - Get pending airdrops
- `createAccountOverview` - Get complete account overview
- `createAccounts` - List accounts (with pagination)
- `createAccountsInfinite` - Infinite scroll for accounts

### Tokens

- `createTokenInfo` - Get token details
- `createTokenBalances` - Get token balances
- `createTokenNfts` - Get token NFTs
- `createTokenNft` - Get specific token NFT
- `createTokenNftTransactions` - Get NFT transactions
- `createTokens` - List tokens (with pagination)
- `createTokensInfinite` - Infinite scroll for tokens

### Transactions

- `createTransaction` - Get transaction details
- `createTransactions` - List transactions (with pagination)
- `createTransactionsByAccount` - List transactions by account
- `createTransactionsInfinite` - Infinite scroll for transactions
- `createPollTransaction` - Poll for transaction confirmation

### Contracts

- `createContractInfo` - Get contract details
- `createContractCall` - Call contract function
- `createContractResults` - Get contract results
- `createContractResult` - Get specific contract result
- `createContractState` - Get contract state
- `createContractLogs` - Get contract logs
- `createContractAllResults` - Get all contract results
- `createContractResultByTransactionIdOrHash` - Get result by transaction
- `createContractResultActions` - Get result actions
- `createContractResultOpcodes` - Get result opcodes
- `createContractAllLogs` - Get all contract logs
- `createContracts` - List contracts (with pagination)
- `createContractsInfinite` - Infinite scroll for contracts

### Topics

- `createTopicInfo` - Get topic details
- `createTopicMessages` - Get topic messages
- `createTopicMessage` - Get specific topic message
- `createTopicMessageByTimestamp` - Get message by timestamp
- `createTopics` - List topics (with pagination)
- `createTopicsInfinite` - Infinite scroll for topics

### Schedules

- `createScheduleInfo` - Get schedule details
- `createSchedules` - List schedules (with pagination)
- `createSchedulesInfinite` - Infinite scroll for schedules

### Blocks

- `createBlock` - Get block details
- `createBlocks` - List blocks (with pagination)

### Balances

- `createBalances` - List balances (with pagination)

### Network

- `createNetworkExchangeRate` - Get HBAR exchange rates
- `createNetworkFees` - Get network fees
- `createNetworkNodes` - Get network nodes
- `createNetworkStake` - Get network stake
- `createNetworkSupply` - Get network supply

## Query Options

All hooks accept standard TanStack Query options:

```tsx
const query = createAccountInfo(() => ({
  accountId: "0.0.123",
  enabled: true,
}));
```

## Reactivity in SolidJS

Options are wrapped in functions for automatic tracking:

```tsx
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

## Utilities

Prefetch and invalidate queries from anywhere in your app:

```tsx
import { prefetchQuery, invalidateQueries, mirrorNodeKeys } from "@hiecom/solid-mirror-node";
import { useMirrorNodeClient } from "@hiecom/solid-mirror-node";

function MyComponent() {
  const client = useMirrorNodeClient();

  const prefetchAccount = async () => {
    await prefetchQuery(queryClient, client, mirrorNodeKeys.account.info("mainnet", "0.0.123"));
  };

  const refreshAccount = async () => {
    await invalidateQueries(queryClient, {
      exactKey: mirrorNodeKeys.account.info("mainnet", "0.0.123"),
    });
  };

  const refreshAllAccounts = async () => {
    await invalidateQueries(queryClient, { entityType: "account" });
  };

  const refreshAll = async () => {
    await invalidateQueries(queryClient, {});
  };
}
```

## License

MIT
