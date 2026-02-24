# @hiecom/react-mirror-node

Type-safe Hedera Mirror Node API client for React.

## Install

```bash
npm install @hiecom/react-mirror-node
# or
bun add @hiecom/react-mirror-node
```

TanStack Query is optional:

```bash
# Required for Option A (React Query Hooks)
npm install @tanstack/react-query
# or
bun add @tanstack/react-query
```

## Quick Start

### 1. Setup Provider

```tsx
import { MirrorNodeProvider, MirrorNodeClient } from "@hiecom/react-mirror-node";

const client = new MirrorNodeClient({ network: "mainnet" });

function App() {
  return (
    <MirrorNodeProvider client={client}>
      <YourApp />
    </MirrorNodeProvider>
  );
}
```

### 2. Use in Components

**Option A: React Query Hooks** (requires `@tanstack/react-query`)

```tsx
import { useAccountInfo } from "@hiecom/react-mirror-node";

function AccountBalance({ accountId }: { accountId: string }) {
  const { data, isLoading, error } = useAccountInfo({ accountId });

  if (isLoading) return <span>Loading...</span>;
  if (!data?.success) return <span>Error: {data.error.message}</span>;

  return <span>Balance: {data.data.balance.balance} ℏ</span>;
}
```

**Option B: Manual TanStack Query**

```tsx
import { useQuery } from "@tanstack/react-query";
import { useMirrorNodeClient, mirrorNodeKeys } from "@hiecom/react-mirror-node";

function AccountBalance({ accountId }: { accountId: string }) {
  const client = useMirrorNodeClient();
  
  const { data, isLoading, error } = useQuery({
    queryKey: mirrorNodeKeys.account.info(accountId),
    queryFn: () => client.account.getInfo(accountId),
  });

  if (isLoading) return <span>Loading...</span>;
  if (!data?.success) return <span>Error: {data.error.message}</span>;

  return <span>Balance: {data.data.balance.balance} ℏ</span>;
}
```

**Option C: Direct Client**

```tsx
import { useState, useEffect } from "react";
import { useMirrorNodeClient } from "@hiecom/react-mirror-node";

function AccountBalance({ accountId }: { accountId: string }) {
  const client = useMirrorNodeClient();
  const [account, setAccount] = useState(null);

  useEffect(() => {
    client.account.getInfo(accountId).then(setAccount);
  }, [accountId]);

  if (!account) return <span>Loading...</span>;
  if (!account.success) return <span>Error: {account.error.message}</span>;

  return <span>Balance: {account.data.balance.balance} ℏ</span>;
}
```

- **Option A** & **Option B**: Require `@tanstack/react-query`
- **Option C**: Works without `@tanstack/react-query`

## Configuration

```tsx
const client = new MirrorNodeClient({ network: "mainnet" });  // default
const client = new MirrorNodeClient({ network: "testnet" });
const client = new MirrorNodeClient({ network: "previewnet" });

// Custom Mirror Node URL
const client = new MirrorNodeClient({
  network: "mainnet",
  mirrorNodeUrl: "https://your-mirror-node.com",
});
```

## Query Keys

Use `mirrorNodeKeys` for manual cache management with `useQuery`:

