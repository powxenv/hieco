---
title: Developer Experience Proposals
category: proposals
---

# Hiero Bounty: Novel DX-Focused Library Proposals

**Hackathon:** Hedera Hello Future Apex Hackathon 2026
**Bounty Pool:** $8,000
**Approach:** Zero duplication of official examples, pure DX innovation

---

## Philosophy: Avoiding the Obvious

The official hackathon examples are:

1. ❌ TypeScript Mirror Node client with typed queries + pagination helpers
2. ❌ Scheduled transactions helper (create, sign, track status)
3. ❌ React / Next.js integration kit (hooks/utilities for common Hiero flows)

**These are guaranteed to have 50+ submissions.** We need completely different angles.

---

## Novel Proposal 1: `@hiero/devtools` - Visual Transaction Debugger

### The Problem

When Hiero transactions fail, developers get cryptic error messages like `TRANSACTION_EXPIRED` or `INSUFFICIENT_PAYER_BALANCE`. Understanding **what went wrong** requires:

1. Reading 500+ lines of SDK source code
2. Manually parsing transaction bytes
3. Cross-referencing with Hedera documentation
4. Using block explorers to trace execution
5. Adding console.log statements everywhere

**This is the #1 pain point for new Hiero developers.**

### The Solution

A **visual transaction debugger** that lets developers:

- Inspect transaction bytes in a human-readable format
- Simulate execution without submitting to the network (dry run)
- See exactly what fees will be deducted
- Validate signatures before broadcast
- Trace execution path through the network

### Key Features

```typescript
import { TransactionDebugger } from '@hiero/devtools';

// 1. Visual transaction inspection
const tx = new TransferTransaction()
  .setAmount(new Hbar(100))
  .setRecipient(AccountId.fromString('0.0.1234'));

const debug = TransactionDebugger.inspect(tx);

console.log(debug.summary);
// → TransferTransaction
//   Sender: 0.0.1000
//   Recipient: 0.0.1234
//   Amount: 100 ℏ
//   Max Fee: 1 ℏ
//   Valid Duration: 120s
//   Memo: null

console.log(debug.validation);
// → ✅ Valid transaction structure
//   ⚠️  Warning: Transaction fee (1 ℏ) exceeds transfer amount (100 ℏ) ratio

// 2. Dry-run execution (no network submission)
const dryRun = await TransactionDebugger.dryRun(tx, {
  network: 'testnet',
  accountBalance: Hbar.from(1000)
});

console.log(dryRun.simulation);
// → Execution Simulation
//   Starting Balance: 1000 ℏ
//   Transaction Fee: -0.011321 ℏ
//   Transfer Amount: -100 ℏ
//   Ending Balance: 899.988679 ℏ
//   Status: ✅ SUCCESS

// 3. Transaction breakdown
console.log(debug breakdown);
// → Transaction Breakdown
//   Body bytes: [0xa, 0xb, ...] (256 bytes)
//   Signatures: []
//   Node account: 0.0.3
//   Expected gas: 15673 units
```

### Why This is Novel

**No existing tool provides:**

- Visual transaction inspection for Hiero
- Dry-run simulation without network submission
- Fee prediction before execution
- Signature validation in a user-friendly format

**Comparable tools in other ecosystems:**

- Ethereum: **Tenderly** (transaction simulation)
- Solana: **Solana Explorer** (transaction inspector)
- Bitcoin: **mempool.space** (transaction visualization)

**Hiero has nothing equivalent.**

### Implementation Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    @hiero/devtools                          │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │   Inspector     │  │   Simulator      │  │   Validator  │ │
│  │                  │  │                  │  │              │ │
│  │  Parse tx bytes  │  │  Execute locally  │  │  Check sigs   │ │
│  │  Decode fields   │  │  Predict fees     │  │  Verify keys │ │
│  │  Show structure  │  │  Simulate balance │  │  Test format  │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │   CLI Tool       │  │   VSCode Ext     │                    │
│  │                  │  │                  │                    │
│  │  npx hiero-debug │  │  Debug panel    │                    │
│  │  inspect-tx.json │  │  Hover inspect   │                    │
│  └──────────────────┘  └──────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### Unique Value Propositions

1. **Saves developers hours** of debugging time
2. **Reduces failed transactions** on mainnet (saves real money)
3. **Lowers learning curve** for new developers
4. **Works offline** - no network connection required for inspection
5. **Integrates with existing workflow** - doesn't replace SDK, enhances it

### Implementation Phases

**Phase 1: Transaction Inspector (3-4 days)**

- Parse all transaction types from SDK
- Decode transaction bytes to human-readable format
- Pretty-print transaction structure
- Extract all fields (sender, recipient, amount, fees, etc.)

**Phase 2: Fee Calculator (2-3 days)**

- Calculate transaction fees based on transaction size
- Predict gas consumption for contract calls
- Show fee breakdown (node fee, service fee, network fee)
- Compare fee to transaction amount (warn if fee > 10% of value)

**Phase 3: Dry-Run Simulator (3-4 days)**

- Local transaction execution simulation
- Balance prediction (start → end)
- Signature validation (verify signatures are valid)
- Expiry check (warn if transaction will expire before processing)

**Phase 4: VSCode Extension (2-3 days)**

- Syntax highlighting for transaction bytes
- Hover to inspect transaction fields
- Command to debug current file
- Integration with Hiero SDK (automatic detection)

**Phase 5: CLI Tool (1-2 days)**

```bash
npx @hiero/devtools inspect transaction.json
npx @hiero/devtools simulate transaction.json --balance 1000
npx @hiero/devtools validate-signatures transaction.json
```

**Phase 6: Testing & Docs (2-3 days)**

- Unit tests for all transaction types
- Integration tests with known transactions
- Documentation with examples
- CLI help text and usage guides

### Target Users

1. **New Hiero developers** learning the platform
2. **Teams debugging complex transactions**
3. **Smart contract developers** testing contract interactions
4. **Tool builders** creating Hiero-based applications

### Success Metrics

- Reduces average debugging time by 70%
- Prevents 90% of failed transactions caused by configuration errors
- Adopted by 20+ projects within 3 months
- Mentioned in official Hiero onboarding docs

---

## Novel Proposal 2: `@hiero/hotswap` - Hot Reload Development Server

### The Problem

Developing Hiero smart contracts or dApps is a **slow feedback loop**:

1. Make code change
2. Recompile contract (if applicable)
3. Deploy contract to testnet
4. Wait for confirmation (~3-5 seconds)
5. Create test account (if needed)
6. Fund account from faucet (rate limited)
7. Execute transaction
8. Check if it worked
9. ❌ Bug found → repeat from step 1

**This cycle takes 5-10 minutes per iteration.**

For comparison, modern web development has **Hot Module Replacement (HMR)** - you see changes in <100ms.

### The Solution

A **development server** that provides:

- Instant contract redeployment without changing addresses
- Auto-funding of test accounts (virtual faucet)
- State snapshots and restoration
- Time travel (fast-forward through consensus delays)
- Watch mode for automatic rebuilds

### Key Features

```typescript
// hotswap.config.js
export default {
  network: 'local',
  contracts: ['./contracts/*.sol'],
  watch: ['./src/**/*.ts'],
  snapshots: './snapshots/',
};

// Terminal
$ npx @hiero/hotswap

✓ Hotswap server running on http://localhost:3000
✓ Connected to Hiero local node
✓ Watching ./contracts/*.sol
✓ Watching ./src/**/*.ts

// When you save a contract file:
🔄 Contract changed: Token.sol
⚡ Redeploying to same address 0.0.1001...
✓ Deployed in 0.3s (gas: 1.2M)
📸 Snapshot: pre-transfer state

// When you save test code:
🔄 Test changed: transfer.spec.ts
⚡ Executing with auto-funding...
✓ Account 0.0.2002 auto-funded 10,000 ℏ
✓ Test passed in 1.2s

// Time travel
await hotswap.travel(Duration.minutes(5));
// → Simulates 5 minutes passing (useful for scheduled txs)

// State restoration
await hotswap.restore('pre-transfer');
// → Restores contract state to snapshot
```

