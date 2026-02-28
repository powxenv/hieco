---
title: Additional Package Research for @hieco Ecosystem
description: Independent research on potential new packages based on modern Web3 development trends and ecosystem gaps
category: research
created: 2026-02-28
status: complete
tags: [hieco, packages, research, web3, wagmi, viem, rainbowkit, account-abstraction]
related:
  - ../02-bounty-research/hiero-deep-dive.md
  - ../04-ecosystem-expansion/README.md
---

# Additional Package Research for @hieco Ecosystem

**Date:** February 28, 2026
**Status:** Research Complete
**Focus:** Identifying new package opportunities based on modern Web3 trends and ecosystem gaps

---

## Research Methodology

All research was conducted using multiple sources:

- **Web Search:** Analyzed modern Web3/blockchain frontend development tools (wagmi, viem, RainbowKit, ConnectKit)
- **Deep Research:** Comprehensive analysis of Web3 development trends for 2025-2026
- **Competitive Analysis:** Studied Ethereum ecosystem tools and their Hedera equivalents
- **Framework Analysis:** Researched meta-framework adoption (Next.js, Nuxt, SvelteKit, SolidStart, Astro)
- **Emerging Tech:** Investigated Account Abstraction (ERC-4337), gasless transactions, NFT utilities

---

## Key Research Findings

### Modern Web3 Development Trends (2026)

1. **wagmi + viem** is now the standard for React Web3 development (replacing ethers.js)
   - wagmi: ~472,635 weekly npm downloads, 6.7k GitHub stars
   - viem: ~2.4k GitHub stars, actively maintained
   - TypeScript-first with strong ergonomics

2. **RainbowKit/ConnectKit** dominate wallet connection UI
   - RainbowKit: ~103,781 weekly downloads, 2.8k stars
   - ConnectKit: ~13,403 weekly downloads, 1k stars
   - Built on wagmi/viem, provides beautiful wallet connection UX

3. **Account Abstraction (ERC-4337)** has gone mainstream
   - 200M+ smart wallets deployed
   - 100M+ transactions since 2023
   - Enables gasless transactions, social recovery, batch operations

4. **Meta-frameworks** are gaining significant traction:
   - **Next.js**: Industry standard for dApps, React + SSR
   - **Nuxt 3**: Vue equivalent with strong momentum
   - **SvelteKit**: Lightweight, performance-focused
   - **SolidStart**: Ultra-high performance via fine-grained reactivity
   - **Astro**: Content-first, ships zero JS by default

5. **Gasless transactions** and **paymasters** are critical for user onboarding
   - Users shouldn't need HBAR for gas
   - Meta-transactions enable sponsored transactions
   - Relayer networks (Gelato, Biconomy) provide infrastructure

6. **NFT/SBT utilities** are in high demand
   - NFT galleries, marketplaces need common components
   - Soulbound Tokens (SBT) require special handling
   - Metadata fetching and display is complex

7. **Cross-chain compatibility** is essential
   - Multi-chain abstraction layers
   - Chain-agnostic wallet connections
   - Unified developer experience

### Gaps Identified in Hedera/Hiero Ecosystem

| Gap | Ethereum Equivalent | Hedera Status |
|-----|---------------------|---------------|
| wagmi/viem-style adapters | wagmi + viem | ❌ Missing |
| Wallet connection UI kit | RainbowKit/ConnectKit | ❌ Missing |
| Account abstraction tools | ERC-4337, Alchemy AA | ❌ Missing |
| Next.js integration | wagmi Next.js adapter | ❌ Missing |
| Nuxt integration | Nuxt Web3 modules | ❌ Missing |
| SvelteKit integration | Viem SvelteKit | ❌ Missing |
| NFT component library | thirdweb NFT components | ❌ Missing |
| Relayer/Paymaster service | Gelato, Biconomy | ❌ Missing |
| GraphQL indexing | The Graph | ⚠️ Limited |

---

## Existing @hieco Packages

### Already Built
- `@hieco/mirror` - Core Mirror Node REST API client
- `@hieco/mirror-react` - React hooks with TanStack Query
- `@hieco/mirror-preact` - Preact adapter
- `@hieco/mirror-solid` - Solid.js adapter
- `@hieco/mirror-shared` - Shared utilities
- `@hieco/types` - Common types
- `@hieco/realtime` - Realtime subscription
- `@hieco/testing` - Test utilities
- `@hieco/mirror-mcp` - MCP server
- `@hieco/mirror-cli` - CLI tool

### Previously Proposed
- `@hieco/scheduled` - Scheduled transaction toolkit
- `@hieco/devtools` - Transaction builder & debugger
- `@hieco/mirror-vue` - Vue adapter
- `@hieco/vault` - Secure key management

---

## Additional Package Proposals

### Tier 1: High Impact (Gap Severity: HIGH)

#### 1. `@hieco/next` - Next.js Integration Kit

**Impact:** ⭐⭐⭐⭐⭐ | **Complexity:** Medium | **Time:** 7-9 days

**Problem Solved:**
- Next.js 13+ App Router SSR compatibility issues
- Server components support for Hedera queries
- Proper hydration patterns for wallet state
- API route handlers for secure operations

**Why High Priority:**
- Next.js is the #1 framework for Web3 dApps in 2026
- Every major dApp uses Next.js
- SSR patterns are complex and error-prone
- No official Hedera/Hiero Next.js integration exists

**Key Features:**

