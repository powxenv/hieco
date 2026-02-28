---
title: @hieco/connect - Headless/Unstyled Approach
description: Headless wallet connection library for maximum UI flexibility
category: prd
created: 2026-02-28
status: complete
tags: [hieco, connect, headless, unstyled, ui, dx, radix, ark]
related:
  - ../06-connect-prd.md
  - ../05-additional-packages-research.md
---

# @hieco/connect - Headless/Unstyled Approach

**Package:** `@hieco/connect`
**Variant:** `@hieco/connect/headless` or headless mode
**Type:** Headless Wallet Connection Library
**Status:** Proposed
**Inspiration:** Radix UI, Headless UI, React Aria, Ark UI

---

## Executive Summary

### What is Headless/Unstyled?

A **headless** or **unstyled** library provides:
- ✅ All the **logic and functionality**
- ✅ **State management**
- ✅ **Accessibility features**
- ✅ **Keyboard navigation**
- ✅ **Screen reader support**
- ❌ **No pre-built UI components**
- ❌ **No default styling**

**You bring your own UI.** The library handles everything else.

### Why Headless for Wallet Connection?

| Benefit | Explanation |
|---------|-------------|
| **Full Design Control** | Match your brand exactly, no fighting default styles |
| **Smaller Bundle** | No bundled CSS/icons = smaller download |
| **Framework Agnostic** | Works with React, Vue, Svelte, Solid + any UI library |
| **Composability** | Use with shadcn/ui, Chakra, MUI, Tailwind, CSS-in-JS |
| **Future-Proof** | UI trends change, logic stays the same |
| **Tree-Shakeable** | Only use what you need |

### Trade-offs

| Con | Mitigation |
|-----|------------|
| **More UI Code** | Provide example implementations for popular stacks |
| **Styling Work** | Provide Tailwind + CSS examples |
| **Accessibility Burden** | Built-in ARIA attributes, keyboard handlers |

---

## Architecture: Two Packages or One?

### Option 1: Single Package with Headless Mode ✅ RECOMMENDED

```
@hieco/connect
├── /headless          # Headless hooks + logic
├── /components       # Styled UI components (optional)
└── /react            # React integration
```

**Benefits:**
- Single dependency
- Can switch between headless and styled
- Shared logic, no duplication

**Usage:**
```typescript
// Use headless
import { useWallet } from '@hieco/connect/headless';

// Or use styled
import { ConnectButton } from '@hieco/connect/components';
```

### Option 2: Separate Packages

```
@hieco/connect-core     # Headless logic only
@hieco/connect-ui       # Styled UI components
```

**Benefits:**
- Smaller core package
- Clear separation

---

## API Specification (Headless)

### Core Hooks

```typescript
// Primary hook - provides all wallet state
import { useWallet } from '@hieco/connect/headless';

function MyConnectButton() {
  const wallet = useWallet();

  return (
    <div>
      {wallet.isConnected ? (
        <button onClick={wallet.disconnect}>
          Disconnect
        </button>
      ) : (
        <button onClick={() => wallet.connect('hashpack')}>
          Connect HashPack
        </button>
      )}
    </div>
  );
}
```

### useWallet Return Type

```typescript
interface UseWalletReturn {
  // ===== State =====

  // Connection status
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;

  // Account data
  address: string | null;
  balance: Hbar | null;
  network: Network | null;

  // Wallet info
  wallet: Wallet | null;
  walletId: string | null;

  // Errors
  error: Error | null;

  // Capabilities
  canSwitchNetwork: boolean;
  canSwitchAccount: boolean;
  supportedNetworks: Network[];

  // ===== Actions =====

  // Connect to a specific wallet
  connect: (walletId: string) => Promise<void>;

  // Connect with auto-detection (tries all wallets)
  connectAuto: () => Promise<void>;

  // Disconnect current wallet
  disconnect: () => Promise<void>;

  // Switch network
  switchNetwork: (network: Network) => Promise<void>;

  // Switch account (multi-account wallets)
  switchAccount: (address: string) => Promise<void>;

  // Refresh balance
  refreshBalance: () => Promise<void>;

  // Get balance for specific address
  getBalance: (address: string) => Promise<Hbar>;

  // ===== Utilities =====

  // Get available wallets
  availableWallets: WalletInfo[];

  // Get wallet connection status
  getWalletStatus: (walletId: string) => WalletStatus;

  // Check if wallet is installed
  isWalletInstalled: (walletId: string) => boolean;
}
```

