# @hiecom/testing

Testing utilities for Hiero/Hedera development with MSW fixtures and helpers.

## Install

```bash
# bun
bun add @hiecom/testing msw

# npm
npm install @hiecom/testing msw

# pnpm
pnpm add @hiecom/testing msw

# yarn
yarn add @hiecom/testing msw
```

## Quick Start

```typescript
import { setupMirrorMock } from "@hiecom/testing";

const { server, listen, resetHandlers, close } = setupMirrorMock({ network: "testnet" });

beforeAll(() => listen());
afterEach(() => resetHandlers());
afterAll(() => close());
```

### Using Fixtures

```typescript
import { mockAccount, mockToken, mockTransaction } from "@hiecom/testing/fixtures";
import { setupMirrorMock } from "@hiecom/testing";

const { server, listen, resetHandlers, close } = setupMirrorMock({ network: "testnet" });

beforeAll(() => listen());
afterEach(() => resetHandlers());
afterAll(() => close());

it("gets account info", async () => {
  server.use(
    http.get("/api/v1/accounts/0.0.123", () => {
      return HttpResponse.json(mockAccount({ accountId: "0.0.123" }));
    }),
  );

  const client = createMirrorNodeClient({ network: "testnet" });
  const result = await client.account.getInfo("0.0.123");
  expect(result.success).toBe(true);
});
```

## Server

### setupMirrorMock

```typescript
import { setupMirrorMock } from "@hiecom/testing";

const { server, listen, resetHandlers, close, use } = setupMirrorMock({
  network: "testnet", // "mainnet" | "testnet" | "previewnet"
  onUnhandledRequest: "error", // "error" | "warn" | "bypass"
});

server.listen();
server.resetHandlers();
server.close();
server.use(...handlers);
```

### createFixtureHandlers

Create default handlers with custom fixtures:

```typescript
import { createFixtureHandlers, mockAccount } from "@hiecom/testing";

const handlers = createFixtureHandlers({
  network: "testnet",
  accounts: [mockAccount.build({ account: "0.0.123" })],
});
```

### NETWORK_URLS

```typescript
import { NETWORK_URLS } from "@hiecom/testing";

NETWORK_URLS.mainnet; // "https://mainnet.mirrornode.hedera.com"
NETWORK_URLS.testnet; // "https://testnet.mirrornode.hedera.com"
NETWORK_URLS.previewnet; // "https://previewnet.mirrornode.hedera.com"
```

## Fixtures

tokens: [mockToken({ tokenId: "0.0.456" })],
});

````

## Fixtures

Available fixtures for all Hedera entities:

### Account

```typescript
import { mockAccount, type AccountFixtureOptions } from "@hiecom/testing/fixtures";

const account = mockAccount({
  account: "0.0.123",
  hbar: 1000,
});
````

### Transaction

```typescript
import { mockTransaction, type TransactionFixtureOptions } from "@hiecom/testing/fixtures";

const tx = mockTransaction({
  transaction_id: "0.0.123@1234567890.000000001",
  result: "SUCCESS",
});
```

### Token

```typescript
import { mockToken, type TokenFixtureOptions } from "@hiecom/testing/fixtures";

const token = mockToken({
  token_id: "0.0.456",
  name: "Test Token",
  symbol: "TT",
  decimals: 8,
  total_supply: 1000000,
});
```

### NFT

```typescript
import { mockNft, type NftFixtureOptions } from "@hiecom/testing/fixtures";

const nft = mockNft({
  token_id: "0.0.456",
  serial_number: 1,
  account: "0.0.123",
  metadata: "test-metadata",
});

const nfts = mockNft.buildList(5, { token_id: "0.0.456" });
```

### Token Relationship

```typescript
import { mockTokenRelationship } from "@hiecom/testing/fixtures";

const relationship = mockTokenRelationship.build("0.0.123", {
  token_id: "0.0.456",
  balance: 100,
});
```

### Balance

```typescript
import { mockBalance, type BalanceFixtureOptions } from "@hiecom/testing/fixtures";

const balance = mockBalance({
  account: "0.0.123",
  hbar: 1000,
  tokens: [{ token_id: "0.0.456", balance: 100 }],
});
```

### Contract

```typescript
import { mockContract, type ContractFixtureOptions } from "@hiecom/testing/fixtures";

const contract = mockContract({
  contract_id: "0.0.789",
});
```

### Topic

```typescript
import { mockTopic, mockTopicMessage, type TopicFixtureOptions } from "@hiecom/testing/fixtures";

