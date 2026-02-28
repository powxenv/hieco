# @hieco/testing

Testing utilities for Hedera Mirror Node development with MSW fixtures and helpers.

## Features

- **MSW Handlers** - Mock Service Worker handlers for Mirror Node API
- **Fixtures** - Factory functions for all Hedera entities
- **Test Setup** - Easy setup and teardown for test suites
- **Transaction Builders** - Build test transactions
- **Timestamp Utils** - Helper functions for timestamp manipulation
- **State Management** - Unique ID generation for tests

## Installation

```bash
# bun
bun add @hieco/testing msw

# npm
npm install @hieco/testing msw

# pnpm
pnpm add @hieco/testing msw

# yarn
yarn add @hieco/testing msw
```

## Quick Start

```typescript
import { setupMirrorMock, mockAccount } from "@hieco/testing";

const { server, listen, resetHandlers, close } = setupMirrorMock({
  network: "testnet",
  onUnhandledRequest: "error",
});

beforeAll(() => listen());
afterEach(() => resetHandlers());
afterAll(() => close());

it("gets account info", async () => {
  server.use(
    http.get("/api/v1/accounts/0.0.123", () => {
      return HttpResponse.json(mockAccount({ account: "0.0.123" }));
    }),
  );

  const client = createMirrorNodeClient({ network: "testnet" });
  const result = await client.account.getInfo("0.0.123");
  expect(result.success).toBe(true);
});
```

## API Reference

### Server Setup

```typescript
// Setup mock server
setupMirrorMock(config: {
  network: "mainnet" | "testnet" | "previewnet";
  onUnhandledRequest?: "error" | "warn" | "bypass";
}): {
  server: SetupServerApi;
  listen: () => void;
  resetHandlers: () => void;
  close: () => void;
}

// Network URLs
NETWORK_URLS: {
  mainnet: string;
  testnet: string;
  previewnet: string;
}
```

### Fixtures

#### Account

```typescript
mockAccount({ account: "0.0.123" });
mockAccount.build({ account: "0.0.123", balance: 1000 });
mockAccount.buildList(5, { account: "0.0.123" });
```

#### Transaction

```typescript
mockTransaction({ transaction_id: "0.0.123@1234567890.000000001" });
mockTransaction.build({ result: "SUCCESS" });
mockTransaction.buildList(10);
```

#### Token

```typescript
mockToken({ token_id: "0.0.456", name: "Test Token", symbol: "TT" });
mockToken.build({ decimals: 8, total_supply: 1000000 });
```

#### NFT

```typescript
mockNft({ token_id: "0.0.456", serial_number: 1 });
mockNft.buildList(5, { token_id: "0.0.456" });
```

#### Token Relationship

```typescript
mockTokenRelationship.build("0.0.123", { token_id: "0.0.456", balance: 100 });
```

#### Balance

```typescript
mockBalance({ account: "0.0.123", hbar: 1000 });
mockBalance.build({ account: "0.0.123", tokens: [{ token_id: "0.0.456", balance: 100 }] });
```

#### Contract

```typescript
mockContract({ contract_id: "0.0.789" });
mockContract.build({ evm_address: "0x..." });
```

#### Topic

```typescript
mockTopic({ topic_id: "0.0.111" });
mockTopicMessage({ topic_id: "0.0.111", sequence_number: 1 });
```

#### Schedule

```typescript
mockSchedule({ schedule_id: "0.0.222" });
```

#### Block

```typescript
mockBlock({ number: 123, hash: "abc123" });
```

#### Network

```typescript
mockExchangeRate({ current_rate: { hbar_equiv: 30000, cent_equiv: 1 } });
mockNetworkNode({ node_id: 1, account_id: "0.0.3" });
mockNetworkSupply({ total_coin: 5000000000000000000 });
```

### Transaction Builders

```typescript
transactionBuilder.cryptoTransfer({
  hbarTransfers: [
    { accountId: "0.0.123", amount: 100 },
    { accountId: "0.0.456", amount: -100 },
  ],
});

transactionBuilder.transferToken({
  tokenId: "0.0.456",
  from: "0.0.123",
  to: "0.0.789",
  amount: 10,
});

transactionBuilder.transferNft({
  tokenId: "0.0.456",
  from: "0.0.123",
  to: "0.0.789",
  serialNumber: 1,
});
```

### Test Setup Helpers

```typescript
// Create test setup
createTestSetup({
  network: "testnet",
  resetState: true,
  onUnhandledRequest: "error",
}): {
  start: () => void;
  stop: () => void;
}

// Auto-cleanup helper
withAutoCleanup(async (callback) => {
  // Runs in isolated context
})

// With mirror server helper
withMirrorServer(async (server) => {
  server.use(/* custom handlers */);
});
```

### Timestamp Utils

```typescript
timestampUtils.now(); // "1234567890000000000"
timestampUtils.fromMillis(1234567890000); // "1234567890000000000"
timestampUtils.fromSeconds(1234567890); // "1234567890000000000"
timestampUtils.fromDate(new Date()); // "1234567890000000000"
timestampUtils.addSeconds("1234567890.000000000", 10); // "1234567900.000000000"
timestampUtils.addMillis("1234567890.000000000", 1000); // "1234567891.000000000"
timestampUtils.toDate("1234567890.000000000"); // Date
timestampUtils.compare(a, b); // -1 | 0 | 1
timestampUtils.equals(a, b); // boolean
timestampUtils.before(a, b); // boolean
timestampUtils.after(a, b); // boolean
```

### State Management

```typescript
state.incrementAccount(); // Returns 0, then 1, 2, ...
state.incrementToken(); // Returns 0, then 1, 2, ...
state.reset(); // Resets all counters
```

### Async Helpers

```typescript
await sleep(1000);
await waitFor(condition, { timeout, interval });
await assertThrows(async () => {
  throw new Error();
});
```

## Examples

### With Test Framework

```typescript
import { setupMirrorMock, mockAccount } from "@hieco/testing";

describe("Account API", () => {
  const { server, listen, resetHandlers, close } = setupMirrorMock({ network: "testnet" });

  beforeAll(() => listen());
  afterEach(() => resetHandlers());
  afterAll(() => close());

  it("fetches account info", async () => {
    server.use(
      http.get("/api/v1/accounts/0.0.123", () => {
        return HttpResponse.json(mockAccount({ account: "0.0.123", balance: 1000 }));
      }),
    );

    const result = await client.account.getInfo("0.0.123");
    expect(result.success).toBe(true);
    expect(result.data.balance.balance).toBe(1000);
  });
});
```

### With Custom Fixtures

```typescript
import { createFixtureHandlers, mockAccount, mockToken } from "@hieco/testing";

const handlers = createFixtureHandlers({
  network: "testnet",
  accounts: [mockAccount.build({ account: "0.0.123" })],
  tokens: [mockToken.build({ token_id: "0.0.456" })],
});

server.use(...handlers);
```

## Related Packages

- [`@hieco/mirror`](https://www.npmjs.com/package/@hieco/mirror) - REST API client (for testing)
- [`@hieco/mirror-react`](https://www.npmjs.com/package/@hieco/mirror-react) - React hooks

## License

MIT