```ts
// Account
mirrorNodeKeys.account.info(id)
mirrorNodeKeys.account.balances(id)
mirrorNodeKeys.account.tokens(id)
mirrorNodeKeys.account.nfts(id)
mirrorNodeKeys.account.stakingRewards(id)
mirrorNodeKeys.account.cryptoAllowances(id)
mirrorNodeKeys.account.tokenAllowances(id)
mirrorNodeKeys.account.nftAllowances(id)
mirrorNodeKeys.account.outstandingAirdrops(id)
mirrorNodeKeys.account.pendingAirdrops(id)
mirrorNodeKeys.account.list()

// Token
mirrorNodeKeys.token.info(id)
mirrorNodeKeys.token.balances(id)
mirrorNodeKeys.token.nfts(id)
mirrorNodeKeys.token.nft(tokenId, serialNumber)
mirrorNodeKeys.token.nftTransactions(tokenId, serialNumber)
mirrorNodeKeys.token.list()

// Contract
mirrorNodeKeys.contract.info(id)
mirrorNodeKeys.contract.results(id)
mirrorNodeKeys.contract.result(id, timestamp)
mirrorNodeKeys.contract.state(id)
mirrorNodeKeys.contract.logs(id)
mirrorNodeKeys.contract.allResults()
mirrorNodeKeys.contract.resultByTx(txHash)
mirrorNodeKeys.contract.resultActions(txHash)
mirrorNodeKeys.contract.resultOpcodes(txHash)
mirrorNodeKeys.contract.allLogs()
mirrorNodeKeys.contract.call()
mirrorNodeKeys.contract.list()

// Transaction
mirrorNodeKeys.transaction.info(id)
mirrorNodeKeys.transaction.byAccount(id)
mirrorNodeKeys.transaction.list()

// Topic
mirrorNodeKeys.topic.info(id)
mirrorNodeKeys.topic.messages(id)
mirrorNodeKeys.topic.message(id, sequenceNumber)
mirrorNodeKeys.topic.messageByTimestamp(timestamp)
mirrorNodeKeys.topic.list()

// Schedule
mirrorNodeKeys.schedule.info(id)
mirrorNodeKeys.schedule.list()

// Network
mirrorNodeKeys.network.exchangeRate()
mirrorNodeKeys.network.fees()
mirrorNodeKeys.network.nodes()
mirrorNodeKeys.network.stake()
mirrorNodeKeys.network.supply()

// Balance
mirrorNodeKeys.balance.list()

// Block
mirrorNodeKeys.block.list()
mirrorNodeKeys.block.info(hashOrNumber)
```

## API Reference

### Account API

```tsx
// Hooks
useAccountInfo({ accountId })
useAccountBalances({ accountId })
useAccountTokens({ accountId, params })
useAccountNfts({ accountId, params })
useAccountStakingRewards({ accountId, params })
useAccountCryptoAllowances({ accountId })
useAccountTokenAllowances({ accountId, params })
useAccountNftAllowances({ accountId, params })
useAccountOutstandingAirdrops({ accountId, params })
useAccountPendingAirdrops({ accountId, params })
useAccounts({ params })
useAccountsInfinite({ params })

// Client
client.account.getInfo("0.0.123")
client.account.getBalances("0.0.123")
client.account.getTokens("0.0.123", { limit: 25 })
client.account.getNfts("0.0.123", { "token.id": "0.0.456", limit: 100 })
client.account.getStakingRewards("0.0.123")
client.account.getCryptoAllowances("0.0.123")
client.account.getTokenAllowances("0.0.123", { spender: "0.0.456" })
client.account.getNftAllowances("0.0.123")
client.account.getOutstandingAirdrops("0.0.123")
client.account.getPendingAirdrops("0.0.123")
client.account.listPaginated({ balance: "gte:1000", limit: 50 })
```

### Token API

```tsx
// Hooks
useTokenInfo({ tokenId })
useTokenBalances({ tokenId, params })
useTokenNfts({ tokenId, params })
useTokenNft({ tokenId, serialNumber })
useTokenNftTransactions({ tokenId, serialNumber, params })
useTokens({ params })
useTokensInfinite({ params })

// Client
client.token.getInfo("0.0.456")
client.token.getBalances("0.0.456", { account: "0.0.123", limit: 100 })
client.token.getNfts("0.0.456", { limit: 25 })
client.token.getNft("0.0.456", 1)
client.token.getNftTransactions("0.0.456", 1)
client.token.listPaginated({ type: "FUNGIBLE_COMMON", limit: 50 })
```

### Topic API

```tsx
// Hooks
useTopicInfo({ topicId })
useTopicMessages({ topicId, params })
useTopicMessage({ topicId, sequenceNumber })
useTopicMessageByTimestamp({ timestamp })
useTopics({ params })
useTopicsInfinite({ params })

// Client
client.topic.getInfo("0.0.789")
client.topic.getMessages("0.0.789", { limit: 50, encoding: "utf-8" })
client.topic.getMessage("0.0.789", 1)
client.topic.getMessageByTimestamp("1234567890.000000000")
client.topic.listPaginated({ limit: 25 })
```

### Transaction API

```tsx
// Hooks
useTransaction({ transactionId })
useTransactionsByAccount({ accountId, params })
useTransactions({ params })
useTransactionsInfinite({ params })

// Client
client.transaction.getById("0.0.123@1234567890.123456789")
client.transaction.listByAccount("0.0.123", { limit: 50, result: "SUCCESS" })
client.transaction.listPaginated({ "account.id": "0.0.123", limit: 100 })
```

