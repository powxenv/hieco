# @hieco/testing

Comprehensive testing library for Hiero blockchain development. Includes mock Hiero SDK client, test fixtures, custom Jest/Vitest matchers, and MSW handlers for Mirror Node API.

## Features

- **MockHieroClient** - In-memory Hiero SDK client for unit testing
- **TestKit** - All-in-one testing helper with fixtures & lifecycle management
- **Custom Matchers** - Jest/Vitest matchers for Hbar, EntityId, Status, Transactions
- **Mirror Fixtures** - Test data factories for Mirror Node API responses
- **SDK Fixtures** - Test helpers for mock SDK client
- **MSW Handlers** - Mock Service Worker handlers for Mirror Node API

## Installation

```bash
# bun
bun add @hieco/testing @hiero-ledger/sdk msw
```

**Peer Dependencies:**

- `@hiero-ledger/sdk` - Required (optional: `true`)
- `msw` - Required (optional: `true`)

## Quick Start

### With MockHieroClient

```typescript
import { createTestKit } from "@hieco/testing/mock";

const testKit = createTestKit();

// Create account with initial balance
const account = testKit.client.accounts.create(Hbar.fromTinybars(1000));

// Query balance
const balance = testKit.client.accounts.getBalance(account.accountId);

// Transfer Hbar
testKit.client.accounts.transferBalance(fromAccountId, toAccountId, Hbar.fromTinybars(100));

// Reset all state (between tests)
testKit.reset();
```

### With TestKit Fixtures

```typescript
import { createTestKit } from "@hieco/testing/mock";

const testKit = createTestKit();

// Create SDK fixtures
const account = testKit.fixtures.account(); // 100 Hbar default
const token = testKit.fixtures.token({
  name: "My Token",
  symbol: "MTK",
  decimals: 8,
  initialSupply: 1_000_000,
  treasury: "0.0.1",
});
```

### Polling (eventual consistency)

```typescript
import { poll } from "@hieco/testing/utils";

const value = await poll(async (attempt) => {
  const result = await fetch("https://example.com/health");
  if (!result.ok) return { done: false };
  return { done: true, value: { attempt } };
});
```

### With Jest Matchers

```typescript
// In jest.config.js
setupFilesAfterEnv: ["@hieco/testing/jest"];

// In your tests
import { Hbar } from "@hiero-ledger/sdk";

test("Hbar balance", () => {
  const balance = Hbar.fromTinybars(1000);
  expect(balance).toBeHbar(100);
});

test("Entity ID", () => {
  const accountId = "0.0.123";
  expect(accountId).toBeAccountId(accountId);
  expect(accountId).toHaveShard(0);
});
```

### With Vitest Matchers

```typescript
// In vitest.config.ts
setupFiles: ["@hieco/testing/vitest"];

// Same matchers work in Vitest!
```

## Structure

```
src/
├── fixtures/          # Test data factories
│   ├── mirror/       # Mirror Node API fixtures
│   └── sdk/          # SDK mock fixtures
├── mock/             # Mock SDK client & utilities
│   ├── client.ts     # MockHieroClient
│   ├── testkit.ts    # TestKit helper
│   ├── stores/       # In-memory stores
│   ├── time/         # Time controller
│   └── snapshot/     # Snapshot management
├── matchers/         # Custom matchers (framework-agnostic)
│   ├── core/         # Core implementations
│   ├── jest/         # Jest adapter
│   └── vitest/       # Vitest adapter
├── server/           # MSW handlers for Mirror Node
├── jest/             # Jest setup
├── vitest/           # Vitest setup
└── types/            # Shared types
```

## API Reference

### MockHieroClient

```typescript
import { MockHieroClient } from "@hieco/testing/mock";

const client = new MockHieroClient();

// Account management
client.accounts.create(initialBalance: Hbar): AccountState
client.accounts.getBalance(accountId: EntityId): Hbar | undefined
client.accounts.setBalance(accountId: EntityId, balance: Hbar): boolean
client.accounts.transferBalance(from: EntityId, to: EntityId, amount: Hbar): { success: boolean }

// Token management
client.tokens.createToken(config: TokenCreationConfig): TokenState
client.tokens.associate(accountId: EntityId, tokenId: EntityId): boolean
client.tokens.getBalance(accountId: EntityId, tokenId: EntityId): bigint | undefined
client.tokens.transfer(from: EntityId, to: EntityId, tokenId: EntityId, amount: bigint): boolean

// Contract management
client.contracts.create(bytecode: string): ContractState
client.contracts.recordCall(contractId: EntityId, input: ContractCallInput): void
client.contracts.getCalls(contractId: EntityId): ContractCall[]

// Topic management
client.topics.create(memo: string): TopicState
client.topics.submitMessage(topicId: EntityId, message: TopicMessage): void

// Time control
client.setTime(timestamp: Date): void
client.freezeTime(at?: Date): void
client.unfreezeTime(): void
client.advanceTime(milliseconds: number): void

// Snapshot & reset
client.snapshot.capture(client: MockHieroClient): Snapshot
client.snapshot.restore(client: MockHieroClient, snapshot: Snapshot): void
client.reset(): void
```

### TestKit

```typescript
import { createTestKit } from "@hieco/testing/mock";

const testKit = createTestKit();

testKit.client; // MockHieroClient instance
testKit.fixtures; // Fixtures helper
testKit.snapshot(); // Capture snapshot
testKit.restore(); // Restore snapshot
testKit.reset(); // Reset all state
```

### SDK Fixtures