```typescript
// Server-side client provider
import { createHieroServerClient } from '@hieco/next/server';

export default async function Page() {
  const client = createHieroServerClient();
  const balance = await client.getAccountBalance('0.0.1234');

  return <ServerBalanceView balance={balance} />;
}

// Client-side wallet hook with SSR-safe hydration
'use client';
import { useWalletConnection } from '@hieco/next/client';

export function WalletButton() {
  const { connect, isConnected, address } = useWalletConnection();
  return <button onClick={connect}>Connect Wallet</button>;
}

// API route handler for secure operations
import { createHieroApiRoute } from '@hieco/next/api';

export const POST = createHieroApiRoute(async (req, { client }) => {
  const result = await client.mirror.getTransactions(req.body.accountId);
  return Response.json(result);
});

// App Router provider setup
// app/providers.tsx
import { HederaProvider } from '@hieco/next/provider';

export default function RootLayout({ children }) {
  return (
    <HederaProvider network="testnet">
      {children}
    </HederaProvider>
  );
}
```

**Implementation Checklist:**
- [ ] Server client factory with network config
- [ ] SSR-safe wallet connection hook
- [ ] Hydration boundary components
- [ ] API route helpers
- [ ] Server action utilities (Next.js 15+)
- [ ] Error boundary integration
- [ ] Loading states for server queries
- [ ] Example Next.js 13+ App Router app
- [ ] Example Next.js 14+ Pages Router app

---

#### 2. `@hieco/connect` - Wallet Connection UI Kit

**Impact:** ⭐⭐⭐⭐⭐ | **Complexity:** Medium | **Time:** 8-10 days

**Problem Solved:**
- No unified wallet connection UI for Hedera
- Each wallet (HashPack, Blade, Kabila) has different integration
- Mobile wallet connection is complex (WalletConnect v2)
- No wallet list management or ordering
- No theming or branding options

**Why High Priority:**
- Wallet connection is the first interaction users have
- Poor connection UX = high churn
- RainbowKit has set the standard for EVM chains
- Hedera needs equivalent experience

**Key Features:**

```typescript
// RainbowKit-style provider setup
import { HederaConnect, hederaTheme } from '@hieco/connect';

export function App() {
  return (
    <HederaConnect
      theme={hederaTheme.darkMode({
        accentColor: '#1a1a1a',
        accentColorForeground: '#ffffff',
        borderRadius: 'large',
      })}
      wallets={{
        preferred: ['hashpack', 'blade'],
        order: ['hashpack', 'blade', 'kabila', 'metamask'],
        exclude: ['unknown-wallet']
      }}
      network="testnet"
      walletConnectProjectId="YOUR_PROJECT_ID"
    >
      <YourDApp />
    </HederaConnect>
  );
}

// Pre-built connect button
import { ConnectButton } from '@hieco/connect';

<ConnectButton
  showBalance={true}
  accountStatus={{
    smallScreen: 'avatar',
    largeScreen: 'full'
  }}
/>

// Custom wallet list
<WalletModal>
  <WalletList>
    <WalletItem id="hashpack" icon={<HashPackIcon />} />
    <WalletItem id="blade" icon={<BladeIcon />} />
  </WalletList>
</WalletModal>

// Mobile-optimized bottom sheet
<MobileConnectSheet />
```

**Supported Wallets:**
- **HashPack** - Most popular Hedera wallet
- **Blade Wallet** - Browser extension
- **Kabila** - Mobile wallet
- **MetaMask** - Via Hedera Snap
- **WalletConnect v2** - Mobile wallet protocol
- **Coinbase Wallet** - For broader adoption

**Implementation Checklist:**
- [ ] Core connection provider
- [ ] Wallet adapters for each wallet
- [ ] Theme system (light/dark mode)
- [ ] Connect button component
- [ ] Wallet modal/dialog
- [ ] Mobile bottom sheet
- [ ] Wallet list management
- [ ] Balance display
- [ ] Account avatar component
- [ ] Network switcher integration
- [ ] WalletConnect v2 integration
- [ ] TypeScript types for all wallet configs
- [ ] Storybook for all components

---

#### 3. `@hieco/components` - UI Component Library

**Impact:** ⭐⭐⭐⭐⭐ | **Complexity:** Low | **Time:** 6-8 days

**Problem Solved:**
- No pre-built components for common Hedera operations
- Developers must build everything from scratch
- Inconsistent UX across dApps hurts ecosystem perception
- No standard patterns for displaying blockchain data

**Why High Priority:**
- Reduces development time by 80%+
- Creates consistent UX across all Hedera dApps
- Lower barrier to entry for new developers
- Brand building for @hieco ecosystem

**Key Components:**

```typescript
// === Wallet Components ===

import {
  WalletConnectButton,
  AccountAvatar,
  AccountBalance,
  NetworkSwitcher
} from '@hieco/components/wallet';

<WalletConnectButton />
<AccountAvatar accountId="0.0.1234" size="medium" />
<AccountBalance accountId="0.0.1234" format="compact" />
<NetworkSwitcher networks={['mainnet', 'testnet', 'previewnet']} />

// === Transaction Components ===

import {
  TransferHbarForm,
  TransferTokenForm,
  TransactionStatus,
  TransactionList
} from '@hieco/components/transaction';

<TransferHbarForm
  defaultTo="0.0.9876"
  onSubmit={(tx) => console.log(tx)}
  showFeeEstimate={true}
/>

<TransferTokenForm
  tokenId="0.0.4567"
  decimals={8}
/>

<TransactionStatus
  txId="0.0.1234-1234567890"
  showReceipt={true}
/>

<TransactionList
  accountId="0.0.1234"
  limit={10}
/>

// === NFT Components ===

import {
  NFTGallery,
  NFTCard,
  NFTMintButton,
  NFTMetadataDisplay
} from '@hieco/components/nft';

<NFTGallery
  tokenId="0.0.4567"
  columns={4}
  lazyLoad={true}
/>

<NFTCard
  nftData={nft}
  onClick={() => navigate(`/nft/${nft.id}`)}
  showPrice={true}
/>

<NFTMintButton
  contractId="0.0.9999"
  price={100}
  onSuccess={(receipt) => toast.success('Minted!')}
/>

<NFTMetadataDisplay
  tokenId="0.0.4567"
  serial={123}
/>

// === Token Components ===

import {
  TokenBalance,
  TokenInfo,
  TokenList
} from '@hieco/components/token';

<TokenBalance
  tokenId="0.0.4567"
  accountId="0.0.1234"
  showSymbol={true}
/>

<TokenInfo tokenId="0.0.4567" />

<TokenList
  accountTokens={tokens}
  filterByType={['FUNGIBLE_COMMON']}
/>

// === Utility Components ===

import {
  HashScanLink,
  FormattedHbar,
  FormattedTimestamp,
  CountdownTimestamp,
  AccountIdDisplay
} from '@hieco/components/ui';

<HashScanLink type="account" id="0.0.1234" />
<HashScanLink type="transaction" id="0.0.1234-1234567890" />

<FormattedHbar amount={100000000} /> {/* "1.000 ℏ" */}
<FormattedHbar amount={100000000} format="tinybars" />

<FormattedTimestamp timestamp={1234567890} relative />

<CountdownTimestamp
  timestamp={1735689600}
  onComplete={() => console.log('Done!')}
/>

<AccountIdDisplay
  id="0.0.1234"
  format="full" // or "short", "evm"
/>

// === Loading States ===

import {
  Spinner,
  TransactionPending,
  AccountSkeleton
} from '@hieco/components/loading';

<TransactionPending message="Confirming transaction..." />

<AccountSkeleton />
```

