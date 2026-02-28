---
title: @hieco/testing - Product Requirements Document
description: Comprehensive testing utilities and mock server for Hiero/Hedera development
category: proposals
created: 2026-02-25
status: complete
tags: [hieco, testing, prd, msw, vitest, developer-experience]
related:
  - ./README.md
  - ../../02-bounty-research/hiero-deep-dive.md
  - ../../03-proposals/hieco-unified-ecosystem.md
---

# @hieco/testing - Product Requirements Document

**Version:** 1.0
**Status:** Research Complete
**Estimated Effort:** 6-8 days
**Target Release:** Q1 2026

---

## 1. Executive Summary

`@hieco/testing` is a comprehensive testing utility library for Hiero/Hedera development. It provides mock Mirror Node servers, test fixtures, React testing utilities, and seamless integration with modern testing frameworks (Vitest, Bun Test).

### Problem Statement

Developers building Hiero applications face these testing challenges:

1. **Slow testnet reliance** - Tests against public testnet are slow (2-5s per transaction), rate-limited, and non-deterministic
2. **No mocking standard** - Every team builds their own Mirror Node mocks, resulting in duplicated effort
3. **Flaky async tests** - React Query hooks, WebSocket subscriptions, and transaction receipts cause timing issues
4. **Complex setup** - Testing against local Solo/Hiero nodes requires 16GB+ RAM and 5+ minute startup time
5. **No test data fixtures** - Generating realistic account IDs, transactions, and token data is manual

### Solution

A unified testing library that:

- Mocks Mirror Node REST API with type-safe handlers
- Provides pre-built test fixtures for common entities
- Includes React testing utilities with proper wrappers
- Integrates seamlessly with Vitest and Bun Test
- Offers zero-config setup with sensible defaults

---

## 2. Goals & Success Metrics

### Primary Goals

1. **Reduce test suite runtime by 90%** - Mocked tests should run in milliseconds, not seconds
2. **Eliminate testnet dependency** - 95% of tests should run without network calls
3. **Standardize test fixtures** - One source of truth for mock data
4. **Provide React utilities** - Drop-in wrappers for hooks testing

### Success Metrics

| Metric                 | Target           | Measurement                |
| ---------------------- | ---------------- | -------------------------- |
| Test runtime           | < 100ms per test | Benchmark suite            |
| Setup time             | < 5 minutes      | Time to first passing test |
| Documentation coverage | 100%             | All exports documented     |
| Type coverage          | 100%             | Strict TypeScript          |
| Adoption               | 10+ projects     | GitHub dependents          |

### Non-Goals

- Running actual Hiero nodes (use Solo/hiero-local-node)
- E2E testing framework (use Playwright/Cypress)
- Smart contract testing (use Hardhat/Foundry)
- Performance benchmarking (separate tool)

---

## 3. Core Features

### 3.1 Mock Mirror Node Server

**Capability:** Mock all Mirror Node REST API endpoints using MSW

```typescript
import { setupMirrorMock, http } from "@hieco/testing/vitest";

// Quick setup with defaults
const { server, cleanup } = setupMirrorMock();

// Custom handlers
const { server } = setupMirrorMock({
  network: "testnet",
  handlers: {
    accounts: {
      "0.0.1234": {
        balance: 100000000000, // in tinybars
        account: "0.0.1234",
        expiry_timestamp: 1234567890,
      },
    },
    transactions: (req) => {
      // Dynamic handler based on request
      return HttpResponse.json({ transactions: [] });
    },
  },
});

// After tests
cleanup();
```

**Mocked Endpoints:**

| Endpoint                           | Methods | Notes                  |
| ---------------------------------- | ------- | ---------------------- |
| `/api/v1/accounts`                 | GET     | List with pagination   |
| `/api/v1/accounts/{id}`            | GET     | Single account details |
| `/api/v1/accounts/{id}/allowances` | GET     | Token allowances       |
| `/api/v1/balances`                 | GET     | Account balances       |
| `/api/v1/transactions`             | GET     | List with filters      |
| `/api/v1/transactions/{id}`        | GET     | Transaction details    |
| `/api/v1/tokens`                   | GET     | Token list             |
| `/api/v1/tokens/{id}`              | GET     | Token details          |
| `/api/v1/tokens/{id}/nfts`         | GET     | NFTs for token         |
| `/api/v1/topics`                   | GET     | Topic list             |
| `/api/v1/topics/{id}/messages`     | GET     | Topic messages         |
| `/api/v1/contracts`                | GET     | Contract list          |
| `/api/v1/contracts/{id}`           | GET     | Contract details       |
| `/api/v1/contracts/{id}/results`   | GET     | Contract results       |
| `/api/v1/blocks`                   | GET     | Block list             |
| `/api/v1/network`                  | GET     | Network info           |
| `/api/v1/schedules`                | GET     | Scheduled transactions |

