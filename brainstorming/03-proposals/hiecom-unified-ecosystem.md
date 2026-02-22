# @hiecom: Unified Hiero Community Frontend Ecosystem

**Hackathon:** Hedera Hello Future Apex Hackathon 2026
**Bounty Pool:** $8,000 (Hiero Developer Tooling Track)
**Project:** Community-driven unified frontend integration ecosystem
**Namespace:** `@hiecom/*` (Hiero Community)
**Timeline:** 5 weeks (February - March 2026)

---

## Executive Summary

The `@hiecom` ecosystem consolidates all Hiero frontend integration efforts under a unified community namespace, providing consistent, well-tested, and framework-idiomatic SDKs for **React, Svelte, Vue, Solid, and Qwik**. This comprehensive monorepo eliminates duplication, establishes best practices, and accelerates Hiero dApp development across the entire frontend ecosystem.

### Vision

A single, cohesive ecosystem where every frontend developer can integrate Hiero blockchain functionality using their preferred framework's idioms and patterns, backed by shared core utilities, comprehensive testing, and unified documentation.

### Differentiation from Official Examples

The official hackathon examples focus on:
1. ❌ TypeScript Mirror Node client
2. ❌ Scheduled transactions helper
3. ❌ React/Next.js integration kit

The `@hiecom` ecosystem **transcends** these by providing:
- ✅ **Multi-framework coverage** (React, Svelte, Vue, Solid, Qwik) - not just React
- ✅ **Monorepo architecture** with shared core utilities and testing infrastructure
- ✅ **Framework-specific idioms** (hooks for React, stores for Svelte, composables for Vue, signals for Solid, loadables for Qwik)
- ✅ **Unified type definitions** across all frameworks via shared TypeScript types package
- ✅ **Zero-config setup** with sensible defaults for all frameworks
- ✅ **Comprehensive documentation** with cross-framework examples

---

## Table of Contents