**Theming Support:**

```typescript
import { HiecoThemeProvider } from '@hieco/components';

<HiecoThemeProvider
  theme="dark"
  customColors={{
    primary: '#0098FF',
    success: '#00D26A',
    error: '#FF5A5F',
    warning: '#FFB800'
  }}
>
  <App />
</HiecoThemeProvider>
```

**Implementation Checklist:**
- [ ] Theme provider with Tailwind integration
- [ ] Wallet components (5+ components)
- [ ] Transaction components (4+ components)
- [ ] NFT components (4+ components)
- [ ] Token components (3+ components)
- [ ] Utility components (6+ components)
- [ ] Loading skeleton components
- [ ] Accessibility (WCAG 2.2 AA)
- [ ] Storybook for all components
- [ ] Dark mode support
- [ ] Responsive design

---

### Tier 2: Medium Impact (Gap Severity: MEDIUM)

#### 4. `@hieco/smart-wallet` - Account Abstraction Layer

**Impact:** ⭐⭐⭐⭐ | **Complexity:** High | **Time:** 12-15 days

**Problem Solved:**
- Hedera has no ERC-4337 equivalent for smart wallets
- No gasless transaction support
- No social recovery or multi-sig abstractions
- User experience remains stuck with seed phrases

**Why Important:**
- Account abstraction is mainstream (200M+ wallets in 2026)
- Gasless UX dramatically improves conversion
- Social recovery reduces lost funds
- Strategic for long-term ecosystem growth

**Key Features:**

```typescript
// Smart wallet deployment
import { SmartWallet } from '@hieco/smart-wallet';

const wallet = await SmartWallet.deploy({
  signers: [
    { address: '0x123...', weight: 1 },
    { address: '0x456...', weight: 1 },
    { address: '0x789...', weight: 1 }
  ],
  threshold: 2, // 2 of 3 signatures required
  guardians: [
    { address: '0xabc...', recoveryDelay: 86400 }, // 24 hours
    { address: '0xdef...', recoveryDelay: 86400 }
  ]
});

// Gasless transactions via relayer
const result = await wallet.execute({
  to: '0.0.1234',
  amount: 100,
  paymaster: {
    address: 'hieco-relayer',
    policy: 'sponsor-all' // Sponsor gas for all txs
  }
});

// Batch operations - multiple txs in one
await wallet.batchExecute([
  { transferHbar: { to: '0.0.1111', amount: 10 } },
  { transferToken: { tokenId: '0.0.2222', to: '0.0.3333', amount: 50 } },
  { contractCall: { contractId: '0.0.4444', method: 'mint', args: [] } }
]);

// Spending limits
wallet.setSpendingLimit({
  daily: 1000, // HBAR per day
  perTransaction: 100,
  whitelist: ['0.0.1234', '0.0.5678'] // Only these recipients
});

// Session keys for dApps
const sessionKey = await wallet.createSessionKey({
  dapp: '0x999...',
  permissions: ['transfer:read'],
  expiresAt: Date.now() + 3600000 // 1 hour
});

// Social recovery
const recoveryTx = await wallet.initiateRecovery({
  guardians: ['0xabc...', '0xdef...'],
  newSigner: '0xnew...',
  reason: 'Lost private key'
});
```

**React Hooks:**

```typescript
import {
  useSmartWallet,
  useGaslessTransaction,
  useSessionKey
} from '@hieco/smart-wallet/react';

function Component() {
  const { wallet, deploy, isDeployed } = useSmartWallet();
  const { execute, isSponsoring } = useGaslessTransaction();

  const handleTransfer = async () => {
    await execute({
      to: '0.0.1234',
      amount: 100
    });
    // Gas sponsored automatically!
  };
}
```

**Implementation Checklist:**
- [ ] SmartWallet contract deployment
- [ ] Multi-sig signature aggregation
- [ ] Guardian recovery system
- [ ] Paymaster integration
- [ ] Batch execution
- [ ] Spending limit enforcement
- [ ] Session key management
- [ ] React hooks integration
- [ ] TypeScript types
- [ ] Test suite
- [ ] Security audit preparation

---

#### 5. `@hieco/nuxt` - Nuxt Integration Kit

**Impact:** ⭐⭐⭐⭐ | **Complexity:** Medium | **Time:** 5-7 days

**Problem Solved:**
- Vue/Nuxt developers lack Nuxt-specific patterns
- No SSR-safe composables
- No module ecosystem integration
- Vue has 20%+ market share and growing

