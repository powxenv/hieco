---
title: @hiero/testkit - Comprehensive Testing Library Proposal
description: A unique, high-impact testing infrastructure library for Hiero blockchain development
category: proposals
created: 2026-03-03
status: complete
tags: [hiero, testing, vitest, jest, mock, fixtures]
related:
  - ../02-bounty-research/hiero-deep-dive.md
  - ../03-proposals/hiero-dx-proposals.md
  - ../08-hiero-sdk-complete-research.md
---

# @hiero/testkit - Comprehensive Testing Library for Hiero

**Hackathon:** Hedera Hello Future Apex Hackathon 2026
**Bounty Pool:** $8,000 (Hiero Developer Tooling Track)
**Status:** Novel Proposal - Zero Overlap with Official Examples
**Timeline:** 5 weeks (February - March 2026)

---

## Executive Summary

**@hiero/testkit** is a comprehensive testing infrastructure library that solves the #1 undocumented pain point in Hiero development: **the complete absence of testing utilities, patterns, and mock implementations**.

### Why This Will Win

1. **Zero Competition** - No existing testing library exists for Hiero
2. **Solves Real Pain** - Addresses documented gaps in SDK research
3. **100% Novel** - Not in official examples, not in existing proposals
4. **High Adoption** - Every Hiero developer needs testing tools
5. **Production-Minded** - Follows hiero-enterprise-java patterns

---

## Problem Analysis: The Testing Gap in Hiero Ecosystem

### What the Deep Research Revealed

Exhaustive research using MCP tools, GitHub search, and deep web analysis uncovered these documented gaps:

> "No verified, reproducible community facts in the supplied evidence describe recommended VSCode launch configs, sourcemap configurations, or coverage tool specifics for Hiero/Hedera + Vitest/Jest"

> "No verified community guidance for Hedera-specific mocking libraries (MSW/testcontainers) or patterns"

> "No coverage integration best-practices with the Hiero SDK"

### Current Developer Experience (Broken)

Developers writing Hiero tests today face:

```typescript
// ❌ The "Old Way" - What developers currently do
import { Client, TransferTransaction, Hbar } from '@hiero-ledger/sdk';

describe('Transfer Tests', () => {
  let client: Client;
  let senderKey: PrivateKey;
  let recipientKey: PrivateKey;

  beforeAll(async () => {
    // Must start local node manually - 30+ seconds
    // Docker must be running
    // Port conflicts possible
    // Ledger state is non-deterministic
    client = Client.forPreviewnet();
    senderKey = PrivateKey.generate();
    recipientKey = PrivateKey.generate();
    // Must fund accounts from faucet - rate limited!
  });

  test('transfer HBAR', async () => {
    // Flaky if faucet fails
    // Slow (actual network call)
    // Tests interfere with each other
    const tx = await new TransferTransaction()
      .addHbarTransfer(sender, Hbar.fromTinybars(-100))
      .addHbarTransfer(recipient, Hbar.fromTinybars(100))
      .execute(client);

    const receipt = await tx.getReceipt(client);
    expect(receipt.status).toBe(Status.Success);
  });
});
```

**Problems:**
- Tests require actual network connection (slow, flaky)
- No way to mock SDK responses
- Shared ledger state causes cascading failures
- No test fixtures or helpers
- No custom matchers
- Tests take minutes instead of milliseconds

---

## What @hiero/testkit Provides

### Core Value Proposition

**@hiero/testkit** brings Hiero testing to parity with modern Web3 tooling (viem, wagmi, Hardhat) by providing:

| Feature | Description | Comparable To |
|---------|-------------|---------------|
| **Mock Client** | In-memory mock for unit tests | viem's `anvil` + `testClient` |
| **Test Fixtures** | Pre-configured accounts, tokens, contracts | Hardhat's `hardhat-network-helpers` |
| **Custom Matchers** | Jest/Vitest matchers for Hiero types | `@nomicfoundation/hardhat-viem-assertions` |
| **State Snapshots** | Ledger state management | Foundry's `vm.snapshot` |
| **Network Spinup** | Programmatic local node control | Hardhat's `node` object |
| **Coverage Config** | Ready-to-use instrumentation | nyc/istanbul presets |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         @hiero/testkit                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Core Testing Layer                        │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │   │
│  │  │ MockHiero    │  │ TestFixtures │  │  Matchers    │      │   │
│  │  │   Client     │  │              │  │              │      │   │
│  │  │              │  │ • Accounts   │  │ • toHaveStatus│      │   │
│  │  │ • Mock tx    │  │ • Tokens     │  │ • toHaveBalance│      │   │
│  │  │ • Mock query │  │ • Contracts  │  │ • toHaveEmitted│      │   │
│  │  │ • Freeze time│  │ • Topics     │  │ • toBeValidTx │      │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                 Test Runner Integration                      │   │
│  │                                                              │   │
│  │  ┌─────────────────────────┐  ┌─────────────────────────┐   │   │
│  │  │      Vitest Plugin      │  │       Jest Plugin        │   │   │
│  │  │                         │  │                         │   │   │
│  │  │ • setupFiles            │  │ • setupFilesAfterEnv   │   │   │
│  │  │ • global fixtures       │  │ • globalSetup          │   │   │
│  │  │ • workspace support    │  │ • transform            │   │   │
│  │  └─────────────────────────┘  └─────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    Developer Tools                           │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │   │
│  │  │ VSCode       │  │ Coverage     │  │ CLI          │      │   │
│  │  │ Debug Config │  │ Presets      │  │              │      │   │
│  │  │              │  │              │  │ • init       │      │   │
│  │  │ • launch.json│  │ • nyc        │  │ • generate   │      │   │
│  │  │ • extensions │  │ • vitest     │  │ • validate   │      │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## API Design

### 1. Mock Client - Unit Testing Without Network

```typescript
import { mockClient } from '@hiero/testkit/vitest';
// or
import { mockClient } from '@hiero/testkit/jest';

describe('TransferService', () => {
  const mock = mockClient();

  beforeEach(() => {
    mock.reset();
  });

  it('should transfer HBAR', async () => {
    // Arrange: Set up mock state
    mock.accounts.set({
      '0.0.1001': { balance: Hbar.from(1000) },
      '0.0.1002': { balance: Hbar.from(0) }
    });

    // Act: Execute transaction against mock
    const service = new TransferService(mock.client);
    await service.transfer('0.0.1001', '0.0.1002', Hbar.from(100));

    // Assert: Verify state changes
    expect(mock.accounts.get('0.0.1001').balance).toBeHbar('899.99...');
    expect(mock.accounts.get('0.0.1002').balance).toBeHbar('100');

    // Verify transaction was submitted
    expect(mock.client.execute).toHaveBeenCalledWith(
      expect.any(TransferTransaction)
    );
  });

  it('should fail with insufficient balance', async () => {
    mock.accounts.set({
      '0.0.1001': { balance: Hbar.from(10) } // Not enough
    });

    const service = new TransferService(mock.client);

    await expect(
      service.transfer('0.0.1001', '0.0.1002', Hbar.from(100))
    ).rejects.toThrowHieroError('INSUFFICIENT_PAYER_BALANCE');
  });
});
```

### 2. Test Fixtures - Pre-configured Test State

```typescript
import { fixtures, useAccount, useToken } from '@hiero/testkit/vitest';

describe('Token Transfer', () => {
  // Use pre-funded test accounts
  const [sender, recipient] = fixtures.accounts(2);

  // Use pre-configured token
  const token = fixtures.token({
    name: 'Test Token',
    symbol: 'TST',
    decimals: 8,
    initialSupply: 1_000_000,
    treasury: sender.accountId
  });

  beforeEach(async () => {
    await fixtures.deploy(mock.client);
  });

  it('should transfer tokens', async () => {
    await token.transfer(recipient.accountId, 100);

    expect(await token.balanceOf(sender.accountId)).toBe(999_900n);
    expect(await token.balanceOf(recipient.accountId)).toBe(100n);
  });
});
```

### 3. Custom Matchers - Type-Safe Assertions