const topic = mockTopic({
  topic_id: "0.0.111",
  sequence_number: 1,
});

const message = mockTopicMessage({
  topic_id: "0.0.111",
  sequence_number: 1,
  message: "SGVsbG8gV29ybGQ=",
});
```

### Schedule

```typescript
import { mockSchedule, type ScheduleFixtureOptions } from "@hiecom/testing/fixtures";

const schedule = mockSchedule({
  schedule_id: "0.0.222",
});
```

### Block

```typescript
import { mockBlock, type BlockFixtureOptions } from "@hiecom/testing/fixtures";

const block = mockBlock({
  number: 123,
  hash: "abc123",
});
```

### Network

```typescript
import { mockExchangeRate, mockNetworkNode, mockNetworkSupply } from "@hiecom/testing/fixtures";

const exchangeRate = mockExchangeRate({
  current_rate: {
    hbar_equiv: 30000,
    cent_equiv: 1,
  },
});

const node = mockNetworkNode({
  node_id: 1,
  account_id: "0.0.3",
});

const supply = mockNetworkSupply({
  total_coin: 5000000000000000000,
});
```

### Staking

```typescript
import { mockStakedAccount, type StakingInfoFixtureOptions } from "@hiecom/testing/fixtures";

const staking = mockStakedAccount({
  staked_account_id: "0.0.456",
  stake_period_start: "1234567890.000000001",
});
```

## Transaction Builders

### transactionBuilder

```typescript
import { transactionBuilder } from "@hiecom/testing/builders";

const tx = transactionBuilder.cryptoTransfer({
  hbarTransfers: [
    { accountId: "0.0.123", amount: 100 },
    { accountId: "0.0.456", amount: -100 },
  ],
});

const tokenTx = transactionBuilder.transferToken({
  tokenId: "0.0.456",
  from: "0.0.123",
  to: "0.0.789",
  amount: 10,
});

const nftTx = transactionBuilder.transferNft({
  tokenId: "0.0.456",
  from: "0.0.123",
  to: "0.0.789",
  serialNumber: 1,
});
```

## Utils

### createTestSetup, withAutoCleanup

```typescript
import { createTestSetup, withAutoCleanup } from "@hiecom/testing";

const setup = createTestSetup({
  network: "testnet",
  resetState: true,
  onUnhandledRequest: "error",
});

beforeAll(() => setup.start());
afterAll(() => setup.stop());

it("test", async () => {
  await withAutoCleanup(async ({ server }) => {
    server.use(/* custom handlers */);
  });
});
```

### withMirrorServer

Integration test helper that automatically sets up and tears down the mock server:

```typescript
import { withMirrorServer } from "@hiecom/testing";

it("test", async () => {
  const result = await withMirrorServer(async (server) => {
    server.use(
      http.get("/api/v1/accounts/0.0.123", () => {
        return HttpResponse.json(mockAccount({ accountId: "0.0.123" }));
      }),
    );
    // test code
  });
});
```

### timestampUtils

```typescript
import { timestampUtils } from "@hiecom/testing";

timestampUtils.now(); // "1234567890000000000"
timestampUtils.fromMillis(1234567890000); // "1234567890000000000"
timestampUtils.fromSeconds(1234567890); // "1234567890000000000"
timestampUtils.fromDate(new Date()); // "1234567890000000000"
timestampUtils.addSeconds("1234567890.000000000", 10); // "1234567900.000000000"
timestampUtils.addMillis("1234567890.000000000", 1000); // "1234567891.000000000"
timestampUtils.toDate("1234567890.000000000"); // Date
timestampUtils.compare("1234567890.000000001", "1234567890.000000002"); // -1
timestampUtils.equals("1234567890.000000000", "1234567890.000000000"); // true
timestampUtils.before("1234567890.000000000", "1234567891.000000000"); // true
timestampUtils.after("1234567891.000000000", "1234567890.000000000"); // true
```

### State

Generate unique IDs for fixtures:

```typescript
import { state } from "@hiecom/testing";

state.incrementAccount(); // 0
state.incrementAccount(); // 1
state.incrementToken(); // 0
state.reset(); // resets all counters
```

### sleep, waitFor, assertThrows

```typescript
import { sleep, waitFor, assertThrows } from "@hiecom/testing";

await sleep(1000);

const result = await waitFor(() => someAsyncCondition(), {
  timeout: 5000,
  interval: 100,
});

await assertThrows(async () => {
  throw new Error("fail");
});
```

## License

MIT