### Why This is Novel

**Existing solutions:**

- **hiero-local-node**: Requires Docker, 16GB RAM, manual setup
- **Solo**: CLI tool, not a development server
- **Hardhat (Ethereum)**: Has hot reload, but Ethereum-only

**Hiero has no hot reload development experience.**

### Implementation Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                  Hotswap Development Server                  │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐         │
│  │  File       │   │  Contract   │   │  Account    │         │
│  │  Watcher    │→──│  Reloader   │   │  Manager    │         │
│  │             │   │             │   │             │         │
│  │  Watch TS   │   │  Keep addr  │   │  Virtual    │         │
│  │  Watch Sol  │   │  Update code│   │  Faucet     │         │
│  └─────────────┘   └─────────────┘   └─────────────┘         │
│         ↓                 ↓                  ↓               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Hiero Local Node Integration             │  │
│  │                                                         │  │
│  │  - Fast contract updates                              │  │
│  │  - Predictable account IDs                             │  │
│  │  - Instant consensus                                   │  │
│  └─────────────────────────────────────────────────────────┘  │
│         ↓
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                   Snapshot Manager                       │  │
│  │                                                         │  │
│  │  - Save state before operations                        │  │
│  │  - Restore to any snapshot                             │  │
│  │  - Compare states (diff)                                │  │
│  └─────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Unique Technical Approach

**1. Address Recycling**

```typescript
// Deploy contract once, get address 0.0.1001
// Update contract bytecode at SAME address
await hotswap.redeploy("0.0.1001", newBytecode);

// How: Use scheduled transactions with same creation code
// and execute immediately (local node only feature)
```

**2. Virtual Faucet**

```typescript
// Track virtual balances internally
await hotswap.faucet(accountId, Hbar.from(10000));

// When transaction needs funding:
// 1. Check virtual balance
// 2. If sufficient, let it through
// 3. Deduct from virtual balance
// 4. Skip actual network fee (local node)
```

**3. Time Travel**

```typescript
// Fast-forward consensus
await hotswap.setTime(Timestamp.from(Date.now()) + Duration.minutes(10));

// Scheduled transactions execute immediately
// Useful for testing vesting, time-locks, etc.
```

### Implementation Phases

**Phase 1: Watcher & Reloader (3-4 days)**

- File system watcher for contracts and test files
- Contract change detection
- Automatic recompilation (Solidity → bytecode)
- Integration with Hiero SDK for deployment

**Phase 2: Address Recycling (4-5 days)**

- Implement scheduled transaction trick for same-address deployment
- Works with local Hiero node only
- Preserve storage or wipe (configurable)

**Phase 3: Virtual Account System (3-4 days)**

- Virtual balance tracking
- Auto-funding mechanism
- Balance check middleware
- Transaction interception (for fee skipping)

**Phase 4: Snapshot Manager (2-3 days)**

- State capture before operations
- State restoration API
- Snapshot comparison (diff view)
- Named snapshots for test organization

**Phase 5: Time Travel (2-3 days)**

- Override consensus timestamp
- Execute scheduled transactions immediately
- Fast-forward for long-running tests
- Time reset capability

**Phase 6: CLI & DX Polish (2-3 days)**

- Pretty terminal output
- Progress indicators
- Error recovery
- Configuration file support

### Unique Value Propositions

1. **10x faster iteration** - 5-10 seconds → 0.5-1 seconds per cycle
2. **No more faucet hunting** - unlimited virtual test accounts
3. **Deterministic testing** - same addresses, predictable behavior
4. **Works with existing tests** - no test rewrite needed
5. **Zero additional setup** - extends hiero-local-node

### Target Users

1. **Smart contract developers** building on Hiero
2. **dApp developers** testing contract interactions
3. **Protocol teams** iterating rapidly
4. **Hackathon participants** needing quick feedback loops

### Success Metrics

- Reduces development iteration time by 90%
- Adopted by Hiero for official workshops and tutorials
- 100+ GitHub stars within 3 months
- Featured in Hiero developer onboarding materials

---

## Novel Proposal 3: `@hiero/observability` - Hiero Profiler & Monitoring Dashboard

### The Problem

When Hiero applications go to production, developers have **zero visibility** into:

1. **How many transactions are my dApp sending?**
2. **Why are transactions failing?**
3. **Which smart contract functions are called most?**
4. **What's the gas cost distribution?**
5. **Are there bottlenecks in my application?**
6. **How are users actually using my dApp?**

Existing solutions:

- **Mirror Node REST API** - Raw data, no visualization
- **HashScan / Blade Explorer** - Transaction lookup, not analytics
- **Manual logging** - Scattered, no aggregation

**This is a massive blind spot for production applications.**

### The Solution

An **observability platform** specifically for Hiero applications:

- Transaction tracing and visualization
- Smart contract profiling
- Error tracking and alerting
- User behavior analytics
- Performance monitoring
- Real-time dashboard

### Key Features

```typescript
import { HieroProfiler } from "@hiero/observability";

// 1. Auto-instrument transactions
const profiler = new HieroProfiler({
  apiKey: "your-project-key",
  network: "mainnet",
});

// Wrap your client
const client = profiler.wrap(new Client());

// All transactions are now tracked:
// - Execution time
// - Success/failure rate
// - Fee distribution
// - Error categorization

// 2. Smart contract profiling
const contractProfits = await profiler.analyzeContract({
  contractId: "0.0.1000",
  range: "7d",
});

console.log(contractProfits);
// → Contract Analysis: 0x1000 (last 7 days)
//   Total calls: 1,234
//   Success rate: 98.5%
//   Average gas: 45,000
//   Top functions:
//     - transfer()    45% (555 calls)  43k gas avg
//     - approve()     30% (370 calls)  12k gas avg
//     - mint()        25% (309 calls)  89k gas avg
//   Errors:
//     - INSUFFICIENT_BALANCE: 12 times
//     - CONTRACT_EXECUTION_FAILED: 6 times

// 3. Real-time dashboard
// https://observability.hiero.dev/your-project
// Live transaction stream
// Error rate graph
// Gas cost over time
// Active users
// Top contracts

// 4. Alerting
profiler.on("error-rate", (threshold) => {
  if (threshold > 0.05) {
    // 5% error rate
    alert(`Error rate spiked to ${threshold * 100}%`);
  }
});

profiler.on("gas-spend", (stats) => {
  console.log(`Gas cost: ${stats.daily} per day`);
});
```

### Why This is Novel

**Hiero has no dedicated observability platform.**

**Comparable tools in other ecosystems:**

- Ethereum: **Etherscan / Dune Analytics** (blockchain analytics)
- Web3: **Moralis / Alchemy** (dApp infrastructure)
- Traditional: **Datadog / New Relic** (application monitoring)

**Nothing exists specifically for Hiero dApps.**

### Dashboard UI

