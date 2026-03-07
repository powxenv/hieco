# First-Party Wallet Adapter Design

## Core conclusion

We should not build one adapter per wallet brand by default.

We should build:

1. a wallet-agnostic session model inside `@hieco/react`
2. one adapter package per external wallet integration surface

Examples:

- `@hieco/react-appkit`
- `@hieco/react-wagmi` if we later support EVM relay mode directly
- `@hieco/react-hashpack` only if a direct HashPack SDK integration is needed and AppKit is not sufficient

This matches the way Reown and wagmi separate connection infrastructure from wallet-specific implementations. AppKit already aggregates many wallets behind one adapter surface, so Hieco should integrate with AppKit once instead of per wallet.

## Why not one adapter per wallet

Per-wallet adapters create the wrong maintenance boundary.

- HashPack, Kabila, Dropp, and future wallets can all sit behind AppKit
- Hieco does not need to know which wallet brand is active if it can resolve a Hedera `Signer`
- the Hieco boundary is signer and session state, not wallet branding

The only time a wallet-specific package is justified is when a wallet exposes a unique SDK that does not fit an existing integration surface.

## Package boundaries

### `@hieco/react`

Responsibilities:

- Hieco runtime
- TanStack Query integration
- wallet session context
- signer-aware client scoping
- generic wallet session hooks

It should not depend on AppKit, wagmi, HashPack SDKs, or wallet-specific APIs.

### `@hieco/react-appkit`

Responsibilities:

- read AppKit connection state
- resolve Hedera signer from the active AppKit provider
- expose a Hieco wallet session bridge
- optionally expose convenience hooks for AppKit wallet UX

It depends on:

- `@hieco/react`
- `@reown/appkit/react`
- `@hashgraph/hedera-wallet-connect`

## New core model

Current `@hieco/react` treats signer changes as client reconfiguration.

That should be replaced with an explicit wallet session model.

```ts
export type HiecoWalletSession =
  | {
      readonly status: "disconnected";
      readonly signer: undefined;
      readonly accountId: undefined;
      readonly walletId: undefined;
      readonly walletName: undefined;
    }
  | {
      readonly status: "connecting";
      readonly signer: undefined;
      readonly accountId: undefined;
      readonly walletId: string | undefined;
      readonly walletName: string | undefined;
    }
  | {
      readonly status: "connected";
      readonly signer: Signer;
      readonly accountId: string;
      readonly walletId: string | undefined;
      readonly walletName: string | undefined;
    };
```

## Provider redesign

`HiecoProvider` should keep a stable base client for network config and derive a signer-scoped client from wallet session.

### Current

- `config + signer -> create client`
- signer change rotates the whole client
- query cache is isolated by client instance

### Proposed

- `config -> baseClient`
- `walletSession -> signer scope`
- `effectiveClient = walletSession.connected ? baseClient.as(session.signer) : baseClient`
- query cache isolation uses a stable `scopeKey`

## Proposed `@hieco/react` API

```ts
type HiecoProviderProps =
  | {
      readonly config: ClientConfig;
      readonly session?: HiecoWalletSession;
      readonly children: ReactNode;
    }
  | {
      readonly client: HiecoClient;
      readonly session?: HiecoWalletSession;
      readonly children: ReactNode;
    };
```

Compatibility sugar:

- `signer?: Signer` remains supported as shorthand for `session`

## New hooks in `@hieco/react`

- `useHiecoSession()`
- `useHiecoSigner()`
- `useHiecoAccount()`
- `useHiecoWallet()`

`useHiecoController()` should remain only as an escape hatch and should stop being the main documented wallet pattern.

## Query scoping

Signer-aware queries need cache isolation, but not through client reconstruction.

Add:

```ts
type HiecoScope = {
  readonly network: string;
  readonly accountId: string | undefined;
  readonly walletId: string | undefined;
};
```

Derive:

```ts
const scopeKey = ["hieco", network, accountId ?? "anonymous", walletId ?? "unknown"] as const;
```

All query keys should use `scopeKey`.

## Adapter package contract

Adapter packages should not reimplement Hieco hooks.

They should only bridge external wallet state into `HiecoWalletSession`.

### Bridge component

```tsx
export function HiecoWalletSessionProvider(props: {
  readonly session: HiecoWalletSession;
  readonly children: ReactNode;
}): ReactNode;
```

### Adapter-side bridge

```tsx
export function HiecoAppKitBridge(props: { readonly children: ReactNode }): ReactNode;
```

Internally:

- reads AppKit account state
- reads AppKit provider
- resolves signer
- builds `HiecoWalletSession`
- mounts `HiecoWalletSessionProvider`

This keeps `@hieco/react` clean and lets adapter packages evolve independently.

## Proposed `@hieco/react-appkit` API

```tsx
export function HiecoAppKitBridge(props: { readonly children: ReactNode }): ReactNode;

export function useHiecoAppKitSession(): HiecoWalletSession;

export function useHiecoAppKitWallet(): {
  readonly open: () => Promise<void>;
  readonly close: () => Promise<void>;
  readonly address: string | undefined;
  readonly isConnected: boolean;
  readonly status: "connecting" | "connected" | "disconnected";
};
```

## App usage

```tsx
<QueryClientProvider client={queryClient}>
  <HiecoProvider config={{ network: "testnet" }}>
    <HiecoAppKitBridge>
      <App />
    </HiecoAppKitBridge>
  </HiecoProvider>
</QueryClientProvider>
```

Feature components only use:

- `useAccountSend()`
- `useHiecoSession()`

They do not manually set a signer.

## Implementation phases

### Phase 1

Refactor `@hieco/react` internals.

- add `HiecoWalletSession`
- split base client from signer-scoped client
- add wallet session hooks
- move query keys from `clientKey` to `scopeKey`

### Phase 2

Create `@hieco/react-appkit`.

- add `HiecoAppKitBridge`
- resolve signer from AppKit Hedera provider
- add docs and example

### Phase 3

Only if demand exists, add direct wallet packages.

- `@hieco/react-hashpack`
- `@hieco/react-kabila`

These should be added only when there is a concrete SDK that does not already fit AppKit.

## Decision

The correct first-party design is not one connector per wallet.

It is:

- one wallet-agnostic session layer in `@hieco/react`
- one adapter package per external integration surface
- wallet-specific packages only when an ecosystem cannot already be covered by an existing integration surface
