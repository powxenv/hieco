# @hiecom/mirror-js

Hedera Mirror Node API client for Node.js and browser.

## Install

```bash
# bun
bun add @hiecom/mirror-js

# npm
npm install @hiecom/mirror-js

# pnpm
pnpm add @hiecom/mirror-js

# yarn
yarn add @hiecom/mirror-js
```

## Usage

```typescript
import { createMirrorNodeClient } from "@hiecom/mirror-js";

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
client.network.listPaginated({ limit: 25 });
client.network.listPaginatedPage({ limit: 25 });
client.network.listPaginatedPageByUrl("https://...");
client.network.createNetworkNodesPaginator({ limit: 25 });
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

## Cursor Pagination

The Hedera Mirror Node API uses cursor-based pagination with forward-only navigation.

### Paginated Response Format

```typescript
interface PaginatedResponse<T> {
  links: {
    next?: string;
  };
  data: T[];
}
```

### Fetch All Pages

Automatically follows `links.next` to fetch all pages:

```typescript
const result = await client.token.listPaginated({ limit: 100 });

if (result.success) {
  const tokens = result.data;
  console.log(`Fetched ${tokens.length} total tokens`);
}
```

### Fetch Single Page

Get one page with metadata:

```typescript
const result = await client.token.listPaginatedPage({ limit: 25 });

if (result.success) {
  const page = result.data;
  console.log(`Items: ${page.data.length}`);
  console.log(`Next: ${page.links.next ?? "none"}`);
}
```

### Fetch by URL

Navigate using a previously returned `links.next` URL:

```typescript
let nextUrl: string | undefined = initialUrl;

while (nextUrl) {
  const result = await client.token.listPaginatedPageByUrl(nextUrl);

  if (result.success) {
    const { data, links } = result.data;
    for (const item of data) {
      // Process item
    }
    nextUrl = links.next;
  }
}
```

### Async Iterator

```typescript
const paginator = client.token.createTokenPaginator({ limit: 100 });

for await (const token of paginator) {
  console.log(token.name);
}
```

### Framework Packages

For React, Preact, and SolidJS, use the framework-specific packages:

- `@hiecom/mirror-react` - React hooks with TanStack Query
- `@hiecom/mirror-preact` - Preact hooks with TanStack Query
- `@hiecom/mirror-solid` - SolidJS hooks with TanStack Query

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
import { createMirrorNodeClient } from "@hiecom/mirror-js";

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

For ready-made hooks, see [`@hiecom/mirror-react`](https://www.npmjs.com/package/@hiecom/mirror-react).

## Using API Classes Directly

```typescript
import { AccountApi } from "@hiecom/mirror-js";

const accountApi = new AccountApi({
  baseUrl: "https://mainnet.mirrornode.hedera.com/api/v1",
});

const result = await accountApi.getInfo("0.0.123");
```

## License

MIT