```typescript
import { describe, it, expect } from '@hiero/testkit/vitest';

// Custom matchers for Hiero types
describe('Custom Matchers', () => {
  it('should match Hbar amounts', () => {
    const balance = Hbar.fromTinybars(100_000_000);

    expect(balance).toBeHbar('1 ℏ');
    expect(balance).toBeHbar(1);
    expect(balance).toBeHbar(Hbar.from(1));
  });

  it('should match account IDs', () => {
    const accountId = AccountId.fromString('0.0.1234');

    expect(accountId).toBeAccountId('0.0.1234');
    expect(accountId).toHaveShard(0);
    expect(accountId).toHaveRealm(0);
    expect(accountId).toHaveAccount(1234);
  });

  it('should match transaction status', () => {
    const receipt = { status: Status.Success };

    expect(receipt).toHaveStatus('SUCCESS');
    expect(receipt).toSucceed();
  });

  it('should match transaction receipts', () => {
    const receipt = {
      status: Status.Success,
      accountId: AccountId.fromString('0.0.1234'),
      tokenId: TokenId.fromString('0.0.5678')
    };

    expect(receipt).toSucceedWith({
      accountId: '0.0.1234',
      tokenId: '0.0.5678'
    });
  });

  it('should validate errors', () => {
    const error = new HederaTransactionError(
      'INSUFFICIENT_PAYER_BALANCE',
      'account 0.0.1001 has insufficient balance'
    );

    expect(error).toBeHieroError('INSUFFICIENT_PAYER_BALANCE');
    expect(error).toHaveErrorCode(12);
  });

  it('should match token info', () => {
    const tokenInfo = {
      tokenId: TokenId.fromString('0.0.1000'),
      name: 'Test Token',
      symbol: 'TST',
      decimals: 8,
      totalSupply: 1_000_000n
    };

    expect(tokenInfo).toBeToken({
      name: 'Test Token',
      symbol: 'TST',
      decimals: 8
    });
  });
});
```

### 4. State Snapshots - Deterministic Test Isolation

```typescript
import { createTestKit } from '@hiero/testkit';

describe('State Snapshots', () => {
  const kit = createTestKit();

  it('test 1 - creates account', async () => {
    const account = await kit.createAccount();
    expect(kit.accounts.has(account.accountId)).toBe(true);
  });

  it('test 2 - isolated from test 1', async () => {
    // Each test gets fresh state
    expect(kit.accounts.count()).toBe(0);

    const account = await kit.createAccount();
    expect(kit.accounts.count()).toBe(1);
  });

  it('test 3 - can snapshot and restore', async () => {
    // Create some state
    await kit.createAccount();
    await kit.createToken();

    const snapshot = await kit.snapshot();

    // Modify state
    await kit.createAccount();
    expect(kit.accounts.count()).toBe(3);

    // Restore to snapshot
    await kit.restore(snapshot);
    expect(kit.accounts.count()).toBe(2);
  });
});
```

### 5. Network Control - Programmatic Local Node

```typescript
import { TestNetwork } from '@hiero/testkit';

describe('Integration Tests', () => {
  let network: TestNetwork;

  beforeAll(async () => {
    network = await TestNetwork.start({
      accounts: 10,
      ports: { consensus: 50211, mirror: 5600 },
      features: ['auto-faucet', 'fast-consensus']
    });
  });

  afterAll(async () => {
    await network.stop();
  });

  it('should connect to local network', async () => {
    const client = network.client;
    const account = network.accounts[0];

    const balance = await new AccountBalanceQuery()
      .setAccountId(account.accountId)
      .execute(client);

    expect(balance.hbars.toBigNumber().toNumber()).toBeGreaterThan(0);
  });

  it('should reset network between tests', async () => {
    await network.reset();

    // All accounts deleted, ledger cleared
    expect(network.accounts).toHaveLength(0);
  });
});
```

### 6. Coverage Integration - Ready-to-Use Configs

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { hieroTestkit } from '@hiero/testkit/vitest/plugin';