```
┌─────────────────────────────────────────────────────────────────┐
│                     Hiero Observability                          │
├─────────────────────────────────────────────────────────────────┤
│  Overview      Transactions      Contracts      Users          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  📊 Transaction Volume (24h)                                    │
│  ████░░░░░░░░░░░░░░░ 234 txns                                  │
│                                                                   │
│  ✅ Success Rate: 99.2%   ❌ Errors: 2     ⚠️ Pending: 5        │
│                                                                   │
│  💰 Gas Cost (24h)                  💸 Fee Cost (24h)              │
│  1.2M ℏ                           45 ℏ                         │
│                                                                   │
│  🔥 Top Contracts                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  0.0.1001  MyToken       1,203 calls    45M gas   │    │
│  │  0.0.1002  NFTMarket      856 calls     23M gas   │    │
│  │  0.0.1003  DEX            234 calls     12M gas   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
│  ⚡ Recent Errors                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  10:23:45  INSUFFICIENT_BALANCE     Account: 0.0.2001   │    │
│  │  10:22:30  CONTRACT_EXECUTION_FAILED  Contract: 0.0.1002│    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    @hiero/observability                        │
├──────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   SDK         │  │   Collector  │  │   Analyzer  │       │
│  │   Wrapper     │  │              │  │              │       │
│  │              │→──│              │→──│              │       │
│  │  Intercept   │  │  Buffer txs  │  │  Process     │       │
│  │  txs & calls │  │  Aggregate   │  │  data        │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│         ↓                  ↓                  ↓              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Storage Layer                        │  │
│  │                                                         │  │
│  │  - TimescaleDB (metrics)                              │  │
│  │  - ClickHouse (analytics)                              │  │
│  │  - Redis (real-time cache)                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│         ↓
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Dashboard UI                         │  │
│  │                                                         │  │
│  │  - Real-time graphs                                     │  │
│  │  - Transaction search                                  │  │
│  │  - Error tracking                                       │  │
│  │  - Smart contract profiler                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Unique Technical Approach

**1. SDK Instrumentation**

```typescript
// Wrap any Hiero SDK client
import { instrumentClient } from "@hiero/observability/sdk";

const client = instrumentClient(new Client(), {
  projectName: "my-dapp",
  environment: "production",
});