### 3.2 Test Fixtures

**Capability:** Pre-built, realistic test data

```typescript
import {
  mockAccount,
  mockTransaction,
  mockToken,
  mockNFT,
  mockContract,
  mockTopic,
  mockBalance,
  mockBlock,
  mockSchedule,
} from "@hieco/testing/fixtures";

// Single entity
const account = mockAccount({
  accountId: "0.0.1234",
  balance: Hbar.from(1000),
});

// Multiple entities
const transactions = mockTransaction.list(10);

// Custom generator
const customToken = mockToken({
  name: "My Token",
  symbol: "MTK",
  decimals: 18,
  totalSupply: 1000000,
  type: "FUNGIBLE_COMMON",
});

// Relationship-aware fixtures
const tokenWithNFTs = mockToken.withNFTs(5);
```

**Fixture API:**

```typescript
namespace MockFixtures {
  // Account fixtures
  interface AccountOptions {
    accountId?: string
    balance?: Hbar | number
    alias?: string
    key?: Key
    expiryTimestamp?: number
  }
  function mockAccount(opts?: AccountOptions): MirrorAccount
  function mockAccount.list(count: number): MirrorAccount[]

  // Transaction fixtures
  interface TransactionOptions {
    transactionId?: string
    type?: TransactionType
    from?: string
    to?: string
    amount?: number
    timestamp?: Date
    status?: 'SUCCESS' | 'FAILED'
    fee?: Hbar
  }
  function mockTransaction(opts?: TransactionOptions): MirrorTransaction
  function mockTransaction.list(count: number, opts?: TransactionOptions): MirrorTransaction[]

  // Token fixtures
  interface TokenOptions {
    tokenId?: string
    name?: string
    symbol?: string
    decimals?: number
    totalSupply?: number
    type?: 'FUNGIBLE_COMMON' | 'FUNGIBLE_UNIQUE' | 'NON_FUNGIBLE_UNIQUE'
  }
  function mockToken(opts?: TokenOptions): MirrorToken
  function mockToken.withNFTs(count: number): MirrorToken

  // NFT fixtures
  interface NFTOptions {
    tokenId?: string
    serial?: number
    accountId?: string
    metadata?: string
  }
  function mockNFT(opts?: NFTOptions): MirrorNFT

  // Contract fixtures
  interface ContractOptions {
    contractId?: string
    bytecode?: string
    runtimeBytecode?: string
    adminKey?: string
    solidityId?: string
  }
  function mockContract(opts?: ContractOptions): MirrorContract

  // Topic fixtures
  interface TopicOptions {
    topicId?: string
    memo?: string
    runningHash?: string
    sequenceNumber?: number
    expiry?: number
  }
  function mockTopic(opts?: TopicOptions): MirrorTopic
  function mockTopic.withMessages(count: number): MirrorTopic

  // Balance fixtures
  interface BalanceOptions {
    accountId?: string
    hbar?: number
    tokens?: TokenBalance[]
  }
  function mockBalance(opts?: BalanceOptions): AccountBalance
}
```

### 3.3 React Testing Utilities

**Capability:** Pre-configured wrappers and utilities for testing React hooks

