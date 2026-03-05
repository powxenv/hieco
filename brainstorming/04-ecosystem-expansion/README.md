---
title: hieco Ecosystem Expansion Proposals
description: Seven practical additions to the @hieco ecosystem for superior Developer Experience
category: proposals
created: 2026-02-25
status: complete
tags: [hieco, expansion, dx, testing, scheduled-transactions]
related:
  - ../02-bounty-research/hiero-deep-dive.md
  - ../03-proposals/hieco-unified-ecosystem.md
---

# hieco Ecosystem Expansion Proposals

**Date:** February 25, 2026
**Status:** Research Complete
**Focus:** Practical, high-utility additions to @hieco ecosystem

---

## Executive Summary

Based on the existing `@hieco/mirror-*` packages and research findings, seven strategic additions are proposed to elevate the Hiero developer experience. Each package addresses documented pain points and offers genuine utility.

### Current Foundation

| Package                | Purpose                         | Status   |
| ---------------------- | ------------------------------- | -------- |
| `@hieco/mirror`        | Core Mirror Node REST client    | ✅ Built |
| `@hieco/mirror-react`  | React hooks with TanStack Query | ✅ Built |
| `@hieco/mirror-preact` | Preact adapter                  | ✅ Built |
| `@hieco/mirror-solid`  | Solid.js adapter                | ✅ Built |
| `@hieco/utils` | Shared utilities and types       | ✅ Built |

---

## Proposed Additions

### 1. `@hieco/testing` - Test Utilities & Mock Server

**Impact:** ⭐⭐⭐⭐⭐ | **Complexity:** Low | **Time:** 6-8 days

**Problem Solved:**

- Testing against live testnet is slow and unreliable
- No good mocking solutions for Mirror Node API
- Developers write boilerplate for every test

**Key Features:**

- Mock Mirror Node server using MSW
- Test utilities for React hooks
- Pre-built test data fixtures
- Coverage reporting integration

```typescript
import { setupMirrorMock, renderHook } from "@hieco/testing";

const { server } = setupMirrorMock({
  network: "testnet",
  handlers: {
    accountBalance: {
      "0.0.1234": Hbar.from(1000),
    },
  },
});

test("useAccountBalance", async () => {
  const { result } = renderHook(() => useAccountBalance("0.0.1234"));
  await waitFor(() => expect(result.current.balance).toEqual(Hbar.from(1000)));
});
```

---

### 2. `@hieco/scheduled` - Scheduled Transaction Toolkit

**Impact:** ⭐⭐⭐⭐ | **Complexity:** Medium | **Time:** 7-9 days

**Problem Solved:**

- Multi-party signature coordination is complex
- No template library for common patterns
- Status tracking requires manual polling

**Key Features:**

- Template library (escrow, time-lock, vesting, atomic swap)
- Multi-party signature collection
- Status tracking with webhook support
- React hooks integration

```typescript
import { EscrowTemplate } from "@hieco/scheduled";

const escrow = EscrowTemplate.create({
  buyer: "0.0.1111",
  seller: "0.0.2222",
  arbitrator: "0.0.3333",
  amount: Hbar.from(100),
  threshold: 2,
});

await escrow.addSignature(buyerSignature);
await escrow.addSignature(arbitratorSignature);
await escrow.execute(); // Auto-executes when threshold reached
```

---

### 3. `@hieco/devtools` - Transaction Builder & Debugger

**Impact:** ⭐⭐⭐⭐⭐ | **Complexity:** Medium | **Time:** 8-10 days

**Problem Solved:**

- Building complex transactions requires deep SDK knowledge
- Debugging failures is painful
- Cryptic error messages

**Key Features:**

- Chainable, type-safe transaction builder
- Dry-run simulation without network submission
- Fee prediction before execution
- Visual transaction inspector

```typescript
import { TransactionBuilder, Debugger } from "@hieco/devtools";

const tx = TransactionBuilder.tokenTransfer()
  .tokenId("0.0.4567")
  .from("0.0.1234")
  .to("0.0.9876", 100)
  .build();

const report = await Debugger.simulate(tx, { network: "testnet" });
// Returns: { valid, estimatedFee, warnings, requiredSignatures }
```

---

### 4. `@hieco/mirror-realtime` - WebSocket Subscription Client

**Impact:** ⭐⭐⭐⭐ | **Complexity:** Medium | **Time:** 5-7 days

**Problem Solved:**

- Mirror Node REST API is polling-only
- No real-time updates for transactions/balances
- Manual polling is inefficient

**Key Features:**