### Contract API

```tsx
// Hooks
useContractInfo({ contractIdOrAddress })
useContractCall({ params: { contractId, data } })
useContractResults({ contractId, params })
useContractResult({ contractId, timestamp })
useContractAllResults({ params })
useContractResultByTransactionIdOrHash({ transactionIdOrHash, params })
useContractResultActions({ transactionIdOrHash })
useContractResultOpcodes({ transactionIdOrHash })
useContractState({ contractId, params })
useContractLogs({ contractId, params })
useContractAllLogs({ params })
useContracts({ params })
useContractsInfinite({ params })

// Client
client.contract.getInfo("0.0.456")
client.contract.call({ contractId: "0.0.456", data: "0x..." })
client.contract.getResults("0.0.456", { limit: 25 })
client.contract.getResult("0.0.456", "1234567890.123456789")
client.contract.getAllResults({ limit: 25 })
client.contract.getResultByTransactionIdOrHash("0x...", { nonce: 0 })
client.contract.getResultActions("0x...")
client.contract.getResultOpcodes("0x...")
client.contract.getState("0.0.456", { slot: "0x..." })
client.contract.getLogs("0.0.456", { timestamp: "1234567890.123456789" })
client.contract.getAllContractLogs({ limit: 100 })
client.contract.listPaginated({ limit: 50 })
```

### Schedule API

```tsx
// Hooks
useScheduleInfo({ scheduleId })
useSchedules({ params })
useSchedulesInfinite({ params })

// Client
client.schedule.getInfo("0.0.123")
client.schedule.listPaginated({ "creator.account.id": "0.0.456", limit: 25 })
```

### Network API

```tsx
// Hooks
useNetworkExchangeRate()
useNetworkFees()
useNetworkNodes()
useNetworkStake()
useNetworkSupply()

// Client
client.network.getExchangeRate()
client.network.getFees()
client.network.getNodes()
client.network.getStake()
client.network.getSupply()
```

### Balance API

```tsx
// Hooks
useBalances({ params })

// Client
client.balance.getBalances({ limit: 100 })
```

### Block API

```tsx
// Hooks
useBlock({ hashOrNumber })
useBlocks({ params })

// Client
client.block.getBlock("0.0.456")
client.block.getBlock("123456")
client.block.getBlocks({ limit: 50 })
```

## Query Options

All hooks accept TanStack Query options:

```tsx
const { data } = useAccountInfo({ 
  accountId: "0.0.123",
  enabled: true,                    // enable/disable fetch
  staleTime: 1000 * 60 * 5,         // cache time (5 min)
  refetchOnWindowFocus: false,      // refetch on window focus
  retry: 3,                         // retry count
});

// Network hooks don't require entity ID
const { data } = useNetworkExchangeRate({
  staleTime: 1000 * 60 * 10,        // cache longer for static data
});
```

## Pagination

```tsx
// Paginated list
const { data } = useAccounts({ params: { balance: "gte:1000", limit: 25 } });

// Infinite scroll
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useAccountsInfinite({ 
  params: { limit: 25 } 
});

// Manual pagination with client
const result = await client.account.listPaginated({ limit: 25, order: "desc" });
if (result.success) {
  console.log(result.data);
  console.log(result.links?.next); // cursor for next page
}
```

## Filters

```tsx
// Exact match
{ account: "0.0.123" }

// Operators: gte, lte, gt, lt, ne
{ balance: "gte:1000" }

// Timestamp range
{ timestamp: { from: "1234567890.000000000", to: "1234567900.000000000" } }

// List filters
useTokens({ params: { type: "FUNGIBLE_COMMON", limit: 50 } });
useTransactions({ params: { "account.id": "0.0.123", result: "SUCCESS" } });
```

## Type Safety

Every response is typed and includes error handling:

```tsx
const result = await client.account.getInfo("0.0.123");

if (result.success) {
  console.log(result.data.balance); // typed
} else {
  console.error(result.error.message);
  console.log(result.error._tag);   // "NetworkError" | "ValidationError" | "NotFoundError" | "RateLimitError" | "UnknownError"
}
```

## License

Apache-2.0