**Why Important:**
- Nuxt 3 brings same maturity to Vue as Next.js to React
- Strong file-based routing and module system
- SSR-first mindset
- Growing adoption in enterprise

**Key Features:**

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@hieco/nuxt'],

  hieco: {
    network: 'testnet',
    mirrorNode: 'https://testnet.mirrornode.hedera.com',
    operator: {
      accountId: process.env.HEDERA_ACCOUNT_ID,
      privateKey: process.env.HEDERA_PRIVATE_KEY
    }
  }
});

// Server-side data fetching
// composables/useServerAccount.ts
export const useServerAccount = async (accountId: string) => {
  const { $hiero } = useNuxtApp();
  return await $hiero.getAccount(accountId);
};

// In component
<script setup lang="ts">
const account = await useServerAccount('0.0.1234');
</script>

<template>
  <div>{{ account.balance }} HBAR</div>
</template>

// Client composable
<script setup lang="ts">
import { useHieroWallet } from '@hieco/nuxt';

const { connect, isConnected, address, disconnect } = useHieroWallet();
</script>

// Nuxt plugin for server utilities
// plugins/hiero.server.ts
export default defineNuxtPlugin((nuxtApp) => {
  const client = createHieroClient({
    network: useRuntimeConfig().hieco.network
  });

  nuxtApp.provide('hiero', client);
});
```

**Implementation Checklist:**
- [ ] Nuxt module configuration
- [ ] Server client plugin
- [ ] SSR-safe composables
- [ ] Auto-imports
- [ ] Type definitions
- [ ] Example Nuxt 3 app
- [ ] Documentation

---

#### 6. `@hieco/sveltekit` - SvelteKit Integration Kit

**Impact:** ⭐⭐⭐⭐ | **Complexity:** Medium | **Time:** 5-7 days

**Problem Solved:**
- SvelteKit SSR patterns for Hedera
- Load functions for account/token data
- Form actions for transactions
- SvelteKit momentum is strong

**Why Important:**
- SvelteKit shipping 20-40% smaller bundles
- Strong Lighthouse scores out of the box
- Developer satisfaction is very high
- Performance-critical apps prefer Svelte

**Key Features:**

```typescript
// +page.server.ts - Server-side load
import { createHieroClient } from '@hieco/sveltekit/server';

export async function load({ fetch }) {
  const client = createHieroClient({
    network: 'testnet'
  });

  const [account, transactions] = await Promise.all([
    client.getAccount('0.0.1234'),
    client.getTransactions({ accountId: '0.0.1234', limit: 10 })
  ]);

  return { account, transactions };
}

// +page.svelte - Client component
<script lang="ts">
  import { connectWallet, accountBalance } from '@hieco/sveltekit';

  const { connect, isConnected, address } = connectWallet();
  const balance = accountBalance('0.0.1234');

  // Reactive store
  $: displayBalance = $balance ? `${$balance} ℏ` : 'Loading...';
</script>

<button on:click={connect}>
  {isConnected ? address : 'Connect Wallet'}
</button>

<p>Balance: {displayBalance}</p>

// +page.server.ts - Form actions
import { transferHbar } from '@hieco/sveltekit/actions';

export const actions = {
  transfer: async ({ request }) => {
    const data = await request.formData();
    const to = data.get('to');
    const amount = data.get('amount');

    const result = await transferHbar(to, amount);
    return { success: true, txId: result.transactionId };
  }
};

// Transfer form
<form method="POST" action="?/transfer">
  <input name="to" placeholder="Recipient Account ID" />
  <input name="amount" type="number" placeholder="Amount (HBAR)" />
  <button type="submit">Transfer</button>
</form>

// +layout.ts - App-wide setup
import { setHieroClient } from '@hieco/sveltekit';

setHieroClient({
  network: 'testnet',
  mirrorNode: 'https://testnet.mirrornode.hedera.com'
});
```

**Implementation Checklist:**
- [ ] Server client factory
- [ ] SSR-safe stores
- [ ] Load helpers
- [ ] Form action utilities
- [ ] Type definitions
- [ ] Example SvelteKit app
- [ ] Documentation

---

### Tier 3: Specialized Use Cases

#### 7. `@hieco/nft` - NFT/SB Utilities

**Impact:** ⭐⭐⭐ | **Complexity:** Low | **Time:** 4-6 days

**Problem Solved:**
- NFT metadata fetching is complex
- No standard NFT display components
- Soulbound Token detection missing
- IPFS gateway handling

**Key Features:**

```typescript
// NFT metadata fetching with caching
import {
  fetchNFTMetadata,
  fetchNFTsByAccount,
  fetchNFTsByToken
} from '@hieco/nft';

const metadata = await fetchNFTMetadata('0.0.4567', 123);
// {
//   name: "My NFT #123",
//   description: "...",
//   image: "ipfs://Qm...",
//   attributes: [...]
// }

const nfts = await fetchNFTsByAccount('0.0.1234');
const allNfts = await fetchNFTsByToken('0.0.4567');

// NFT display components
import {
  NFTImage,
  NFTAttributes,
  NFTCard,
  NFTGallery
} from '@hieco/nft/components';

<NFTImage
  tokenId="0.0.4567"
  serial={123}
  loading="lazy"
  fallback={<Skeleton />}
/>

<NFTAttributes attributes={metadata.attributes}>
  {(attr) => (
    <div class="attribute">
      <span>{attr.trait_type}</span>
      <span>{attr.value}</span>
    </div>
  )}
</NFTAttributes>

<NFTCard
  tokenId="0.0.4567"
  serial={123}
  onClick={() => navigate(`/nft/${tokenId}`)}
  showPrice={true}
/>

<NFTGallery
  tokenId="0.0.4567"
  columns="auto-fit"
  minColumnWidth="250px"
  gap="1rem"
/>