- WebSocket subscription client
- Account transaction streaming
- Token transfer notifications
- Auto-reconnect with exponential backoff

```typescript
import { MirrorRealtimeClient } from "@hieco/mirror-realtime";

const client = new MirrorRealtimeClient("testnet");

client.subscribe.accountTransactions("0.0.1234", {
  onTransaction: (tx) => console.log("New tx:", tx),
  onError: (err) => console.error(err),
});
```

---

### 5. `@hieco/vault` - Secure Key Management

**Impact:** ⭐⭐⭐ | **Complexity:** Medium | **Time:** 5-7 days

**Problem Solved:**

- Private keys in .env files leak
- No secure abstraction for signing operations
- Hardware wallet integration missing

**Key Features:**

- Unified key management interface
- Environment variable support
- Keystore file support
- Ledger hardware wallet integration

```typescript
import { Vault, KeyLocation } from "@hieco/vault";

const vault = Vault.create();
vault.addKey(KeyLocation.env("MY_PRIVATE_KEY"));
vault.addKey(KeyLocation.ledger());

const signed = await vault.sign(transaction, { accountId: "0.0.1234" });
```

---

### 6. `@hieco/mirror-vue` - Vue Adapter

**Impact:** ⭐⭐⭐ | **Complexity:** Low | **Time:** 3-4 days

**Problem Solved:**

- Vue developers need Mirror Node integration
- Inconsistent API across frameworks

**Key Features:**

- Vue 3 composables mirroring React hooks
- Nuxt 3 integration
- TypeScript support

```typescript
import { useAccountBalance, useContractRead } from "@hieco/mirror-vue";

const { balance, loading } = useAccountBalance("0.0.1234");
```

---

### 7. `@hieco/cli` - Developer CLI

**Impact:** ⭐⭐⭐ | **Complexity:** Low | **Time:** 4-5 days

**Problem Solved:**

- Common operations require writing scripts
- No unified developer tool

**Key Features:**

- Account management
- Transaction building (interactive)
- Monitoring and watch mode
- Local development server

```bash
hieco account:create testnet
hieco tx:build --type token-transfer
hieco monitor:account 0.0.1234 --watch
```

---

## Priority Roadmap

### Phase 1: Foundation (Weeks 1-2)

| Package            | Rationale                                        |
| ------------------ | ------------------------------------------------ |
| `@hieco/testing`   | Enables better development of all other packages |
| `@hieco/scheduled` | Fills documented gap, unique in ecosystem        |
| `@hieco/devtools`  | Maximum DX improvement                           |

### Phase 2: Realtime & Security (Weeks 3-4)

| Package                  | Rationale                       |
| ------------------------ | ------------------------------- |
| `@hieco/mirror-realtime` | Critical for modern dApp UX     |
| `@hieco/vault`           | Production security requirement |

### Phase 3: Framework Expansion (Week 5)

| Package             | Rationale                      |
| ------------------- | ------------------------------ |
| `@hieco/mirror-vue` | Vue has 20%+ market share      |
| `@hieco/cli`        | Developer productivity booster |

---

## Comparative Analysis

### Testing Landscape (2025-2026)

| Framework | Speed      | TypeScript | DX         | Ecosystem |
| --------- | ---------- | ---------- | ---------- | --------- |
| Vitest    | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Growing   |
| Bun Test  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   | Built-in  |
| Jest      | ⭐⭐       | ⭐⭐⭐     | ⭐⭐⭐     | Mature    |

### Mock Server Comparison

| Tool  | Browser | Node | Client Agnostic | Type Safety |
| ----- | ------- | ---- | --------------- | ----------- |
| MSW   | ✅      | ✅   | ✅              | ⭐⭐⭐⭐⭐  |
| Nock  | ❌      | ✅   | Partial         | ⭐⭐⭐      |
| Polly | ✅      | ✅   | ✅              | ⭐⭐⭐      |

---

## Success Metrics

### 3-Month Targets

- 100+ GitHub stars across packages
- 500+ weekly NPM downloads
- 10+ public projects using library
- Positive feedback in Hiero Discord

### 6-Month Targets

- 500+ GitHub stars
- 2,000+ weekly downloads
- 50+ public projects
- Mention in official Hiero docs

---

## Related Documents

- [Hiero Bounty Deep-Dive](../02-bounty-research/hiero-deep-dive.md)
- [hieco Unified Ecosystem](../03-proposals/hieco-unified-ecosystem.md)
- [Testing PRD](./testing-prd.md) - Detailed PRD for `@hieco/testing`

---

_Document Version: 1.0_
_Last Updated: 2026-02-25_
_Author: @pow_
_License: MIT_