```typescript
import { createFixtures } from "@hieco/testing/fixtures/sdk";
import { MockHieroClient } from "@hieco/testing/mock";

const client = new MockHieroClient();
const fixtures = createFixtures(client);

// Account fixtures
fixtures.account(); // Single account with 100 Hbar
fixtures.account(Hbar.fromTinybars(1000)); // Custom balance
fixtures.accounts(5); // Create 5 accounts

// Token fixtures
fixtures.token({
  name: "My Token",
  symbol: "MTK",
  decimals: 8,
  initialSupply: 1_000_000n,
  treasury: "0.0.1",
});

// Contract fixtures
fixtures.contract({ bytecode: "0x..." });

// Topic fixtures
fixtures.topic({ memo: "My topic" });
```

### Mirror Node Fixtures

```typescript
import { mockAccount, mockTransaction, mockToken } from "@hieco/testing/fixtures/mirror";

// Account fixtures
mockAccount({ account: "0.0.123" });
mockAccount.build({ account: "0.0.123", balance: 1000 });

// Transaction fixtures
mockTransaction({ transaction_id: "0.0.123@1234567890.000000001" });
mockTransaction.build({ result: "SUCCESS" });

// Token fixtures
mockToken({ token_id: "0.0.456", name: "Test Token", symbol: "TT" });
```

### Jest/Vitest Matchers

#### Hbar Matchers

```typescript
import { Hbar } from "@hiero-ledger/sdk";

expect(Hbar.fromTinybars(1000)).toBeHbar(1000);
expect(Hbar.fromTinybars(100)).toBeHbar("1");
expect(Hbar.fromTinybars(100)).toBeHbar(100n);
```

#### EntityId Matchers

```typescript
expect("0.0.123").toBeAccountId("0.0.123");
expect("0.0.123").toHaveShard(0);
expect("0.0.123").toHaveRealm(0);
expect("0.0.123").toHaveAccount(123);
expect("0.0.123").toBeEntityId("0.0.123");
```

#### Status Matchers

```typescript
expect(response).toHaveStatus("SUCCESS");
expect(response).toSucceed();
expect(response).toSucceedWith({ accountId: "0.0.123" });
expect(response).toBeValidTx();
```

#### Token Matchers

```typescript
expect(token).toHaveTokenBalance("0.0.456", 1000n);
expect(token).toBeToken({ name: "My Token", symbol: "MTK" });
expect(token).toBeAssociated("0.0.456");
```

### MSW Server Setup

```typescript
import { setupMirrorMock } from "@hieco/testing/server";

const { server, listen, resetHandlers, close } = setupMirrorMock({
  network: "testnet",
  onUnhandledRequest: "error",
});

beforeAll(() => listen());
afterEach(() => resetHandlers());
afterAll(() => close());

// Use in tests
server.use(
  http.get("/api/v1/accounts/0.0.123", () => {
    return HttpResponse.json(mockAccount({ account: "0.0.123" }));
  }),
);
```

## Notes

- Package manager: this repo uses `bun`.

## Examples

### Complete Test Example

```typescript
import { describe, test, expect, beforeEach, afterEach } from "@jest/globals";
import { Hbar } from "@hiero-ledger/sdk";
import { createTestKit } from "@hieco/testing/mock";
import "@hieco/testing/jest"; // Setup matchers

describe("Token Transfers", () => {
  let testKit: ReturnType<typeof createTestKit>;

  beforeEach(() => {
    testKit = createTestKit();
  });

  afterEach(() => {
    testKit.reset();
  });

  test("transfer Hbar between accounts", () => {
    const from = testKit.client.accounts.create(Hbar.fromTinybars(1000));
    const to = testKit.client.accounts.create(Hbar.fromTinybars(500));

    testKit.client.accounts.transferBalance(from.accountId, to.accountId, Hbar.fromTinybars(100));

    expect(testKit.client.accounts.getBalance(from.accountId)).toBeHbar(900);
    expect(testKit.client.accounts.getBalance(to.accountId)).toBeHbar(600);
  });

  test("associate and transfer tokens", () => {
    const account = testKit.client.accounts.create(Hbar.fromTinybars(1000));
    const tokenId = "0.0.456";

    testKit.client.tokens.createToken({
      name: "Test Token",
      symbol: "TT",
      decimals: 8,
      initialSupply: 1000n,
      treasury: "0.0.1",
    });

    testKit.client.tokens.associate(account.accountId, tokenId);
    expect(testKit.client.tokens.isAssociated(account.accountId, tokenId)).toBe(true);

    testKit.client.tokens.setBalance(account.accountId, tokenId, 500n);
    expect(testKit.client.tokens.getBalance(account.accountId, tokenId)).toBe(500n);
  });
});
```

### With Time Control

```typescript
import { createTestKit } from "@hieco/testing/mock";

test("time-based operations", () => {
  const testKit = createTestKit();

  // Freeze time for deterministic tests
  testKit.freezeTime(new Date("2024-01-01T00:00:00Z"));

  // Advance time
  testKit.advanceTime(1000); // 1 second
  testKit.advanceTime(60_000); // 1 minute

  // Unfreeze to use real time
  testKit.unfreezeTime();
});
```

### Snapshot Testing

```typescript
test("snapshot and restore", () => {
  const testKit = createTestKit();

  // Create some state
  testKit.client.accounts.create(Hbar.fromTinybars(1000));

  // Capture snapshot
  const snapshot = testKit.snapshot();

  // Modify state
  testKit.client.accounts.setBalance("0.0.1", Hbar.fromTinybars(0));

  // Restore snapshot
  testKit.restore(snapshot);

  expect(testKit.client.accounts.getBalance("0.0.1")).toBeHbar(1000);
});
```

## Peer Dependencies

This package requires `@hiero-ledger/sdk` and `msw` to be installed in your project:

```json
{
  "peerDependencies": {
    "@hiero-ledger/sdk": "^2.0.0",
    "msw": "^2.7.0"
  }
}
```

## License

MIT