// SBT (Soulbound Token) utilities
import { isSoulbound } from '@hieco/nft';

if (await isSoulbound(tokenId, serial)) {
  // Show non-transferable indicator
  <NonTransferableBadge />;
}

// IPFS utilities
import { getIPFSGatewayUrl } from '@hieco/nft/ipfs';

const imageUrl = getIPFSGatewayUrl('ipfs://Qm...');
// Returns: https://ipfs.io/ipfs/Qm...
```

**Implementation Checklist:**
- [ ] NFT metadata fetcher with caching
- [ ] IPFS gateway utilities
- [ ] NFT image component
- [ ] NFT attributes component
- [ ] NFT card component
- [ ] NFT gallery component
- [ ] SBT detection utilities
- [ ] Lazy loading support
- [ ] Error handling for missing metadata

---

#### 8. `@hieco/staking` - HBAR Staking Utilities

**Impact:** ⭐⭐⭐ | **Complexity:** Low | **Time:** 4-5 days

**Problem Solved:**
- Staking is increasingly important on Hedera
- No unified staking interface
- Reward calculations are complex
- Node selection is difficult

**Key Features:**

```typescript
import {
  getStakedNodes,
  calculateRewards,
  stakeHbar,
  unstakeHbar,
  getStakingPosition
} from '@hieco/staking';

// Get available nodes for staking
const nodes = await getStakedNodes();
// [
//   { nodeId: "0.0.3", name: "Node 1", fee: 1.5%, minStake: 100000 },
//   { nodeId: "0.0.4", name: "Node 2", fee: 2.0%, minStake: 50000 }
// ]

// Calculate pending rewards
const rewards = await calculateRewards('0.0.1234');
// { hbar: 123.45, usd: 98.76 }

// Get current staking position
const position = await getStakingPosition('0.0.1234');
// {
//   staked: 1000,
//   nodes: [{ nodeId: "0.0.3", amount: 500 }, ...],
//   rewards: 123.45,
//   startDate: 1234567890
// }

// Stake HBAR
const receipt = await stakeHbar({
  accountId: '0.0.1234',
  nodeId: '0.0.3',
  amount: 1000
});

// Unstake HBAR
const receipt = await unstakeHbar({
  accountId: '0.0.1234',
  nodeId: '0.0.3',
  amount: 500
});

// React hooks
import { useStaking, useRewards, useNodeList } from '@hieco/staking/react';

function StakingDashboard() {
  const { stakedNodes, stake, unstake } = useStaking('0.0.1234');
  const { rewards, claim } = useRewards('0.0.1234');
  const { nodes, loading } = useNodeList();

  return (
    <div>
      <p>Staked: {stakedNodes.reduce((sum, n) => sum + n.amount, 0)} ℏ</p>
      <p>Rewards: {rewards} ℏ</p>
      <button onClick={claim}>Claim Rewards</button>
    </div>
  );
}
```

**Implementation Checklist:**
- [ ] Node list fetcher
- [ ] Staking position calculator
- [ ] Reward calculator
- [ ] Stake/unstake functions
- [ ] React hooks
- [ ] Vue composables
- [ ] Svelte stores

---

#### 9. `@hieco/forms` - Form Validation Integration

**Impact:** ⭐⭐⭐ | **Complexity:** Low | **Time:** 3-4 days

**Problem Solved:**
- Form validation for blockchain data is complex
- Account IDs, token amounts have specific formats
- No integration with popular form libraries

**Key Features:**

```typescript
// Zod schemas
import { z } from 'zod';
import {
  hiecoAccountId,
  hbarAmount,
  tokenId,
  evmAddress
} from '@hieco/forms/schemas';

const transferSchema = z.object({
  to: hiecoAccountId, // Validates "0.0.1234" format
  amount: hbarAmount.min(1).max(10000), // HBAR amount
  memo: z.string().max(100).optional()
});

// React Hook Form resolver
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(transferSchema)
});

// Custom validators
import { validateAccountId, validateTokenId } from '@hieco/forms/validators';

if (validateAccountId('0.0.1234')) {
  // Valid
}

// React Hook Form integration
import { HiecoResolver } from '@hieco/forms/react-hook-form';

const { register } = useForm({
  resolver: HiecoResolver({
    to: 'accountId',
    amount: 'hbarAmount'
  })
});

// VeeValidate integration (Vue)
import { HiecoRules } from '@hieco/forms/vee-validate';

<HiecoInput name="to" rules="required|accountId" />
<HiecoInput name="amount" rules="required|hbarAmount|min:1|max:10000" />

// Svelte forms integration
import { hiecoValidators } from '@hieco/forms/svelte';

const schema = z.object({
  to: hiecoAccountId
});
```

**Implementation Checklist:**
- [ ] Zod schemas for all Hedera types
- [ ] React Hook Form resolver
- [ ] VeeValidate rules (Vue)
- [ ] Svelte forms integration
- [ ] Custom validators
- [ ] Error message localization

---

#### 10. `@hieco/docs` - Documentation Generator

**Impact:** ⭐⭐⭐ | **Complexity:** Low | **Time:** 3-4 days

**Problem Solved:**
- Manual documentation is time-consuming
- Type definitions don't automatically generate docs
- No standardized docs format across @hieco packages

**Key Features:**

```bash
# CLI to generate docs from types
hieco-docs generate packages/mirror/src

# CLI to generate VitePress site
hieco-docs build:site

# Options
hieco-docs generate \
  --input packages/mirror/src \
  --output docs/api \
  --format vitepress \
  --includePrivate=false
```

```typescript
// JSDoc enhancements
/**
 * Get account balance from Mirror Node
 *
 * @param accountId - The account ID to query (e.g., "0.0.1234")
 * @returns The account balance in HBAR
 * @throws {MirrorNodeError} If account not found
 * @example
 * ```ts
 * const balance = await getAccountBalance("0.0.1234");
 * console.log(balance); // "100.0 ℏ"
 * ```
 */