// All calls are now tracked:
// - latency metrics
// - error capture
// - gas usage
// - success/failure rates
```

**2. Zero-Knowledge Sampling** (privacy-preserving)

- Sample 1% of transactions for detailed profiling
- Anonymize sensitive data (account IDs, amounts)
- Aggregated metrics only

**3. Smart Contract Profiling**

```typescript
// Which functions cost the most gas?
await profiler.profileContract({
  contractId: "0.0.1000",
  duration: "7d",
  granularity: "function",
});
```

**4. User Journey Tracing**

```typescript
// Follow a user's journey through your dApp
await profiler.traceUser(userId, {
  duration: "session",
  events: true, // Contract calls, transactions
  errors: true, // Failed operations
});
```

### Implementation Phases

**Phase 1: SDK Wrapper (3-4 days)**

- Hiero SDK instrumentation
- Transaction interception
- Error capture
- Basic metrics collection

**Phase 2: Data Pipeline (4-5 days)**

- Buffer for incoming data
- Aggregation logic
- TimescaleDB setup (or use cloud service)
- API for data ingestion

**Phase 3: Analytics Engine (3-4 days)**

- Gas cost analysis
- Error categorization
- Success rate calculation
- Contract function profiling

**Phase 4: Dashboard UI (5-6 days)**

- Real-time graphs (using D3.js or similar)
- Transaction search
- Error tracking UI
- Smart contract profiler

**Phase 5: Alerting System (2-3 days)**

- Webhook notifications
- Email alerts
- Slack/Discord integration
- Custom alert rules

**Phase 6: Testing & Documentation (2-3 days)**

- Load testing (1000+ tx/sec)
- Privacy validation (no sensitive data leaks)
- Documentation
- Example integrations

### Unique Value Propositions

1. **Production-grade visibility** for Hiero dApps
2. **No infrastructure setup** - managed service
3. **Privacy-first** - no sensitive data stored
4. **Works with any framework** - framework-agnostic SDK
5. **Real-time alerts** - catch issues before users do

### Target Users

1. **Production dApps** needing monitoring
2. **DeFi protocols** requiring analytics
3. **NFT marketplaces** tracking user behavior
4. **Teams** building mission-critical applications

### Success Metrics

- Tracks 1M+ transactions within 6 months
- 50+ production dApps integrated
- Catches 90% of errors before users report them
- Becomes standard tooling for Hiero ecosystem

---

## Comparative Summary

| Proposal                 | Type       | Innovation Level | Implementation      | Target User         |
| ------------------------ | ---------- | ---------------- | ------------------- | ------------------- |
| **@hiero/devtools**      | Debugger   | ⭐⭐⭐⭐⭐       | Medium (12-15 days) | All developers      |
| **@hiero/hotswap**       | Dev Server | ⭐⭐⭐⭐⭐       | Hard (18-22 days)   | Smart contract devs |
| **@hiero/observability** | Monitoring | ⭐⭐⭐⭐         | Hard (20-25 days)   | Production apps     |

---

## Why These Will Win

### 1. No Direct Competition

- **DevTools**: Visual debugging doesn't exist for Hiero
- **Hotswap**: Hot reload doesn't exist for Hiero development
- **Observability**: No Hiero-specific monitoring platform

### 2. Solve Real Pain Points

Each proposal addresses a top-tier developer complaint:

1. **"Transactions fail and I don't know why"** → DevTools
2. **"Development cycle is too slow"** → Hotswap
3. **"I can't see what's happening in production"** → Observability

### 3. High Leverage

These tools enable **entire categories** of applications:

- DevTools → Faster learning, more developers
- Hotswap → Rapid prototyping, more experiments
- Observability → Production confidence, better UX

### 4. Extend Don't Replace

All three **enhance** the existing SDK:

- Work alongside `@hashgraph/sdk`
- Don't require rewriting code
- Can be adopted incrementally

---

## Recommended Choice for Hackathon

**Best ROI: `@hiero/devtools` (Transaction Debugger)**

**Why:**

1. **Most achievable** in 5-week timeframe (12-15 days)
2. **Highest immediate value** - every developer needs debugging
3. **Lowest complexity** - no infrastructure, just local tools
4. **Clear adoption path** - can be used immediately

**Implementation priority for hackathon:**

1. **Week 1-2:** Transaction Inspector (parse, decode, pretty-print)
2. **Week 2-3:** Fee Calculator (gas, fees, predictions)
3. **Week 3-4:** Dry-Run Simulator (local execution, balance checks)
4. **Week 4:** CLI Tool (npx package)
5. **Week 5:** Polish, docs, examples

This delivers a **complete, polished tool** that solves an urgent problem with zero duplication risk.

---

## Submission Strategy

### Positioning

"We didn't build another client library. We built the **tool that helps developers understand why their code doesn't work**."

### Key Talking Points

1. **0% overlap** with official examples
2. **Solves #1 pain point** (transaction debugging)
3. **10x faster** debugging cycles
4. **Reduces failed transactions** (saves real money)
5. **Enables next generation** of Hiero tooling

### Demo Strategy

**Live Debugging Session:**

1. Show a failing transaction (common error)
2. Use official SDK → cryptic error message
3. Use `@hiero/devtools` → clear explanation of what's wrong
4. Fix the issue in seconds
5. Audience understands the value immediately

---

_All proposals are 100% novel and address genuine developer experience gaps in the Hiero ecosystem. Each has clear implementation path, measurable impact, and strong adoption potential._

---

# @hieco: Unified Hiero Community Frontend Ecosystem

**Hackathon:** Hedera Hello Future Apex Hackathon 2026
**Bounty Pool:** $8,000 (Hiero Developer Tooling Track)
**Project:** Community-driven unified frontend integration ecosystem
**Namespace:** `@hieco/*` (Hiero Community)
**Reference Implementation:** React
**Timeline:** 5 weeks (February - March 2026)

---

## Executive Summary

The `@hieco` ecosystem provides a **unified, community-driven frontend integration layer** for Hiero blockchain, built with React as the reference implementation and replicated across Svelte, Vue, Solid, and Qwik. This comprehensive monorepo eliminates duplication, establishes best practices, and accelerates Hiero dApp development with genuine utility and intuitive developer experience.

### Vision

A single, cohesive ecosystem where frontend developers can integrate Hiero using their preferred framework's idioms and patterns, with **70% code reuse** via shared core utilities, comprehensive testing, and unified documentation—all starting with React as the production-ready reference implementation.

### Alignment with Official Hiero Bounty Requirements

**Official Bounty Statement:**

> "Build a Hiero-ready open-source library that makes it easier for developers to interact with Hiero networks—a reusable set of utilities (not an app) that improves developer experience and can realistically be adopted by the ecosystem."

**How @hieco Exceeds Requirements:**

| Requirement                  | Official Spec                  | @hieco Delivery                              |
| ---------------------------- | ------------------------------ | -------------------------------------------- |
| **Open-source library**      | ✅ Public repo + clear license | ✅ MIT license, 7 packages                   |
| **Clean library API**        | ✅ Basic structure             | ✅ Production-ready, idiomatic per framework |
| **Tests**                    | ✅ Basic tests                 | ✅ 90%+ coverage, unit + integration + E2E   |
| **CI**                       | ✅ CI/CD                       | ✅ GitHub Actions + automated releases       |
| **README + quickstart**      | ✅ Install + examples          | ✅ Full documentation site (VitePress)       |
| **Contribution hygiene**     | ✅ CONTRIBUTING + DCO          | ✅ Full monorepo standards + Changesets      |
| **Reference implementation** | hiero-enterprise-java          | ✅ @hieco/react as reference pattern         |

**Beyond Basic Examples:**

The official examples mention:

- ❌ TypeScript Mirror Node client
- ❌ Scheduled transactions helper
- ❌ React/Next.js integration kit

**@hieco transcends these by providing:**

- ✅ **Multi-framework ecosystem** (React as reference → Svelte, Vue, Solid, Qwik replicate pattern)
- ✅ **Type-safe Mirror Node client** with automatic pagination
- ✅ **Scheduled transactions** as first-class feature across all frameworks
- ✅ **Monorepo architecture** with shared core utilities
- ✅ **Production-ready patterns** battle-tested by enterprise Java reference

---

## Table of Contents

1. [Official Bounty Requirements Integration](#official-bounty-requirements-integration)
2. [React-First Reference Architecture](#react-first-reference-architecture)
3. [Core Package: Shared Utilities](#core-package-shared-utilities)
4. [React Implementation: Reference Pattern](#react-implementation-reference-pattern)
5. [Framework Adapter Pattern](#framework-adapter-pattern)
6. [Genuine Utility Demonstrations](#genuine-utility-demonstrations)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Submission Deliverables](#submission-deliverables)

---

## Official Bounty Requirements Integration

### Bounty Problem Statement

> "Build a Hiero-ready open-source library that makes it easier for developers to interact with Hiero networks—a reusable set of utilities (not an app) that improves developer experience and can realistically be adopted by the ecosystem."

### @hieco Solution Approach

**Core Philosophy:** Every feature must demonstrate **genuine utility** and **intuitive developer experience**.

**Utility Validation:**

- ❌ "Would be nice to have" → Rejected
- ✅ "Solves a daily pain point" → Accepted
- ✅ "Reduces boilerplate by 80%" → Accepted
- ✅ "Prevents common bugs" → Accepted

**DX Validation:**

- ❌ Requires reading 50+ docs to use → Rejected
- ✅ Works in 5 minutes with quickstart → Accepted
- ✅ TypeScript autocomplete for everything → Accepted
- ✅ Helpful error messages → Accepted

### Required Deliverables Mapping

| Official Requirement            | @hieco Implementation                               |
| ------------------------------- | --------------------------------------------------- |
| **Public repo + clear license** | `github.com/hieco/ecosystem` with MIT license       |
| **Clean library API**           | Idiomatic React hooks → replicated patterns         |
| **Basic tests**                 | Vitest with 90%+ coverage + Playwright E2E          |
| **CI**                          | GitHub Actions (lint, test, build, release)         |
| **README + quickstart**         | Full VitePress docs + interactive examples          |
| **Contribution hygiene**        | CONTRIBUTING.md, DCO sign-offs, Changesets          |
| **Reference implementation**    | hiero-enterprise-java patterns adapted for frontend |

### Judging Criteria Alignment

**Integration (15%) - How integrated is it?**

- Uses Mirror Node REST API (transactions, accounts, tokens, contracts)
- Wraps Hiero SDK client operations
- Leverages Hedera Consensus Service for agent/event coordination
- Type-safe integration with all major Hiero services

**Innovation (10%) - New capabilities for ecosystem**

- First multi-framework Hiero integration (React + 4 others)
- Type-safe Mirror Node client (doesn't exist)
- Unified type definitions across all frameworks
- Shared testing infrastructure (doesn't exist)

**Execution (20%) - MVP quality**

- Working React implementation (reference)
- Production-ready: error handling, caching, retries
- Comprehensive tests (unit + integration + E2E)
- Full documentation with live examples

**Success (20%) - Impact on ecosystem**

- Lowers barrier to entry: 5 min to first Hiero dApp
- Enables rapid prototyping: 80% less boilerplate
- Type safety prevents bugs: TypeScript throughout
- Multi-framework: reaches 95% of frontend developers

---

## React-First Reference Architecture

### Design Philosophy

**React as Reference Pattern:**

All framework adapters follow the **React reference implementation**. This ensures:

1. **Proven patterns**: React implementation is battle-tested first
2. **Clear migration path**: Framework adapters copy established patterns
3. **Shared mental model**: Developers switching frameworks recognize similar APIs
4. **Reduced maintenance**: Core utilities tested via React, reused by others

### Framework Adapter Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                   Framework Adapters                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  @hieco/react (REFERENCE)  @hieco/svelte  @hieco/vue    │
│       ↓                          ↓             ↓             │
│  Proven patterns              Replicate     Replicate        │
│  Tested first                 same          same             │
│  Documented fully             patterns      patterns         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      @hieco/core                             │
│  Shared utilities • Client wrappers • Types • Testing        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    @hashgraph/sdk                             │
│                   Official Hiero SDK                          │
└─────────────────────────────────────────────────────────────┘
```

**Adapter Implementation Rules:**

1. **React defines the contract**: Hook names, parameters, return types
2. **Other frameworks replicate**: Use idiomatic equivalents (stores, composables, etc.)
3. **Core stays framework-agnostic**: All business logic in `@hieco/core`
4. **Testing cascades**: React tests validate core, others test adapter layer

---

## Core Package: Shared Utilities

### `@hieco/core` Architecture

The core package contains **framework-agnostic business logic** that all framework adapters consume.

**Key Principles:**

1. **No framework dependencies** (pure TypeScript)
2. **Full type safety** (strict mode enabled)
3. **Production-ready** (error handling, retries, caching)
4. **Well-tested** (90%+ coverage, mocked framework calls)

### Core Exports

```typescript
// Client management
export { createClient, ClientConfig } from "./client";
export { HieroClient } from "./client/hiero-client";

// Mirror Node integration (type-safe)
export { MirrorNodeClient } from "./mirror-node/client";

// Transaction builders
export { TransactionBuilder } from "./builders/transaction";
export { ContractCallBuilder } from "./builders/contract";

// Type definitions
export * from "./types";

// Utilities
export { formatHbar, parseHbar } from "./utils/hbar";
export { estimateFee } from "./utils/fees";
export { retryWithBackoff } from "./utils/retry";
```

### Example: HieroClient (Framework-Agnostic)

```typescript
// @hieco/core/src/client/hiero-client.ts
export class HieroClient {
  constructor(private config: ClientConfig) {
    this.client = Client.forName(config.network);
    if (config.operator) {
      this.client.setOperator(config.operator.accountId, config.operator.privateKey);
    }
  }

  // Account operations
  async getAccountBalance(accountId: AccountId): Promise<Hbar> {
    const query = new AccountBalanceQuery().setAccountId(accountId);
    const balance = await query.execute(this.client);
    return balance.hbars;
  }

  async getAccountInfo(accountId: AccountId): Promise<AccountInfo> {
    const query = new AccountInfoQuery().setAccountId(accountId);
    return await query.execute(this.client);
  }

  // Transaction execution
  async sendTransaction(
    transaction: Transaction,
    options?: { timeout?: number },
  ): Promise<TransactionReceipt> {
    const tx = transaction.freezeWith(this.client);
    const response = await tx.execute(this.client);

    // Get receipt with timeout
    const receipt = await response.getReceipt(this.client, {
      timeout: options?.timeout || 60000,
    });

    return receipt;
  }

  // Contract interactions
  async callContract(request: ContractCallRequest): Promise<ContractFunctionResult> {
    const query = new ContractCallQuery()
      .setContractId(request.contractId)
      .setGas(request.gas)
      .setFunction(request.functionName, request.params);

    return await query.execute(this.client);
  }

  // Mirror Node client
  get mirrorNode(): MirrorNodeClient {
    if (!this._mirrorClient) {
      this._mirrorClient = new MirrorNodeClient(this.config.network, this.config.mirrorNode);
    }
    return this._mirrorClient;
  }
}
```

### Example: MirrorNodeClient (Type-Safe)

```typescript
// @hieco/core/src/mirror-node/client.ts
export class MirrorNodeClient {
  constructor(
    private network: Network,
    private config?: { apiKey?: string; baseUrl?: string },
  ) {}

  private get baseUrl(): string {
    if (this.config?.baseUrl) return this.config.baseUrl;

    const endpoints = {
      mainnet: "https://mainnet.mirrornode.hedera.com",
      testnet: "https://testnet.mirrornode.hedera.com",
      previewnet: "https://previewnet.mirrornode.hedera.com",
    };

    return endpoints[this.network];
  }

  // Type-safe account queries
  async getAccount(accountId: string): Promise<MirrorAccount> {
    const response = await fetch(`${this.baseUrl}/api/v1/accounts/${accountId}`);

    if (!response.ok) {
      throw new MirrorNodeError(`Failed to fetch account: ${response.statusText}`);
    }

    return await response.json();
  }

  async getAccountBalance(accountId: string): Promise<Hbar> {
    const account = await this.getAccount(accountId);
    return Hbar.from(account.balance.balance);
  }

  // Automatic pagination
  async getTransactions(filters: TransactionFilters): Promise<PaginatedResults<Transaction>> {
    const results: Transaction[] = [];
    let link = `${this.baseUrl}/api/v1/transactions?${this.buildQueryString(filters)}`;

    while (link && results.length < (filters.limit || 100)) {
      const response = await fetch(link);
      const data = await response.json();

      results.push(...data.transactions);
      link = data.links?.next; // Mirror Node pagination
    }

    return {
      data: results,
      total: results.length,
    };
  }

  // Contract queries
  async getContract(contractId: string): Promise<MirrorContract> {
    const response = await fetch(`${this.baseUrl}/api/v1/contracts/${contractId}`);

    if (!response.ok) {
      throw new MirrorNodeError(`Failed to fetch contract: ${response.statusText}`);
    }

    return await response.json();
  }

  async getContractResults(
    contractId: string,
    options?: { limit?: number; order?: "asc" | "desc" },
  ): Promise<ContractResult[]> {
    const params = new URLSearchParams({
      limit: (options?.limit || 25).toString(),
      order: options?.order || "desc",
    });

    const response = await fetch(
      `${this.baseUrl}/api/v1/contracts/${contractId}/results?${params}`,
    );

    if (!response.ok) {
      throw new MirrorNodeError(`Failed to fetch results: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  }
}
```

---

## React Implementation: Reference Pattern

### Core React Hooks

**Reference Implementation Philosophy:**

Every React hook must:

1. **Handle all edge cases** (loading, errors, retries)
2. **Provide TypeScript autocomplete** for all parameters
3. **Return consistent shapes** (data, loading, error, actions)
4. **Support SSR** (Next.js App Router compatible)
5. **Include examples** in JSDoc comments

### Client Provider Setup

```typescript
// @hieco/react/src/components/ClientProvider.tsx
import { createContext, useContext, ReactNode } from 'react';
import { HieroClient, ClientConfig } from '@hieco/core';

interface ClientContextValue {
  client: HieroClient | null;
  isConnected: boolean;
}

const ClientContext = createContext<ClientContextValue>({
  client: null,
  isConnected: false,
});

interface ClientProviderProps {
  config: ClientConfig;
  children: ReactNode;
}

export function ClientProvider({ config, children }: ClientProviderProps) {
  const [client] = useState(() => new HieroClient(config));
  const isConnected = !!client;

  return (
    <ClientContext.Provider value={{ client, isConnected }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClient(): HieroClient {
  const { client } = useContext(ClientContext);

  if (!client) {
    throw new Error('useClient must be used within ClientProvider');
  }

  return client;
}
```

### Hook: UseAccountBalance

**Demonstrates Genuine Utility:**

**Before @hieco:**

```typescript
// 30+ lines of boilerplate every time
const [balance, setBalance] = useState<Hbar | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  if (!account) return;
  setLoading(true);

  new AccountBalanceQuery()
    .setAccountId(account)
    .execute(client)
    .then((result) => setBalance(result.hbars))
    .catch(setError)
    .finally(() => setLoading(false));
}, [account]);
```

**After @hieco:**

```typescript
// 2 lines, handles all edge cases
const { balance, loading, error, refetch } = useAccountBalance(accountId);
```

**Implementation:**

````typescript
// @hieco/react/src/hooks/useAccountBalance.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useClient } from "./useClient";
import { AccountId, Hbar } from "@hashgraph/sdk";

interface UseAccountBalanceOptions {
  refetchInterval?: number;
  enabled?: boolean;
}

interface UseAccountBalanceResult {
  balance: Hbar | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * React hook for fetching and caching account balance.
 *
 * @example
 * ```tsx
 * function BalanceDisplay({ accountId }) {
 *   const { balance, loading } = useAccountBalance(accountId);
 *
 *   if (loading) return <Spinner />;
 *   return <div>{balance?.toString()} ℏ</div>;
 * }
 * ```
 */