### Secondary Hooks

#### useConnectModal

```typescript
import { useConnectModal } from '@hieco/connect/headless';

function ConnectButton() {
  const { isOpen, open, close, selectedWallet, selectWallet } = useConnectModal();

  return (
    <>
      <button onClick={open}>Connect Wallet</button>

      {isOpen && (
        <div className="modal">
          <h2>Select Wallet</h2>

          {selectedWallet ? (
            <WalletConnector walletId={selectedWallet} />
          ) : (
            <WalletList onSelect={selectWallet} />
          )}

          <button onClick={close}>Cancel</button>
        </div>
      )}
    </>
  );
}
```

#### useWalletList

```typescript
import { useWalletList } from '@hieco/connect/headless';

function WalletSelector() {
  const { wallets, installedWallets, isInstalling } = useWalletList();

  return (
    <div>
      {wallets.map((wallet) => (
        <WalletItem
          key={wallet.id}
          wallet={wallet}
          installed={installedWallets.includes(wallet.id)}
          isInstalling={isInstalling === wallet.id}
          onSelect={() => connect(wallet.id)}
        />
      ))}
    </div>
  );
}

interface WalletItemProps {
  wallet: WalletInfo;
  installed: boolean;
  isInstalling: boolean;
  onSelect: () => void;
}

function WalletItem({ wallet, installed, isInstalling, onSelect }: WalletItemProps) {
  return (
    <div className="wallet-item">
      <img src={wallet.icon} alt={wallet.name} />
      <span>{wallet.name}</span>

      {installed ? (
        <button onClick={onSelect}>Connect</button>
      ) : (
        <a href={wallet.downloadUrl} target="_blank" rel="noopener">
          Install
        </a>
      )}

      {isInstalling && <span>Installing...</span>}
    </div>
  );
}
```

#### useAccountDropdown

```typescript
import { useAccountDropdown } from '@hieco/connect/headless';

function AccountMenu() {
  const { isOpen, open, close, toggle } = useAccountDropdown();
  const { address, balance, disconnect } = useWallet();

  return (
    <div className="relative">
      <button onClick={toggle}>
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>

      {isOpen && (
        <div className="dropdown">
          <div className="account-info">
            <p>Address: {address}</p>
            <p>Balance: {balance?.toString()} ℏ</p>
          </div>

          <button onClick={() => copyToClipboard(address)}>
            Copy Address
          </button>

          <a href={`https://hashscan.io/testnet/account/${address}`}>
            View on HashScan
          </a>

          <button onClick={disconnect}>
            Disconnect
          </button>

          <button onClick={close}>Close</button>
        </div>
      )}
    </div>
  );
}
```

#### useNetworkSwitcher

```typescript
import { useNetworkSwitcher } from '@hieco/connect/headless';