export async function getAccountBalance(accountId: string): Promise<Hbar>;
```

**Generated Documentation Structure:**

```markdown
# @hieco/mirror API Reference

## Account Methods

### getAccountBalance()

Get account balance from Mirror Node

**Signature:**
```typescript
async function getAccountBalance(accountId: string): Promise<Hbar>
```

**Parameters:**
- `accountId` - The account ID to query (e.g., "0.0.1234")

**Returns:** The account balance in HBAR

**Throws:** `MirrorNodeError` If account not found

**Example:**
```typescript
const balance = await getAccountBalance("0.0.1234");
console.log(balance); // "100.0 ℏ"
```
```

**Implementation Checklist:**
- [ ] CLI tool
- [ ] TypeScript parser
- [ ] JSDoc extractor
- [ ] VitePress generator
- [ ] Example code extractor
- [ ] Type signature rendering
- [ ] Table of contents generator

---

### Tier 4: Infrastructure & DevTools

#### 11. `@hieco/relay` - Gasless Relayer

**Impact:** ⭐⭐⭐ | **Complexity:** High | **Time:** 10-12 days

**Problem Solved:**
- No meta-transaction support for Hedera
- Developers must implement their own relayers
- No paymaster infrastructure
- Gas fees block user onboarding

**Key Features:**

```typescript
// Relayer SDK for clients
import { RelayerClient } from '@hieco/relay';

const relayer = new RelayerClient({
  apiUrl: 'https://relay.hieco.dev',
  apiKey: process.env.HIECO_RELAY_KEY
});

// User signs off-chain
const signature = await user.signTransaction({
  to: '0.0.9876',
  amount: 100
});

// Relayer submits and pays gas
const result = await relayer.relay({
  transaction: { to: '0.0.9876', amount: 100 },
  signature,
  paymaster: {
    address: '0xpaymaster...',
    policy: 'sponsor-all' // Sponsor all gas
  }
});

// Paymaster configuration
relayer.configurePaymaster({
  sponsorAddress: '0.0.9999',
  deposit: 10000, // HBAR deposit for gas
  rules: {
    maxGas: 100000,
    allowedContracts: ['0.0.1234', '0.0.5678'],
    maxDailySpend: 100 // HBAR per day
  }
});

// React hooks
import { useRelayedTransaction } from '@hieco/relay/react';

function Component() {
  const { relay, isRelaying, estimatedFee } = useRelayedTransaction({
    paymaster: 'default'
  });

  const handleTransfer = async () => {
    await relay({
      to: '0.0.1234',
      amount: 100
    });
    // Gas sponsored!
  };
}
```

**Server Component:**

```typescript
// Run your own relayer
import { RelayerServer } from '@hieco/relay/server';

const relayer = new RelayerServer({
  port: 3000,
  hedera: {
    network: 'testnet',
    operatorId: '0.0.1111',
    operatorKey: '0x...'
  },
  paymaster: {
    address: '0.0.9999',
    balance: 10000
  }
});

relayer.on('relayed', (tx) => {
  console.log('Relayed:', tx.transactionId);
});

await relayer.start();
```

**Implementation Checklist:**
- [ ] Relayer client SDK
- [ ] Paymaster contract
- [ ] Relayer server
- [ ] Rate limiting
- [ ] Analytics/logging
- [ ] Dashboard
- [ ] React hooks
- [ ] Security audit

---

#### 12. `@hieco/subgraph` - The Graph Integration

**Impact:** ⭐⭐⭐ | **Complexity:** Medium | **Time:** 6-8 days

**Problem Solved:**
- Direct RPC queries are slow and inefficient
- Complex aggregations require multiple requests
- No historical data indexing
- The Graph is industry standard

**Key Features:**

```typescript
// GraphQL client for indexed Hedera data
import { createSubgraphClient } from '@hieco/subgraph';

const client = createSubgraphClient('https://subgraph.hieco.dev');

// Complex queries
const { data } = await client.query(`
  query GetAccountNFTs($accountId: ID!) {
    account(id: $accountId) {
      id
      balance
      tokens(orderBy: createdAt, orderDirection: desc) {
        id
        tokenId
        serialNumber
        metadata {
          name
          description
          image
          attributes {
            trait_type
            value
          }
        }
        owner {
          id
        }
      }
    }
  }
`, { accountId: '0x1234' });

// Real-time subscriptions
import { subscribeToTransfers } from '@hieco/subgraph';

const unsubscribe = subscribeToTransfers(
  { accountId: '0.0.1234' },
  (transfer) => {
    console.log('New transfer:', transfer);
  }
);

// React hooks
import { useAccountNFTs, useAccountTransfers } from '@hieco/subgraph/react';

function NFTGallery() {
  const { nfts, loading, error } = useAccountNFTs('0.0.1234');

  if (loading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      {nfts.map(nft => (
        <NFTCard key={nft.id} nft={nft} />
      ))}
    </div>
  );
}
```

**Subgraph Schema:**

```graphql
type Account @entity {
  id: ID!
  balance: Hbar!
  tokens: [Token!]! @derivedFrom(field: "owner")
  transactions: [Transaction!]! @derivedFrom(field: "from")
  createdAt: BigInt!
}

type Token @entity {
  id: ID!
  tokenId: String!
  serialNumber: BigInt!
  owner: Account!
  metadata: TokenMetadata
  createdAt: BigInt!
}

type TokenMetadata @entity {
  id: ID!
  name: String!
  description: String
  image: String
  attributes: [Attribute!]! @derivedFrom(field: "metadata")
}