```typescript
import {
  renderHook,
  renderWithProviders,
  createTestQueryClient,
  waitForHieroQuery,
  waitForHieroMutation,
} from "@hieco/testing/react";

// Test a custom hook
test("useAccountBalance fetches balance", async () => {
  const { result } = renderHook(() => useAccountBalance("0.0.1234"));

  await waitForHieroQuery(() => {
    expect(result.current.balance).toEqual(Hbar.from(1000));
    expect(result.current.isLoading).toBe(false);
  });
});

// Test with custom QueryClient
const customClient = createTestQueryClient({
  queries: {
    retry: false,
    staleTime: 1000,
  },
});

const { result } = renderHook(() => useAccountBalance("0.0.1234"), {
  wrapper: createQueryWrapper(customClient),
});

// Test mutation hooks
test("useTransferHbar sends transaction", async () => {
  const { result } = renderHook(() => useTransferHbar());

  await act(async () => {
    await result.current.transfer("0.0.5678", 100);
  });

  await waitForHieroMutation(() => {
    expect(result.current.status).toBe("success");
  });
});
```

**Wrapper Components:**

```typescript
import {
  HieroTestProvider,
  MirrorTestProvider,
  QueryTestProvider,
  createTestWrapper
} from '@hieco/testing/react'

// Combine all providers
<HieroTestProvider config={{ network: 'testnet' }}>
  <MirrorTestProvider handlers={mockHandlers}>
    <QueryTestProvider>
      <App />
    </QueryTestProvider>
  </MirrorTestProvider>
</HieroTestProvider>

// Or use convenience wrapper
const wrapper = createTestWrapper({
  network: 'testnet',
  queryClient: customQueryClient,
  mirrorHandlers: mockHandlers
})
```

### 3.4 Assertion Helpers

**Capability:** Custom Jest/Vitest matchers for Hiero entities

```typescript
import { expect, test } from "vitest";
import "@hieco/testing/matchers"; // Extends expect

test("account has sufficient balance", () => {
  const account = mockAccount({ balance: 1000 });

  expect(account).toHaveHbarBalance(1000);
  expect(account).toHaveHbarBalance.greaterThan(500);
  expect(account).toBeValidAccountId();
});

test("transaction is successful", () => {
  const tx = mockTransaction({ status: "SUCCESS" });

  expect(tx).toBeSuccessfulTransaction();
  expect(tx).toHaveTransactionType("CRYPTOTRANSFER");
  expect(tx).toHaveFee.lessThan(Hbar.from(1));
});

test("token is fungible", () => {
  const token = mockToken({ type: "FUNGIBLE_COMMON" });

  expect(token).toBeFungibleToken();
  expect(token).toHaveDecimals(18);
  expect(token).toHaveTotalSupply(1000000);
});

test("NFT belongs to account", () => {
  const nft = mockNFT({ accountId: "0.0.1234" });

  expect(nft).toBelongToAccount("0.0.1234");
  expect(nft).toHaveMetadata.length.greaterThan(0);
});
```

**Available Matchers:**

| Matcher                       | Description                 |
| ----------------------------- | --------------------------- |
| `toHaveHbarBalance(amount)`   | Asserts HBAR balance        |
| `toBeValidAccountId()`        | Validates account ID format |
| `toBeSuccessfulTransaction()` | Asserts tx status = SUCCESS |
| `toHaveTransactionType(type)` | Asserts transaction type    |
| `toHaveFee(amount)`           | Asserts transaction fee     |
| `toBeFungibleToken()`         | Asserts token is fungible   |
| `toNonFungibleToken()`        | Asserts token is NFT        |
| `toHaveDecimals(n)`           | Asserts token decimals      |
| `toBelongToAccount(id)`       | Asserts NFT ownership       |
| `toHaveMetadata()`            | Asserts NFT has metadata    |
| `toHaveNonce(n)`              | Asserts account nonce       |

### 3.5 Timer & Network Utilities

**Capability:** Control time and simulate network delays

```typescript
import { advanceTime, freezeTime, restoreTime } from "@hieco/testing/time";
import { simulateNetworkDelay, setNetworkCondition } from "@hieco/testing/network";

// Time manipulation
test("scheduled transaction executes after delay", async () => {
  freezeTime(new Date("2026-01-01"));

  const tx = await createScheduledTransaction({ delay: 3600 });
  expect(tx.status).toBe("SCHEDULED");

  advanceTime({ seconds: 3600 });
  await waitFor(() => expect(tx.status).toBe("EXECUTED"));

  restoreTime();
});

// Network simulation
test("handles timeout", async () => {
  setNetworkCondition({ latency: 1000, failureRate: 0.5 });

  const { result } = renderHook(() => useAccountBalance("0.0.1234"));
  // May fail due to simulated network conditions
});

test("slow connection", async () => {
  simulateNetworkDelay(2000); // 2 second delay

  const start = Date.now();
  await client.getAccountBalance("0.0.1234");
  expect(Date.now() - start).toBeGreaterThanOrEqual(2000);
});
```