export function useAccountBalance(
  accountId: AccountId | string,
  options: UseAccountBalanceOptions = {},
): UseAccountBalanceResult {
  const client = useClient();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["accountBalance", accountId.toString()],
    queryFn: async () => {
      return await client.getAccountBalance(
        typeof accountId === "string" ? AccountId.fromString(accountId) : accountId,
      );
    },
    refetchInterval: options.refetchInterval,
    enabled: options.enabled ?? true,
    staleTime: 10000, // 10 seconds
  });

  return {
    balance: query.data ?? null,
    loading: query.isLoading,
    error: query.error ?? null,
    refetch: () => queryClient.refetchQueries(["accountBalance"]),
  };
}
````

### Hook: UseContractRead

**Demonstrates Intuitive DX:**

**Features:**

- Auto-infers return type from ABI
- Caches results by contract + function + args
- Handles loading/error states automatically
- Supports manual refetch

````typescript
// @hieco/react/src/hooks/useContractRead.ts
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useClient } from "./useClient";
import { ContractId, Hbar } from "@hashgraph/sdk";

interface ContractCallOptions<TArgs extends unknown[]> {
  contractId: ContractId | string;
  functionName: string;
  args?: TArgs;
  gas?: number;
  refetchInterval?: number;
  enabled?: boolean;
}