type Attribute @entity {
  id: ID!
  traitType: String!
  value: String!
  metadata: TokenMetadata!
}
```

**Implementation Checklist:**
- [ ] Subgraph schema definition
- [ ] GraphQL client
- [ ] Code generation
- [ ] React hooks
- [ ] Subscription support
- [ ] Indexing server setup

---

#### 13. `@hieco/solid-start` - SolidStart Integration

**Impact:** ⭐⭐ | **Complexity:** Low | **Time:** 4-5 days

**Key Features:**

```typescript
// Solid.js specific primitives
import {
  createAccountBalance,
  createTransfer,
  createWalletConnection
} from '@hieco/solid-start';

const balance = createAccountBalance('0.0.1234');
// Returns a Solid signal: { value, loading, error }

const { transfer, status } = createTransfer();

const { connect, isConnected, address } = createWalletConnection();

// In component
function BalanceView() {
  const bal = balance();
  return <Show when={bal.loading} fallback={<span>{bal.value()} ℏ</span>}>
    <Spinner />
  </Show>;
}
```

---

#### 14. `@hieco/astro` - Astro Integration

**Impact:** ⭐⭐ | **Complexity:** Low | **Time:** 3-4 days

**Key Features:**

```astro
---
// Server-side data fetching
import { getAccountBalance } from '@hieco/astro/server';

const balance = await getAccountBalance('0.0.1234');
---

<div class="balance">{balance} HBAR</div>

<!-- Client-side islands -->
<HieroConnectButton client:load />
<HieroBalance accountId="0.0.1234" client:visible />
<HieroTransferForm client:idle />

// astro.config.ts
import { defineConfig } from 'astro/config';
import hieco from '@hieco/astro';

export default defineConfig({
  integrations: [
    hieco({
      network: 'testnet',
      mirrorNode: 'https://testnet.mirrornode.hedera.com'
    })
  ]
});
```

---

#### 15. `@hieco/devtools-extension` - Browser DevTools Extension

**Impact:** ⭐⭐⭐ | **Complexity:** High | **Time:** 10-12 days

**Problem Solved:**
- Debugging Hedera transactions is difficult
- No visibility into wallet state
- Console logging is insufficient
- No transaction inspection

**Key Features:**

```typescript
// DevTools Panel

// 1. Transaction Inspector
// Inspect transaction bytes, decode, validate
[Transaction Inspector]
Transaction ID: 0.0.1234-1234567890
Type: CRYPTOTRANSFER
From: 0.0.1111
To: 0.0.2222
Amount: 100 HBAR
Fee: 0.004211 ℏ
Status: SUCCESS
Timestamp: 2026-02-28 10:30:00

// 2. Account Inspector
[Account Inspector]
Account ID: 0.0.1234
Balance: 1,234.567 ℏ
Keys: ED25519 (0x1234...)
Staking: Node 0.0.3 (500 ℏ)
Tokens: 5 tokens, 12 NFTs

// 3. Network State
[Network]
Current: testnet
Mirror Node: https://testnet.mirrornode.hedera.com
Latency: 125ms
Block Height: 12345678

// 4. Console API
window.hieco
  .getBalance('0.0.1234')
  .getTransaction('0.0.1234-1234567890')
  .getAccount('0.0.1234')
  .getNetwork()

// 5. React DevTools Integration
// Inspect @hieco/mirror-react hooks state
[Hieco DevTools]
useAccountBalance("0.0.1234")
  data: Hbar { tinybars: 100000000n }
  loading: false
  error: null
  isFetching: false