---

## 4. Technical Architecture

### 4.1 Package Structure

```
@hieco/testing/
├── package.json
├── src/
│   ├── index.ts                    # Main exports
│   ├── vitest/                     # Vitest-specific utilities
│   │   ├── index.ts
│   │   ├── setup.ts                # setupMirrorMock()
│   │   └── server.ts               # MSW server management
│   ├── bun/                        # Bun Test-specific utilities
│   │   ├── index.ts
│   │   └── setup.ts
│   ├── fixtures/                   # Test data fixtures
│   │   ├── index.ts
│   │   ├── account.ts
│   │   ├── transaction.ts
│   │   ├── token.ts
│   │   ├── nft.ts
│   │   ├── contract.ts
│   │   ├── topic.ts
│   │   ├── balance.ts
│   │   ├── block.ts
│   │   └── schedule.ts
│   ├── react/                      # React testing utilities
│   │   ├── index.ts
│   │   ├── providers.tsx           # Test provider components
│   │   ├── wrappers.ts             # Wrapper factories
│   │   ├── render-hook.ts          # Enhanced renderHook
│   │   └── wait-for.ts             # waitFor utilities
│   ├── matchers/                   # Custom jest-vitest matchers
│   │   ├── index.ts
│   │   ├── account.ts
│   │   ├── transaction.ts
│   │   └── token.ts
│   ├── time/                       # Time manipulation
│   │   ├── index.ts
│   │   └── timer.ts
│   ├── network/                    # Network simulation
│   │   ├── index.ts
│   │   └── delay.ts
│   └── types/                      # Shared types
│       ├── fixtures.ts
│       └── server.ts
├── __tests__/                      # Tests for the testing library
│   ├── fixtures.test.ts
│   ├── server.test.ts
│   └── react.test.ts
└── README.md
```

### 4.2 Dependencies

**Production Dependencies:**

```json
{
  "dependencies": {
    "msw": "^2.7.0",
    "@hieco/mirror": "workspace:*",
    "@hieco/mirror-shared": "workspace:*"
  },
  "peerDependencies": {
    "@tanstack/react-query": "^5.0.0",
    "react": ">=18",
    "vitest": ">=3.0.0"
  },
  "peerDependenciesMeta": {
    "vitest": {
      "optional": true
    },
    "react": {
      "optional": true
    }
  },
  "devDependencies": {
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.0",
    "happy-dom": "^15.11.6",
    "@tanstack/react-query": "^5.62.11"
  }
}
```

**Why These Dependencies:**

| Dependency                            | Purpose          | Rationale                                               |
| ------------------------------------- | ---------------- | ------------------------------------------------------- |
| `msw@^2.7.0`                          | Mock HTTP server | Network-level interception, works with any fetch client |
| `@testing-library/react@^16.1.0`      | React testing    | Industry standard, renderHook built-in                  |
| `@testing-library/user-event@^14.5.0` | User interaction | Realistic event simulation                              |
| `happy-dom@^15.11.6`                  | DOM environment  | 10-100x faster than jsdom, sufficient for tests         |
| `@tanstack/react-query@^5.62.11`      | Query testing    | React Query integration for hooks                       |

### 4.3 Module Exports

```typescript
// Main entry point
export * from "./fixtures";
export * from "./time";
export * from "./network";

// Vitest-specific
export { setupMirrorMock, cleanupMirrorMock } from "./vitest";
export type { MirrorMockOptions, MirrorMockServer } from "./vitest";

// Bun-specific
export { setupMirrorMock as setupMirrorMockBun } from "./bun";

// React utilities
export {
  renderWithProviders,
  createTestWrapper,
  createTestQueryClient,
  HieroTestProvider,
  MirrorTestProvider,
  QueryTestProvider,
} from "./react";

export { waitForHieroQuery, waitForHieroMutation } from "./react/wait-for";

// Matchers (auto-registers when imported)
export { registerHieroMatchers } from "./matchers";
export type { HieroMatchers } from "./matchers";
```