export default defineConfig({
  plugins: [hieroTestkit()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      // Pre-configured exclusions for test files
      exclude: [...hieroTestkit.defaultCoverageExcludes]
    }
  }
});
```

### 7. VSCode Debug Configuration

```json
// .vscode/launch.json - Generated by @hiero/testkit init
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Current Hiero Test",
      "program": "${workspaceFolder}/node_modules/.bin/vitest",
      "args": ["run", "${relativeFile}"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "smartStep": true,
      "skipFiles": ["<node_internals>/**", "**/node_modules/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug All Hiero Tests",
      "program": "${workspaceFolder}/node_modules/.bin/vitest",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

---

## Implementation Roadmap

### Phase 1: Core Mock Client (Days 1-7)

**Deliverables:**
- `MockClient` class implementing `Client` interface
- Mock transaction execution (no network calls)
- Mock query responses
- In-memory state tracking
- Time freezing utilities

**API:**
```typescript
class MockClient implements Client {
  // Mock state
  readonly accounts: MockAccountStore;
  readonly tokens: MockTokenStore;
  readonly contracts: MockContractStore;
  readonly topics: MockTopicStore;

  // Time control
  setTime(timestamp: Date): void;
  freezeTime(): void;
  advanceTime(duration: Duration): void;

  // Spying
  readonly execute: jest.Mock<Function>;
  readonly setOperator: jest.Mock<Function>;
}
```

### Phase 2: Test Fixtures (Days 8-12)

**Deliverables:**
- Pre-configured test accounts
- Token creation helpers
- Contract deployment helpers
- Topic creation helpers
- Fixture reset utilities

**API:**
```typescript
const fixtures = {
  accounts: (count: number) => TestAccount[],
  account: (config?: AccountConfig) => TestAccount,
  token: (config: TokenConfig) => TokenFixture,
  contract: (bytecode: string, abi: Abi) => ContractFixture,
  topic: (config?: TopicConfig) => TopicFixture,
  deploy: (client: Client) => Promise<void>
};
```

### Phase 3: Custom Matchers (Days 13-16)

**Deliverables:**
- Jest custom matchers
- Vitest custom matchers
- TypeScript type narrowing
- Pretty error messages

**Matchers:**
- `toBeHbar(amount)`
- `toBeAccountId(id)`
- `toHaveStatus(status)`
- `toSucceed()`
- `toFailWith(error)`
- `toBeHieroError(code)`
- `toHaveEmitted(event)`
- `toHaveTokenBalance(balance)`
- `toBeValidTx()`

### Phase 4: State Snapshots (Days 17-20)

**Deliverables:**
- Snapshot creation
- Snapshot restoration
- Automatic per-test isolation
- Manual snapshot management

**API:**
```typescript
interface TestKit {
  snapshot(): Promise<Snapshot>;
  restore(snapshot: Snapshot): Promise<void>;
  reset(): Promise<void>;
}
```

### Phase 5: Network Control (Days 21-24)

**Deliverables:**
- Local node lifecycle management
- Docker integration
- Port management
- Health checks
- Automatic reset between tests

**API:**
```typescript
class TestNetwork {
  static start(options?: NetworkOptions): Promise<TestNetwork>;
  stop(): Promise<void>;
  reset(): Promise<void>;

  readonly client: Client;
  readonly accounts: TestAccount[];
  readonly ports: NetworkPorts;
}
```

### Phase 6: Developer Tools (Days 25-28)

**Deliverables:**
- CLI tool (`hiero-testkit init`)
- VSCode configurations
- Coverage presets
- Example test suite

**CLI:**
```bash
npx @hiero/testkit init
npx @hiero/testkit generate:mock <contract>
npx @hiero/testkit validate
```

### Phase 7: Documentation & Examples (Days 29-35)

**Deliverables:**
- README with quickstart
- API reference
- Example test suites
- Migration guide (from raw SDK tests)
- Contribution guidelines

---

## Unique Selling Points

### 1. Zero Network Dependency for Unit Tests

```typescript
// Before: 30+ seconds per test (network)
// After: <10ms per test (in-memory)

it('transfers HBAR', async () => {
  const mock = mockClient();
  // ... test runs in milliseconds
});
```

### 2. Deterministic Test Outcomes

No more flaky tests due to:
- Faucet rate limits
- Network delays
- Shared ledger state
- Port conflicts
- Docker issues

### 3. Type-Safe Mocking

```typescript
// TypeScript knows the exact types
const mock = mockClient();
mock.execute.mockResolvedValueOnce({
  status: Status.Success,
  accountId: AccountId.fromString('0.0.1234')
  // Fully typed!
});
```

### 4. IDE Integration

- VSCode debug configurations included
- Auto-completion for matchers
- Quick fixes for common issues
- Test file templates

### 5. Works with Existing Tests

Drop-in replacement for real `Client`:

```typescript
// Before
const client = Client.forTestnet();

// After (in tests only)
const client = mockClient().client;

// All existing code works unchanged
const tx = await new TransferTransaction()
  .addHbarTransfer(sender, Hbar.from(100))
  .execute(client);
```

---

## Competitive Analysis

| Feature | @hiero/testkit | viem (Ethereum) | Hardhat | Current Hiero |
|---------|----------------|-----------------|---------|---------------|
| Mock Client | ✅ | ✅ | ✅ | ❌ |
| Custom Matchers | ✅ | ✅ | ✅ | ❌ |
| Test Fixtures | ✅ | ⚠️ Community | ✅ | ❌ |
| State Snapshots | ✅ | ✅ | ✅ | ❌ |
| Network Control | ✅ | ⚠️ Anvil separate | ✅ | ⚠️ Manual only |
| VSCode Config | ✅ | ❌ Manual | ⚠️ Community | ❌ |
| TypeScript First | ✅ | ✅ | ⚠️ | ✅ |
| Hiero Specific | ✅ | ❌ | ❌ | N/A |

---

## Success Metrics

### For Hackathon Judging

**Code Quality (30%)**
- ✅ TypeScript strict mode
- ✅ 90%+ test coverage (ironically, testing library must be well-tested)
- ✅ Zero ESLint warnings
- ✅ Full type safety

**Documentation (25%)**
- ✅ README with <5 min quickstart
- ✅ API reference with examples
- ✅ JSDoc on all exports
- ✅ 3+ complete example suites

**Developer Experience (25%)**
- ✅ One-line setup (`npm install @hiero/testkit`)
- ✅ Drop-in replacement pattern
- ✅ Helpful error messages
- ✅ Works with Vitest AND Jest

**Innovation (20%)**
- ✅ First testing library for Hiero
- ✅ Solves documented ecosystem gaps
- ✅ Brings Hiero to parity with Ethereum tooling
- ✅ Enables TDD workflows

### Post-Hackathon Adoption Targets

**3 Months:**
- 100+ GitHub stars
- 500+ weekly downloads
- 10+ projects using it
- Mentioned in official docs

**6 Months:**
- 500+ GitHub stars
- 2,000+ weekly downloads
- 50+ projects using it
- Standard for Hiero testing

---

## Submission Checklist

- [ ] Public GitHub repository with Apache 2.0 license
- [ ] Clean library API with intuitive interfaces
- [ ] Unit tests for all modules (>90% coverage)
- [ ] Integration tests with real Hiero SDK
- [ ] CI/CD (GitHub Actions)
- [ ] README with installation and quickstart
- [ ] Contributing guidelines (CONTRIBUTING.md)
- [ ] API documentation (TypeDoc)
- [ ] Example test suites (3+ scenarios)
- [ ] VSCode configuration templates
- [ ] Coverage presets (v8, nyc)
- [ ] CLI tool (`init` command)
- [ ] Vitest plugin
- [ ] Jest plugin
- [ ] Demo video showing before/after comparison

---

## Demo Strategy

### Live Demo: "The Same Test, Two Ways"

**Part 1: The Old Way (2 minutes)**
1. Start local node manually (Docker, wait...)
2. Write test that hits actual network
3. Show flakiness (fauce timeout, network delay)
4. Show 30+ second execution time

**Part 2: The New Way (1 minute)**
1. Install @hiero/testkit
2. Write same test with mock client
3. Show <10ms execution time
4. Run 100 tests in <1 second

**Part 3: Feature Tour (2 minutes)**
1. Custom matchers showing readable assertions
2. State snapshots showing test isolation
3. Network control for integration tests
4. VSCode debugging in action

**Total Time: 5 minutes of impact**

---

## Why This Beats Other Proposals

| Criteria | @hiero/testkit | Mirror Client | Scheduled Tx | React Hooks |
|----------|----------------|---------------|--------------|-------------|
| **Official Example?** | ❌ No | ❌ Yes (duplicate) | ❌ Yes (duplicate) | ❌ Yes (duplicate) |
| **Existing Solutions?** | ❌ Zero | ⚠️ Old wrapper (2021) | ❌ Zero | ⚠️ Partial libs |
| **Pain Point Severity** | 🔥 Critical | 🟡 High | 🟡 Medium | 🟡 Medium |
| **Adoption Potential** | ✅ Every project | ✅ Most projects | ⚠️ Niche | ✅ Frontend only |
| **Implementation Complexity** | Medium | Medium | Medium | Medium |
| **Differentiation** | ✅ Clear | ⚠️ Feature parity | ⚠️ Feature parity | ⚠️ Feature parity |

---

## Conclusion

**@hiero/testkit** is the right choice because:

1. **Solves the #1 Undocumented Pain Point** - No testing tools exist
2. **Zero Overlap** - Not in official examples, not in existing proposals
3. **Universal Appeal** - Every Hiero developer needs testing
4. **Clear Value Prop** - 1000x faster tests, deterministic outcomes
5. **Ecosystem Parity** - Brings Hiero to parity with Ethereum tooling

The library is achievable within the hackathon timeline, has a clear adoption path, and will genuinely improve the developer experience for the entire Hiero ecosystem.

---

*Proposal compiled from extensive research including:*
- *GitHub code search for existing patterns*
- *Deep research on testing pain points*
- *Analysis of modern Web3 testing frameworks (viem, wagmi, Hardhat)*
- *Review of official Hiero SDK and tooling*
- *Study of hiero-enterprise-java reference implementation*

_Last Updated: March 3, 2026_
