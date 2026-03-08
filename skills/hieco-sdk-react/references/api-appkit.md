# `@hieco/react/appkit` API Reference

Canonical docs:

- [`@hieco/react` README](https://github.com/powxenv/hieco/tree/main/packages/react)
- Package sources and installed lookup paths: [sources.md](sources.md)

Installed lookup paths:

- `node_modules/@hieco/react/dist/appkit/index.d.ts`
- `node_modules/@hieco/react/dist/appkit/index.js`

## Overview

`@hieco/react/appkit` is the optional Reown AppKit bridge exported by `@hieco/react`.

Use it when:

- the app already uses Reown AppKit
- the wallet connection should drive `HiecoProvider` automatically
- the app wants a React-native bridge instead of manually passing a signer

## Exports

| Export                 | What it does                                                                       | Parameters                              | Returns                                    |
| ---------------------- | ---------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------ |
| `createHiecoAppKit`    | Initialize Reown AppKit with the Hedera universal provider wired in automatically. | `options: CreateHiecoAppKitOptions`     | `Promise<ReturnType<typeof createAppKit>>` |
| `HiecoAppKitProvider`  | Compose `HiecoProvider` with `useHiecoAppKitSigner`.                               | `props: HiecoAppKitProviderProps`       | `ReactNode`                                |
| `useHiecoAppKitSigner` | Resolve the current Hedera signer from AppKit state.                               | `options?: UseHiecoAppKitSignerOptions` | `Signer \| undefined`                      |

## Type Definitions

### `CreateHiecoAppKitOptions`

```ts
type CreateHiecoAppKitOptions = Omit<CreateAppKit, "universalProvider">;
```

Important required fields come from Reown AppKit itself, typically:

- `projectId`
- `metadata`
- `networks`
- `adapters`

`createHiecoAppKit` injects `universalProvider` internally by calling `HederaProvider.init(...)`.

### `UseHiecoAppKitSignerOptions`

```ts
interface UseHiecoAppKitSignerOptions {
  readonly namespace?: typeof hederaNamespace;
}
```

If omitted, `namespace` defaults to the Hedera namespace exported by `@hashgraph/hedera-wallet-connect`.

### `HiecoAppKitProviderProps`

```ts
type HiecoAppKitProviderProps = Omit<HiecoProviderProps, "signer"> & UseHiecoAppKitSignerOptions;
```

This means `HiecoAppKitProvider` accepts the normal `HiecoProvider` props except `signer`, plus an optional `namespace`.

## Function Contracts

### `createHiecoAppKit`

Behavior:

1. reads `metadata` and `projectId` from the provided AppKit options
2. calls `HederaProvider.init({ metadata, projectId })`
3. passes the resulting `universalProvider` into `createAppKit(...)`
4. returns the created AppKit instance

Use it during app bootstrap before rendering wallet UI.

### `useHiecoAppKitSigner`

Behavior:

1. reads connection state from `useAppKitAccount({ namespace })`
2. reads the wallet provider from `useAppKitProvider(namespace)`
3. returns `undefined` when the wallet is disconnected or the Hedera native provider is unavailable
4. otherwise returns `nativeProvider.getSigner(topic)`

### `HiecoAppKitProvider`

Behavior:

1. resolves the signer with `useHiecoAppKitSigner`
2. passes that signer into `HiecoProvider`
3. keeps the rest of the provider contract identical to `HiecoProvider`

## Exact Type Definition Entry Points

When an agent needs the exact field-level contract, read these installed files in order:

1. `node_modules/@hieco/react/dist/appkit/index.d.ts`
2. `node_modules/@hieco/react/dist/index.d.ts`
3. `node_modules/@hieco/react/README.md`
