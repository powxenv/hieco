# `@hieco/wallet` API Reference

Canonical docs:

- [`@hieco/wallet` README](https://github.com/powxenv/hieco/tree/main/packages/wallet)
- Package sources and installed lookup paths: [sources.md](sources.md)

Installed lookup paths:

- `node_modules/@hieco/wallet/README.md`
- `node_modules/@hieco/wallet/dist/index.d.ts`
- `node_modules/@hieco/wallet/dist/index.js`

Use `dist/index.d.ts` as the authoritative source for exact exported signatures and field-level type definitions.

## Factory And Helper Exports

| Export                       | What it does                                             | Parameters                    | Returns            |
| ---------------------------- | -------------------------------------------------------- | ----------------------------- | ------------------ |
| `createWallet`               | Create the headless wallet runtime.                      | `CreateWalletOptions?`        | `Wallet`           |
| `hederaMainnet`              | Create the built-in Hedera mainnet chain definition.     | none                          | `WalletChain`      |
| `hederaTestnet`              | Create the built-in Hedera testnet chain definition.     | none                          | `WalletChain`      |
| `hederaPreviewnet`           | Create the built-in Hedera previewnet chain definition.  | none                          | `WalletChain`      |
| `hederaDevnet`               | Create a devnet chain definition.                        | config object                 | `WalletChain`      |
| `hashpack`                   | Create the curated HashPack wallet definition.           | none                          | `WalletDefinition` |
| `kabila`                     | Create the curated Kabila wallet definition.             | none                          | `WalletDefinition` |
| `genericWalletConnectWallet` | Create the neutral Hedera WalletConnect fallback wallet. | none                          | `WalletDefinition` |
| `createWalletError`          | Construct a typed wallet error.                          | `code`, `message`, `options?` | `WalletError`      |
| `formatWalletError`          | Convert a typed wallet error into readable text.         | `error`                       | `string`           |
| `asWalletError`              | Normalize an unknown value into a typed wallet error.    | `error`, `fallback`           | `WalletError`      |

## Runtime Contract

| Member               | What it does                                      | Parameters               | Returns                     |
| -------------------- | ------------------------------------------------- | ------------------------ | --------------------------- | ---------- |
| `wallet.snapshot`    | Read the current wallet state snapshot.           | none                     | `WalletState`               |
| `wallet.onChange`    | Subscribe to future wallet state changes.         | `(listener: () => void)` | `() => void`                |
| `wallet.connect`     | Start a wallet connection flow.                   | `ConnectOptions?`        | `Promise<WalletConnection>` |
| `wallet.disconnect`  | Disconnect the active wallet session.             | none                     | `Promise<void>`             |
| `wallet.restore`     | Restore the previous wallet session if it exists. | none                     | `Promise<WalletConnection   | null>`     |
| `wallet.switchChain` | Switch the active Hedera chain in the runtime.    | `chainId: string`        | `Promise<void>`             |
| `wallet.signer`      | Read the active Hiero-compatible signer.          | none                     | `Signer                     | undefined` |
| `wallet.destroy`     | Tear down the runtime.                            | none                     | `Promise<void>`             |
| `wallet.$state`      | Read the underlying Nanostore directly.           | none                     | `ReadableAtom<WalletState>` |

## Key Type Definitions

### `CreateWalletOptions`

```ts
type CreateWalletOptions = {
  readonly projectId?: string;
  readonly app?: Partial<WalletAppMetadata> & {
    readonly redirect?: {
      readonly native?: string;
      readonly universal?: string;
    };
  };
  readonly chains?: readonly WalletChain[];
  readonly wallets?: readonly WalletDefinition[];
  readonly autoConnect?: boolean;
  readonly storage?: WalletStorage;
  readonly storageKey?: string;
};
```

### `ConnectOptions`

```ts
type ConnectOptions = {
  readonly wallet?: string;
  readonly chain?: string;
  readonly presentation?: "auto" | "qr" | "deeplink";
};
```

### `WalletPrompt`

```ts
type WalletPrompt =
  | {
      readonly kind: "qr";
      readonly uri: string;
      readonly wallet: WalletOption;
    }
  | {
      readonly kind: "deeplink";
      readonly uri: string;
      readonly href: string;
      readonly wallet: WalletOption;
    }
  | {
      readonly kind: "return";
      readonly wallet: WalletOption;
      readonly href?: string;
    };
```

### `WalletState`

```ts
type WalletState = {
  readonly status: "idle" | "connecting" | "connected" | "restoring" | "disconnecting" | "error";
  readonly wallets: readonly WalletOption[];
  readonly wallet: WalletOption | null;
  readonly account: WalletAccount | null;
  readonly accounts: readonly WalletAccount[];
  readonly chain: WalletChain;
  readonly chains: readonly WalletChain[];
  readonly signer: Signer | undefined;
  readonly error: WalletError | null;
  readonly prompt: WalletPrompt | null;
};
```

## Behavioral Notes

- Creating a runtime is SSR-safe.
- `connect()` and `restore()` are browser-only runtime actions.
- Managed mode is used when `projectId` is omitted.
- Production apps should pass `projectId` explicitly.
- The signer is the main integration boundary with `@hieco/sdk` and `@hieco/react`.

## Exact Type Definition Entry Points

When an agent needs the exact field-level contract, read these installed files in order:

1. `node_modules/@hieco/wallet/dist/index.d.ts`
2. `node_modules/@hieco/wallet/README.md`
3. [packages/wallet on GitHub](https://github.com/powxenv/hieco/tree/main/packages/wallet)