```

**Implementation Checklist:**
- [ ] Chrome extension manifest
- [ ] DevTools panel UI
- [ ] Transaction decoder
- [ ] Account inspector
- [ ] Network state monitor
- [ ] Console API
- [ ] React DevTools hook inspector
- [ ] Firefox extension support

---

## Priority Roadmap

### Phase 1: Foundation (Weeks 1-2) - Tier 1

**Highest Impact Packages:**

| Package | Effort | Impact | Priority |
|---------|--------|--------|----------|
| `@hieco/connect` | 8-10 days | ⭐⭐⭐⭐⭐ | **P0** |
| `@hieco/next` | 7-9 days | ⭐⭐⭐⭐⭐ | **P0** |
| `@hieco/components` | 6-8 days | ⭐⭐⭐⭐⭐ | **P0** |

**Rationale:**
- `@hieco/connect` fills the most visible gap (wallet UX)
- `@hieco/next` enables Next.js dApps (dominant framework)
- `@hieco/components` provides immediate DX improvement

**Success Criteria:**
- RainbowKit-quality wallet connection UX
- Production-ready Next.js App Router patterns
- 20+ pre-built components
- 90%+ test coverage

### Phase 2: Ecosystem Expansion (Weeks 3-4) - Tier 2

**Medium Priority Packages:**

| Package | Effort | Impact | Priority |
|---------|--------|--------|----------|
| `@hieco/nuxt` | 5-7 days | ⭐⭐⭐⭐ | **P1** |
| `@hieco/sveltekit` | 5-7 days | ⭐⭐⭐⭐ | **P1** |
| `@hieco/smart-wallet` | 12-15 days | ⭐⭐⭐⭐ | **P1** |

**Rationale:**
- Vue/Nuxt has 20%+ market share
- SvelteKit momentum is strong
- Account Abstraction is strategic long-term

### Phase 3: Specialized Utilities (Weeks 5-6) - Tier 3

| Package | Effort | Impact | Priority |
|---------|--------|--------|----------|
| `@hieco/nft` | 4-6 days | ⭐⭐⭐ | **P2** |
| `@hieco/staking` | 4-5 days | ⭐⭐⭐ | **P2** |
| `@hieco/forms` | 3-4 days | ⭐⭐⭐ | **P2** |
| `@hieco/docs` | 3-4 days | ⭐⭐⭐ | **P2** |

### Phase 4: Infrastructure (Weeks 7-10) - Tier 4

| Package | Effort | Impact | Priority |
|---------|--------|--------|----------|
| `@hieco/relay` | 10-12 days | ⭐⭐⭐ | **P2** |
| `@hieco/subgraph` | 6-8 days | ⭐⭐⭐ | **P2** |
| `@hieco/devtools-extension` | 10-12 days | ⭐⭐⭐ | **P3** |
| `@hieco/solid-start` | 4-5 days | ⭐⭐ | **P3** |
| `@hieco/astro` | 3-4 days | ⭐⭐ | **P3** |

---

## Summary Matrix

### By Package

| Package | Impact | Complexity | Time | Priority |
|---------|--------|------------|------|----------|
| `@hieco/next` | ⭐⭐⭐⭐⭐ | Medium | 7-9d | P0 |
| `@hieco/connect` | ⭐⭐⭐⭐⭐ | Medium | 8-10d | P0 |
| `@hieco/components` | ⭐⭐⭐⭐⭐ | Low | 6-8d | P0 |
| `@hieco/smart-wallet` | ⭐⭐⭐⭐ | High | 12-15d | P1 |
| `@hieco/nuxt` | ⭐⭐⭐⭐ | Medium | 5-7d | P1 |
| `@hieco/sveltekit` | ⭐⭐⭐⭐ | Medium | 5-7d | P1 |
| `@hieco/nft` | ⭐⭐⭐ | Low | 4-6d | P2 |
| `@hieco/staking` | ⭐⭐⭐ | Low | 4-5d | P2 |
| `@hieco/forms` | ⭐⭐⭐ | Low | 3-4d | P2 |
| `@hieco/docs` | ⭐⭐⭐ | Low | 3-4d | P2 |
| `@hieco/relay` | ⭐⭐⭐ | High | 10-12d | P2 |
| `@hieco/subgraph` | ⭐⭐⭐ | Medium | 6-8d | P2 |
| `@hieco/devtools-extension` | ⭐⭐⭐ | High | 10-12d | P3 |
| `@hieco/solid-start` | ⭐⭐ | Low | 4-5d | P3 |
| `@hieco/astro` | ⭐⭐ | Low | 3-4d | P3 |

### By Category

| Category | Existing | Proposed (New) |
|----------|----------|-----------------|
| **Core** | mirror, mirror-shared, types | - |
| **React** | mirror-react | next, components, connect, forms |
| **Vue** | mirror-vue (proposed) | nuxt |
| **Svelte** | - | sveltekit |
| **Solid** | mirror-solid | solid-start |
| **Preact** | mirror-preact | - |
| **Meta** | - | astro |
| **Utilities** | testing, realtime, scheduled (proposed) | nft, staking, smart-wallet, forms, docs |
| **DevTools** | mirror-mcp, mirror-cli | devtools-extension |
| **Infrastructure** | - | relay, subgraph |

---

## Success Metrics

### For Tier 1 Packages (connect, next, components)

**3-Month Targets:**
- 200+ GitHub stars across all packages
- 1,000+ weekly NPM downloads combined
- 20+ public projects using the libraries
- 5+ production dApps launched
- Positive feedback in Hedera/Hiero Discord

**6-Month Targets:**
- 1,000+ GitHub stars
- 5,000+ weekly downloads
- 100+ public projects
- Mention in official Hiero docs
- Integration in major Hedera dApps

### For Tier 2-4 Packages

**6-Month Targets:**
- 100+ GitHub stars
- 500+ weekly downloads
- 10+ public projects

---

## Risk Assessment

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Hedera SDK breaking changes | Medium | High | Use strict versioning, adapter pattern |
| Mirror Node API changes | Low | Medium | Abstract API layer, version checking |
| React 19 conflicts | Low | Medium | Test with canary, peer dependencies |
| Wallet integration issues | High | High | Thorough testing, fallbacks |

### Adoption Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Low community awareness | High | High | Docs, examples, social media |
| Competition from official SDK | Low | High | Collaborate, offer to upstream |
| Niche use case | Medium | Medium | Focus on real pain points, validate |

---

## Conclusion

This research identifies **15 additional packages** that could be added to the @hieco ecosystem, organized into 4 tiers based on impact and complexity.

### Top Recommendations (Start Here)

1. **`@hieco/connect`** - Wallet connection UI kit (RainbowKit for Hedera)
2. **`@hieco/next`** - Next.js integration (SSR patterns, App Router)
3. **`@hieco/components`** - UI component library (20+ pre-built components)

These three packages provide the highest impact and address the most critical gaps in the ecosystem.

### Strategic Investments (Long-term)

- **`@hieco/smart-wallet`** - Account abstraction for Hedera
- **`@hieco/relay`** - Gasless transaction infrastructure
- **`@hieco/devtools-extension`** - Professional debugging tools

These packages position @hieco for long-term ecosystem growth and developer experience leadership.

---

## Research Sources

### Web Search & Deep Research

- Modern Web3 frontend development tools (wagmi, viem, RainbowKit, ConnectKit)
- Web3 development trends for 2025-2026
- Hedera/Hiero ecosystem gaps and missing tools
- Account Abstraction (ERC-4337) and smart wallets
- Meta-framework adoption (Next.js, Nuxt, SvelteKit, SolidStart, Astro)
- NFT marketplace development patterns

### Key Findings

- wagmi: ~472,635 weekly npm downloads, 6.7k GitHub stars
- viem: ~2.4k GitHub stars, actively maintained
- RainbowKit: ~103,781 weekly downloads, 2.8k stars
- ConnectKit: ~13,403 weekly downloads, 1k stars
- 200M+ smart wallets deployed via ERC-4337
- Account Abstraction is mainstream in 2026

---

**Document Version:** 1.0
**Last Updated:** 2026-02-28
**Author:** @abinovalfauzi
**License:** MIT (for documentation structure)

_This research supports the continued expansion of the @hieco ecosystem for the Hedera Hello Future Apex Hackathon 2026._
