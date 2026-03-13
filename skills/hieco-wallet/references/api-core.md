# `@hieco/wallet` API Reference

Canonical docs:

- [`@hieco/wallet` README](https://github.com/powxenv/hieco/tree/main/packages/wallet)
- Package sources and installed lookup paths: [sources.md](sources.md)

Installed lookup paths:

- `node_modules/@hieco/wallet/README.md`
- `node_modules/@hieco/wallet/dist/index.d.ts`
- `node_modules/@hieco/wallet/dist/index.js`

Use `dist/index.d.ts` as the authoritative source for exact runtime signatures and exported type definitions.

## Table Of Contents

- Root exports
- Config and state types
- `Wallet`
- Errors

## Root Exports

| Export                       | What it does                                            | Parameters             | Returns            |
| ---------------------------- | ------------------------------------------------------- | ---------------------- | ------------------ |
| `createWallet`               | Create the headless wallet runtime.                     | `CreateWalletOptions`  | `Wallet`           |
| `getConnectableWallets`      | Filter installed wallet options from `WalletState`.     | `state`                | `readonly WalletOption[]` |
| `getUnavailableWallets`      | Filter unavailable wallet options from `WalletState`.   | `state`                | `readonly WalletOption[]` |
| `hederaMainnet`              | Create the built-in Hedera mainnet chain.               | none                   | `WalletChain`      |
| `hederaTestnet`              | Create the built-in Hedera testnet chain.               | none                   | `WalletChain`      |
| `hederaPreviewnet`           | Create the built-in Hedera previewnet chain.            | none                   | `WalletChain`      |
| `hederaDevnet`               | Create a devnet or custom chain definition.             | config object          | `WalletChain`      |
| `hashpack`                   | Create the curated HashPack wallet definition.          | none                   | `WalletDefinition` |
| `kabila`                     | Create the curated Kabila wallet definition.            | none                   | `WalletDefinition` |
| `genericWalletConnectWallet` | Create the generic WalletConnect wallet definition.     | none                   | `WalletDefinition` |
| `getDefaultWallets`          | Return the default wallet catalog.                      | none                   | `readonly WalletDefinition[]` |
| `WalletError`                | Typed wallet error class with a stable `code`.          | `code`, `message?`     | `WalletError`      |
| `asWalletError`              | Normalize unknown errors into a `WalletError`.          | `error`, `fallback`    | `WalletError`      |

## Config And State Types

### `CreateWalletOptions`

```ts
type CreateWalletOptions = {
  readonly projectId?: string;
  readonly app: WalletAppMetadata;
  readonly chain?: WalletChain;
  readonly wallets?: readonly WalletDefinition[];
  readonly restoreOnStart?: boolean;
  readonly storage?: WalletStorage;
  readonly storageKey?: string;
};
```

### `WalletState`

```ts
type WalletState = {
  readonly chain: WalletChain;
  readonly walletConnectEnabled: boolean;
  readonly wallets: readonly WalletOption[];
  readonly session: WalletSession | null;
  readonly connection: WalletConnection | null;
};
```

### `WalletSession`

```ts
type WalletSession = {
  readonly kind: "qr" | "extension";
  readonly wallet: WalletInfo;
  readonly accountId: string;
  readonly caip10: string;
  readonly chain: WalletChain;
  readonly signer: Signer;
};
```

### `WalletConnection`

```ts
type WalletConnection = {
  readonly uri: string | null;
  readonly extensionId: string | null;
};
```

### `WalletOption`

```ts
type WalletOption = {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly availability: "installed" | "unavailable";
  readonly canConnect: boolean;
  readonly installUrl?: string;
};
```

## `Wallet`

| Member                    | What it does                                                | Parameters               | Returns                        |
| ------------------------- | ----------------------------------------------------------- | ------------------------ | ------------------------------ |
| `wallet.snapshot`         | Read the current wallet state synchronously.                | none                     | `WalletState`                  |
| `wallet.subscribe`        | Subscribe to state changes.                                 | `listener: () => void`   | `() => void`                   |
| `wallet.connectQr`        | Start or join the shared QR connection flow.                | none                     | `Promise<WalletSession>`       |
| `wallet.connectExtension` | Start or join the shared extension flow for a wallet ID.    | `walletId: string`       | `Promise<WalletSession>`       |
| `wallet.cancelConnection` | Clear the pending connection attempt.                       | none                     | `void`                         |
| `wallet.disconnect`       | Disconnect the active wallet session.                       | none                     | `Promise<void>`                |
| `wallet.restore`          | Restore the previous wallet session if it can be rehydrated. | none                    | `Promise<WalletSession \| null>` |
| `wallet.destroy`          | Tear down the runtime and clear cached client state.        | none                     | `Promise<void>`                |

## Errors

### `WalletErrorCode`

```ts
type WalletErrorCode =
  | "CONNECT_FAILED"
  | "USER_REJECTED"
  | "SESSION_EXPIRED"
  | "PAIRING_FAILED"
  | "PAIRING_REQUIRED"
  | "WALLET_NOT_READY"
  | "WALLET_NOT_INSTALLED"
  | "WALLET_NOT_SUPPORTED_ON_DESKTOP"
  | "CHAIN_UNSUPPORTED"
  | "STORAGE_UNAVAILABLE"
  | "RESTORE_FAILED"
  | "DISCONNECT_FAILED"
  | "SIGNER_UNAVAILABLE"
  | "DEEPLINK_UNAVAILABLE"
  | "RETURN_TO_APP_UNAVAILABLE";
```

## Behavioral Notes

- `app` is required when creating a runtime.
- `projectId` enables WalletConnect-backed connection and restore behavior.
- Runtime creation is SSR-safe, but `connectQr()`, `connectExtension()`, `disconnect()`, and `restore()` are browser-only actions.
- One runtime owns one chain, one active session, and one pending connection attempt.
- `connectQr()` and `connectExtension()` reuse the same pending attempt until it settles or is canceled.
- `restoreOnStart` performs a best-effort restore after runtime creation in the browser.

## Exact Type Definition Entry Points

When an agent needs exact field-level contracts, read these installed files in order:

1. `node_modules/@hieco/wallet/dist/index.d.ts`
2. `node_modules/@hieco/wallet/README.md`
3. [packages/wallet on GitHub](https://github.com/powxenv/hieco/tree/main/packages/wallet)
