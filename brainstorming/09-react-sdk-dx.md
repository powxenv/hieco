# React SDK DX Redesign

## Goal

Make `@hieco/react` feel native in the React ecosystem.

The target is not "React wrappers around SDK methods".

The target is:

- one root provider for runtime configuration
- first-class wallet connection primitives
- headless hooks that feel like wagmi or Solana React hooks
- TanStack Query for cache, invalidation, suspense, and mutation state
- no imperative signer plumbing in feature components

## What feels wrong today

The current package in `packages/react` is technically sound, but the DX is still too low-level.

### Current issues

1. `useHiecoController()` is too prominent.

   It exposes config mutation and signer mutation directly. That is useful as an escape hatch, but it should not be the primary wallet integration story.

2. Signer state is modeled as client state.

   In `packages/react/src/provider.tsx`, changing the signer rebuilds the whole client and rotates `clientKey`. This makes wallet connection feel like transport reconfiguration instead of user session state.

3. Wallet integration is not first-class.

   Developers are expected to bring their own wallet abstraction and manually bridge it into the Hieco provider. That is workable, but it does not feel native.

4. The package has data hooks but no wallet hooks.

   In modern React web3 libraries, these usually come together:
   - connection hooks
   - account hooks
   - transaction hooks
   - query hooks

5. The example shape encourages imperative glue code.

   That pushes connector setup into app code instead of into a reusable provider and hook boundary.

## Research summary

### wagmi

- Root provider configured once
- Connectors configured up front
- React Query provider composed at the app root
- Wallet state available via hooks like `useConnect`, `useConnectors`, `useConnection`, `useDisconnect`
- Contract and transaction hooks consume the connected wallet without the app manually passing a signer around

Relevant docs:

- https://wagmi.sh/react/guides/connect-wallet

### Solana React hooks

- Stable client configured once
- Wallet connectors configured on the client or provider
- Wallet hooks are first-class: `useWallet`, `useWalletConnection`, `useConnectWallet`, `useDisconnectWallet`
- Transaction hooks are declarative and wallet-aware
- Query and runtime hooks are layered on top of the shared client runtime

Relevant docs:

- https://solana.com/docs/frontend/react-hooks

### Hedera WalletConnect tutorial

- Hedera examples already move toward a dedicated wallet abstraction such as `useWalletInterface`
- Wallet integration is treated as an app-level provider concern
- UI code consumes wallet state rather than constructing wallet connectors inline

Relevant docs:

- https://docs.hedera.com/hedera/tutorials/more-tutorials/develop-a-hedera-dapp-integrated-with-walletconnect

## Proposed direction

The best DX is a two-layer architecture.

## Layer 1: `@hieco/react`

This package should stay headless and own:

- Hieco runtime config
- TanStack Query integration
- generated domain hooks
- transaction helpers
- low-level signer context support

It should not own wallet SDKs directly.

### Proposed shape

- `HiecoProvider`
- `HiecoQueryProvider`
- `useHiecoClient`
- `useHiecoConfig`
- `useHiecoNetwork`
- generated operation hooks
- low-level signer hooks

### Provider model

Split runtime config from wallet identity.

- runtime config: network, mirror URL, retry, deadlines
- wallet session: signer, account, wallet metadata

Signer changes should not be treated as transport reconfiguration by default.

### Internal runtime change

The provider should keep a stable base client for network configuration and derive a scoped signer-aware client from wallet state when needed.

Current model:

- `config + signer -> recreate client -> rotate clientKey`

Proposed model:

- `config -> stable base client`
- `signer -> wallet session context`
- hooks resolve `signer ? baseClient.as(signer) : baseClient`

Benefits:

- connecting or disconnecting a wallet does not invalidate unrelated caches
- network changes still produce a clean cache boundary
- wallet state feels like account state, not infrastructure state

### Low-level hooks

Keep low-level hooks, but reposition them.

- `useHiecoController` becomes escape hatch, not primary DX
- add `useHiecoSigner`
- add `useHiecoAccount`
- add `useHiecoSession`

## Layer 2: wallet connection package

Create a separate package, ideally:

- `@hieco/connect`
- or `@hieco/connect-react`

This package should own:

- wallet adapter contracts
- connector lifecycle
- auto-connect
- persistence
- account status
- wallet metadata
- connect and disconnect actions

### Adapter packages

Wallet adapters should be separate packages, similar to wagmi connectors.

- `@hieco/connector-hashpack`
- `@hieco/connector-blade`
- `@hieco/connector-kabila`
- `@hieco/connector-metamask`

