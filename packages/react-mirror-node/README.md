# @hiecom/react-mirror-node

Type-safe React hooks for Hedera Mirror Node API with TanStack Query.

## Installation

```bash
bun add @hiecom/mirror-node @hiecom/react-mirror-node @tanstack/react-query
```

## Quick Start

### Step 1: Wrap your app with providers

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MirrorNodeProvider, createNetworkConfig } from "@hiecom/react-mirror-node";

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
import { useAccountInfo } from "@hiecom/react-mirror-node";

function AccountBalance({ accountId }: { accountId: string }) {
  const { data, isLoading, error } = useAccountInfo({ accountId });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data?.success) return <div>Failed to load</div>;

  return <div>Balance: {data.data.balance.balance} tinybars</div>;
}
```

## Switching Networks

Switch networks at runtime. All queries automatically refetch with the new network:

```tsx
import { useNetwork } from "@hiecom/react-mirror-node";

function NetworkSelector() {
  const { network, switchNetwork } = useNetwork();

  return (
    <div>
      <span>Current: {network}</span>
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
import { useTokens } from "@hiecom/react-mirror-node";

function TokenList() {
  const { data, isLoading } = useTokens({
    params: { limit: 25, order: "desc" },
  });

  if (isLoading) return <div>Loading...</div>;
  if (!data?.success) return <div>Failed to load</div>;

  return (
    <div>
      <p>Showing {data.data.length} tokens</p>
      <ul>
        {data.data.map((token) => (
          <li key={token.token_id}>{token.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

The `limit` parameter controls how many items per page to fetch from the API. The hooks automatically follow the pagination cursor (`links.next`) to fetch all pages and combine the results.

### Infinite Queries

For infinite scroll with manual page-by-page loading:

```tsx
import { useTokensInfinite } from "@hiecom/react-mirror-node";

function TokenInfiniteList() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useTokensInfinite();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.pages.map((page, index) => (
        <div key={index}>
          {page.success &&
            page.data.data.map((token) => <div key={token.token_id}>{token.name}</div>)}
        </div>
      ))}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
```

Available return values:

- `data.pages` - Array of fetched pages
- `fetchNextPage()` - Call to fetch the next page
- `hasNextPage` - Boolean indicating if more pages exist
- `isFetchingNextPage` - Boolean indicating if next page is loading

## Available Hooks

### Accounts

- `useAccountInfo` - Get account details
- `useAccountBalances` - Get account balances
- `useAccountTokens` - Get associated tokens
- `useAccountNfts` - Get associated NFTs
- `useAccountStakingRewards` - Get staking rewards
- `useAccountCryptoAllowances` - Get crypto allowances
- `useAccountTokenAllowances` - Get token allowances
- `useAccountNftAllowances` - Get NFT allowances
- `useAccountOutstandingAirdrops` - Get outstanding airdrops
- `useAccountPendingAirdrops` - Get pending airdrops
- `useAccountOverview` - Get complete account overview
- `useAccounts` - List accounts (with pagination)
- `useAccountsInfinite` - Infinite scroll for accounts

### Tokens

- `useTokenInfo` - Get token details
- `useTokenBalances` - Get token balances
- `useTokenNfts` - Get token NFTs
- `useTokenNft` - Get specific token NFT
- `useTokenNftTransactions` - Get NFT transactions
- `useTokens` - List tokens (with pagination)
- `useTokensInfinite` - Infinite scroll for tokens

### Transactions

- `useTransaction` - Get transaction details
- `useTransactions` - List transactions (with pagination)
- `useTransactionsByAccount` - List transactions by account
- `useTransactionsInfinite` - Infinite scroll for transactions
- `usePollTransaction` - Poll for transaction confirmation

### Contracts

- `useContractInfo` - Get contract details
- `useContractCall` - Call contract function
- `useContractResults` - Get contract results
- `useContractResult` - Get specific contract result
- `useContractState` - Get contract state
- `useContractLogs` - Get contract logs
- `useContractAllResults` - Get all contract results
- `useContractResultByTransactionIdOrHash` - Get result by transaction
- `useContractResultActions` - Get result actions
- `useContractResultOpcodes` - Get result opcodes
- `useContractAllLogs` - Get all contract logs
- `useContracts` - List contracts (with pagination)
- `useContractsInfinite` - Infinite scroll for contracts

### Topics

- `useTopicInfo` - Get topic details
- `useTopicMessages` - Get topic messages
- `useTopicMessage` - Get specific topic message
- `useTopicMessageByTimestamp` - Get message by timestamp
- `useTopics` - List topics (with pagination)
- `useTopicsInfinite` - Infinite scroll for topics

### Schedules

- `useScheduleInfo` - Get schedule details
- `useSchedules` - List schedules (with pagination)
- `useSchedulesInfinite` - Infinite scroll for schedules

### Blocks

- `useBlock` - Get block details
- `useBlocks` - List blocks (with pagination)

### Balances

- `useBalances` - List balances (with pagination)

### Network

- `useNetworkExchangeRate` - Get HBAR exchange rates
- `useNetworkFees` - Get network fees
- `useNetworkNodes` - Get network nodes
- `useNetworkStake` - Get network stake
- `useNetworkSupply` - Get network supply

## Query Options

All hooks accept standard TanStack Query options:

```tsx
const { data } = useAccountInfo({
  accountId: "0.0.123",
  enabled: true,
  staleTime: 60000,
  refetchOnWindowFocus: false,
});
```

## Utilities

Prefetch and invalidate queries from anywhere in your app:

```tsx
import { prefetchQuery, invalidateQueries, mirrorNodeKeys } from "@hiecom/react-mirror-node";
import { useMirrorNodeClient } from "@hiecom/react-mirror-node";

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