interface UseContractReadResult<TData> {
  data: TData | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * React hook for reading from smart contracts with caching.
 *
 * @example
 * ```tsx
 * function TokenBalance() {
 *   const { data: balance, loading } = useContractRead({
 *     contractId: '0.0.1234',
 *     functionName: 'balanceOf',
 *     args: [userAddress],
 *   });
 *
 *   if (loading) return <Spinner />;
 *   return <div>Balance: {balance?.toString()}</div>;
 * }
 * ```
 */
export function useContractRead<TArgs extends unknown[], TData = unknown>(
  options: ContractCallOptions<TArgs>,
): UseContractReadResult<TData> {
  const client = useClient();
  const queryClient = useQueryClient();

  const contractId =
    typeof options.contractId === "string" ? options.contractId : options.contractId.toString();

  const query = useQuery({
    queryKey: ["contractRead", contractId, options.functionName, options.args],
    queryFn: async () => {
      const result = await client.callContract({
        contractId: options.contractId,
        functionName: options.functionName,
        gas: options.gas || 300000,
        params: options.args || [],
      });

      return result as TData;
    },
    refetchInterval: options.refetchInterval,
    enabled: options.enabled ?? true,
    staleTime: 5000, // 5 seconds
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error ?? null,
    refetch: () => queryClient.refetchQueries(["contractRead"]),
  };
}
````

### Hook: UseTransferHbar

**Demonstrates Real Production Value:**

**Features:**

- Automatic fee estimation
- Transaction submission with loading states
- Receipt polling until confirmation
- Error handling with helpful messages
- Optimistic updates (optional)

````typescript
// @hieco/react/src/hooks/useTransferHbar.ts
import { useState, useCallback } from "react";
import { useClient } from "./useClient";
import { AccountId, Hbar, TransferTransaction } from "@hashgraph/sdk";

interface TransferHbarOptions {
  onSuccess?: (receipt: TransactionReceipt) => void;
  onError?: (error: Error) => void;
}

interface UseTransferHbarResult {
  transfer: (to: AccountId | string, amount: number | Hbar) => Promise<void>;
  status: "idle" | "pending" | "success" | "error";
  error: Error | null;
  reset: () => void;
}

/**
 * React hook for transferring HBAR with automatic fee estimation and receipt polling.
 *
 * @example
 * ```tsx
 * function SendButton() {
 *   const { transfer, status, error } = useTransferHbar({
 *     onSuccess: (receipt) => toast.success('Sent!'),
 *     onError: (error) => toast.error(error.message),
 *   });
 *
 *   const handleClick = () => {
 *     await transfer('0.0.1234', 100);
 *   };
 *
 *   return (
 *     <button onClick={handleClick} disabled={status === 'pending'}>
 *       {status === 'pending' ? 'Sending...' : 'Send 100 ℏ'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTransferHbar(options: TransferHbarOptions = {}): UseTransferHbarResult {
  const client = useClient();
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<Error | null>(null);

  const transfer = useCallback(
    async (to: AccountId | string, amount: number | Hbar) => {
      try {
        setStatus("pending");
        setError(null);

        const toAccountId = typeof to === "string" ? AccountId.fromString(to) : to;
        const hbarAmount = typeof amount === "number" ? Hbar.from(amount) : amount;

        // Build transaction
        const transaction = new TransferTransaction()
          .addHbarTransfer(client.operatorAccountId!, hbarAmount.negate())
          .addHbarTransfer(toAccountId, hbarAmount)
          .freezeWith(client);

        // Estimate fee
        const estimatedFee = await transaction.getHbarFee(client);
        console.log(`Estimated fee: ${estimatedFee.toString()}`);

        // Execute
        const receipt = await client.sendTransaction(transaction);

        setStatus("success");
        options.onSuccess?.(receipt);
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Transfer failed");
        setStatus("error");
        setError(error);
        options.onError?.(error);
        throw error;
      }
    },
    [client, options],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return { transfer, status, error, reset };
}
````

### Hook: UseMirrorNodeAccount

**Demonstrates Type-Safe Mirror Node Integration:**

````typescript
// @hieco/react/src/hooks/useMirrorNodeAccount.ts
import { useQuery } from "@tanstack/react-query";
import { useClient } from "./useClient";
import type { MirrorAccount } from "@hieco/utils";

interface UseMirrorNodeAccountResult {
  account: MirrorAccount | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

/**
 * React hook for fetching full account details from Mirror Node.
 * Includes balance, tokens, NFTs, and staking info.
 *
 * @example
 * ```tsx
 * function AccountDetails({ accountId }) {
 *   const { account, loading } = useMirrorNodeAccount(accountId);
 *
 *   if (loading) return <Spinner />;
 *   if (!account) return null;
 *
 *   return (
 *     <div>
 *       <p>Balance: {account.balance.balance} ℏ</p>
 *       <p>Tokens: {account.balance.tokens.length}</p>
 *       <p>NFTs: {account.balance.nfts.length}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useMirrorNodeAccount(accountId: string): UseMirrorNodeAccountResult {
  const client = useClient();

  const query = useQuery({
    queryKey: ["mirrorNodeAccount", accountId],
    queryFn: async () => {
      return await client.mirrorNode.getAccount(accountId);
    },
    staleTime: 30000, // 30 seconds
  });

  return {
    account: query.data ?? null,
    loading: query.isLoading,
    error: query.error ?? null,
    refetch: () => query.refetch(),
  };
}
````

### Complete Real-World Example

```typescript
// Example dApp using @hieco/react
import { ClientProvider, useAccountBalance, useTransferHbar } from '@hieco/react';

function App() {
  const config = {
    network: 'testnet',
    operator: {
      accountId: '0.0.1000',
      privateKey: process.env.HEDERA_PRIVATE_KEY!,
    },
  };

  return (
    <ClientProvider config={config}>
      <WalletDashboard />
    </ClientProvider>
  );
}

function WalletDashboard() {
  const accountId = '0.0.1000';
  const { balance, loading: balanceLoading } = useAccountBalance(accountId);
  const { transfer, status, error } = useTransferHbar({
    onSuccess: () => alert('Transfer successful!'),
    onError: (err) => alert(`Error: ${err.message}`),
  });

  const handleTransfer = async () => {
    await transfer('0.0.2000', 10);
  };

  if (balanceLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Wallet Dashboard</h1>
      <p>Balance: {balance?.toString()} ℏ</p>

      <button
        onClick={handleTransfer}
        disabled={status === 'pending'}
      >
        {status === 'pending' ? 'Transferring...' : 'Send 10 ℏ'}
      </button>

      {error && <p style={{ color: 'red' }}>{error.message}</p>}
    </div>
  );
}
```

---

## Framework Adapter Pattern

### How Other Frameworks Replicate React Patterns

**Principle:** Framework adapters follow the **exact same API surface** as React, using their idiomatic patterns.

### Svelte Adapter Pattern

```typescript
// @hieco/svelte - Stores replicate React hooks

// React: useAccountBalance(accountId)
// Svelte: accountBalance(accountId) → store

import { readable, derived } from "svelte/store";
import { HieroClient } from "@hieco/core";

export function createAccountBalanceStore(client: HieroClient, accountId: string) {
  const { subscribe, set, update } = readable<Hbar | null>(null, (set) => {
    let interval: ReturnType<typeof setInterval>;

    async function fetch() {
      const balance = await client.getAccountBalance(accountId);
      set(balance);
    }

    fetch();
    interval = setInterval(fetch, 10000); // Poll every 10s

    return () => clearInterval(interval);
  });

  return {
    subscribe,
    refetch: () => fetch(),
  };
}

// Usage in Svelte component:
// <script>
//   import { accountBalance } from '@hieco/svelte';
//   const balance = accountBalance(client, '0.0.1000');
// </script>
//
// <p>{$balance?.toString()} ℏ</p>
```

### Vue Adapter Pattern

```typescript
// @hieco/vue - Composables replicate React hooks

// React: useAccountBalance(accountId)
// Vue: useAccountBalance(accountId) → composable

import { ref, onMounted, onUnmounted } from "vue";
import { HieroClient } from "@hieco/core";

export function useAccountBalance(accountId: string) {
  const balance = ref<Hbar | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  let interval: ReturnType<typeof setInterval>;

  async function fetch() {
    loading.value = true;
    try {
      // @ts-ignore - client injected by provider
      const client = this.$hieroClient;
      balance.value = await client.getAccountBalance(accountId);
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    fetch();
    interval = setInterval(fetch, 10000);
  });

  onUnmounted(() => {
    clearInterval(interval);
  });

  return { balance, loading, error, refetch: fetch };
}

// Usage in Vue component:
// <script setup>
//   import { useAccountBalance } from '@hieco/vue';
//   const { balance, loading } = useAccountBalance('0.0.1000');
// </script>
//
// <template>
//   <p v-if="loading">Loading...</p>
//   <p v-else>{{ balance?.toString() }} ℏ</p>
// </template>
```

### Adapter Implementation Checklist

For each framework adapter (`@hieco/{svelte,vue,solid,qwik}`):

- [ ] **Provider component**: Wraps framework with `HieroClient`
- [ ] **useClient hook**: Access client in components
- [ ] **useAccountBalance**: Replicate React hook pattern
- [ ] **useContractRead**: Replicate React hook pattern
- [ ] **useTransferHbar**: Replicate React hook pattern
- [ ] **useMirrorNodeAccount**: Replicate React hook pattern
- [ ] **Tests**: Validate adapter produces same results as React
- [ ] **Examples**: Port React examples to framework idioms

---

## Genuine Utility Demonstrations

### Utility 1: Eliminates Boilerplate

**Before @hieco (50+ lines per component):**

```typescript
// Manual implementation without @hieco
function BalanceDisplay() {
  const [balance, setBalance] = useState<Hbar | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetch() {
      setLoading(true);
      try {
        const client = Client.forName('testnet');
        client.setOperator(myAccountId, myPrivateKey);

        const query = new AccountBalanceQuery()
          .setAccountId('0.0.1000');

        const result = await query.execute(client);

        if (!cancelled) {
          setBalance(result.hbars);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetch();

    return () => { cancelled = true; };
  }, []);

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  return <div>{balance?.toString()} ℏ</div>;
}
```

**After @hieco (3 lines):**

```typescript
// With @hieco/react
function BalanceDisplay() {
  const { balance, loading, error } = useAccountBalance('0.0.1000');

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  return <div>{balance?.toString()} ℏ</div>;
}
```

**Value:** **94% less code**, handles all edge cases, auto-caching, retry logic

### Utility 2: Type Safety Prevents Bugs

**Problem:** Untyped Mirror Node responses cause runtime errors

**Before @hieco:**

```typescript
// Manual fetch - no type safety
const response = await fetch("/api/v1/accounts/0.0.1000");
const data = await response.json();

// Runtime error: property name typo
console.log(data.ballance.balance); // Oops! "ballance" not "balance"

// Runtime error: wrong type assumption
const balance = data.balance.balance; // Could be string or number
```

**After @hieco:**

```typescript
// With @hieco - full type safety
const { account } = useMirrorNodeAccount("0.0.1000");

// TypeScript catches typos at compile time
console.log(account.ballance.balance); // ❌ Type error!

// Correct types inferred
const balance: Hbar = account.balance.balance; // ✅ Correct type
```

**Value:** **Catches bugs at compile time**, autocomplete prevents typos

### Utility 3: Handles All Edge Cases

**Problem:** Manual implementations miss edge cases

**Before @hieco:**

```typescript
// ❌ What if network request fails?
// ❌ What if transaction times out?
// ❌ What if account doesn't exist?
// ❌ What if user switches accounts mid-query?
// ❌ What to do about stale data?
// ❌ How to retry failed requests?
```

**After @hieco:**

```typescript
// ✅ All edge cases handled automatically
const { balance, loading, error, refetch } = useAccountBalance(accountId);

// - Network errors: caught, exposed in `error`
// - Timeouts: configured with 60s default
// - Missing accounts: throws helpful error
// - Account switching: React Query handles key changes
// - Stale data: 10s staleTime, auto-refetch
// - Retries: built-in with exponential backoff
```

**Value:** **Production-ready**, no edge case bugs

### Utility 4: Unified Across Frameworks

**Problem:** Learning different APIs for each framework

**Before @hieco:**

```typescript
// React (some library)
const { balance } = useBalance(accountId);

// Svelte (different API)
const balance = getBalance(accountId);

// Vue (different API again)
const { balance } = useBalance(accountId); // Different return shape!

// Solid (yet another API)
const [balance] = createBalance(accountId);
```

**After @hieco:**

```typescript
// React - @hieco/react
const { balance, loading, error } = useAccountBalance(accountId);

// Svelte - @hieco/svelte (same return shape)
const { balance, loading, error } = accountBalance(accountId);

// Vue - @hieco/vue (same return shape)
const { balance, loading, error } = useAccountBalance(accountId);

// Solid - @hieco/solid (same return shape)
const { balance, loading, error } = createAccountBalance(accountId);

// Qwik - @hieco/qwik (same return shape)
const { balance, loading, error } = useAccountBalance(accountId);
```

**Value:** **Learn once, apply everywhere**, portable skills

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Goal:** Set up monorepo and implement `@hieco/core` + `@hieco/react` (reference)

**Tasks:**

- [x] Initialize Turborepo + pnpm workspace
- [ ] Configure TypeScript, ESLint, Prettier
- [ ] Set up Vitest for testing
- [ ] Implement `@hieco/core`:
  - [ ] `HieroClient` class
  - [ ] `MirrorNodeClient` class (type-safe)
  - [ ] Transaction builders
  - [ ] Type definitions
  - [ ] Utilities (retry, format, fee estimation)
- [ ] Implement `@hieco/react` reference:
  - [ ] `ClientProvider` component
  - [ ] `useClient` hook
  - [ ] `useAccountBalance` hook
  - [ ] `useContractRead` hook
  - [ ] `useTransferHbar` hook
  - [ ] `useMirrorNodeAccount` hook
- [ ] Tests for core + React (90%+ coverage)
- [ ] CI/CD pipeline (GitHub Actions)

**Deliverable:** Working React SDK with comprehensive tests

### Phase 2: Documentation & Examples (Week 2-3)

**Goal:** Production-ready documentation site with live examples

**Tasks:**

- [ ] Set up VitePress documentation site
- [ ] Write quickstart guide (<5 min to first use)
- [ ] Create 5+ real-world examples:
  - [ ] Wallet dashboard
  - [ ] Token transfer
  - [ ] Smart contract interaction
  - [ ] NFT gallery
  - [ ] Transaction history
- [ ] API reference for all React hooks
- [ ] Migration guide from vanilla SDK
- [ ] Contributing guidelines

**Deliverable:** Professional documentation site with live demos

### Phase 3: Framework Adapters (Week 3-4)

**Goal:** Implement Svelte, Vue adapters following React pattern

**Tasks:**

- [ ] `@hieco/svelte`:
  - [ ] Port all React hooks to Svelte stores
  - [ ] Create 3 Svelte examples
  - [ ] Write Svelte-specific docs
- [ ] `@hieco/vue`:
  - [ ] Port all React hooks to Vue composables
  - [ ] Create 3 Vue examples
  - [ ] Write Vue-specific docs

**Deliverable:** Svelte + Vue packages with examples

### Phase 4: Advanced Frameworks (Week 4-5)

**Goal:** Implement Solid, Qwik adapters

**Tasks:**

- [ ] `@hieco/solid`:
  - [ ] Port all React hooks to Solid signals
  - [ ] Create 2 Solid examples
  - [ ] Write Solid-specific docs
- [ ] `@hieco/qwik`:
  - [ ] Port all React hooks to Qwik loadables
  - [ ] Create 2 Qwik examples
  - [ ] Write Qwik-specific docs

**Deliverable:** Solid + Qwik packages with examples

### Phase 5: Polish & Submission (Week 5)

**Goal:** Finalize for hackathon submission

**Tasks:**

- [ ] Bundle size optimization
- [ ] Performance benchmarking
- [ ] Record demo video (5-10 min)
- [ ] Create pitch deck
- - [ ] Team & project introduction
  - [ ] Architecture & tech decisions
  - [ ] Demo walkthrough
  - [ ] Future roadmap
  - [ ] Live demo URL
- [ ] Final test suite (100% coverage on core)
- [ ] Update README with install instructions
- [ ] Prepare submission materials

**Deliverable:** Complete hackathon submission package

---

## Submission Deliverables

### 1. Public Repository

**Location:** `github.com/hieco/ecosystem`

**Structure:**

```
hieco/ecosystem
├── packages/
│   ├── core/           # @hieco/core
│   ├── utils/          # @hieco/utils
│   ├── react/          # @hieco/react (REFERENCE)
│   ├── svelte/         # @hieco/svelte
│   ├── vue/            # @hieco/vue
│   ├── solid/          # @hieco/solid
│   └── qwik/           # @hieco/qwik
├── apps/
│   ├── docs/           # VitePress documentation
│   └── examples/       # Live example apps
├── CONTRIBUTING.md     # DCO sign-offs, guidelines
├── LICENSE             # MIT
└── README.md           # Quickstart + install
```

### 2. Clean Library API

**Example Installation:**

```bash
npm install @hieco/react @hieco/core
# or
pnpm add @hieco/react @hieco/core
# or
yarn add @hieco/react @hieco/core
```

**Example Usage:**

```typescript
// Quickstart - < 5 minutes to working dApp
import { ClientProvider } from '@hieco/react';
import { useAccountBalance, useTransferHbar } from '@hieco/react';

function App() {
  return (
    <ClientProvider config={{ network: 'testnet', operator: {...}}>
      <Wallet />
    </ClientProvider>
  );
}

function Wallet() {
  const { balance } = useAccountBalance('0.0.1000');
  const { transfer, status } = useTransferHbar();

  return (
    <div>
      <p>Balance: {balance?.toString()} ℏ</p>
      <button onClick={() => transfer('0.0.2000', 10)}>
        {status === 'pending' ? 'Sending...' : 'Send 10 ℏ'}
      </button>
    </div>
  );
}
```

### 3. Basic Tests

**Coverage Target:** 90%+ for core, 80%+ for adapters

**Test Structure:**

```typescript
// packages/core/test/client/hiero-client.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { HieroClient } from "../src/client/hiero-client";

describe("HieroClient", () => {
  let client: HieroClient;

  beforeEach(() => {
    client = new HieroClient({
      network: "testnet",
      operator: { accountId: "0.0.1000", privateKey: "0x..." },
    });
  });

  describe("getAccountBalance", () => {
    it("should return account balance", async () => {
      const balance = await client.getAccountBalance("0.0.1000");
      expect(balance).toBeDefined();
      expect(balance.toTinybars()).toBeGreaterThan(0n);
    });

    it("should throw for invalid account ID", async () => {
      await expect(client.getAccountBalance("invalid")).rejects.toThrow();
    });
  });
});
```

### 4. CI/CD

**GitHub Actions Workflow:**

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - run: pnpm install
      - run: pnpm test
      - run: pnpm lint
      - run: pnpm typecheck
```

### 5. README with Quickstart

**Sections:**

- Project title + description
- Installation instructions
- Quickstart example (<5 min)
- Link to full documentation
- Contributing guidelines
- License (MIT)

### 6. Contribution Hygiene

**Files:**

- `CONTRIBUTING.md`: PR guidelines, DCO sign-offs
- `.github/PULL_REQUEST_TEMPLATE.md`: PR template
- `.github/ISSUE_TEMPLATE/`: Bug report, feature request
- `CODEOWNERS`: Review requirements
- Changesets: For version management

---

## Beyond Bounty Requirements

### What Makes @hieco Special

**1. Multi-Framework First**

Most libraries pick one framework. We support **5** from day one.

**2. Production-Ready Patterns**

Inspired by `hiero-enterprise-java`, but for frontend:

- Error handling
- Retry logic
- Caching
- TypeScript throughout
- Comprehensive tests

**3. Zero Duplication**

70% code reuse via shared core:

- Type definitions shared
- Client logic shared
- Testing utilities shared
- Documentation shared

**4. Developer Experience Obsession**

Every decision prioritizes DX:

- 5-minute quickstart
- Full TypeScript autocomplete
- Helpful error messages
- Clear examples
- Migration guides

**5. Community-Driven Namespace**

`@hieco/*` signals:

- Not vendor-controlled
- Community-maintained
- Open to contributions
- Ecosystem-owned

---

## Conclusion

The `@hieco` unified ecosystem delivers on the Hiero bounty's vision while **exceeding expectations**:

- ✅ **Open-source library** (7 packages, MIT licensed)
- ✅ **Clean API** (idiomatic per framework, React as reference)
- ✅ **Production-ready** (error handling, retries, caching, logging)
- ✅ **Well-tested** (90%+ coverage, unit + integration + E2E)
- ✅ **CI/CD** (GitHub Actions, automated releases)
- ✅ **Documentation** (VitePress site, quickstart, examples)
- ✅ **Contribution hygiene** (CONTRIBUTING.md, DCO, Changesets)

**Unique Value:**

1. **Multi-framework coverage** - First for Hiero
2. **Type-safe Mirror Node client** - Doesn't exist elsewhere
3. **React-first reference pattern** - Proven, replicated by others
4. **Genuine utility** - Eliminates 94% of boilerplate
5. **Intuitive DX** - 5-minute quickstart, full autocomplete

This isn't just a library—it's the **foundation for Hiero's frontend ecosystem**.

---

_Document Version: 2.0_
_Last Updated: 2026-02-22_
_Author: @abinovalfauzi_
_License: MIT (for documentation structure)_