### Core connect API

```tsx
type HiecoWalletAdapter = {
  readonly id: string;
  readonly name: string;
  readonly icon?: string;
  readonly ready: boolean;
  connect(): Promise<HiecoWalletSession>;
  disconnect(): Promise<void>;
  getSession(): Promise<HiecoWalletSession | null>;
};

type HiecoWalletSession = {
  readonly accountId: string;
  readonly signer: import("@hieco/sdk").Signer;
  readonly walletId: string;
  readonly walletName: string;
};
```

### React connect API

```tsx
type HiecoWalletProviderProps = {
  readonly children: React.ReactNode;
  readonly adapters: ReadonlyArray<HiecoWalletAdapter>;
  readonly autoConnect?: boolean;
  readonly storageKey?: string;
  readonly onError?: (error: Error, adapter?: HiecoWalletAdapter) => void;
};
```

Hooks:

- `useWallets()`
- `useWallet()`
- `useWalletConnection()`
- `useConnectWallet()`
- `useDisconnectWallet()`
- `useWalletAccount()`
- `useWalletSigner()`

## Best possible root API

The best end-state is one provider stack that feels normal in React.

```tsx
"use client";

import { QueryClient } from "@tanstack/react-query";
import { HiecoProvider } from "@hieco/react";
import { HiecoWalletProvider } from "@hieco/connect-react";
import { hashPack } from "@hieco/connector-hashpack";

const queryClient = new QueryClient();

const adapters = [
  hashPack({
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    metadata: {
      name: "My App",
      description: "Hedera wallet app",
      url: "https://example.com",
      icons: ["https://example.com/icon.png"],
    },
  }),
];

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HiecoProvider config={{ network: "testnet" }} queryClient={queryClient}>
      <HiecoWalletProvider adapters={adapters} autoConnect>
        {children}
      </HiecoWalletProvider>
    </HiecoProvider>
  );
}
```

Then feature code becomes normal:

```tsx
import { useAccountSend } from "@hieco/react";
import { useWalletConnection } from "@hieco/connect-react";

export function CheckoutButton() {
  const { status, accountId } = useWalletConnection();
  const send = useAccountSend();

  return (
    <button
      disabled={status !== "connected" || send.isPending}
      onClick={() =>
        send.mutate({
          to: "0.0.5005",
          amount: 10,
          memo: "order-48291",
        })
      }
    >
      {status === "connected" ? `Pay from ${accountId}` : "Connect wallet"}
    </button>
  );
}
```

## Why this is more native

1. No `await import` in UI code

   Wallet libraries are imported in a client-only provider module, which is how React apps normally structure browser-only integrations.

2. No signer setter in feature components

   Feature components should not need `setSigner`. They should only care whether a wallet is connected and whether a mutation can run.

3. Connectors are explicit configuration, not hidden glue

   This matches wagmi and Solana wallet adapter.

4. Wallet state and data state are separate

   That keeps mental models clean and prevents unrelated cache churn.

5. The package stays composable

   Teams can use only `@hieco/react`, only `@hieco/connect`, or both together.

## What to change in the current package

## Phase 1

Improve `@hieco/react` without adding wallet packages yet.

1. Rework `HiecoProvider` internals so signer changes do not recreate the base client.
2. Add `useHiecoSigner`, `useHiecoAccount`, and `useHiecoSession`.
3. Reposition `useHiecoController` as advanced API only.
4. Remove wallet-connection style examples from the README that rely on direct controller mutation.
5. Document a recommended pattern:
   app-owned wallet provider -> pass signer into Hieco runtime -> use domain hooks in features

## Phase 2

Add `@hieco/connect-react`.

1. Define adapter contract
2. Build wallet provider and connection hooks
3. Add auto-connect and storage support
4. Expose connected signer to `@hieco/react`

## Phase 3

Add first-party adapters.

1. HashPack
2. Blade
3. Kabila
4. MetaMask / WalletConnect-based flows

## Phase 4

Optional UI package.

1. `ConnectWalletButton`
2. `WalletMenu`
3. `WalletAvatar`
4. `WalletStatusBadge`

## Recommendation

Do not try to make `@hieco/react` itself own every wallet SDK.

Do make wallet connection a first-class part of the overall Hieco React story.

The best end-state is:

- `@hieco/react` for runtime, queries, mutations, and generated hooks
- `@hieco/connect-react` for wallet connection
- small adapter packages for real wallets
- optional UI package on top
