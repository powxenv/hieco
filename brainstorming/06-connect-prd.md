---
title: @hieco/connect - Product Requirements Document
description: Comprehensive PRD for wallet connection UI kit focusing on Developer and User Experience
category: prd
created: 2026-02-28
status: complete
tags: [hieco, connect, wallet, ux, dx, rainbowkit, prd]
related:
  - ../05-additional-packages-research.md
  - ../04-ecosystem-expansion/README.md
---

# @hieco/connect - Product Requirements Document

**Package:** `@hieco/connect`
**Type:** Wallet Connection UI Kit
**Status:** Proposed
**Target:** Hedera/Hiero dApp developers
**Timeline:** 8-10 days

---

## Executive Summary

`@hieco/connect` is a wallet connection UI kit for Hedera dApps, inspired by RainbowKit but specifically designed for the Hedera ecosystem. The primary goals are:

1. **Developer Experience (DX):** Make it incredibly easy for developers to add wallet connection to their dApps
2. **User Experience (UX):** Make wallet connection feel seamless, fast, and intuitive for end users

**Why This Matters:**

- Wallet connection is the first interaction users have with a dApp
- Poor connection UX = high churn (users leave before even trying the app)
- Each Hedera wallet (HashPack, Blade, Kabila) has different integration patterns
- Developers shouldn't have to build wallet connection from scratch every time

**Reference Implementation:** RainbowKit for Ethereum

---

## Table of Contents