1. [Technical Analysis of Hiero API Capabilities](#technical-analysis-of-hiero-api-capabilities)
2. [Current Ecosystem Gap Analysis](#current-ecosystem-gap-analysis)
3. [Architecture Design](#architecture-design)
4. [Package Hierarchy](#package-hierarchy)
5. [Framework Implementation Specifications](#framework-implementation-specifications)
6. [Monorepo Structure](#monorepo-structure)
7. [Testing Strategy](#testing-strategy)
8. [Deployment and Distribution](#deployment-and-distribution)
9. [Implementation Roadmap](#implementation-roadmap)
10. [Feasibility Validation](#feasibility-validation)

---

## Technical Analysis of Hiero API Capabilities

### Core SDK Transaction API

Based on Context7 queries and official Hiero SDK documentation, the following transaction APIs are available:

#### Transaction Base Class
```typescript
class Transaction {
  // Byte serialization
  static fromBytes(bytes: Uint8Array): Transaction;
  toBytes(): Uint8Array;

  // Signing
  signWithOperator(client: Client): Transaction;
  signWith(keypair: PrivateKey): Transaction;
  addSignature(publicKey: PublicKey, signature: Uint8Array): Transaction;

  // Execution
  execute(client: Client): TransactionResponse;
  setTransactionValidDuration(seconds: number): Transaction;

  // State
  freeze(): Transaction;
  isFrozen(): boolean;
  setMaxTransactionFee(fee: Hbar): Transaction;
  setTransactionMemo(memo: string): Transaction;
}
```

#### TransferTransaction
```typescript
class TransferTransaction extends Transaction {
  addHbarTransfer(accountId: AccountId, amount: Hbar): TransferTransaction;
  addTokenTransfer(tokenId: TokenId, accountId: AccountId, amount: bigint): TransferTransaction;
}
```

#### Contract Operations
```typescript
// Contract queries
class ContractCallQuery extends Query<ContractFunctionResult> {
  setContractId(contractId: ContractId): ContractCallQuery;
  setGas(gas: bigint): ContractCallQuery;
  setFunctionParameters(functionName: string, args: FunctionParameters): ContractCallQuery;
}

// Contract execution
class ContractExecuteTransaction extends Transaction {
  setContractId(contractId: ContractId): ContractExecuteTransaction;
  setGas(gas: bigint): ContractExecuteTransaction;
  setFunctionParameters(functionName: string, args: FunctionParameters): ContractExecuteTransaction;
  setPayableAmount(amount: Hbar): ContractExecuteTransaction;
}

// Contract creation
class ContractCreateTransaction extends Transaction {
  setBytecode(bytecode: Uint8Array): ContractCreateTransaction;
  setGas(gas: bigint): ContractCreateTransaction;
  setConstructorParameters(constructor: FunctionParameters): ContractCreateTransaction;
  setAdminKey(key: Key): ContractCreateTransaction;
}
```

#### File Operations
```typescript
class FileCreateTransaction extends Transaction {
  setContents(contents: Uint8Array): FileCreateTransaction;
  setKeys(keys: Key[]): FileCreateTransaction;
}

class FileUpdateTransaction extends Transaction {
  setFileId(fileId: FileId): FileUpdateTransaction;
  setContents(contents: Uint8Array): FileUpdateTransaction;
}

class FileDeleteTransaction extends Transaction {
  setFileId(fileId: FileId): FileDeleteTransaction;
}
```

#### Account Operations
```typescript
class AccountUpdateTransaction extends Transaction {
  setAccountId(accountId: AccountId): AccountUpdateTransaction;
  setKey(key: Key): AccountUpdateTransaction;
}

class AccountRecordsQuery extends Query<TransactionRecord[]> {
  setAccountId(accountId: AccountId): AccountRecordsQuery;
}

class AccountStakersQuery extends Query<Staker[]> {
  setAccountId(accountId: AccountId): AccountStakersQuery;
}
```

#### Token Operations
```typescript
class TokenCreateTransaction extends Transaction {
  setTokenName(name: string): TokenCreateTransaction;
  setTokenSymbol(symbol: string): TokenCreateTransaction;
  setDecimals(decimals: number): TokenCreateTransaction;
  setInitialSupply(supply: bigint): TokenCreateTransaction;
  setTreasuryAccountId(accountId: AccountId): TokenCreateTransaction;
  setAdminKey(key: Key): TokenCreateTransaction;
  setSupplyKey(key: Key): TokenCreateTransaction;
  setFreezeKey(key: Key): TokenCreateTransaction;
  setWipeKey(key: Key): TokenCreateTransaction;
  setKycKey(key: Key): TokenCreateTransaction;
}

class TokenAssociateTransaction extends Transaction {
  setAccountId(accountId: AccountId): TokenAssociateTransaction;
  setTokenIds(tokenIds: TokenId[]): TokenAssociateTransaction;
}

class TokenDissociateTransaction extends Transaction {
  setAccountId(accountId: AccountId): TokenDissociateTransaction;
  setTokenIds(tokenIds: TokenId[]): TokenDissociateTransaction;
}
```

### Mirror Node REST API Endpoints

The Hiero Mirror Node provides REST endpoints for historical data:

#### Accounts
- `GET /api/v1/accounts/{accountId}` - Account information
- `GET /api/v1/accounts/{accountId}/tokens` - Account token balances
- `GET /api/v1/accounts/{accountId}/nfts` - Account NFTs

#### Transactions
- `GET /api/v1/transactions` - Transaction list with pagination
- `GET /api/v1/transactions/{transactionId}` - Transaction details
- `GET /api/v1/transactions/{transactionId}/statechanges` - State changes

#### Contracts
- `GET /api/v1/contracts/{contractId}` - Contract information
- `GET /api/v1/contracts/{contractId}/results` - Contract execution results

#### Tokens
- `GET /api/v1/tokens` - Token list
- `GET /api/v1/tokens/{tokenId}` - Token details
- `GET /api/v1/tokens/{tokenId}/nfts` - Token NFTs

#### Topics (HCS)
- `GET /api/v1/topics/{topicId}/messages` - Topic messages

#### Network
- `GET /api/v1/network/exchangerate` - Hbar exchange rate
- `GET /api/v1/accounts/{accountId}/balances` - Account balance at timestamp

### Network Configuration

Hiero supports multiple networks:

```typescript
interface NetworkConfig {
  mainnet: {
    '0.0.3': '35.237.200.180:50211',
    '0.0.4': '35.186.191.247:50211',
    // ... 20+ nodes
  };
  testnet: {
    '0.0.3': '35.237.200.180:50211',
    // ... testnet nodes
  };
  previewnet: {
    '0.0.3': '35.237.200.180:50211',
    // ... previewnet nodes
  };
  local: {
    '0.0.3': '127.0.0.1:50211',
    // ... local node
  };
}
```

### Key Constraints and Considerations

1. **Transaction Fees:** All transactions require Hbar payment. Fee estimation is critical for UX.
2. **Transaction Duration:** Default 120 seconds. Must be set before execution.
3. **Consensus:** Transactions take 2-3 seconds for consensus confirmation.
4. **Rate Limits:** Mirror Node has rate limits (varies by network).
5. **Transaction Size:** Maximum transaction size is ~6KB.
6. **Gas Limits:** Contract calls require explicit gas specification.
7. **Key Management:** Multiple key types (ED25519, ECDSA secp256k1, ContractID, ThresholdKey).

---

## Current Ecosystem Gap Analysis

### Existing Solutions

#### Official Hiero SDKs
- ✅ **@hashgraph/sdk** - Core JavaScript/TypeScript SDK
- ✅ **hiero-enterprise-java** - Enterprise Java integration
- ✅ **hiero-cli** - Command-line interface
- ✅ **hiero-local-node** - Local development node
- ✅ **hiero-mirror-node** - Mirror node implementation

#### Community Projects (Identified via Research)

**React-Specific:**
- ✅ `svelte-web3` - Svelte store wrappers for Web3.js (Ethereum-focused)
- ✅ `ethers-svelte` - Ethers.js as Svelte stores (Ethereum-focused)
- ✅ `sveeeth` - Wagmi wrapper for Svelte (Ethereum-focused)
- ✅ `@thewuh/wallet-adapter-svelte` - Solana wallet adapter for Svelte

**Vue-Specific:**
- ✅ `@wagmi/vue` - Vue composables for Ethereum (via Wagmi)
- ✅ `use-wagmi` - Vue Composition API for Ethereum (Wagmi-based)
- ✅ `@web3auth/modal/vue` - Web3Auth Vue SDK

**SolidJS-Specific:**
- ✅ `solid-algo-wallets` - Algorand wallet integration for SolidJS
- ⚠️ Limited Web3/blockchain integration examples

**Qwik-Specific:**
- ✅ `qwik-web3auth` - Web3Auth integration for Qwik
- ⚠️ Very limited Web3/blockchain integration patterns

#### Critical Gaps

1. **No Hiero-Specific Framework Integrations:** All existing projects focus on Ethereum or other chains.
2. **No Unified Type System:** Each framework has its own type definitions.
3. **No Shared Testing Infrastructure:** Each project has isolated test setups.
4. **No Unified Documentation:** Framework-specific docs scattered across multiple repos.
5. **No Multi-Framework Coverage:** Most projects support only one framework.
6. **No Mirror Node Type Safety:** All Mirror Node queries are untyped `any` responses.

---

## Architecture Design

### Design Principles

1. **Framework-Idiomatic API:** Each framework SDK uses its native patterns (hooks, stores, composables, signals, loadables)
2. **Shared Core:** All frameworks share a common core package with types and utilities
3. **Zero-Config Setup:** Sensible defaults with optional configuration
4. **Type Safety:** Full TypeScript support with generated types for all APIs
5. **Tree-Shakeable:** Minimum bundle size impact
6. **Test-Driven:** Comprehensive test coverage with shared test utilities
7. **Documentation-First:** Unified docs site with cross-framework examples

### Architectural Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                     Framework Integrations                       │
│  (@hiecom/react)  (@hiecom/svelte)  (@hiecom/vue)  (@hiecom/solid)  (@hiecom/qwik) │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      @hiecom/core                                │
│  - TypeScript types                                             │
│  - Client wrappers                                              │
│  - Query builders                                                │
│  - Error handling                                                │
│  - Utilities                                                     │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     @hashgraph/sdk                               │
│  (Official Hiero SDK)                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Package Dependencies

```
@hiecom/react
  └── @hiecom/core

@hiecom/svelte
  └── @hiecom/core

@hiecom/vue
  └── @hiecom/core

@hiecom/solid
  └── @hiecom/core

@hiecom/qwik
  └── @hiecom/core

@hiecom/core
  ├── @hashgraph/sdk (peer dependency)
  └── @hiecom/types (optional, for Mirror Node types)
```

---

## Package Hierarchy

### Core Packages

#### `@hiecom/core`

**Purpose:** Shared utilities, types, and client wrappers used by all framework packages.

**Exports:**

```typescript
// Client management
export { createClient, ClientConfig } from './client';
export { HieroClient } from './client/hiero-client';

// Transaction builders
export { TransactionBuilder } from './builders/transaction';
export { ContractCallBuilder } from './builders/contract';
export { TransferBuilder } from './builders/transfer';

// Type definitions
export * from './types';

// Error handling
export { HieroError, HieroErrorCodes } from './errors';

// Utilities
export { formatHbar, parseHbar } from './utils/hbar';
export { toAccountId, toTokenId, toContractId } from './utils/converters';
export { estimateFee } from './utils/fees';
```

**Key Classes:**

```typescript
// HieroClient - Wrapper around @hashgraph/sdk Client
class HieroClient {
  constructor(config: ClientConfig);

  // Account management
  getAccountBalance(accountId: AccountId): Promise<Hbar>;
  getAccountInfo(accountId: AccountId): Promise<AccountInfo>;

  // Transactions
  sendTransaction(tx: Transaction): Promise<TransactionResponse>;
  simulateTransaction(tx: Transaction): Promise<SimulationResult>;

  // Contracts
  callContract(request: ContractCallRequest): Promise<ContractFunctionResult>;
  deployContract(bytecode: Uint8Array, gas: bigint): Promise<ContractId>;

  // Queries
  getTransactionRecord(transactionId: TransactionId): Promise<TransactionRecord>;
  getContractInfo(contractId: ContractId): Promise<ContractInfo>;

  // Mirror Node
  mirrorNode: MirrorNodeClient;
}

// MirrorNodeClient - Type-safe Mirror Node queries
class MirrorNodeClient {
  constructor(network: Network, apiKey?: string);

  // Accounts
  getAccount(accountId: AccountId): Promise<MirrorAccount>;
  getAccountBalances(accountId: AccountId): Promise<TokenBalance[]>;
  getAccountNfts(accountId: AccountId): Promise<Nft[]>;

  // Transactions
  getTransactions(filters: TransactionFilters): Promise<Paginated<Transaction>>;
  getTransaction(transactionId: TransactionId): Promise<MirrorTransaction>;

  // Contracts
  getContract(contractId: ContractId): Promise<MirrorContract>;
  getContractResults(contractId: ContractId): Promise<ContractResult[]>;

  // Tokens
  getTokens(filters?: TokenFilters): Promise<Paginated<Token>>;
  getToken(tokenId: TokenId): Promise<MirrorToken>;

  // Topics (HCS)
  getTopicMessages(topicId: TopicId, filters?: MessageFilters): Promise<Paginated<TopicMessage>>;
}

// TransactionBuilder - Fluent transaction construction
class TransactionBuilder {
  transfer(): TransferBuilder;
  tokenTransfer(): TokenTransferBuilder;
  contractCall(): ContractCallBuilder;
  contractCreate(): ContractCreateBuilder;
  tokenCreate(): TokenCreateBuilder;
  tokenAssociate(): TokenAssociateBuilder;
}
```

#### `@hiecom/types`

**Purpose:** TypeScript type definitions for Mirror Node API responses and common types.

**Generated from:** OpenAPI spec (if available) or manually maintained.

**Exports:**

```typescript
// Mirror Node types
export interface MirrorAccount {
  account: string;
  balance: Hbar;
  account_balance: TokenBalance[];
  evm_address?: string;
  key?: Key;
  // ... full Mirror Node account schema
}

export interface MirrorTransaction {
  transaction_id: string;
  transaction_hash: string;
  name: string;
  valid_start_timestamp: string;
  consensus_timestamp: string;
  transfers: Transfer[];
  token_transfers: TokenTransfer[];
  // ... full schema
}

export interface Paginated<T> {
  data: T[];
  links: {
    next?: string;
    prev?: string;
  };
}

// Common types
export type Network = 'mainnet' | 'testnet' | 'previewnet' | 'local';

export interface ClientConfig {
  network: Network;
  operator?: {
    accountId: AccountId | string;
    privateKey: PrivateKey | string;
  };
  mirrorNode?: {
    url?: string;
    apiKey?: string;
  };
}
```

### Framework Packages

#### `@hiecom/react`

**Framework Version:** React 16.8+ (hooks), React 18+ (concurrent features)

**Primary Idiom:** React Hooks

**Key Hooks:**

```typescript
// Client and connection
export function useClient(config?: ClientConfig): HieroClient;
export function useNetwork(): Network;
export function useConnectionStatus(): ConnectionStatus;

// Account management
export function useAccount(accountId?: AccountId): AccountInfo | null;
export function useBalance(accountId: AccountId): Hbar | null;
export function useMultiSigAccounts(): MultiSigAccount[];

// Transactions
export function useSignTransaction(): (
  transaction: Transaction
) => Promise<TransactionResponse>;
export function useSendTransaction(): (
  transaction: Transaction
) => Promise<TransactionResponse>;

// Contracts
export function useContractCall(
  contractId: ContractId,
  functionName: string,
  args?: unknown[]
): ContractCallResult;
export function useContractCallQuery(
  contractId: ContractId,
  functionName: string,
  args?: unknown[]
): QueryObserver<ContractFunctionResult>;

// Mirror Node
export function useAccountMirror(accountId: AccountId): MirrorAccount | null;
export function useTransactions(
  filters?: TransactionFilters
): Paginated<Transaction>;
export function useTokenBalances(accountId: AccountId): TokenBalance[];

// Utilities
export function useFeeEstimator(transaction: Transaction): Hbar | null;
export function useTransactionHistory(accountId: AccountId): TransactionRecord[];
```

**Example Usage:**

```tsx
import { useClient, useAccount, useBalance, useContractCallQuery } from '@hiecom/react';

function MyDapp() {
  const client = useClient({ network: 'testnet' });
  const account = useAccount();
  const balance = useBalance(account?.accountId);
  const { data: totalSupply, isLoading } = useContractCallQuery(
    tokenContractId,
    'totalSupply',
    []
  );

  return (
    <div>
      <p>Balance: {balance?.toString()} ℏ</p>
      <p>Total Supply: {isLoading ? 'Loading...' : totalSupply?.toString()}</p>
    </div>
  );
}
```

#### `@hiecom/svelte`

**Framework Version:** Svelte 4+ (stores), Svelte 5+ (runes)

**Primary Idioms:** Svelte Stores (+ Runes for Svelte 5)

**Key Stores:**

```typescript
// Client and connection
export const client: Readable<HieroClient>;
export const network: Readable<Network>;
export const connectionStatus: Readable<ConnectionStatus>;

// Account management
export const account: Readable<AccountInfo | null>;
export const balance: Readable<Hbar | null>;

// Derived stores
export const isConnected: Readable<boolean>;

// Actions
export function connectWallet(): Promise<void>;
export function disconnectWallet(): void;
export function switchNetwork(network: Network): Promise<void>;

// Contract stores
export function createContractStore(
  contractId: ContractId
): {
  subscribe: Readable<ContractState>;
  call: (functionName: string, args: unknown[]) => Promise<ContractFunctionResult>;
};

// Mirror Node stores
export function createAccountMirrorStore(accountId: AccountId): Readable<MirrorAccount>;
export function createTransactionsStore(filters?: TransactionFilters): Readable<Paginated<Transaction>>;
```

**Example Usage (Svelte 4):**

```svelte
<script>
  import { client, account, balance, createContractStore } from '@hiecom/svelte';
  import { onMount } from 'svelte';

  const tokenContract = createContractStore(tokenContractId);

  onMount(async () => {
    const result = await tokenContract.call('totalSupply', []);
    console.log('Total supply:', result);
  });
</script>

{#if $account}
  <p>Account: {$account.accountId.toString()}</p>
  <p>Balance: {$balance?.toString() || '0'} ℏ</p>
{/if}
```

**Example Usage (Svelte 5 Runes):**

```svelte
<script>
  import { client, account, balance } from '@hiecom/svelte';
  import { onMount } from 'svelte';

  let totalSupply = $state<bigint>();

  onMount(async () => {
    const result = await $client.callContract({
      contractId: tokenContractId,
      functionName: 'totalSupply',
      args: []
    });
    totalSupply = result.asBigInt();
  });
</script>

<p>Total Supply: {totalSupply?.toString() || 'Loading...'}</p>
```

#### `@hiecom/vue`

**Framework Version:** Vue 3.2+ (Composition API)

**Primary Idioms:** Vue Composables

**Key Composables:**

```typescript
// Client and connection
export function useClient(config?: ClientConfig): Ref<HieroClient>;
export function useNetwork(): Ref<Network>;
export function useConnectionStatus(): Ref<ConnectionStatus>;

// Account management
export function useAccount(): Ref<AccountInfo | null>;
export function useBalance(accountId?: AccountId): Ref<Hbar | null>;

// Actions
export function useConnect(): { connect: () => Promise<void>; disconnect: () => void };
export function useSwitchNetwork(): { switchNetwork: (network: Network) => Promise<void> };

// Contract composables
export function useContractCall(
  contractId: ContractId,
  functionName: string,
  args?: Ref<unknown[]>
): { data: Ref<ContractFunctionResult | null>, error: Ref<Error | null>, execute: () => Promise<void> };

export function useContractState(
  contractId: ContractId,
  refreshInterval?: number
): { state: Ref<ContractState>, refresh: () => Promise<void> };

// Mirror Node composables
export function useAccountMirror(accountId: AccountId): { data: Ref<MirrorAccount | null>, loading: Ref<boolean> };
export function useTransactions(filters?: TransactionFilters): { data: Ref<Paginated<Transaction>>, loading: Ref<boolean> };
```

**Example Usage:**

```vue
<script setup lang="ts">
import { useClient, useAccount, useBalance, useContractCall } from '@hiecom/vue';

const client = useClient({ network: 'testnet' });
const account = useAccount();
const balance = useBalance(computed(() => account.value?.accountId));

const { data: totalSupply, execute } = useContractCall(
  tokenContractId,
  'totalSupply',
  []
);

onMounted(() => execute());
</script>

<template>
  <div>
    <p v-if="account">Balance: {{ balance?.toString() }} ℏ</p>
    <p>Total Supply: {{ totalSupply?.toString() || 'Loading...' }}</p>
  </div>
</template>
```

#### `@hiecom/solid`

**Framework Version:** SolidJS 1.8+

**Primary Idioms:** Solid Signals and Reactive Primitives

**Key Functions:**

```typescript
// Client and connection
export function createClient(config?: ClientConfig): Accessor<HieroClient>;
export function createNetwork(): Accessor<Network>;
export function createConnectionStatus(): Accessor<ConnectionStatus>;

// Account management
export function createAccount(): Accessor<AccountInfo | null>;
export function createBalance(accountId?: Accessor<AccountId>): Accessor<Hbar | null>;

// Actions
export function createConnect(): {
  connect: () => Promise<void>;
  disconnect: () => void;
  connecting: Accessor<boolean>;
};

export function createSwitchNetwork(): {
  switchNetwork: (network: Network) => Promise<void>;
  switching: Accessor<boolean>;
};

// Contract functions
export function createContractCall(
  contractId: Accessor<ContractId>,
  functionName: string,
  args?: Accessor<unknown[]>
): {
  data: Accessor<ContractFunctionResult | null>;
  call: () => Promise<void>;
  loading: Accessor<boolean>;
};

// Mirror Node functions
export function createAccountMirror(accountId: Accessor<AccountId>): {
  data: Accessor<MirrorAccount | null>;
  loading: Accessor<boolean>;
  refetch: () => Promise<void>;
};

export function createTransactions(filters?: Accessor<TransactionFilters>): {
  data: Accessor<Paginated<Transaction>>;
  loading: Accessor<boolean>;
};
```

**Example Usage:**

```tsx
import { createClient, createAccount, createBalance, createContractCall } from '@hiecom/solid';
import { createMemo, onMount } from 'solid-js';

function MyDapp() {
  const client = createClient({ network: 'testnet' });
  const account = createAccount();
  const balance = createBalance(() => account()?.accountId);

  const totalSupply = createContractCall(
    () => tokenContractId,
    'totalSupply',
    () => []
  );

  onMount(() => {
    totalSupply.call();
  });

  return (
    <div>
      <p>Balance: {balance()?.toString() || '0'} ℏ</p>
      <p>Total Supply: {totalSupply.data()?.toString() || 'Loading...'}</p>
    </div>
  );
}
```

#### `@hiecom/qwik`

**Framework Version:** Qwik 1.0+

**Primary Idioms:** Qwik Loadables and `$` suffix functions

**Key Functions:**

```typescript
// Client and connection (server-side)
export function useClient(config?: ClientConfig): HieroClient;
export function useNetwork(): Signal<Network>;
export function useConnectionStatus(): Signal<ConnectionStatus>;

// Account management (loadables for SSR)
export function useAccount(): Signal<AccountInfo | null>;
export function useBalance(accountId?: Signal<AccountId>): Signal<Hbar | null>;

// Actions ( `$` suffix for Qwik)
export const useConnect$ = $(async () => Promise<void>);
export const useDisconnect$ = $(async () => Promise<void>);
export const useSwitchNetwork$ = $(async (network: Network) => Promise<void>);

// Contract loadables
export function useContractCall(
  contractId: Signal<ContractId>,
  functionName: string,
  args?: Signal<unknown[]>
): {
  data: Signal<ContractFunctionResult | null>;
  loading: Signal<boolean>;
  call$: QRL<() => Promise<void>>;
};

// Mirror Node loadables
export function useAccountMirror(accountId: Signal<AccountId>): {
  data: Signal<MirrorAccount | null>;
  loading: Signal<boolean>;
};

export function useTransactions(filters?: Signal<TransactionFilters>): {
  data: Signal<Paginated<Transaction>>;
  loading: Signal<boolean>;
};
```

**Example Usage:**

```tsx
import { component$, useSignal } from '@builder.io/qwik';
import { useClient, useAccount, useBalance, useContractCall } from '@hiecom/qwik';

export const MyDapp = component$(() => {
  const client = useClient({ network: 'testnet' });
  const account = useAccount();
  const balance = useBalance(account.value?.accountId);

  const totalSupply = useContractCall(
    tokenContractId,
    'totalSupply',
    []
  );

  return (
    <div>
      <p>Balance: {balance.value?.toString() || '0'} ℏ</p>
      <p>Total Supply: {totalSupply.data.value?.toString() || 'Loading...'}</p>
    </div>
  );
});
```

---

## Monorepo Structure

### Tooling Selection

Based on 2025-2026 best practices research:

- **Package Manager:** `pnpm` (strict dependencies, efficient workspace linking)
- **Build Orchestration:** `Turborepo` (simple, fast, excellent caching)
- **Testing:** `Vitest` (fast, unified with Vite, great watch mode)
- **Linting:** `ESLint` with TypeScript support
- **Formatting:** `Prettier`
- **Documentation:** `VitePress` (Vue-powered, excellent docs experience)

### Directory Structure

```
@hiecom/
├── apps/
│   ├── docs/                    # VitePress documentation site
│   │   ├── .vitepress/
│   │   ├── guide/
│   │   ├── reference/
│   │   └── examples/
│   │
│   └── playground/              # Multi-framework demo app
│       ├── react/
│       ├── svelte/
│       ├── vue/
│       ├── solid/
│       └── qwik/
│
├── packages/
│   ├── core/                    # @hiecom/core
│   │   ├── src/
│   │   │   ├── client/
│   │   │   ├── builders/
│   │   │   ├── types/
│   │   │   ├── errors/
│   │   │   └── utils/
│   │   ├── test/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── types/                   # @hiecom/types
│   │   ├── src/
│   │   │   ├── mirror-node/
│   │   │   ├── transactions/
│   │   │   └── contracts/
│   │   ├── test/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── react/                   # @hiecom/react
│   │   ├── src/
│   │   │   ├── hooks/
│   │   │   ├── components/
│   │   │   └── utils/
│   │   ├── test/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── svelte/                  # @hiecom/svelte
│   │   ├── src/
│   │   │   ├── stores/
│   │   │   ├── components/
│   │   │   └── actions/
│   │   ├── test/
│   │   ├── package.json
│   │   └── svelte.config.js
│   │
│   ├── vue/                     # @hiecom/vue
│   │   ├── src/
│   │   │   ├── composables/
│   │   │   ├── components/
│   │   │   └── utils/
│   │   ├── test/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── solid/                   # @hiecom/solid
│   │   ├── src/
│   │   │   ├── primitives/
│   │   │   ├── components/
│   │   │   └── utils/
│   │   ├── test/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── qwik/                    # @hiecom/qwik
│       ├── src/
│       │   ├── loadables/
│       │   ├── components/
│       │   └── utils/
│       ├── test/
│       ├── package.json
│       └── tsconfig.json
│
├── tools/
│   ├── eslint-config/           # Shared ESLint config
│   ├── typescript-config/       # Shared TypeScript config
│   └── test-utils/              # Shared testing utilities
│
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
├── tsconfig.base.json
├── .prettierrc
├── .eslintrc.js
└── README.md
```

### Configuration Files

#### `pnpm-workspace.yaml`

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tools/*'
```

#### `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.vitepress/cache/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

#### Root `package.json`

```json
{
  "name": "@hiecom/monorepo",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "prettier": "^3.2.0",
    "turbo": "^2.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.2.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

#### `tsconfig.base.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

---

## Testing Strategy

### Testing Pyramid

```
                    ┌─────────────┐
                    │   E2E       │  (Playwright, multi-framework)
                    │   (5%)      │
                    ├─────────────┤
                    │ Integration │  (Framework-agnostic)
                    │   (20%)     │
                    ├─────────────┤
                    │   Unit      │  (Vitest, fast)
                    │   (75%)     │
                    └─────────────┘
```

### Unit Testing

**Tool:** Vitest (fast, native ESM, watch mode)

**Coverage:** Target 90%+ for core packages

**Example Test Structure:**

```typescript
// packages/core/test/client/hiero-client.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HieroClient } from '../src/client/hiero-client';

describe('HieroClient', () => {
  let client: HieroClient;

  beforeEach(() => {
    client = new HieroClient({
      network: 'testnet',
      operator: {
        accountId: '0.0.1000',
        privateKey: '0x...'
      }
    });
  });

  describe('getAccountBalance', () => {
    it('should return account balance', async () => {
      const balance = await client.getAccountBalance('0.0.1000');
      expect(balance).toBeDefined();
      expect(balance.toTinybars()).toBeGreaterThan(0n);
    });

    it('should throw for invalid account ID', async () => {
      await expect(client.getAccountBalance('invalid')).rejects.toThrow();
    });
  });

  describe('sendTransaction', () => {
    it('should send transaction and return receipt', async () => {
      const tx = new TransferTransaction()
        .addHbarTransfer('0.0.1000', -100)
        .addHbarTransfer('0.0.1001', 100);

      const receipt = await client.sendTransaction(tx);
      expect(receipt.status).toBe('SUCCESS');
    });
  });
});
```

### Integration Testing

**Tool:** Vitest with `@hiero/sdk` mock server or local node

**Scope:** Test framework packages with real SDK interactions (using local node)

**Example Test Structure:**

```typescript
// packages/react/test/integration/hooks.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useClient, useAccount, useBalance } from '@hiecom/react';
import { LocalNode } from '@hiero/local-node';

describe('useAccount Integration', () => {
  let localNode: LocalNode;

  beforeAll(async () => {
    localNode = new LocalNode();
    await localNode.start();
  });

  afterAll(async () => {
    await localNode.stop();
  });

  it('should fetch account balance', async () => {
    const { result } = renderHook(() => {
      const client = useClient({ network: 'local' });
      const account = useAccount();
      const balance = useBalance(account.current?.accountId);

      return { account, balance };
    });

    await waitFor(() => {
      expect(result.current.balance).toBeDefined();
    });
  });
});
```

### E2E Testing

**Tool:** Playwright (multi-browser, multi-framework)

**Scope:** Test full user flows across all framework examples

**Example Test Structure:**

```typescript
// apps/playground/tests/connect-wallet.spec.ts
import { test, expect, Page } from '@playwright/test';

test.describe('Connect Wallet Flow', () => {
  ['react', 'svelte', 'vue', 'solid', 'qwik'].forEach((framework) => {
    test.describe(`${framework}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.goto(`/${framework}`);
      });

      test('should display connect button', async ({ page }) => {
        await expect(page.locator('button:has-text("Connect")')).toBeVisible();
      });

      test('should connect wallet and show balance', async ({ page }) => {
        await page.click('button:has-text("Connect")');

        // Mock wallet connection
        await page.evaluate(() => {
          (window as any).ethereum = {
            request: async () => ({ result: ['0x123'] }),
            on: () => {}
          };
        });

        await page.click('button:has-text("Connect")');

        await expect(page.locator('text=/Balance:/')).toBeVisible();
      });
    });
  });
});
```

### Shared Test Utilities

**Location:** `tools/test-utils`

**Exports:**

```typescript
// Mock SDK client
export function createMockClient(): HieroClient;

// Mock account data
export function mockAccount(overrides?: Partial<AccountInfo>): AccountInfo;

// Mock transaction
export function mockTransaction(overrides?: Partial<Transaction>): Transaction;

// Test utilities
export function waitForCondition(condition: () => boolean, timeout?: number): Promise<void>;

// Framework-specific render helpers
export function renderWithClient(component: ReactElement, client?: HieroClient);
export function renderSvelteWithClient(component: Component, client?: HieroClient);
```

---

## Deployment and Distribution

### Publishing Strategy

#### Package Publishing

**Registry:** npm (public)

**Versioning:** Independent versioning per package using Changesets

**CI/CD:** GitHub Actions

**Workflow:**

1. Developer creates PR with changes
2. Automated tests run on all packages
3. When PR is merged to `main`, Changeset bot prompts for version bump
4. Developer adds changeset describing changes
5. Version PR is created
6. After merge, packages are published to npm

#### GitHub Actions Workflow

```yaml
# .github/workflows/publish.yml
name: Publish Packages

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: 'https://registry.npmjs.org'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Build Packages
        run: pnpm build

      - name: Run Tests
        run: pnpm test

      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

#### Release Script

```json
// Root package.json
{
  "scripts": {
    "release": "changeset publish",
    "version": "changeset version"
  }
}
```

#### Changesets Configuration

```json
// .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config@2.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

### Documentation Site

**Framework:** VitePress

**Deployment:** Vercel (automatic on push to `main`)

**URL:** `https://hieco.dev`

**Structure:**

```
apps/docs/
├── .vitepress/
│   ├── config.ts
│   ├── theme/
│   └── components/
├── guide/
│   ├── getting-started.md
│   ├── installation.md
│   ├── concepts.md
│   └── framework-guides/
│       ├── react.md
│       ├── svelte.md
│       ├── vue.md
│       ├── solid.md
│       └── qwik.md
├── reference/
│   ├── core.md
│   ├── react-api.md
│   ├── svelte-api.md
│   ├── vue-api.md
│   ├── solid-api.md
│   └── qwik-api.md
├── examples/
│   ├── counter-dapp.md
│   ├── token-sale.md
│   ├── nft-marketplace.md
│   └── voting-dapp.md
└── index.md
```

### Example Applications

**Location:** `apps/playground`

**Purpose:** Live demos of each framework integration

**Deployment:** Vercel (multi-framework app)

**URL:** `https://playground.hieco.dev`

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Goal:** Set up monorepo infrastructure and core utilities

**Tasks:**

- [x] Initialize Turborepo + pnpm workspace
- [ ] Create `@hiecom/types` package with Mirror Node types
- [ ] Implement `@hiecom/core` client wrappers
- [ ] Set up ESLint, Prettier, TypeScript configs
- [ ] Configure Vitest for unit testing
- [ ] Set up GitHub Actions CI pipeline
- [ ] Create initial documentation structure

**Deliverables:**

- Working monorepo with 3 packages: `@hiecom/types`, `@hiecom/core`, `@hiecom/react`
- CI/CD pipeline passing all tests
- Basic documentation site deployed

### Phase 2: React Integration (Week 2-3)

**Goal:** Complete React SDK with comprehensive hooks

**Tasks:**

- [ ] Implement `@hiecom/react` hooks
  - [ ] `useClient`, `useAccount`, `useBalance`
  - [ ] `useContractCall`, `useContractCallQuery`
  - [ ] `useSendTransaction`, `useSignTransaction`
  - [ ] `useAccountMirror`, `useTransactions`
- [ ] Add React-specific error boundaries
- [ ] Create example components (`ConnectButton`, `BalanceDisplay`)
- [ ] Write comprehensive tests (unit + integration)
- [ ] Create Counter DApp example

**Deliverables:**

- Full-featured `@hiecom/react` package published to npm
- Example Counter DApp deployed
- Documentation for all hooks

### Phase 3: Multi-Framework Expansion (Week 3-4)

**Goal:** Implement Svelte, Vue, Solid, and Qwik packages

**Tasks:**

- [ ] Implement `@hiecom/svelte` stores and actions
- [ ] Implement `@hiecom/vue` composables
- [ ] Implement `@hiecom/solid` reactive primitives
- [ ] Implement `@hiecom/qwik` loadables
- [ ] Create example components for each framework
- [ ] Write tests for each framework
- [ ] Create framework-specific documentation

**Deliverables:**

- All 5 framework packages published to npm
- Cross-framework examples in playground app
- Comprehensive documentation for each framework

### Phase 4: Polish and Optimization (Week 4-5)

**Goal:** Optimize bundle sizes, improve DX, finalize documentation

**Tasks:**

- [ ] Bundle size optimization and tree-shaking validation
- [ ] Performance benchmarking
- [ ] Add TypeScript strict mode support
- [ ] Create migration guide from `@hashgraph/sdk`
- [ ] Write "Getting Started" tutorial for each framework
- [ ] Create advanced examples (NFT marketplace, token sale)
- [ ] Add JSDoc comments for IDE autocomplete
- [ ] Create contributing guidelines
- [ ] Finalize demo videos

**Deliverables:**

- Optimized packages with minimal bundle impact
- Complete documentation site
- 3+ production-ready example apps
- Migration guide from vanilla SDK
- Demo video for hackathon submission

### Phase 5: Hackathon Submission (Week 5)

**Goal:** Finalize submission materials

**Tasks:**

- [ ] Record demo video (5-10 minutes)
- [ ] Write README for all packages
- [ ] Create submission description
- [ ] Prepare live demo environment
- [ ] Test all packages on testnet
- [ ] Gather community feedback
- [ ] Finalize pitch deck

**Deliverables:**

- Hackathon submission package
- Live demo working flawlessly
- Community engagement (Discord, Twitter)

---

## Feasibility Validation

### Technical Feasibility

#### Hiero SDK Compatibility

**Validated:** All required SDK functionality is available

- ✅ Client creation and configuration
- ✅ Transaction signing and execution
- ✅ Contract calls and queries
- ✅ Account and balance queries
- ✅ Mirror Node REST API access

**Potential Issues:**

- ⚠️ Mirror Node rate limits may affect query performance → Mitigation: Implement request caching and batching
- ⚠️ Transaction fee estimation requires network query → Mitigation: Use fee estimation with fallback to max fee
- ⚠️ Local node setup requires Docker → Mitigation: Provide Docker Compose config for easy setup

#### Framework Compatibility

**Research Findings:**

1. **React:** Extensive Web3 patterns exist (wagmi, viem). High confidence.
2. **Svelte:** Existing Web3 libraries (svelte-web3, ethers-svelte). High confidence.
3. **Vue:** Mature Vue 3 Web3 ecosystem (wagmi/vue). High confidence.
4. **SolidJS:** Limited Web3 examples but reactive primitives align well with reactive state. Medium confidence.
5. **Qwik:** Very limited Web3 examples (only qwik-web3auth). Medium-low confidence.

**Mitigation for Low-Confidence Frameworks:**

- Prioritize Solid and Qwik implementation after React/Svelte/Vue
- Leverage Qwik's `$` suffix functions for resumability
- Use Solid's signals directly mapped to reactive state
- Community outreach for early testing

### Implementation Timeline Validation

**Estimated Effort:**

| Package | Lines of Code | Implementation Days | Testing Days | Total |
|---------|---------------|---------------------|--------------|-------|
| @hiecom/types | ~1,500 | 3 | 1 | 4 |
| @hiecom/core | ~3,000 | 6 | 2 | 8 |
| @hiecom/react | ~2,000 | 5 | 2 | 7 |
| @hiecom/svelte | ~1,800 | 4 | 2 | 6 |
| @hiecom/vue | ~1,800 | 4 | 2 | 6 |
| @hiecom/solid | ~1,500 | 4 | 2 | 6 |
| @hiecom/qwik | ~1,500 | 5 | 2 | 7 |
| Infrastructure | N/A | 3 | 1 | 4 |
| Documentation | N/A | 4 | 0 | 4 |
| **Total** | **~13,100** | **38** | **14** | **52** |

**Timeline:** 52 days × 8 hours/day = 416 hours ≈ 10 weeks solo

**Hackathon Timeline:** 5 weeks

**Strategy:**

1. **Prioritize MVP:** Start with React only (Week 1-2)
2. **Parallelize:** Implement multiple frameworks in parallel after core is stable (Week 3-4)
3. **Simplify:** Reduce scope of initial release to essential features
4. **Community:** Recruit contributors for framework-specific implementation

**Revised MVP Timeline (5 Weeks):**

| Week | Focus | Deliverables |
|------|-------|--------------|
| 1 | Core + Types | `@hiecom/core`, `@hiecom/types` |
| 2 | React | `@hiecom/react` with core hooks |
| 3 | Svelte + Vue | `@hiecom/svelte`, `@hiecom/vue` |
| 4 | Solid + Qwik | `@hiecom/solid`, `@hiecom/qwik` |
| 5 | Polish + Docs | Documentation site, examples, submission |

### Resource Requirements

**Infrastructure:**

- GitHub repository (free)
- npm package publishing ($0 for public packages)
- Vercel deployment for docs and playground (free tier)
- Local Hiero node testing (Docker, free)

**External Dependencies:**

- `@hashgraph/sdk` (official, stable)
- `@hiero/local-node` (for testing)
- Framework SDKs (React, Svelte, Vue, Solid, Qwik)

**Skills Required:**

1. TypeScript (advanced)
2. All 5 frameworks (intermediate understanding sufficient)
3. Hiero SDK (documented, learnable)
4. Monorepo tooling (Turborepo, pnpm)

### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| SDK API changes during development | Low | High | Pin SDK version, create adapter layer |
| Framework-specific bugs | Medium | Medium | Extensive testing, community review |
| Insufficient time for all frameworks | High | High | Prioritize React/Svelte/Vue, defer Solid/Qwik |
| Low adoption due to competition | Medium | Medium | Focus on unified DX, multi-framework advantage |
| Mirror Node rate limits | Low | Medium | Implement caching, batch queries |
| Local node setup complexity | Medium | Low | Provide Docker Compose, clear docs |

---

## Submission Strategy

### Unique Value Propositions

1. **Multi-Fragmentation Solution:** First unified SDK covering 5 major frameworks
2. **Community Namespace:** `@hiecom/*` signals community-driven, not vendor-controlled
3. **Shared Infrastructure:** 70% code reuse across frameworks via `@hiecom/core`
4. **Zero-Duplication:** No existing Hiero-specific framework integrations exist
5. **Production Ready:** Comprehensive testing, documentation, examples

### Competitive Advantages

| Feature | @hiecom | Official Examples | Competitors (Ethereum) |
|---------|---------|-------------------|------------------------|
| Multi-framework | ✅ 5 frameworks | ❌ React only | ⚠️ 1-2 frameworks |
| Type-safe Mirror Node | ✅ Full TypeScript | ❌ Untyped | ⚠️ Partial |
| Shared core | ✅ `@hiecom/core` | ❌ No sharing | ❌ Isolated |
| Monorepo | ✅ Turborepo + pnpm | ❌ N/A | ⚠️ Varies |
| Documentation | ✅ Unified site | ❌ Scattered | ⚠️ Per-package |

### Hackathon Pitch

**Title:** `@hiecom`: The Unified Frontend Ecosystem for Hiero

**Problem:**
> "Hiero has excellent SDKs, but frontend developers are stuck reinventing the wheel for every framework. No type safety, no shared patterns, massive code duplication."

**Solution:**
> "A single, cohesive ecosystem providing idiomatic SDKs for React, Svelte, Vue, Solid, and Qwik—all built on shared core infrastructure with full TypeScript support."

**Impact:**
> "Accelerates dApp development 10x by eliminating boilerplate, providing type-safe APIs, and unifying best practices across the entire frontend ecosystem."

**Demo:**
1. Show Counter DApp built in 5 minutes with `@hiecom/react`
2. Show same Dapp in Svelte with 90% code reuse
3. Show type-safe Mirror Node queries preventing bugs
4. Show unified documentation site

### Success Metrics

- **Quantitative:**
  - 5 framework packages published to npm
  - 90%+ test coverage
  - 10,000+ total lines of code
  - 50+ pages of documentation

- **Qualitative:**
  - Zero existing Hiero-specific framework integrations
  - Idiomatic API for each framework (verified by community)
  - Production-ready examples
  - Clear migration path from vanilla SDK

---

## Conclusion

The `@hiecom` unified ecosystem represents a **paradigm shift** in Hiero frontend development:

1. **From scattered efforts** to **cohesive ecosystem**
2. **From boilerplate-heavy** to **zero-config**
3. **From untyped APIs** to **full TypeScript safety**
4. **From framework-specific** to **multi-framework coverage**
5. **From duplicative work** to **shared infrastructure**

By consolidating all Hiero frontend integration patterns under a single namespace, this project delivers:

- **Immediate value** for current developers (better DX, type safety, documentation)
- **Long-term sustainability** (community-driven, not vendor-controlled)
- **Scalability** (easy to add new frameworks or features)
- **Adoption acceleration** (low barrier to entry, familiar patterns)

The hackathon provides the perfect launchpad for this ecosystem, with potential to become the **de facto standard** for Hiero frontend development across all frameworks.

---

## Appendix

### A. Package Naming Convention

All packages follow the `@hiecom/*` namespace:

- `@hiecom/core` - Core utilities and client wrappers
- `@hiecom/types` - TypeScript type definitions
- `@hiecom/react` - React hooks and components
- `@hiecom/svelte` - Svelte stores and actions
- `@hiecom/vue` - Vue composables
- `@hiecom/solid` - Solid reactive primitives
- `@hiecom/qwik` - Qwik loadables

### B. Import Examples

```typescript
// React
import { useClient, useAccount, useBalance } from '@hiecom/react';

// Svelte
import { client, account, balance } from '@hiecom/svelte';

// Vue
import { useClient, useAccount, useBalance } from '@hiecom/vue';

// Solid
import { createClient, createAccount, createBalance } from '@hiecom/solid';

// Qwik
import { useClient, useAccount, useBalance } from '@hiecom/qwik';

// Core (any framework)
import { HieroClient, TransactionBuilder } from '@hiecom/core';
```

### C. Environment Variables

```bash
# .env.example
HIERO_NETWORK=testnet
HIERO_OPERATOR_ACCOUNT_ID=0.0.1000
HIERO_OPERATOR_PRIVATE_KEY=0x...
HIERO_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
HIERO_MIRROR_NODE_API_KEY=optional
```

### D. Contributing Guidelines

```markdown
# Contributing to @hiecom

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run `pnpm test` and `pnpm lint`
6. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.
```

---

**Document Version:** 1.0
**Last Updated:** 2026-02-22
**Author:** @abinovalfauzi
**License:** MIT (planned for all packages)
