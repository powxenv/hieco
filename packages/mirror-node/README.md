# @hiecom/mirror-node

Hedera Mirror Node API client for Node.js and browser.

## Install

```bash
# bun
bun add @hiecom/mirror-node

# npm
npm install @hiecom/mirror-node

# pnpm
pnpm add @hiecom/mirror-node

# yarn
yarn add @hiecom/mirror-node
```

## Usage

```typescript
import { createMirrorNodeClient } from "@hiecom/mirror-node";

const client = createMirrorNodeClient({ network: "mainnet" });

const account = await client.account.getInfo("0.0.123");
const tokens = await client.token.listPaginated({ limit: 10 });
```

## Client

```typescript
const client = createMirrorNodeClient({ network: "mainnet" });
const client = createMirrorNodeClient({ network: "testnet" });
const client = createMirrorNodeClient({ network: "previewnet" });

const client = createMirrorNodeClient({
  baseUrl: "https://your-mirror-node.com/api/v1",
});
```

### API Methods

**Account**

```typescript
client.account.getInfo("0.0.123");
client.account.getBalances("0.0.123");
client.account.getTokens("0.0.123", { limit: 25 });
client.account.getNfts("0.0.123", { "token.id": "0.0.456" });
client.account.getStakingRewards("0.0.123");
client.account.getCryptoAllowances("0.0.123");
client.account.getTokenAllowances("0.0.123", { spender: "0.0.456" });
client.account.getNftAllowances("0.0.123");
client.account.getOutstandingAirdrops("0.0.123");
client.account.getPendingAirdrops("0.0.123");
client.account.listPaginated({ limit: 25 });
```

**Token**

```typescript
client.token.getInfo("0.0.456");
client.token.getBalances("0.0.456", { account: "0.0.123" });
client.token.getNfts("0.0.456");
client.token.getNft("0.0.456", 1);
client.token.getNftTransactions("0.0.456", 1);
client.token.listPaginated({ type: "FUNGIBLE_COMMON" });
```

**Topic**

```typescript
client.topic.getInfo("0.0.789");
client.topic.getMessages("0.0.789", { limit: 50 });
client.topic.getMessage("0.0.789", 1);
client.topic.getMessageByTimestamp("1234567890.000000000");
client.topic.listPaginated({ limit: 25 });
```

**Transaction**

```typescript
client.transaction.getById("0.0.123@1234567890.123456789");
client.transaction.listByAccount("0.0.123", { limit: 50 });
client.transaction.listPaginated({ "account.id": "0.0.123" });
```

**Contract**

```typescript
client.contract.getInfo("0.0.456");
client.contract.call({ contractId: "0.0.456", data: "0x..." });
client.contract.getResults("0.0.456");
client.contract.getResult("0.0.456", "1234567890.123456789");
client.contract.getAllResults({ limit: 25 });
client.contract.getResultByTransactionIdOrHash("0x...");
client.contract.getResultActions("0x...");
client.contract.getResultOpcodes("0x...");
client.contract.getState("0.0.456");
client.contract.getLogs("0.0.456");
client.contract.getAllContractLogs({ limit: 100 });
client.contract.listPaginated({ limit: 50 });
```

**Schedule**

```typescript
client.schedule.getInfo("0.0.123");
client.schedule.listPaginated({ limit: 25 });
```

**Network**

```typescript
client.network.getExchangeRate();
client.network.getFees();
client.network.getNodes();
client.network.getStake();
client.network.getSupply();
```

**Balance**

```typescript
client.balance.getBalances({ limit: 100 });
```

**Block**

```typescript
client.block.getBlock("0.0.456");
client.block.getBlock("123456");
client.block.getBlocks({ limit: 50 });
```

## Response Format

Every method returns a typed result:

```typescript
const result = await client.account.getInfo("0.0.123");

if (result.success) {
  console.log(result.data.balance);
} else {
  console.error(result.error.message);
}
```

## TanStack Query Integration

Use with `@tanstack/react-query` for caching and state management:

```typescript
import { useQuery } from "@tanstack/react-query";
import { createMirrorNodeClient } from "@hiecom/mirror-node";

const client = createMirrorNodeClient({ network: "mainnet" });

function AccountBalance({ accountId }: { accountId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["account", accountId],
    queryFn: () => client.account.getInfo(accountId),
  });

  if (isLoading) return <span>Loading...</span>;
  if (!data?.success) return <span>Error: {data.error.message}</span>;

  return <span>Balance: {data.data.balance.balance} ℏ</span>;
}
```

For ready-made hooks, see [`@hiecom/react-mirror-node`](https://www.npmjs.com/package/@hiecom/react-mirror-node).

## Using API Classes Directly

```typescript
import { AccountApi } from "@hiecom/mirror-node";

const accountApi = new AccountApi({
  baseUrl: "https://mainnet.mirrornode.hedera.com/api/v1",
});

const result = await accountApi.getInfo("0.0.123");
```

## License

MIT