1. [Developer Experience Requirements](#developer-experience-requirements)
2. [User Experience Requirements](#user-experience-requirements)
3. [Core Features](#core-features)
4. [Architecture Design](#architecture-design)
5. [API Specification](#api-specification)
6. [Theming System](#theming-system)
7. [Supported Wallets](#supported-wallets)
8. [Implementation Checklist](#implementation-checklist)
9. [Success Metrics](#success-metrics)

---

## Developer Experience Requirements

### DX Principle 1: Setup in Under 5 Minutes

**Goal:** A developer should be able to add wallet connection to their dApp in less than 5 minutes, starting from `npm install`.

#### Installation

```bash
# All dependencies installed automatically
bun add @hieco/connect
# or
npm install @hieco/connect
```

No manual installation of wallet libraries required - all dependencies bundled or peer dependencies clearly specified.

#### Zero-Config Setup

```typescript
// App.tsx - This is ALL the code needed
import { HederaConnect, ConnectButton } from '@hieco/connect';

function App() {
  return (
    <HederaConnect network="testnet">
      <header>
        <ConnectButton />
      </header>
      <main>
        <YourDApp />
      </main>
    </HederaConnect>
  );
}
```

**No additional configuration required for:**
- Wallet list (comes pre-configured with popular wallets)
- Network endpoints (auto-detected from `network` prop)
- Error handling (built-in, customizable)
- Loading states (built-in, customizable)

### DX Principle 2: Full TypeScript Support

**Goal:** Every feature is fully typed with helpful autocomplete and inline documentation.

```typescript
import type {
  WalletConfig,
  HederaConnectProps,
  ConnectButtonProps,
  WalletList
} from '@hieco/connect';

// All props are typed with descriptions
const config: HederaConnectProps = {
  network: 'testnet', // ← autocomplete shows: 'mainnet' | 'testnet' | 'previewnet'
  theme: 'dark',      // ← autocomplete shows theme options
  wallets: {
    preferred: ['hashpack', 'blade'],
    // ← autocomplete shows all wallet IDs
  },
  // ← all other props with inline docs
};
```

#### Type Safety Benefits

```typescript
// ✅ TypeScript catches errors at compile time
<HederaConnect network="invalid-network" />
// Error: Type '"invalid-network"' is not assignable to type '"mainnet" | "testnet" | "previewnet"'

// ✅ Autocomplete guides developers
<HederaConnect
  network="testnet"
  theme={ /* ← shows: 'light' | 'dark' | customTheme */ }
/>

// ✅ Return types are inferred
const { address, isConnected } = useWallet();
// address: string | null
// isConnected: boolean
```

### DX Principle 3: Sensible Defaults, Easy Customization

**Philosophy:** 80% of dApps should work perfectly with default settings. The 20% that need customization should have clear, well-documented options.

#### Default Behavior (Zero Config)

```typescript
<HederaConnect network="testnet">
  <YourApp />
</HederaConnect>
```

**This gives you:**
- ✅ All 5 popular wallets pre-configured
- ✅ Automatic network detection
- ✅ Beautiful dark/light theme (auto from system preference)
- ✅ Error handling with user-friendly messages
- ✅ Loading states with spinners
- ✅ Account display with balance
- ✅ Network switcher
- ✅ Mobile-responsive design
- ✅ WalletConnect v2 support
- ✅ Auto-reconnection on page reload

#### Customization When Needed

```typescript
<HederaConnect
  network="testnet"

  // Theme customization
  theme={customTheme({
    accentColor: '#0098FF',
    borderRadius: 'large',
    fontStack: 'system',
  })}

  // Wallet list customization
  wallets={{
    preferred: ['hashpack', 'blade'],
    order: ['hashpack', 'blade', 'kabila', 'metamask'],
    exclude: ['some-wallet'],
    custom: [
      {
        id: 'my-custom-wallet',
        name: 'My Custom Wallet',
        icon: CustomWalletIcon,
        connector: customWalletConnector,
      }
    ]
  }}

  // Error handling customization
  onError={(error) => {
    console.error('Wallet error:', error);
    // Send to analytics, show toast, etc.
  }}

  // Event callbacks
  onConnect={({ address, wallet }) => {
    analytics.track('wallet_connected', { address, wallet });
  }}
  onDisconnect={() => {
    analytics.track('wallet_disconnected');
  }}
  onChangeNetwork={(network) => {
    analytics.track('network_changed', { network });
  }}

  // Advanced options
  options={{
    autoConnect: true,           // Auto-reconnect on page load
    persistentState: 'localStorage', // Where to store connection state
    loadingTimeout: 10000,        // Max time to wait for wallet
    showBalance: true,           // Show balance in connect button
    balanceFormat: 'compact',     // 'full' | 'compact' | 'tinybars'
  }}
>
  <YourApp />
</HederaConnect>
```

### DX Principle 4: Clear, Actionable Error Messages

**Principle:** When something goes wrong, developers should immediately understand:
1. What went wrong
2. Why it went wrong
3. How to fix it

#### Example Error Messages

```typescript
// ❌ Bad error message (what NOT to do)
throw new Error('Wallet connection failed');

// ✅ Good error message (what TO DO)
throw new Error(`
Wallet connection failed: HashPack not detected

Possible solutions:
1. Install HashPack browser extension: https://hashpack.app/download
2. Refresh this page after installation
3. Try a different wallet (Blade, Kabila)

Debug info: window.hashpack is undefined
`);
```

#### Built-In Error Handling

```typescript
// The library handles common errors automatically:

// User rejects connection
// → Shows: "Connection declined by user"
// → No console error (expected behavior)

// Wallet not installed
// → Shows: "HashPack not found. Install?"
// → Provides download link

// Network mismatch
// → Shows: "Wallet is on mainnet, dApp is on testnet"
// → One-click network switch prompt

// Timeout
// → Shows: "Connection taking longer than expected..."
// → Retry button

// Account has no HBAR (testnet)
// → Shows: "Account has no HBAR. Get testnet HBAR?"
// → Faucet link
```

### DX Principle 5: Comprehensive Documentation

**Every feature must have:**
1. Quick start example (< 2 min read)
2. API reference with all props/options
3. Code examples for common use cases
4. TypeScript types included in docs
5. Troubleshooting guide

#### Documentation Structure

```
@hieco/connect Documentation
├── Quick Start (5 min to first connection)
├── Installation
├── Basic Usage
│   ├── Minimal Setup
│   ├── Configuration Options
│   ├── Network Selection
│   └── Theming
├── API Reference
│   ├── HederaConnect
│   ├── ConnectButton
│   ├── useWallet Hook
│   ├── Wallet List API
│   └── Theme System
├── Guides
│   ├── Custom Wallet Integration
│   ├── Server-Side Rendering (Next.js)
│   ├── Testing with Mock Wallets
│   ├── Analytics Integration
│   └── Migration from Wallet Connect
├── Examples
│   ├── React (basic)
│   ├── React with Next.js App Router
│   ├── Vue 3
│   ├── Svelte
│   └── Solid.js
├── Troubleshooting
│   ├── Common Errors
│   ├── Wallet-Specific Issues
│   ├── Network Problems
│   └── Browser Compatibility
└── Changelog
```

### DX Principle 6: Performance & Bundle Size

**Goals:**
- Bundle size: < 100KB gzipped
- First paint: < 1 second
- Time to interactive: < 2 seconds

#### Performance Optimizations

```typescript
// ✅ Code splitting by wallet
// Only load wallet connectors when needed
const walletConnectors = {
  hashpack: () => import('./connectors/hashpack'),
  blade: () => import('./connectors/blade'),
  kabila: () => import('./connectors/kabila'),
  metamask: () => import('./connectors/metamask'),
};

// ✅ Lazy load QR code for WalletConnect
const QRCode = React.lazy(() => import('./QRCode'));

// ✅ Tree-shakeable exports
import { ConnectButton } from '@hieco/connect';
// Only ConnectButton and its dependencies are bundled

// ❌ NOT: All-or-nothing bundles
```

### DX Principle 7: Testing Support

**Goal:** Developers can test wallet-dependent code without needing real wallets.

#### Mock Wallet for Testing

```typescript
// __tests__/wallet.test.tsx
import { render, screen } from '@testing-library/react';
import { HederaConnect, mockWallet } from '@hieco/connect';
import '@hieco/connect/testing';

// Mock wallet for tests
const mockHashpack = mockWallet({
  id: 'hashpack',
  account: '0.0.1234',
  network: 'testnet',
  balance: 1000,
});

test('shows account balance when connected', () => {
  render(
    <HederaConnect
      network="testnet"
      mockWallet={mockHashpack} // ← Use mock instead of real wallet
    >
      <AccountBalance />
    </HederaConnect>
  );

  expect(screen.getByText('1,000 ℏ')).toBeInTheDocument();
});

// Simulate wallet actions
await mockHashpack.connect();
await mockHashpack.signTransaction(tx);
await mockHashpack.switchNetwork('mainnet');
```

---

## User Experience Requirements

### UX Principle 1: Instant Visual Feedback

**Goal:** Users should never wonder "is anything happening?" during wallet connection.

#### Loading States

```typescript
// Connection states with clear visual feedback

// 1. Initial state - Click "Connect Wallet"
<button>Connect Wallet</button>

// 2. Loading state (within 100ms)
<button disabled>
  <Spinner size="small" />
  Connecting...
</button>

// 3. Wallet selection modal (appears within 200ms)
<WalletModal>
  <WalletList>
    <WalletItem icon={<HashPackIcon />} name="HashPack" />
    <WalletItem icon={<BladeIcon />} name="Blade" />
    <WalletItem icon={<KabilaIcon />} name="Kabila" />
  </WalletList>
</WalletModal>

// 4. Awaiting user action in wallet
// (shows in modal)
<AwaitingSignature>
  <Spinner />
  Confirm connection in HashPack...
</AwaitingSignature>

// 5. Success state (within 2 seconds total)
<ConnectButton>
  <AccountAvatar />
  0.0.1234
  <ArrowDown />
  1,234.56 ℏ
</ConnectButton>
```

#### Animation Timing

```typescript
// All animations are fast and feel responsive
const ANIMATION_DURATION = {
  fast: 150,    // Hover, focus states
  normal: 200,  // Modal fade in/out
  slow: 300,    // Page transitions
};

// ✅ Connect button responds immediately on hover
<ConnectButton
  transitionDuration={150}
/>

// ✅ Modal appears smoothly
<WalletModal
  animation="fade-in"
  duration={200}
/>
```

### UX Principle 2: Progressive Disclosure

**Principle:** Show information gradually as needed. Don't overwhelm users.

#### Connection Flow

```
Step 1: Simple connect button
┌─────────────────────────┐
│   Connect Wallet    ←── │  Single action, clear
└─────────────────────────┘

Step 2: Wallet selection (only when clicked)
┌────────────────────────────────┐
│  Select your wallet            │
│                                │
│  [HashPack]  [Blade]           │  Clear choices, visual icons
│  [Kabila]    [MetaMask]        │
│                                │
│  Don't have a wallet?          │  Help for new users
│  [Get HashPack] →              │
└────────────────────────────────┘

Step 3: Connection confirmation (in wallet)
┌────────────────────────────────┐
│  Confirm in HashPack...        │  Clear what to do
│                                │
│  [Spinner]  Waiting for you   │
└────────────────────────────────┘

Step 4: Success
┌────────────────────────────────┐
│  [Avatar]  0.0.1234    ▼      │  Account visible, can expand
│            1,234 ℏ            │
└────────────────────────────────┘
```

### UX Principle 3: Error Recovery

**Principle:** When something goes wrong, show the user:
1. What happened (clear, simple language)
2. Why it happened (optional, for advanced users)
3. How to fix it (actionable steps)

#### Error States with Recovery

```typescript
// Error: Wallet not installed
<WalletError
  title="HashPack Not Found"
  message="To connect, you need to install HashPack wallet"
  actions={[
    {
      label: 'Install HashPack',
      href: 'https://hashpack.app/download',
      primary: true,
    },
    {
      label: 'Try a different wallet',
      onClick: () => setShowWalletList(true),
    },
    {
      label: 'Learn more',
      href: '/docs/why-do-i-need-a-wallet',
    },
  ]}
/>

// Error: User rejected
<ConnectionDeclined
  message="Connection cancelled"
  hint="You can always connect later from the header"
  onRetry={() => setShowWalletList(true)}
/>

// Error: Network mismatch
<NetworkMismatch
  currentWallet="mainnet"
  currentDApp="testnet"
  onSwitchNetwork={() => switchWalletNetwork('testnet')}
  onChangeDAppNetwork={() => setDAppNetwork('mainnet')}
/>

// Error: Account has no HBAR
<NoHbarBalance
  network="testnet"
  onGetFaucet={() => openFaucet()}
/>

// Error: Connection timeout
<ConnectionTimeout
  message="Connection is taking longer than usual"
  suggestions={[
    "Check if your wallet is unlocked",
    "Try refreshing the page",
    "Switch to a different browser",
  ]}
  onRetry={() => retryConnection()}
/>
```

### UX Principle 4: Mobile-First Design

**Principle:** Wallet connection must work perfectly on mobile devices.

#### Mobile Adaptations

```typescript
// Mobile: Bottom sheet instead of modal
<WalletSheet>
  <WalletList>
    <WalletItem icon={<HashPackIcon />} name="HashPack" />
    <WalletItem icon={<BladeIcon />} name="Blade" />
  </WalletList>
  <MobileWalletConnect />
  // "Scan QR code" option for mobile wallets
</WalletSheet>

// Mobile: Deep linking to wallet apps
<WalletItem
  id="kabila"
  mobileApp="kabila://"
  fallback="https://kabila.app/download"
/>

// Mobile: Touch-friendly targets
const TOUCH_TARGET_SIZE = 44; // iOS HIG minimum

// All buttons meet accessibility guidelines
<button
  style={{ minHeight: `${TOUCH_TARGET_SIZE}px` }}
>
  Connect Wallet
</button>
```

### UX Principle 5: Smart Defaults & Auto-Detection

**Goal:** Reduce friction by detecting and suggesting the most likely options.

#### Auto-Detection Features

```typescript
// 1. Detect installed wallets
// Only show wallets that are actually installed
<WalletList>
  {hasHashpack && <WalletItem id="hashpack" />}
  {hasBlade && <WalletItem id="blade" />}
  {hasKabila && <WalletItem id="kabila" />}
  <WalletItem id="install-more" label="More wallets..." />
</WalletList>

// 2. Detect mobile vs desktop
// On mobile: prioritize mobile wallets (Kabila)
// On desktop: prioritize browser extensions (HashPack, Blade)
<WalletList
  priority={isMobile ? 'mobile' : 'desktop'}
/>

// 3. Remember last used wallet
<HederaConnect
  options={{
    rememberLastWallet: true,
    defaultWallet: lastUsedWallet, // Skip wallet selection
  }}
/>

// 4. Auto-reconnect on page load
<HederaConnect
  options={{
    autoConnect: true, // Reconnect using stored session
  }}
/>

// 5. Detect network from wallet
// If wallet is already on testnet, auto-select testnet in dApp
<HederaConnect
  options={{
    syncNetworkWithWallet: true,
  }}
/>
```

### UX Principle 6: Network Switching Made Simple

**Challenge:** Hedera has multiple networks (mainnet, testnet, previewnet). Users often get confused.

#### Network Switching UX

```typescript
// Inline network switcher
<NetworkSwitcher>
  <CurrentNetwork>
    {currentNetwork === 'mainnet' && 'Mainnet'}
    {currentNetwork === 'testnet' && 'Testnet'}
    {currentNetwork === 'previewnet' && 'Preview'}
  </CurrentNetwork>
  <SwitchButton onClick={() => setShowNetworkMenu(true)} />
</NetworkSwitcher>

// When networks don't match
<NetworkMismatchDialog
  walletNetwork="mainnet"
  dAppNetwork="testnet"
  message="Your wallet is on Hedera mainnet, but this dApp uses testnet"
  primaryAction={{
    label: "Switch wallet to testnet",
    onClick: () => switchWalletNetwork('testnet'),
  }}
  secondaryAction={{
    label: "Switch dApp to mainnet",
    onClick: () => switchDAppNetwork('mainnet'),
    warning: "⚠️ Mainnet uses real HBAR",
  }}
/>

// Visual network indicators
<ConnectButton>
  <NetworkIndicator network="mainnet" color="purple" />
  <AccountAvatar />
  0.0.1234
</ConnectButton>
```

### UX Principle 7: Transaction Signing Clarity

**Principle:** Users should always understand what they're signing.

#### Signing UX

```typescript
// Before signing: Clear preview
<TransactionPreview
  transaction={{
    type: 'CRYPTOTRANSFER',
    from: '0.0.1111',
    to: '0.0.2222',
    amount: '100 HBAR',
    fee: '~0.004211 HBAR',
  }}
/>

// While signing: Status in modal
<SigningStatus>
  <Spinner />
  <p>Confirm transaction in HashPack...</p>
  <Details>
    Sending 100 HBAR to 0.0.2222
  </Details>
</SigningStatus>

// After signing: Success with receipt
<TransactionSuccess
  receipt={{
    transactionId: '0.0.1234-1234567890',
    status: 'SUCCESS',
    fee: '0.004211 HBAR',
  }}
  onViewReceipt={() => openHashScan(txId)}
/>

// On error: Clear explanation
<TransactionError
  error="INSUFFICIENT_BALANCE"
  message="You don't have enough HBAR to complete this transaction"
  required="104.211 HBAR"
  available="100 HBAR"
  onGetFaucet={() => openFaucet()}
/>
```

### UX Principle 8: Account Management

**Goal:** Users can easily manage their Hedera accounts.

#### Account Management Features

```typescript
// Account dropdown menu
<AccountDropdown>
  <AccountInfo>
    <AccountAvatar />
    <AccountId>0.0.1234</AccountId>
    <AccountBalance>1,234.56 ℏ</AccountBalance>
  </AccountInfo>

  <AccountActions>
    <Action label="Copy address" onClick={copyAddress} />
    <Action label="View on HashScan" href={hashScanUrl} />
    <Action label="Switch account" onClick={switchAccount} />
    <Action label="Disconnect" onClick={disconnect} variant="danger" />
  </AccountActions>

  <NetworkInfo>
    <NetworkBadge network="testnet" />
    <BlockNumber>12,345,678</BlockNumber>
  </NetworkInfo>
</AccountDropdown>

// Multi-account support (wallets with multiple accounts)
<AccountSwitcher>
  {accounts.map(account => (
    <AccountItem
      key={account.id}
      accountId={account.id}
      balance={account.balance}
      isActive={account.id === currentAccount}
      onClick={() => switchAccount(account.id)}
    />
  ))}
</AccountSwitcher>
```

---

## Core Features

### 1. Pre-Configured Wallet Support

Out of the box, `@hieco/connect` supports these wallets with zero configuration:

| Wallet | Type | Priority | Notes |
|--------|------|----------|-------|
| **HashPack** | Browser Extension | ⭐⭐⭐⭐⭐ | Most popular Hedera wallet |
| **Blade Wallet** | Browser Extension | ⭐⭐⭐⭐ | Clean UI, good mobile app |
| **Kabila** | Mobile Wallet | ⭐⭐⭐⭐ | Great mobile UX |
| **MetaMask** | Browser Extension + Snap | ⭐⭐⭐ | Via Hedera Snap |
| **WalletConnect** | Mobile Protocol | ⭐⭐⭐⭐ | For mobile wallet apps |

### 2. React Hooks API

```typescript
// Primary hook for wallet state
import { useWallet } from '@hieco/connect';

function Component() {
  const {
    address,           // Connected account ID
    balance,           // Account balance in HBAR
    network,           // Current network
    wallet,            // Wallet object
    isConnected,       // Boolean connection status
    isConnecting,      // Boolean connection in progress
    error,             // Error object if any

    // Actions
    connect,           // Connect wallet
    disconnect,        // Disconnect wallet
    switchNetwork,     // Switch Hedera network
    switchAccount,     // Switch account (multi-account wallets)

    // Utility
    refreshBalance,    // Refresh account balance
  } = useWallet();

  return (
    <div>
      {isConnected ? (
        <p>Connected: {address}</p>
      ) : (
        <button onClick={connect}>Connect</button>
      )}
    </div>
  );
}

// Hook for transaction signing
import { useSignTransaction } from '@hieco/connect';

function TransferForm() {
  const { sign, isSigning, error } = useSignTransaction();

  const handleTransfer = async () => {
    const receipt = await sign({
      to: '0.0.2222',
      amount: 100,
    });
  };
}

// Hook for contract interactions
import { useContractCall } from '@hieco/connect';

function ContractInteraction() {
  const { call, isCalling, data } = useContractCall({
    contractId: '0.0.3333',
    method: 'balanceOf',
    params: ['0.0.1234'],
  });
}
```

### 3. Component Library

```typescript
// Connect Button (most common use case)
import { ConnectButton } from '@hieco/connect';

<ConnectButton
  showBalance={true}
  showNetwork={true}
  accountStatus="full"  // 'avatar' | 'address' | 'full'
  chainStatus="icon"    // 'none' | 'icon' | 'full'
/>

// Minimal button
<ConnectButton />

// With balance display
<ConnectButton
  showBalance={true}
  balanceFormat="compact"
/>

// Custom render props
<ConnectButton>
  {({ account, balance, isConnected }) => (
    <button>
      {isConnected ? (
        <>{account}: {balance} ℏ</>
      ) : (
        <>Connect Wallet</>
      )}
    </button>
  )}
</ConnectButton>

// Network Switcher
import { NetworkSwitcher } from '@hieco/connect';

<NetworkSwitcher
  networks={['mainnet', 'testnet', 'previewnet']}
  showIcons={true}
/>

// Account Avatar
import { AccountAvatar } from '@hieco/connect';

<AccountAvatar
  accountId="0.0.1234"
  size="medium"
  onClick={openAccountMenu}
/>

// Balance Display
import { AccountBalance } from '@hieco/connect';

<AccountBalance
  accountId="0.0.1234"
  format="compact"
  refreshInterval={10000}
/>
```

---

## Architecture Design

### Layer Structure

```
┌─────────────────────────────────────────────────────────┐
│                    UI Components                        │
│  (ConnectButton, WalletModal, NetworkSwitcher, etc.)     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    React Hooks                           │
│  (useWallet, useSignTransaction, useContractCall)       │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Wallet Connectors                       │
│  (HashPack, Blade, Kabila, MetaMask, WalletConnect)     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  Hedera SDK Layer                        │
│  (@hashgraph/sdk, Mirror Node API)                      │
└─────────────────────────────────────────────────────────┘
```

### State Management

```typescript
// Internal state (using Zustand for simplicity)
interface WalletState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;

  // Account data
  address: string | null;
  balance: Hbar | null;
  network: Network;
  wallet: Wallet | null;

  // Actions
  connect: (walletId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (network: Network) => Promise<void>;
  switchAccount: (address: string) => Promise<void>;

  // Persistent state
  lastConnectedWallet: string | null;
  autoConnect: boolean;
}

// State persistence
const persist = {
  key: '@hieco/connect',
  storage: localStorage, // or sessionStorage
  partialize: (state) => ({
    lastConnectedWallet: state.lastConnectedWallet,
    // Don't persist sensitive data
  }),
};
```

### Wallet Connector Interface

```typescript
// All wallet connectors implement this interface
interface WalletConnector {
  id: string;
  name: string;
  icon: React.ComponentType;

  // Lifecycle
  isAvailable: () => boolean | Promise<boolean>;
  connect: () => Promise<WalletAccount>;
  disconnect: () => Promise<void>;

  // Account management
  getAccounts: () => Promise<WalletAccount[]>;
  switchAccount: (address: string) => Promise<void>;

  // Network
  getNetwork: () => Promise<Network>;
  switchNetwork: (network: Network) => Promise<void>;

  // Transactions
  signTransaction: (tx: Transaction) => Promise<Signature>;
  signMessage: (message: string) => Promise<Signature>;

  // Events
  on: (event: string, handler: Function) => void;
  off: (event: string, handler: Function) => void;
}

// Example: HashPack connector
class HashPackConnector implements WalletConnector {
  id = 'hashpack';
  name = 'HashPack';
  icon = HashPackIcon;

  isAvailable() {
    return typeof window.hashpack !== 'undefined';
  }

  async connect() {
    if (!this.isAvailable()) {
      throw new Error('HashPack not installed');
    }

    const accounts = await window.hashpack.connect();
    return {
      address: accounts[0],
      network: await this.getNetwork(),
    };
  }

  // ... other methods
}
```

---

## API Specification

### HederaConnect (Provider)

```typescript
interface HederaConnectProps {
  // Required
  network: 'mainnet' | 'testnet' | 'previewnet';
  children: React.ReactNode;

  // Optional - Theme
  theme?: Theme | 'light' | 'dark';

  // Optional - Wallet configuration
  wallets?: {
    preferred?: string[];           // Preferred wallets (shown first)
    order?: string[];                // Custom order
    exclude?: string[];              // Exclude specific wallets
    custom?: WalletConnector[];     // Add custom wallets
  };

  // Optional - Error handling
  onError?: (error: Error) => void;

  // Optional - Event callbacks
  onConnect?: (data: {
    address: string;
    wallet: Wallet;
    network: Network;
  }) => void;

  onDisconnect?: () => void;

  onChangeNetwork?: (network: Network) => void;

  onChangeAccount?: (address: string) => void;

  // Optional - Advanced options
  options?: {
    autoConnect?: boolean;           // Default: true
    persistentState?: 'localStorage' | 'sessionStorage' | 'memory';
    loadingTimeout?: number;         // Default: 10000ms
    showBalance?: boolean;           // Default: true
    balanceFormat?: 'full' | 'compact' | 'tinybars';
    refreshInterval?: number;        // Balance refresh interval (ms)
  };
}
```

### ConnectButton (Component)

```typescript
interface ConnectButtonProps {
  // Display options
  showBalance?: boolean;             // Default: false
  showNetwork?: boolean;             // Default: false
  accountStatus?: 'avatar' | 'address' | 'full';
  chainStatus?: 'none' | 'icon' | 'full';

  // Styling
  className?: string;
  style?: React.CSSProperties;

  // Custom render
  children?: (props: ConnectButtonRenderProps) => React.ReactNode;

  // Callbacks
  onClick?: () => void;
}
```

### useWallet (Hook)

```typescript
interface UseWalletReturn {
  // State
  address: string | null;
  balance: Hbar | null;
  network: Network | null;
  wallet: Wallet | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;

  // Actions
  connect: (walletId?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (network: Network) => Promise<void>;
  switchAccount: (address: string) => Promise<void>;

  // Utilities
  refreshBalance: () => Promise<void>;
  getBalance: (address: string) => Promise<Hbar>;
}
```

---

## Theming System

### Theme Specification

```typescript
interface Theme {
  mode: 'light' | 'dark';

  colors: {
    accent: string;
    accentForeground: string;
    background: string;
    foreground: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };

  borderRadius: string;
  fontStack: 'system' | 'rounded' | 'custom';

  shadows: {
    connectButton: string;
    walletModal: string;
  };

  animations: {
    connectButton: string;
    walletModal: string;
  };
}

// Pre-built themes
import { darkTheme, lightTheme, midnightTheme } from '@hieco/connect';

// Custom theme builder
import { createTheme } from '@hieco/connect';

const customTheme = createTheme({
  mode: 'dark',
  colors: {
    accent: '#0098FF',
    accentForeground: '#FFFFFF',
    background: '#0A0A0A',
    foreground: '#FFFFFF',
    border: '#1A1A1A',
    error: '#FF5A5F',
    success: '#00D26A',
    warning: '#FFB800',
  },
  borderRadius: '12px',
  fontStack: 'system',
});
```

### Theme Usage

```typescript
import { HederaConnect, darkTheme, lightTheme } from '@hieco/connect';

// Use pre-built theme
<HederaConnect theme={darkTheme} network="testnet">
  <App />
</HederaConnect>

// Auto theme (follows system preference)
<HederaConnect theme="auto" network="testnet">
  <App />
</HederaConnect>

// Custom theme
<HederaConnect
  theme={customTheme}
  network="testnet"
>
  <App />
</HederaConnect>

// Conditional theme based on time
const theme = new Date().getHours() < 18 ? lightTheme : darkTheme;

<HederaConnect theme={theme} network="testnet">
  <App />
</HederaConnect>
```

---

## Implementation Checklist

### Phase 1: Foundation (Days 1-2)

- [ ] Set up package structure (monorepo integration)
- [ ] Configure TypeScript, ESLint, Prettier
- [ ] Set up Storybook for component development
- [ ] Create wallet connector interface
- [ ] Implement Zustand state management
- [ ] Create base theme system

### Phase 2: Wallet Connectors (Days 3-4)

- [ ] HashPack connector implementation
- [ ] Blade Wallet connector implementation
- [ ] Kabila connector implementation
- [ ] MetaMask Snap connector implementation
- [ ] WalletConnect v2 implementation
- [ ] Wallet detection utilities
- [ ] Error handling for each wallet

### Phase 3: Core Components (Days 5-6)

- [ ] HederaConnect provider component
- [ ] ConnectButton component
- [ ] WalletModal component
- [ ] WalletList component
- [ ] WalletItem component
- [ ] NetworkSwitcher component
- [ ] AccountAvatar component
- [ ] AccountDropdown component

### Phase 4: React Hooks (Days 6-7)

- [ ] useWallet hook implementation
- [ ] useSignTransaction hook
- [ ] useContractCall hook
- [ ] useBalance hook
- [ ] useNetwork hook

### Phase 5: UX Polish (Days 7-8)

- [ ] Loading states for all components
- [ ] Error states with recovery actions
- [ ] Mobile responsive design
- [ ] Bottom sheet for mobile
- [ ] Animations and transitions
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Touch-friendly targets (44px minimum)

### Phase 6: Theming (Day 8)

- [ ] Dark theme implementation
- [ ] Light theme implementation
- [ ] Custom theme builder
- [ ] Theme switcher component
- [ ] CSS-in-JS with Emotion or styled-components

### Phase 7: Testing (Days 8-9)

- [ ] Unit tests for all hooks
- [ ] Component tests with React Testing Library
- [ ] Mock wallet implementation
- [ ] Integration tests with real wallets
- [ ] E2E tests with Playwright
- [ ] Visual regression tests

### Phase 8: Documentation (Day 9)

- [ ] Quick start guide
- [ ] API reference documentation
- [ ] Component examples (Storybook)
- [ ] Migration guide from vanilla wallet integration
- [ ] Troubleshooting guide
- [ ] TypeScript types documentation

### Phase 9: Polish & Release (Day 10)

- [ ] Bundle size optimization
- [ ] Performance testing
- [ ] Security audit preparation
- [ ] NPM package configuration
- [ ] GitHub Actions CI/CD
- [ ] Release notes generation

---

## Success Metrics

### Developer Experience Metrics

**Setup Time:**
- Target: < 5 minutes from `npm install` to working wallet connection
- Measurement: Time to complete quick start tutorial

**API Clarity:**
- Target: 90%+ API surface covered by TypeScript autocomplete
- Measurement: Developer survey, documentation completeness

**Bundle Size:**
- Target: < 100KB gzipped for core package
- Target: < 30KB gzipped per wallet connector
- Measurement: Bundle analysis with webpack-bundle-analyzer

### User Experience Metrics

**Connection Success Rate:**
- Target: 95%+ successful connections (excluding user cancellation)
- Measurement: Analytics tracking

**Connection Time:**
- Target: < 2 seconds from click to connected state
- Measurement: Performance monitoring

**Error Recovery:**
- Target: 80%+ of users recover from errors without leaving dApp
- Measurement: Analytics tracking of error flows

### Adoption Metrics

**3-Month Targets:**
- 200+ GitHub stars
- 1,000+ weekly NPM downloads
- 20+ public projects using
- 5+ production dApps launched

**6-Month Targets:**
- 1,000+ GitHub stars
- 5,000+ weekly downloads
- 100+ public projects
- Mention in official Hiero docs

---

## Security Considerations

1. **No Private Key Storage:** The library never stores private keys
2. **Secure Communication:** All wallet communication uses encrypted channels
3. **Domain Validation:** Verify dApp domain before signing
4. **Transaction Preview:** Always show what user is signing
5. **Rate Limiting:** Prevent abuse of wallet connection
6. **Audit Trail:** Log all sensitive operations
7. **Dependency Pinning:** Lock wallet library versions for security

---

## Dependencies

### Peer Dependencies

```json
{
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0",
    "@hashgraph/sdk": "^2.0.0"
  }
}
```

### Runtime Dependencies

```json
{
  "dependencies": {
    "zustand": "^4.0.0",
    "emotion": "^11.0.0",
    "clsx": "^2.0.0"
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/user-event": "^14.0.0",
    "storybook": "^7.0.0",
    "vitest": "^1.0.0"
  }
}
```

---

**Document Version:** 1.0
**Last Updated:** 2026-02-28
**Author:** @abinovalfauzi
**License:** MIT (for documentation structure)