### 4.4 TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "__tests__"]
}
```

---

## 5. Usage Examples

### 5.1 Basic Setup

**vitest.config.ts:**

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/**/*.spec.{ts,tsx}"],
    },
  },
});
```

**src/test/setup.ts:**

```typescript
import { beforeAll, afterEach, afterAll } from "vitest";
import { cleanup } from "@testing-library/react";
import "@hieco/testing/matchers";
import { setupMirrorMock } from "@hieco/testing/vitest";

const { server } = setupMirrorMock({
  network: "testnet",
  onUnhandledRequest: "error", // Catch unexpected requests
});

beforeAll(() => server.listen());

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => server.close());
```

### 5.2 Testing Mirror Node API Client

```typescript
import { describe, it, expect } from "vitest";
import { MirrorNodeClient } from "@hieco/mirror";
import { mockAccount, mockTransaction } from "@hieco/testing/fixtures";

describe("MirrorNodeClient", () => {
  it("fetches account details", async () => {
    const client = new MirrorNodeClient("testnet");

    // Mock is already set up in setup.ts
    const account = await client.getAccount("0.0.1234");

    expect(account.account).toBe("0.0.1234");
    expect(account.balance.balance).toBeGreaterThan(0);
  });

  it("fetches transactions with pagination", async () => {
    const client = new MirrorNodeClient("testnet");

    const transactions = await client.getTransactions({
      accountId: "0.0.1234",
      limit: 10,
    });

    expect(transactions.data).toHaveLength(10);
    expect(transactions.data[0]).toHaveTransactionType("CRYPTOTRANSFER");
  });
});
```

### 5.3 Testing React Hooks

```typescript
import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAccountBalance, useTransactions } from "@hieco/mirror-react";
import { mockAccount, mockTransaction } from "@hieco/testing/fixtures";
import { createTestWrapper } from "@hieco/testing/react";

describe("useAccountBalance", () => {
  it("fetches and displays balance", async () => {
    const { result } = renderHook(() => useAccountBalance("0.0.1234"), {
      wrapper: createTestWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.balance).toBeDefined();
      expect(result.current.balance.toTinybars()).toBeGreaterThan(0n);
    });
  });

  it("handles errors gracefully", async () => {
    // Use one-time error handler
    server.use(
      http.get("/api/v1/accounts/0.0.9999", () => {
        return new HttpResponse(null, { status: 404 });
      }),
    );

    const { result } = renderHook(() => useAccountBalance("0.0.9999"), {
      wrapper: createTestWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });
});
```

### 5.4 Testing Mutations

```typescript
import { describe, it, expect } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useTransferHbar } from "@hieco/mirror-react";
import { createTestWrapper } from "@hieco/testing/react";

describe("useTransferHbar", () => {
  it("executes transfer successfully", async () => {
    const { result } = renderHook(() => useTransferHbar(), { wrapper: createTestWrapper() });

    expect(result.current.status).toBe("idle");

    await act(async () => {
      await result.current.transfer("0.0.5678", 100);
    });

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });
  });

  it("shows pending state during transfer", async () => {
    const { result } = renderHook(() => useTransferHbar(), {
      wrapper: createTestWrapper({ networkDelay: 1000 }),
    });

    act(() => {
      result.current.transfer("0.0.5678", 100);
    });

    expect(result.current.status).toBe("pending");

    await waitFor(() => {
      expect(result.current.status).toBe("success");
    });
  });
});
```

### 5.5 Testing Components

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AccountBalance } from './AccountBalance'
import { mockAccount } from '@hieco/testing/fixtures'
import { renderWithProviders } from '@hieco/testing/react'