function NetworkSelector() {
  const { isOpen, open, close, networks, currentNetwork, switch } = useNetworkSwitcher();

  return (
    <div>
      <button onClick={open}>
        {currentNetwork}
      </button>

      {isOpen && (
        <div className="network-menu">
          {networks.map((network) => (
            <button
              key={network}
              onClick={() => switch(network)}
              className={network === currentNetwork ? 'active' : ''}
            >
              {network}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### useTransactionSigning

```typescript
import { useTransactionSigning } from '@hieco/connect/headless';

function TransferButton() {
  const { sign, state, reset } = useTransactionSigning();

  const handleTransfer = async () => {
    await sign({
      to: '0.0.2222',
      amount: 100,
    });
  };

  return (
    <div>
      <button onClick={handleTransfer} disabled={state === 'signing'}>
        {state === 'idle' && 'Send 100 ℏ'}
        {state === 'signing' && 'Confirm in wallet...'}
        {state === 'success' && 'Sent! ✓'}
        {state === 'error' && 'Failed. Try again'}
      </button>

      {state === 'error' && (
        <button onClick={reset}>Reset</button>
      )}
    </div>
  );
}
```

---

## Provider Setup (Headless)

### Minimal Configuration

```typescript
import { HederaWalletProvider } from '@hieco/connect/headless';

function App() {
  return (
    <HederaWalletProvider
      network="testnet"
      autoConnect={true}
    >
      <YourApp />
    </HederaWalletProvider>
  );
}
```

### Advanced Configuration

```typescript
import { HederaWalletProvider } from '@hieco/connect/headless';

function App() {
  return (
    <HederaWalletProvider
      network="testnet"

      // Auto-connect options
      autoConnect={true}
      storage="localStorage"
      storageKey="@hieco/wallet"

      // Wallet configuration
      wallets={{
        preferred: ['hashpack', 'blade'],
        custom: [
          {
            id: 'my-wallet',
            name: 'My Custom Wallet',
            icon: 'https://example.com/icon.png',
            connector: MyWalletConnector,
          }
        ]
      }}

      // Event callbacks
      onConnect={(data) => console.log('Connected:', data)}
      onDisconnect={() => console.log('Disconnected')}
      onError={(error) => console.error('Error:', error)}
      onNetworkChange={(network) => console.log('Network:', network)}

      // Advanced options
      options={{
        refreshInterval: 10000,        // Balance refresh (ms)
        connectionTimeout: 10000,       // Max connection time (ms)
        retryAttempts: 3,               // Retry failed connections
        retryDelay: 1000,               // Delay between retries (ms)
      }}
    >
      <YourApp />
    </HederaWalletProvider>
  );
}
```

---

## Example Implementations

### Example 1: Tailwind CSS + Radix-style

```typescript
// components/wallet/ConnectButton.tsx
import { useWallet } from '@hieco/connect/headless';

export function ConnectButton() {
  const { isConnected, address, isConnecting, connect, disconnect } = useWallet();

  if (isConnecting) {
    return (
      <button className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg cursor-not-allowed">
        <Spinner className="inline w-4 h-4 mr-2" />
        Connecting...
      </button>
    );
  }

  if (isConnected) {
    return (
      <button
        onClick={disconnect}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={() => connect('hashpack')}
      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
    >
      Connect Wallet
    </button>
  );
}
```

### Example 2: shadcn/ui Style

```typescript
// components/wallet/wallet-dropdown.tsx
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { useWallet } from '@hieco/connect/headless';
import { Copy, ExternalLink, LogOut } from 'lucide-react';

export function WalletDropdown() {
  const { address, balance, disconnect, isConnected } = useWallet();
  const [copied, setCopied] = useState(false);

  if (!isConnected) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(address!);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent">
          <WalletAvatar />
          <span className="text-sm">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        </button>
      </Dropdown.Trigger>

      <Dropdown.Content align="end" className="w-56">
        <div className="p-4 border-b">
          <p className="text-sm text-muted-foreground">Balance</p>
          <p className="text-lg font-semibold">{balance?.toString()} ℏ</p>
        </div>

        <Dropdown.Item onClick={handleCopy} className="cursor-pointer">
          <Copy className="w-4 h-4 mr-2" />
          {copied ? 'Copied!' : 'Copy address'}
        </Dropdown.Item>

        <Dropdown.Item asChild className="cursor-pointer">
          <a
            href={`https://hashscan.io/testnet/account/${address}`}
            target="_blank"
            rel="noopener"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on HashScan
          </a>
        </Dropdown.Item>

        <Dropdown.Separator />

        <Dropdown.Item onClick={disconnect} className="cursor-pointer text-destructive">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </Dropdown.Item>
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
```

### Example 3: Chakra UI Style

```typescript
// components/wallet/WalletModal.tsx
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  useDisclosure,
  VStack,
  HStack,
  Text,
  Image,
} from '@chakra-ui/react';
import { useWallet, useWalletList } from '@hieco/connect/headless';

export function WalletModal() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { connect, isConnecting } = useWallet();
  const { wallets, installedWallets } = useWalletList();

  const handleConnect = async (walletId: string) => {
    await connect(walletId);
    onClose();
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="blue">
        Connect Wallet
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Connect Wallet</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <VStack spacing={4}>
              {wallets.map((wallet) => (
                <Button
                  key={wallet.id}
                  variant="outline"
                  onClick={() => handleConnect(wallet.id)}
                  isLoading={isConnecting}
                  isDisabled={!installedWallets.includes(wallet.id)}
                  justifyContent="flex-start"
                  p={4}
                  h="auto"
                >
                  <HStack spacing={4}>
                    <Image src={wallet.icon} alt={wallet.name} boxSize={8} />
                    <Text>{wallet.name}</Text>
                  </HStack>
                </Button>
              ))}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
```

### Example 4: Vanilla CSS + CSS Modules

```typescript
// components/wallet/ConnectButton.module.css
.button {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms;
}

.button.primary {
  background: #0098FF;
  color: white;
}

.button.primary:hover {
  background: #0077CC;
}

.button.connected {
  background: #00D26A;
}

.button.loading {
  opacity: 0.7;
  cursor: wait;
}

// Component
import { useWallet } from '@hieco/connect/headless';
import styles from './ConnectButton.module.css';

export function ConnectButton() {
  const { isConnected, address, isConnecting, connect, disconnect } = useWallet();

  const className = [
    styles.button,
    isConnected ? styles.connected : styles.primary,
    isConnecting ? styles.loading : '',
  ].join(' ');

  return (
    <button
      className={className}
      onClick={isConnected ? disconnect : () => connect('hashpack')}
    >
      {isConnecting ? 'Connecting...' : isConnected ? address : 'Connect Wallet'}
    </button>
  );
}
```

### Example 5: Svelte 5 (Runes)

```svelte
<!-- WalletButton.svelte -->
<script lang="ts">
  import { useWallet } from '@hieco/connect/headless';

  const wallet = useWallet();
</script>

{#if $wallet.isConnected}
  <button on:click={() => $wallet.disconnect()}>
    {$wallet.address?.slice(0, 6)}...{$wallet.address?.slice(-4)}
  </button>
{:else}
  <button on:click={() => $wallet.connect('hashpack')}>
    Connect Wallet
  </button>
{/if}
```

### Example 6: Vue 3 Composition API

```vue
<!-- WalletButton.vue -->
<script setup lang="ts">
  import { useWallet } from '@hieco/connect/headless';

  const { isConnected, address, isConnecting, connect, disconnect } = useWallet();
</script>

<template>
  <button
    v-if="isConnected"
    @click="disconnect"
  >
    {{ address?.slice(0, 6) }}...{{ address?.slice(-4) }}
  </button>
  <button
    v-else
    @click="() => connect('hashpack')"
    :disabled="isConnecting"
  >
    {{ isConnecting ? 'Connecting...' : 'Connect Wallet' }}
  </button>
</template>
```

---

## Accessibility (Built-in)

Headless doesn't mean "no accessibility". These features are built-in:

### ARIA Attributes (Auto-applied)

```typescript
// The library automatically adds ARIA attributes
// You just need to apply them to your elements

import { useAriaProps } from '@hieco/connect/headless';

function ConnectButton() {
  const { connect, isConnecting, ariaProps } = useWallet();

  return (
    <button
      {...ariaProps.button}
      onClick={() => connect('hashpack')}
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
```

### What Gets Auto-Applied?

```typescript
// Connect button
{
  'aria-label': 'Connect wallet',
  'role': 'button',
  'aria-busy': isConnecting ? 'true' : undefined,
}

// Wallet list item
{
  'role': 'option',
  'aria-selected': isSelected ? 'true' : 'false',
  'aria-label': `${wallet.name} wallet`,
}

// Modal
{
  'role': 'dialog',
  'aria-modal': 'true',
  'aria-labelledby': 'wallet-modal-title',
}

// Network switcher
{
  'role': 'listbox',
  'aria-expanded': isOpen ? 'true' : 'false',
  'aria-label': 'Select network',
}
```

### Keyboard Navigation (Built-in)

```typescript
import { useKeyboardNav } from '@hieco/connect/headless';

function WalletList() {
  const { wallets, selectedIndex, handleKeyDown } = useKeyboardNav();

  return (
    <div
      role="listbox"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {wallets.map((wallet, index) => (
        <div
          key={wallet.id}
          role="option"
          aria-selected={index === selectedIndex}
          tabIndex={index === selectedIndex ? 0 : -1}
        >
          {wallet.name}
        </div>
      ))}
    </div>
  );
}
```

**Built-in keyboard shortcuts:**
- `Tab` / `Shift+Tab` - Navigate focusable elements
- `ArrowUp` / `ArrowDown` - Navigate wallet list
- `Enter` / `Space` - Select focused wallet
- `Escape` - Close modal/dropdown

---

## Comparison: Headless vs Styled

### Feature Comparison

| Feature | Headless | Styled |
|---------|----------|--------|
| Wallet connection logic | ✅ | ✅ |
| State management | ✅ | ✅ |
| Error handling | ✅ | ✅ |
| Auto-reconnect | ✅ | ✅ |
| Network switching | ✅ | ✅ |
| ARIA attributes | ✅ (apply to your UI) | ✅ (pre-applied) |
| Keyboard navigation | ✅ (hooks provided) | ✅ (built-in) |
| Pre-built components | ❌ | ✅ (20+ components) |
| Default styling | ❌ | ✅ (dark/light themes) |
| Bundle size | ~30KB | ~100KB |
| UI flexibility | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |

### When to Use Which?

#### Use Headless When:

- ✅ You have a strong design system already
- ✅ You're using a component library (shadcn/ui, Chakra, MUI, etc.)
- ✅ You need full customization
- ✅ Bundle size is critical
- ✅ Building a design system yourself

#### Use Styled When:

- ✅ You want to ship quickly
- ✅ You don't have a design system
- ✅ You're prototyping/MVP
- ✅ You want "good enough" defaults
- ✅ You're new to Web3/dApps

---

## Migration Path

### Start with Styled, Switch to Headless

```typescript
// Phase 1: Quick prototype with styled
import { ConnectButton } from '@hieco/connect/components';

<ConnectButton />

// Phase 2: Customize with theme
import { HederaConnect, ConnectButton } from '@hieco/connect/components';
import { customTheme } from './theme';

<HederaConnect theme={customTheme}>
  <ConnectButton />
</HederaConnect>

// Phase 3: Switch to headless gradually
import { useWallet } from '@hieco/connect/headless';
import { MyCustomButton } from './MyCustomButton';

function MyConnectButton() {
  const { isConnected, connect, disconnect } = useWallet();

  return (
    <MyCustomButton
      isConnected={isConnected}
      onConnect={() => connect('hashpack')}
      onDisconnect={disconnect}
    />
  );
}
```

---

## Example: Complete Headless Implementation

### Full dApp Example

```typescript
// App.tsx
import { HederaWalletProvider } from '@hieco/connect/headless';
import { Header } from './Header';
import { Transfer } from './Transfer';

function App() {
  return (
    <HederaWalletProvider network="testnet" autoConnect>
      <div className="app">
        <Header />
        <main>
          <Transfer />
        </main>
      </div>
    </HederaWalletProvider>
  );
}

// Header.tsx
import { useWallet, useAccountDropdown } from '@hieco/connect/headless';
import { NetworkSwitcher } from './NetworkSwitcher';

export function Header() {
  const { isConnected } = useWallet();

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <Logo />

      <div className="flex items-center gap-4">
        {isConnected && <NetworkSwitcher />}
        <AccountMenu />
      </div>
    </header>
  );
}

function AccountMenu() {
  const { isConnected } = useWallet();
  const { isOpen, open, close } = useAccountDropdown();

  if (!isConnected) return <ConnectButton />;

  return (
    <>
      <button onClick={open} className="flex items-center gap-2">
        <AccountAvatar />
        <span>0.0.1234</span>
      </button>

      {isOpen && (
        <div className="absolute right-4 top-16 bg-white shadow-lg rounded-lg p-4 border">
          <AccountDropdownContent onClose={close} />
        </div>
      )}
    </>
  );
}

function ConnectButton() {
  const { connect, isConnecting } = useWallet();
  const { isOpen, open, close } = useConnectModal();

  return (
    <>
      <button onClick={open} disabled={isConnecting}>
        Connect Wallet
      </button>

      {isOpen && (
        <WalletModal onClose={close} />
      )}
    </>
  );
}

// Transfer.tsx
import { useWallet, useTransactionSigning } from '@hieco/connect/headless';

export function Transfer() {
  const { isConnected } = useWallet();
  const { sign, state, receipt } = useTransactionSigning();

  if (!isConnected) {
    return <PleaseConnectWallet />;
  }

  return (
    <div>
      <TransferForm onSubmit={(data) => sign(data)} />

      {state === 'signing' && <SigningPrompt />}
      {state === 'success' && <SuccessReceipt receipt={receipt} />}
      {state === 'error' && <ErrorMessage onRetry={reset} />}
    </div>
  );
}
```

---

## API Reference

### Provider Props

```typescript
interface HederaWalletProviderProps {
  // Required
  network: 'mainnet' | 'testnet' | 'previewnet';
  children: React.ReactNode;

  // Optional - Auto-connect
  autoConnect?: boolean;              // Default: false
  storage?: 'localStorage' | 'sessionStorage' | 'memory';
  storageKey?: string;               // Default: '@hieco/wallet'

  // Optional - Wallets
  wallets?: {
    preferred?: string[];
    custom?: WalletConnector[];
  };

  // Optional - Events
  onConnect?: (data: ConnectionData) => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onNetworkChange?: (network: Network) => void;

  // Optional - Advanced
  options?: {
    refreshInterval?: number;       // Balance refresh (ms)
    connectionTimeout?: number;     // Max connection time (ms)
    retryAttempts?: number;         // Retry attempts
    retryDelay?: number;            // Retry delay (ms)
  };
}
```

### Hook Exports

```typescript
// Core hooks
export {
  useWallet,                    // Main wallet state and actions
  useWalletList,               // Available wallets
  useConnectModal,              // Modal state management
  useAccountDropdown,           // Account dropdown state
  useNetworkSwitcher,           // Network switching state
} from '@hieco/connect/headless';

// Transaction hooks
export {
  useTransactionSigning,       // Sign transactions
  useContractCall,              // Contract interactions
  useMessageSigning,            // Sign messages
} from '@hieco/connect/headless';

// Utility hooks
export {
  useAriaProps,                 // ARIA attributes
  useKeyboardNav,               // Keyboard navigation
  useLocalStorage,             // Persistent state
} from '@hieco/connect/headless';
```

---

## Implementation Checklist

### Phase 1: Core Headless Hooks (Days 1-3)

- [ ] `useWallet` hook implementation
- [ ] Wallet connector interface
- [ ] State management (Zustand)
- [ ] Provider component
- [ ] Auto-connect logic
- [ ] Persistent state (localStorage/sessionStorage)
- [ ] Error handling

### Phase 2: Wallet Connectors (Days 3-4)

- [ ] HashPack connector
- [ ] Blade Wallet connector
- [ ] Kabila connector
- [ ] MetaMask Snap connector
- [ ] WalletConnect v2 implementation
- [ ] Wallet detection utilities

### Phase 3: Secondary Hooks (Days 4-5)

- [ ] `useWalletList` hook
- [ ] `useConnectModal` hook
- [ ] `useAccountDropdown` hook
- [ ] `useNetworkSwitcher` hook
- [ ] `useTransactionSigning` hook

### Phase 4: Accessibility (Days 5-6)

- [ ] ARIA attributes generator
- [ ] Keyboard navigation hooks
- [ ] Screen reader announcements
- [ ] Focus management
- [ ] High contrast mode support

### Phase 5: Example Implementations (Days 6-7)

- [ ] Tailwind CSS example
- [ ] shadcn/ui example
- [ ] Chakra UI example
- [ ] CSS Modules example
- [ ] Vanilla CSS example
- [ ] Svelte example
- [ ] Vue example

### Phase 6: Documentation (Day 7)

- [ ] Quick start guide
- [ ] API reference
- [ ] Migration guide (from styled)
- [ ] Examples repository
- [ ] Accessibility guide

### Phase 7: Testing (Days 7-8)

- [ ] Unit tests for all hooks
- [ ] Integration tests with mock wallets
- [ ] Accessibility tests (axe-core)
- [ ] Keyboard navigation tests

### Phase 8: Release (Day 8-9)

- [ ] Bundle optimization
- [ ] Performance testing
- [ ] NPM package setup
- [ ] CI/CD pipeline
- [ ] Release notes

---

## Bundle Size Comparison

```
@hieco/connect (styled)
├── Core logic: 30KB
├── Components: 40KB
├── Styles: 15KB
├── Icons: 10KB
└── Dependencies: 20KB
Total: ~115KB gzipped

@hieco/connect/headless
├── Core logic: 30KB
├── Hooks: 5KB
├── ARIA utilities: 3KB
└── Dependencies: 10KB
Total: ~48KB gzipped

Savings: ~67KB (58% smaller)
```

---

## Success Metrics

### Developer Experience

| Metric | Target | Measurement |
|--------|--------|-------------|
| Setup time | < 3 minutes | Time to first working connection |
| API clarity | 95% coverage | TypeScript autocomplete coverage |
| Bundle size | < 50KB gzipped | Bundle analysis |
| Documentation | 100% coverage | All hooks documented |

### User Experience

| Metric | Target | Measurement |
|--------|--------|-------------|
| Connection success | 95%+ | Analytics tracking |
| Connection time | < 2 seconds | Performance monitoring |
| Accessibility | WCAG 2.2 AA | axe-core testing |
| Keyboard nav | 100% functional | Manual testing |

### Adoption

| Metric | 3-Month Target | 6-Month Target |
|--------|---------------|---------------|
| GitHub stars | 200+ | 1,000+ |
| Weekly downloads | 1,000+ | 5,000+ |
| Using projects | 20+ | 100+ |

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
    "zustand": "^4.0.0"
  }
}
```

**Note:** No UI dependencies! No Emotion, no styled-components, no Radix.

---

## Comparison with Other Headless Libraries

| Library | Type | Bundle | Features |
|---------|------|--------|----------|
| **@hieco/connect/headless** | Wallet | ~48KB | Hedera-specific, multi-wallet |
| RainbowKit | Styled | ~90KB | EVM only, Rainbow-themed |
| ConnectKit | Styled | ~50KB | EVM only, configurable |
| wagmi | Headless | ~25KB | EVM hooks only |
| @rainbow-me/rainbowkit | Styled | ~85KB | EVM, React only |
| **@hieco/connect (styled)** | Styled | ~115KB | Hedera, multi-framework |

---

## Conclusion

The headless approach for `@hieco/connect` offers:

1. **Maximum Flexibility** - Full control over every pixel
2. **Smaller Bundle** - 58% smaller than styled version
3. **Framework Agnostic** - Works with any UI library
4. **Future-Proof** - Logic survives UI trend changes
5. **Accessibility Built-in** - ARIA + keyboard navigation included

**Recommendation:** Ship both headless and styled versions in a single package. Let developers choose their adventure.

---

**Document Version:** 1.0
**Last Updated:** 2026-02-28
**Author:** @abinovalfauzi
**License:** MIT (for documentation structure)
