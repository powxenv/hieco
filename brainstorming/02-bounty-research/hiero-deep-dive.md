# Hiero Bounty Deep-Dive Analysis: Ecosystem Mapping & Novel Opportunities

**Hackathon:** Hedera Hello Future Apex Hackathon 2026
**Bounty Pool:** $8,000
**Research Date:** February 22, 2026

---

## Executive Summary

This document provides an exhaustive analysis of the Hiero ecosystem to identify **genuine white spaces** and **novel opportunities** for developer tooling libraries. All research was conducted using multiple MCP servers (Model Context Protocol), GitHub code search, Context7 documentation retrieval, and Exa deep research.

### Key Findings

- **15 official SDKs/tools** exist across multiple languages
- **Significant gaps** remain in TypeScript/JavaScript developer experience
- **Zero existing** comprehensive utilities for scheduled transactions, Mirror Node clients, or testing frameworks
- **3 genuinely novel** library proposals identified with zero duplication risk

---

## Table of Contents

1. [Ecosystem Inventory](#ecosystem-inventory)
2. [Gap Analysis](#gap-analysis)
3. [Novel Project Proposals](#novel-project-proposals)
4. [Implementation Roadmaps](#implementation-roadmaps)

---

## Ecosystem Inventory

### Official Hiero SDKs

| SDK                | Language              | GitHub Stars | Status     | Last Updated |
| ------------------ | --------------------- | ------------ | ---------- | ------------ |
| `@hashgraph/sdk`   | JavaScript/TypeScript | Active       | Production | Feb 2026     |
| `hiero-sdk-java`   | Java                  | Active       | Production | Feb 2026     |
| `hiero-sdk-python` | Python                | Active       | Production | Oct 2024     |
| `hiero-sdk-go`     | Go                    | Active       | Production | Ongoing      |
| `hiero-sdk-rust`   | Rust                  | Active       | Production | Ongoing      |
| `hiero-sdk-swift`  | Swift                 | Active       | Production | Ongoing      |
| `hiero-sdk-cpp`    | C++                   | Active       | Production | Ongoing      |

**Source:** [Hiero SDKs Documentation](https://docs.hiero.org/sdks)

### Official Hiero Tools

| Tool                           | Purpose                               | Repository                                                                                            | Status     |
| ------------------------------ | ------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------- |
| **hiero-cli**                  | Command-line interface for developers | [hiero-ledger/hiero-cli](https://github.com/hiero-ledger/hiero-cli)                                   | Production |
| **hiero-local-node**           | Local test network deployment         | [hiero-ledger/hiero-local-node](https://github.com/hiero-ledger/hiero-local-node)                     | Production |
| **hiero-mirror-node**          | Archive node with REST API            | [hiero-ledger/hiero-mirror-node](https://github.com/hiero-ledger/hiero-mirror-node)                   | Production |
| **hiero-mirror-node-explorer** | Block explorer UI                     | [hiero-ledger/hiero-mirror-node-explorer](https://github.com/hiero-ledger/hiero-mirror-node-explorer) | Production |
| **hiero-json-rpc-relay**       | Ethereum JSON-RPC compatibility       | [hiero-ledger/hiero-json-rpc-relay](https://github.com/hiero-ledger/hiero-json-rpc-relay)             | Production |
| **hiero-sdk-tck**              | Technology Compatibility Kit          | [hiero-ledger/hiero-sdk-tck](https://github.com/hiero-ledger/hiero-sdk-tck)                           | Production |
| **solo**                       | Opinionated local network CLI         | [hiero-ledger/solo](https://github.com/hiero-ledger/solo)                                             | Production |
| **hiero-gradle-conventions**   | Gradle plugin conventions             | [hiero-ledger/hiero-gradle-conventions](https://github.com/hiero-ledger/hiero-gradle-conventions)     | Production |

### Decentralized Identity (DID) SDKs

| SDK                      | Language              | Repository                                                                                | Status                   |
| ------------------------ | --------------------- | ----------------------------------------------------------------------------------------- | ------------------------ |
| **hiero-did-sdk-js**     | TypeScript/JavaScript | [hiero-ledger/hiero-did-sdk-js](https://github.com/hiero-ledger/hiero-did-sdk-js)         | Active (20 contributors) |
| **hiero-did-sdk-python** | Python                | [hiero-ledger/hiero-did-sdk-python](https://github.com/hiero-ledger/hiero-did-sdk-python) | Active                   |

### Enterprise Integrations

| Project                   | Type                   | Framework                 | Repository                                                                                  | Status                       |
| ------------------------- | ---------------------- | ------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------- |
| **hiero-enterprise-java** | Enterprise Integration | Spring Boot, Microprofile | [OpenElements/hiero-enterprise-java](https://github.com/OpenElements/hiero-enterprise-java) | **Reference Implementation** |

**Key Features of hiero-enterprise-java:**

- Spring Boot auto-configuration with `@EnableHiero`
- Microprofile/Quarkus support
- Managed services: AccountClient, FileClient, TokenClient, NftClient, SmartContractClient
- Mirror Node repositories: AccountRepository, NetworkRepository, NftRepository, TransactionRepository
- Synchronous APIs with async support via `@Async`
- Configuration via `application.properties` or environment variables
- `.env` file support for local development

### Community Libraries

| Library                                     | Purpose                  | NPM          | Downloads      | Status              |
| ------------------------------------------- | ------------------------ | ------------ | -------------- | ------------------- |
| **@buidlerlabs/hashgraph-react-wallets**    | React wallet integration | ✅           | 77 weekly      | Active              |
| **@hashgraph/hedera-wallet-connect**        | WalletConnect protocol   | ✅           | 348 dependents | Active              |
| **@hashport/react-client**                  | Bridge integration       | ✅           | -              | Deprecated          |
| **hashconnect**                             | Legacy wallet connection | ✅           | 74 versions    | **Deprecated 2026** |
| **@hedera-name-service/hns-resolution-sdk** | HNS name resolution      | ✅           | 216 weekly     | Active              |
| **@ledgerhq/hw-app-hedera**                 | Ledger hardware wallet   | ✅           | 115 weekly     | Active              |
| **@polymathuniversata/echain-wallet**       | Multi-chain wallet       | ✅           | 18 weekly      | Active              |
| **ts-hedera-mirror-node-wrapper**           | Mirror Node REST wrapper | ❌ Community | -              | Legacy              |

**Note:** The `ts-hedera-mirror-node-wrapper` appears to be an older, unmaintained community project from 2021.

### Mirror Node API Endpoints

According to [Hedera Mirror Node REST API documentation](https://docs.hedera.com/hedera/docs/mirror-node-api/rest-api), the following endpoints are available:

**Account APIs:**

- `GET /api/v1/accounts/{id}` - Account information
- `GET /api/v1/accounts/{id}/allowances` - Account allowances

**Transaction APIs:**

- `GET /api/v1/transactions` - List transactions
- `GET /api/v1/transactions/{id}` - Transaction details

**Token APIs:**

- `GET /api/v1/tokens` - List tokens
- `GET /api/v1/tokens/{id}` - Token information
- `GET /api/v1/tokens/{id}/nfts` - NFTs for token
- `GET /api/v1/accounts/{id}/nfts` - NFTs for account

**Topic APIs:**

- `GET /api/v1/topics/{id}/messages` - Topic messages

**Network APIs:**

- `GET /api/v1/network/exchangerate` - Exchange rates
- `GET /api/v1/network/nodes` - Network nodes

**Schedule Transaction APIs:**

- `GET /api/v1/schedules/{id}` - Schedule information

### Developer Pain Points (from GitHub Issues)

**hiero-sdk-js Issues (identified from research):**

1. **TypeScript 5.9+ incompatibility** - Stricter type definitions causing errors (#3479)
2. **Insufficient JSDoc annotations** - Poor IDE autocomplete (#3760, #3759)
3. **Orphaned timers** - Improper resource cleanup complicating debugging (#3701)
4. **Complex query building** - No query builder pattern for complex Mirror Node queries
5. **Pagination not abstracted** - Manual cursor management required
6. **No retry logic** - Developers must implement their own retry/backoff
7. **No caching layer** - Every query hits the network
8. **Error handling inconsistency** - Different error types across SDK

**Mirror Node Operational Challenges:**

- Hardware costs exceed $500/month for personal instances
- Complex setup (Docker, database, RPC server)
- High-availability requires multiple instances
- Database management overhead

**React/Next.js Integration Gaps:**

- No official React hooks
- Wallet integration requires significant boilerplate
- No SSR-compatible patterns
- Transaction state management left to developers
- No standardized UI components

**Scheduled Transactions Pain Points:**

- Multi-party coordination complexity
- Cross-wallet incompatibility (different schedule ID formats)
- No template library for common patterns
- Status tracking requires manual polling
- Expiry management not automated
- No webhook support for status changes

---

## Gap Analysis

### White Space Identification Matrix

| Category                          | Existing Solutions                   | Quality           | Gap Severity | Opportunity Level |
| --------------------------------- | ------------------------------------ | ----------------- | ------------ | ----------------- |
| **TypeScript Mirror Node Client** | ts-hedera-mirror-node-wrapper (2021) | Low, unmaintained | **HIGH**     | **HIGH**          |
| **Scheduled Transaction Toolkit** | None                                 | N/A               | **HIGH**     | **HIGH**          |
| **React/Next.js Integration Kit** | Wallet libs only                     | Medium            | **MEDIUM**   | **HIGH**          |
| **Testing Framework**             | None                                 | N/A               | **MEDIUM**   | **MEDIUM**        |
| **CLI Plugins**                   | Official CLI exists                  | Good              | **LOW**      | **MEDIUM**        |
| **Enterprise Java Patterns**      | hiero-enterprise-java                | Excellent         | **LOW**      | **LOW**           |

### Detailed Gap Assessment

#### 1. TypeScript Mirror Node Client

**What Exists:**

- `ts-hedera-mirror-node-wrapper` from 2021 (3 years old, unmaintained)
- Direct REST API calls using `fetch` or `axios`
- Hiero SDK `Client` class with basic `setMirrorNetwork()` method

**What's Missing:**

- ❌ Strongly-typed query builders
- ❌ Automatic pagination with cursor management
- ❌ Retry logic with exponential backoff
- ❌ Response caching layer
- ❌ WebSocket support for real-time updates
- ❌ Query composition (chaining filters)
- ❌ Batch query support
- ❌ Type-safe response parsing

**Uniqueness Validation:**

- No active TypeScript/JavaScript Mirror Node client library on npm
- Existing wrapper is deprecated and lacks modern features
- Official SDK only provides low-level network configuration

---

#### 2. Scheduled Transaction Utilities

**What Exists:**

- Low-level `ScheduleCreateTransaction`, `ScheduleSignTransaction`, `ScheduleInfoQuery` in Hiero SDK
- Official CLI supports scheduled transactions but requires manual scripting
- Discussion (#731) about standardizing schedule transaction codes

**What's Missing:**

- ❌ Template library for common patterns (escrow, time-lock, multi-sig)
- ❌ Multi-party signature collection workflow
- ❌ Status tracking with webhook/callback support
- ❌ Expiry management and auto-cancellation
- ❌ Cross-wallet compatibility layer
- ❌ Visual transaction builder UI
- ❌ Test suite/mocking utilities

**Uniqueness Validation:**

- No utility library exists specifically for scheduled transactions
- No template library for common scheduled transaction patterns
- Zero abstraction layers for multi-party coordination

---

#### 3. React/Next.js Integration Kit

**What Exists:**

- `@buidlerlabs/hashgraph-react-wallets` (77 weekly downloads) - wallet connection only
- `@hashgraph/hedera-wallet-connect` - WalletConnect protocol, not React-specific
- Wallet libraries (HashPack, Blade, etc.) have their own React SDKs

**What's Missing:**

- ❌ Hooks for account balance with reactive updates
- ❌ Hooks for transaction submission with loading states
- ❌ Hooks for smart contract interaction (read/write)
- ❌ Hooks for scheduled transaction status
- ❌ SSR-compatible patterns (Next.js App Router)
- ❌ Error boundary components
- ❌ Transaction toast/notification components
- ❌ Formatters (HBAR, token amounts, timestamps)
- ❌ Wallet switcher component
- ❌ Network switcher (mainnet/testnet/previewnet)

**Uniqueness Validation:**

- No comprehensive React integration kit exists
- Existing libraries focus on wallet connection, not dApp development
- No official Hedera/Hiero React hooks

---

## Novel Project Proposals

### Proposal 1: `@hiero/mirror-client` - TypeScript Mirror Node Client

**Type:** Utility Library
**Language:** TypeScript
**Target Framework:** Vanilla JS, React, Node.js
**Uniqueness:** ✅ No equivalent library exists

#### Problem Statement

Developers must manually implement:

1. Pagination logic (cursor management, page limits)
2. Retry with exponential backoff for failed requests
3. Response caching to reduce Mirror Node load
4. Type-safe query building for complex filters
5. WebSocket connections for real-time updates

#### Solution Architecture

```typescript
// Core features
class HieroMirrorClient {
  // Automatic pagination
  async transactions.byAccount(accountId)
    .all(); // Fetches all pages automatically

  // Query builder with type safety
  const nfts = await client.nfts
    .byToken(tokenId)
    .withMetadata()
    .orderBy('timestamp', 'desc')
    .limit(100)
    .get();

  // Built-in caching (Redis or in-memory)
  const client = new HieroMirrorClient({
    endpoint: 'https://mainnet.mirrornode.hedera.com',
    cache: new RedisCache({ ttl: 60 }), // or new InMemoryCache()
    retry: { maxRetries: 3, backoff: 'exponential' }
  });

  // WebSocket support for real-time
  client.transactions.on('new', (tx) => {
    console.log('New transaction:', tx);
  });
}
```

#### Unique Selling Points

1. **Type-safe query builder** - Chainable methods with full TypeScript support
2. **Automatic pagination** - No manual cursor management
3. **Smart caching** - Configurable TTL, cache backends (Redis, in-memory)
4. **Retry logic** - Exponential backoff, max retries
5. **WebSocket client** - Real-time transaction/token updates
6. **Zero dependencies** (except optional Redis client)
7. **Compatible with existing SDK** - Works alongside `@hashgraph/sdk`

#### Implementation Phases

**Phase 1: Core REST Client (2-3 days)**

- Base HTTP client with fetch/Axios
- All REST endpoints with TypeScript types
- Basic error handling

**Phase 2: Query Builder (2-3 days)**

- Chainable query methods
- Type-safe filter composition
- Ordering, limiting, pagination

**Phase 3: Caching & Retry (1-2 days)**

- In-memory cache implementation
- Redis cache support (optional)
- Exponential backoff retry logic

**Phase 4: WebSocket Client (2-3 days)**

- WebSocket connection management
- Real-time event listeners
- Auto-reconnection logic

**Phase 5: Testing & Documentation (1-2 days)**

- Unit tests for all modules
- Integration tests with testnet Mirror Node
- README with examples
- JSDoc comments

#### Estimated Effort

- **Total:** 10-13 days for MVP
- **Core features:** 8-10 days
- **Polish & docs:** 2-3 days

---

### Proposal 2: `@hiero/scheduled` - Scheduled Transaction Toolkit

**Type:** Utility Library
**Language:** TypeScript
**Target Use Case:** Multi-party transactions, escrow, time-locks
**Uniqueness:** ✅ No equivalent library exists

#### Problem Statement

Scheduled transactions are powerful but complex:

1. Multi-party coordination requires manual signature collection
2. No standard templates for common patterns (escrow, time-lock, vesting)
3. Status tracking requires manual polling
4. Expiry management is manual
5. Cross-wallet incompatibility (HashPack, Blade, etc.)

#### Solution Architecture

```typescript
// Template system
const scheduledTx = new ScheduledTransactionBuilder()
    .type("MULTISIG_ESCROW")
    .participants(["0.0.11111", "0.0.22222", "0.0.33333"])
    .threshold(2) // 2 of 3 signatures required
    .transaction(tokenTransfer)
    .expiry(Duration.hours(24))
    .onStatusChange((status) => webhook.send(status))
    .build();

// Signature collection
await scheduledTx.addSignature(signature1);
await scheduledTx.addSignature(signature2);

// Auto-submit when threshold reached
await scheduledTx.executeWhenReady();

// Or manual execution
const status = await scheduledTx.getStatus();
if (status === "ready") {
    await scheduledTx.execute();
}
```

#### Unique Selling Points

1. **Template library** - Pre-built patterns for common use cases
    - Multi-sig escrow
    - Time-lock vault
    - Vesting schedule
    - Atomic swap
    - Cross-wallet trade

2. **Signature coordination** - Abstract multi-party signature collection
3. **Status tracking** - Polling or webhook-based status updates
4. **Expiry management** - Auto-cancellation, renewal reminders
5. **Cross-wallet compatibility** - Normalized schedule IDs across wallets

#### Template Examples

```typescript
// 1. Escrow Template
const escrow = EscrowTemplate.create({
    buyer: "0.0.11111",
    seller: "0.0.22222",
    arbitrator: "0.0.33333",
    amount: 100, // HBAR
    threshold: 2, // Any 2 of 3 can release funds
});

// 2. Time-Lock Template
const timelock = TimeLockTemplate.create({
    recipient: "0.0.11111",
    amount: 1000,
    releaseDate: new Date("2026-12-31"),
    creator: "0.0.22222",
});

// 3. Vesting Template
const vesting = VestingTemplate.create({
    beneficiary: "0.0.11111",
    totalAmount: 10000,
    schedule: [
        { date: "2026-03-01", percentage: 25 },
        { date: "2026-06-01", percentage: 25 },
        { date: "2026-09-01", percentage: 25 },
        { date: "2026-12-01", percentage: 25 },
    ],
});
```

#### Implementation Phases

**Phase 1: Core SDK Integration (2-3 days)**

- Wrap Hiero SDK scheduled transaction APIs
- Type-safe transaction builders
- Signature management

**Phase 2: Template Library (3-4 days)**

- Escrow template
- Time-lock template
- Vesting template
- Atomic swap template
- Extensible template system

**Phase 3: Status Tracking (2-3 days)**

- Polling-based status checker
- Webhook support for status changes
- Event emitter interface

**Phase 4: Multi-Party Coordination (2-3 days)**

- Signature collection workflow
- Threshold checking
- Execution triggering

**Phase 5: Testing & Examples (2-3 days)**

- Unit tests for templates
- Integration tests with testnet
- Example applications
- Documentation

#### Estimated Effort

- **Total:** 11-16 days for MVP
- **Core features:** 9-12 days
- **Templates & examples:** 2-4 days

---

### Proposal 3: `@hiero/react` - React/Next.js Integration Kit

**Type:** UI Framework Integration
**Language:** TypeScript
**Target Framework:** React 18+, Next.js 13+
**Uniqueness:** ✅ Comprehensive (no equivalent exists)

#### Problem Statement

React developers must manually implement:

1. Wallet connection and account management
2. Transaction submission with loading/error states
3. Smart contract read/write operations
4. Balance queries and reactive updates
5. Network switching (mainnet/testnet/previewnet)
6. Transaction receipt polling
7. Formatters for HBAR, tokens, timestamps

#### Solution Architecture

```typescript
// Hooks for common operations
function WalletDashboard() {
  const { connect, isConnected, account } = useWalletConnection();
  const { balance, loading } = useAccountBalance(account);
  const { transferHbar, status } = useTransferHbar();

  return (
    <div>
      <p>Balance: {loading ? '...' : formatHbar(balance)}</p>
      <button onClick={() => transferHbar('0.0.123', 100)}>
        Send 100 HBAR
      </button>
      {status === 'pending' && <Spinner />}
    </div>
  );
}

// Smart contract interaction
function TokenContract() {
  const { data: balance, refetch } = useContractRead({
    address: '0x1234...',
    abi: tokenAbi,
    method: 'balanceOf',
    args: [account]
  });

  const { write, loading } = useContractWrite({
    address: '0x1234...',
    abi: tokenAbi,
    method: 'transfer'
  });
}
```

#### Hook APIs

**Wallet Hooks:**

```typescript
useWalletConnection(options?) => {
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnected: boolean;
  account: AccountId | null;
  wallet: Wallet | null;
  error: Error | null;
}

useAccountBalance(accountId, options?) => {
  balance: Hbar | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

**Transaction Hooks:**

```typescript
useTransferHbar() => {
  transferHbar: (to: AccountId, amount: number) => Promise<TransactionResponse>;
  status: 'idle' | 'pending' | 'success' | 'error';
  error: Error | null;
  reset: () => void;
}

useTransferToken() => {
  transferToken: (tokenId: TokenId, to: AccountId, amount: number) => Promise<TransactionResponse>;
  status: 'idle' | 'pending' | 'success' | 'error';
  error: Error | null;
  reset: () => void;
}

useScheduleTransaction() => {
  create: (transaction: Transaction, scheduleInfo: ScheduleInfo) => Promise<ScheduleId>;
  sign: (scheduleId: ScheduleId) => Promise<void>;
  getStatus: (scheduleId: ScheduleId) => Promise<ScheduleInfo>;
  execute: (scheduleId: ScheduleId) => Promise<TransactionResponse>;
}
```

**Smart Contract Hooks:**

```typescript
useContractRead(config) => {
  data: any;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

useContractWrite(config) => {
  write: (args: any[]) => Promise<TransactionResponse>;
  loading: boolean;
  error: Error | null;
  reset: () => void;
}
```

**Utility Hooks:**

```typescript
useNetworkSwitch() => {
  network: 'mainnet' | 'testnet' | 'previewnet';
  switchNetwork: (network: Network) => Promise<void>;
}

useTransactionReceipt(transactionId) => {
  receipt: TransactionReceipt | null;
  status: 'pending' | 'success' | 'error';
  loading: boolean;
}
```

#### UI Components

```typescript
// Pre-built components
<WalletConnectButton />
<AccountBalance />
<TransactionButton />
<NetworkSwitcher />
<TransferForm />
<TokenTransferForm />
<ContractInteraction />
```

#### SSR Compatibility (Next.js App Router)

```typescript
// Server-side wallet connection detection
'use client';

import { useWalletConnection } from '@hiero/react/next';

function Page() {
  const { isConnected } = useWalletConnection();

  if (!isConnected) {
    return <ConnectWalletPrompt />;
  }
  return <Dashboard />;
}
```

#### Implementation Phases

**Phase 1: Core Hooks (3-4 days)**

- `useWalletConnection`
- `useAccountBalance`
- `useTransferHbar`
- `useTransferToken`

**Phase 2: Smart Contract Hooks (2-3 days)**

- `useContractRead`
- `useContractWrite`
- Contract abstraction layer

**Phase 3: Utility Hooks (1-2 days)**

- `useNetworkSwitch`
- `useTransactionReceipt`
- Formatters (HBAR, tokens, timestamps)

**Phase 4: UI Components (2-3 days)**

- Pre-built components with Tailwind CSS
- Accessible (ARIA labels)
- Themeable

**Phase 5: Next.js Integration (1-2 days)**

- SSR patterns
- App Router compatibility
- Example applications

**Phase 6: Testing & Docs (2-3 days)**

- Unit tests for hooks
- Integration tests
- Storybook for components
- Documentation site

#### Estimated Effort

- **Total:** 11-17 days for MVP
- **Core hooks:** 7-10 days
- **Components & docs:** 4-7 days

---

## Implementation Roadmaps

### Proposed Development Timeline (5-Week Hackathon)

#### Week 1: Foundation & Planning

- [ ] Set up project structure (monorepo with turborepo)
- [ ] Configure TypeScript, ESLint, Prettier
- [ ] Set up testing framework (Vitest)
- [ ] Create CI/CD pipeline (GitHub Actions)
- [ ] Write contribution guidelines (CONTRIBUTING.md)

#### Week 2-3: Core Implementation

**For Mirror Client:**

- [ ] REST client with all endpoints
- [ ] Query builder implementation
- [ ] Caching layer
- [ ] Basic retry logic

**For Scheduled Toolkit:**

- [ ] Core SDK integration
- [ ] Escrow template
- [ ] Status tracking system

**For React Kit:**

- [ ] useWalletConnection
- [ ] useAccountBalance
- [ ] useTransferHbar

#### Week 4: Advanced Features

**For Mirror Client:**

- [ ] WebSocket client
- [ ] Advanced query composition
- [ ] Batch query support

**For Scheduled Toolkit:**

- [ ] Additional templates (time-lock, vesting)
- [ ] Multi-party coordination
- [ ] Webhook support

**For React Kit:**

- [ ] Smart contract hooks
- [ ] UI components
- [ ] Next.js SSR patterns

#### Week 5: Polish & Documentation

- [ ] Comprehensive unit tests (>80% coverage)
- [ ] Integration tests with testnet
- [ ] Example applications
- [ ] Documentation site (VitePress)
- [ ] README with quickstart
- [ ] API reference (TypeDoc)

---

## Submission Checklist

### For Mirror Client (`@hiero/mirror-client`)

- [ ] Public GitHub repository with Apache 2.0 or MIT license
- [ ] TypeScript with strict mode enabled
- [ ] All REST endpoints implemented with full type safety
- [ ] Query builder with chainable methods
- [ ] Automatic pagination (cursor management)
- [ ] Retry logic with exponential backoff
- [ ] Caching layer (in-memory, Redis optional)
- [ ] WebSocket client for real-time updates
- [ ] Unit tests (Vitest or Jest)
- [ ] Integration tests with Hedera testnet Mirror Node
- [ ] README with installation and examples
- [ ] API documentation (TypeDoc or JSDoc)
- [ ] CI/CD (GitHub Actions)
- [ ] NPM package configured
- [ ] Compatible with `@hashgraph/sdk` (no conflicts)

### For Scheduled Toolkit (`@hiero/scheduled`)

- [ ] Public GitHub repository with Apache 2.0 or MIT license
- [ ] TypeScript with strict mode enabled
- [ ] Template library with 3+ templates
    - [ ] Multi-sig escrow
    - [ ] Time-lock vault
    - [ ] Vesting schedule
    - [ ] Atomic swap (bonus)
- [ ] Signature collection workflow
- [ ] Status tracking (polling or webhook)
- [ ] Expiry management
- [ ] Cross-wallet compatibility layer
- [ ] Unit tests for all templates
- [ ] Integration tests with testnet
- [ ] Example application for each template
- [ ] README with quickstart
- [ ] Documentation for custom templates
- [ ] CI/CD (GitHub Actions)
- [ ] NPM package configured

### For React Kit (`@hiero/react`)

- [ ] Public GitHub repository with Apache 2.0 or MIT license
- [ ] TypeScript with strict mode enabled
- [ ] React 18+ hooks (5+ hooks)
    - [ ] `useWalletConnection`
    - [ ] `useAccountBalance`
    - [ ] `useTransferHbar`
    - [ ] `useTransferToken`
    - [ ] `useContractRead`
    - [ ] `useContractWrite`
    - [ ] `useNetworkSwitch` (bonus)
- [ ] UI components (3+ components)
    - [ ] `<WalletConnectButton />`
    - [ ] `<AccountBalance />`
    - [ ] `<TransactionButton />`
- [ ] SSR-compatible (Next.js App Router)
- [ ] Unit tests (React Testing Library)
- [ ] Integration tests
- [ ] Storybook for components
- [ ] Example application (Next.js 13+)
- [ ] README with quickstart
- [ ] API documentation
- [ ] CI/CD (GitHub Actions)
- [ ] NPM package configured

---

## Competitive Analysis

### Mirror Client Landscape

| Library                             | Language | Maintenance | Pagination | Caching | TypeScript | WebSocket |
| ----------------------------------- | -------- | ----------- | ---------- | ------- | ---------- | --------- |
| **ts-hedera-mirror-node-wrapper**   | TS       | ⚠️ 2021     | ✅ Basic   | ❌ No   | ⚠️ Partial | ❌ No     |
| **@hiero/mirror-client** (proposed) | TS       | ✅ Active   | ✅ Auto    | ✅ Yes  | ✅ Full    | ✅ Yes    |

### Scheduled Transaction Landscape

| Library                         | Templates | Status Tracking | Multi-Party | TypeScript | Cross-Wallet |
| ------------------------------- | --------- | --------------- | ----------- | ---------- | ------------ |
| **None exist**                  | -         | -               | -           | -          | -            |
| **@hiero/scheduled** (proposed) | ✅ 4+     | ✅ Yes          | ✅ Yes      | ✅ Full    | ✅ Yes       |

### React Integration Landscape

| Library                                  | Hooks      | Components | SSR    | TypeScript | Downloads |
| ---------------------------------------- | ---------- | ---------- | ------ | ---------- | --------- |
| **@buidlerlabs/hashgraph-react-wallets** | ⚠️ 3 basic | ❌ No      | ❌ No  | ✅ Yes     | 77/wk     |
| **@hiero/react** (proposed)              | ✅ 7+      | ✅ 3+      | ✅ Yes | ✅ Full    | N/A       |

---

## Risk Assessment & Mitigation

### Technical Risks

| Risk                           | Probability | Impact | Mitigation                                       |
| ------------------------------ | ----------- | ------ | ------------------------------------------------ |
| **Hiero SDK breaking changes** | Medium      | High   | Use strict versioning, implement adapter pattern |
| **Mirror Node API changes**    | Low         | Medium | Abstract API layer, version checking             |
| **React 19 conflicts**         | Low         | Medium | Test with React 19 canary, use peer dependencies |
| **WebSocket stability**        | Medium      | Low    | Robust reconnection logic, fallback to polling   |

### Adoption Risks

| Risk                              | Probability | Impact | Mitigation                                               |
| --------------------------------- | ----------- | ------ | -------------------------------------------------------- |
| **Low community awareness**       | High        | High   | Comprehensive docs, example apps, social media promotion |
| **Competition from official SDK** | Low         | High   | Collaborate with Hiero team, offer to upstream           |
| **Niche use case**                | Medium      | Medium | Focus on real pain points, validate with community       |

---

## Success Metrics

### For Hackathon Submission

**Code Quality (30%)**

- ✅ Clean, readable code with comments
- ✅ >80% test coverage
- ✅ No ESLint warnings
- ✅ TypeScript strict mode

**Documentation (25%)**

- ✅ Comprehensive README
- ✅ API reference (TypeDoc/JSDoc)
- ✅ 3+ example applications
- ✅ Quickstart guide (<5 minutes to first use)

**Developer Experience (25%)**

- ✅ Intuitive API design
- ✅ Helpful error messages
- ✅ Works with existing SDKs
- ✅ No breaking changes to workflows

**Innovation (20%)**

- ✅ Solves real pain point
- ✅ No equivalent solution exists
- ✅ Extensible architecture
- ✅ Production-ready

### Post-Hackathon Adoption

**3-Month Targets:**

- 100+ GitHub stars
- 500+ weekly NPM downloads
- 10+ public projects using library
- Positive feedback in Hiero Discord

**6-Month Targets:**

- 500+ GitHub stars
- 2,000+ weekly downloads
- 50+ public projects using library
- Mention in official Hiero docs

---

## Conclusion

This analysis has identified **three genuine white spaces** in the Hiero ecosystem:

1. **`@hiero/mirror-client`** - No active TypeScript Mirror Node client exists
2. **`@hiero/scheduled`** - Zero abstraction layers for scheduled transactions
3. **`@hiero/react`** - No comprehensive React integration kit

All three proposals:

- ✅ Solve authentic, documented pain points
- ✅ Have zero overlap with existing solutions
- ✅ Are achievable within a 5-week hackathon timeframe
- ✅ Provide clear adoption paths post-hackathon

The **highest ROI proposal** is the Mirror Node client, as it addresses the most acute pain point (Mirror Node query complexity) and enables other developers to build more sophisticated applications on top of Hiero.

---

_Research compiled using:_

- **Context7** - Hiero SDK documentation
- **GitHub code search** - Repository analysis
- **Exa deep research** - Ecosystem mapping
- **npm registry analysis** - Package landscape
- **GitHub issues** - Developer pain points

_All research conducted February 22, 2026_