describe('AccountBalance', () => {
  it('displays balance', async () => {
    renderWithProviders(<AccountBalance accountId="0.0.1234" />)

    await waitFor(() => {
      expect(screen.getByText(/ℏ/)).toBeInTheDocument()
    })
  })

  it('shows loading state initially', () => {
    const { container } = renderWithProviders(
      <AccountBalance accountId="0.0.1234" />
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('handles refresh button click', async () => {
    const user = userEvent.setup()
    const refetchSpy = vi.fn()

    renderWithProviders(
      <AccountBalance accountId="0.0.1234" onRefetch={refetchSpy} />
    )

    await user.click(screen.getByRole('button', { name: /refresh/i }))

    expect(refetchSpy).toHaveBeenCalledOnce()
  })
})
```

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Days 1-2)

**Tasks:**

- [ ] Initialize package structure
- [ ] Configure TypeScript, Vitest, ESLint
- [ ] Install dependencies (MSW, Testing Library)
- [ ] Create basic fixture generators (account, transaction)
- [ ] Set up MSW server utilities

**Deliverable:** Working package with basic fixtures

### Phase 2: Mock Server (Days 2-3)

**Tasks:**

- [ ] Implement all Mirror Node REST API handlers
- [ ] Create type-safe request/response handlers
- [ ] Add support for dynamic responses
- [ ] Implement pagination handling
- [ ] Add error simulation support

**Deliverable:** Fully mocked Mirror Node API

### Phase 3: Fixtures (Days 3-4)

**Tasks:**

- [ ] Complete all fixture generators
- [ ] Add relationship support (token → NFTs)
- [ ] Create factory pattern for custom data
- [ ] Add faker.js integration for realistic data

**Deliverable:** Complete fixture library

### Phase 4: React Utilities (Days 4-6)

**Tasks:**

- [ ] Implement test provider components
- [ ] Create wrapper factories
- [ ] Add waitFor utilities
- [ ] Implement renderHook enhancements
- [ ] Add QueryClient utilities

**Deliverable:** React testing utilities

### Phase 5: Matchers & Time (Days 6-7)

**Tasks:**

- [ ] Implement custom Vitest matchers
- [ ] Add time manipulation utilities
- [ ] Create network simulation utilities
- [ ] Add timer mocking integration

**Deliverable:** Assertion helpers and time utilities

### Phase 6: Documentation & Examples (Days 7-8)

**Tasks:**

- [ ] Write comprehensive README
- [ ] Create JSDoc comments for all exports
- [ ] Build 5+ example test files
- [ ] Add migration guide from manual mocking
- [ ] Create troubleshooting guide

**Deliverable:** Production-ready package

---

## 7. Testing Strategy

Since this is a testing library, we need to test the tests:

### Meta-Testing Approach

```typescript
// __tests__/fixtures.test.ts - Tests for the fixtures
describe("mockAccount", () => {
  it("generates valid account structure", () => {
    const account = mockAccount();

    expect(account).toMatchSchema(MirrorAccountSchema);
    expect(account.account).toMatch(/^0\.0\.\d+$/);
  });

  it("accepts custom options", () => {
    const account = mockAccount({
      accountId: "0.0.1234",
      balance: 1000,
    });

    expect(account.account).toBe("0.0.1234");
    expect(account.balance.balance).toBe(1000);
  });
});

// __tests__/server.test.ts - Tests for the mock server
describe("setupMirrorMock", () => {
  it("intercepts account requests", async () => {
    const { server } = setupMirrorMock();

    const response = await fetch("http://localhost/api/v1/accounts/0.0.1234");
    const data = await response.json();

    expect(data).toBeDefined();
    expect(data.account).toBe("0.0.1234");
  });
});
```

### Test Coverage Targets

| Module           | Target Coverage |
| ---------------- | --------------- |
| Fixtures         | 95%+            |
| Server utilities | 90%+            |
| React utilities  | 85%+            |
| Matchers         | 90%+            |
| Time/Network     | 85%+            |
| **Overall**      | **90%+**        |

---

## 8. Documentation Requirements

### 8.1 README Sections

```markdown
# @hieco/testing

## Quick Start

## Installation

## Setup

## Usage

- Mock Mirror Node API
- Test Fixtures
- React Testing
- Custom Matchers
- Time & Network

## API Reference

## Migration Guide

## Troubleshooting

## Contributing
```

### 8.2 API Documentation

Every export must have:

- JSDoc comment with description
- `@example` usage block
- `@see` cross-references
- Type parameters documented

````typescript
/**
 * Creates a mock account with realistic test data.
 *
 * @param options - Optional configuration for the mock account
 * @param options.accountId - The account ID (default: random "0.0.X" format)
 * @param options.balance - Initial balance in HBAR (default: 1000)
 * @returns A mock MirrorAccount object
 *
 * @example
 * ```ts
 * const account = mockAccount({
 *   accountId: '0.0.1234',
 *   balance: 5000
 * })
 * ```
 *
 * @see {@link mockTransaction} for related transaction fixtures
 */
export function mockAccount(options?: AccountOptions): MirrorAccount;
````

### 8.3 Example Tests

Create 5+ complete examples:

1. `examples/basic-hooks.test.ts` - Hook testing basics
2. `examples/mutations.test.ts` - Testing mutations
3. `examples/components.test.ts` - Component testing
4. `examples/error-handling.test.ts` - Error scenarios
5. `examples/advanced-mocking.test.ts` - Custom handlers

---

## 9. Open Questions & Decisions Needed

### Question 1: Faker.js Integration

**Issue:** Should we use faker.js for generating realistic data?

**Options:**

- A) Yes, use faker.js for names, addresses, etc.
- B) No, keep fixtures simple and deterministic
- C) Optional, allow faker.js as a peer dependency

**Recommendation:** Option C - Make faker.js optional for users who want realistic data

### Question 2: Solo Integration

**Issue:** Should we provide utilities for running Solo in tests?

**Options:**

- A) Yes, provide `setupSolo()` and `teardownSolo()`
- B) No, Solo setup is too complex, document it separately
- C) Provide a separate `@hieco/testing-solo` package

**Recommendation:** Option B - Document Solo setup but keep this package focused on mocking

### Question 3: Snapshot Testing

**Issue:** Should we include snapshot testing utilities?

**Options:**

- A) Yes, provide `toMatchSnapshot()` for fixtures
- B) No, snapshot tests are brittle
- C) Optional, export utility functions

**Recommendation:** Option C - Provide utilities but don't encourage snapshot testing

### Question 4: GraphQL Support

**Issue:** Mirror Node has GraphQL endpoints - should we mock them?

**Options:**

- A) Yes, include GraphQL mocking from day 1
- B) No, REST is sufficient for now
- C) Add in v2.0

**Recommendation:** Option B - REST covers 95% of use cases, defer GraphQL

---

## 10. Alternatives Considered

### Alternative 1: Nock instead of MSW

**Rejected because:**

- Nock only works in Node.js
- MSW works in browser tests too
- MSW intercepts at network level (more realistic)
- Nock struggles with ESM modules

### Alternative 2: Solo-only testing

**Rejected because:**

- Solo requires 16GB+ RAM
- 5+ minute startup time
- Complex Kubernetes setup
- Not suitable for CI/CD

### Alternative 3: No fixtures, use factories

**Rejected because:**

- Fixtures reduce boilerplate
- Common patterns are reusable
- Easier for newcomers
- Factories can be built on top

---

## 11. Future Enhancements (Post-v1.0)

1. **Visual test debugger** - UI for inspecting mock server state
2. **Request logging** - Track all intercepted requests
3. **Scenario recordings** - Record real API calls and replay
4. **Performance profiling** - Measure test runtime
5. **GraphQL mocking** - Support for GraphQL endpoints
6. **Playwright integration** - E2E testing utilities
7. **Fixture snapshots** - Save and load fixture states

---

## 12. Appendix

### A. Mirror Node API Reference

**Base URLs:**

- Mainnet: `https://mainnet.mirrornode.hedera.com/api/v1`
- Testnet: `https://testnet.mirrornode.hedera.com/api/v1`
- Previewnet: `https://previewnet.mirrornode.hedera.com/api/v1`

**Rate Limits:**

- Mainnet: 6 requests per second
- Testnet: 24 requests per second

### B. Account ID Format

Hiero account IDs follow the format `0.0.X` where X is a positive integer (shard.realm.num).

**Valid Examples:**

- `0.0.1000`
- `0.0.12345`
- `0.0.1`

**Invalid Examples:**

- `1.0.1000` (non-zero shard)
- `0.1.1000` (non-zero realm)
- `abc` (not numeric)

### C. Tinybars Conversion

1 HBAR = 100,000,000 tinybars

```typescript
const hbarToTinybars = (hbar: number): bigint => BigInt(hbar * 100_000_000);
const tinybarsToHbar = (tinybars: bigint): number => Number(tinybars) / 100_000_000;
```

---

**Document Version:** 1.0
**Last Updated:** 2026-02-25
**Author:** @pow
**Status:** Ready for Implementation
