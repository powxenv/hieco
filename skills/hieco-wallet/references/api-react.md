# `@hieco/wallet-react` API Reference

Canonical docs:

- [`@hieco/wallet-react` README](https://github.com/powxenv/hieco/tree/main/packages/wallet-react)
- Package sources and installed lookup paths: [sources.md](sources.md)

Installed lookup paths:

- `node_modules/@hieco/wallet-react/README.md`
- `node_modules/@hieco/wallet-react/dist/index.d.ts`
- `node_modules/@hieco/wallet-react/dist/index.js`

Use the installed declaration file as the authoritative source for exact hook signatures and exported type definitions.

## Table Of Contents

- Provider exports
- Controller exports
- `WalletProviderProps`
- `UseWalletResult`

## Provider Exports

| Export                | What it does                                  | Parameters            | Returns     |
| --------------------- | --------------------------------------------- | --------------------- | ----------- |
| `WalletProvider`      | Provide a wallet runtime to React components. | `WalletProviderProps` | `ReactNode` |
| `WalletProviderProps` | Props accepted by `WalletProvider`.           | none                  | type only   |
| `useWalletClient`     | Read the underlying `@hieco/wallet` runtime.  | none                  | `Wallet`    |

## Controller Exports

| Export             | What it does                                          | Parameters | Returns           |
| ------------------ | ----------------------------------------------------- | ---------- | ----------------- |
| `useWallet`        | Read grouped wallet state and common connect actions. | none       | `UseWalletResult` |
| `UseWalletResult`  | Return type exposed by `useWallet()`.                 | none       | type only         |
| `UseWalletQrState` | QR state returned by `useWallet().qr`.                | none       | type only         |

### `WalletProviderProps`

```ts
type WalletProviderProps =
  | {
      readonly children: ReactNode;
      readonly wallet: Wallet;
    }
  | (CreateWalletOptions & {
      readonly children: ReactNode;
    });
```

### `UseWalletQrState`

```ts
type UseWalletQrState = {
  readonly enabled: boolean;
  readonly uri: string | null;
  readonly pending: boolean;
  readonly expired: boolean;
};
```

### `UseWalletResult`

```ts
type UseWalletResult = {
  readonly chain: WalletChain;
  readonly session: WalletSession | null;
  readonly ready: boolean;
  readonly connectableWallets: readonly WalletOption[];
  readonly unavailableWallets: readonly WalletOption[];
  readonly qr: UseWalletQrState;
  readonly error: Error | null;
  readonly open: () => Promise<void>;
  readonly reload: () => Promise<void>;
  readonly close: () => void;
  readonly connectExtension: (walletId: string) => Promise<void>;
  readonly disconnect: () => Promise<void>;
  readonly clearError: () => void;
};
```

## Behavioral Notes

- `@hieco/wallet-react` is headless by design. There is no built-in UI subpath.
- `WalletProvider` can create a runtime from `CreateWalletOptions` or reuse an existing runtime via `wallet={wallet}`.
- `open()` starts or joins the shared QR connection flow exposed by `@hieco/wallet`.
- `reload()` cancels the current pending QR attempt and immediately starts a fresh one.
- `connectExtension(walletId)` can reuse the same pending connection attempt when an installed extension is selected.
- `close()` clears controller-local UI error state. Use `useWalletClient().cancelConnection()` when closing the UI should cancel the pending runtime attempt.
- For signer-aware React data flows, read the signer from `useWallet().session?.signer`.
- `qr.enabled` means WalletConnect is ready and there is no active session. It does not mean a QR URI already exists.
- `qr.pending` is only `true` while a connection attempt exists and the URI has not been assigned yet.
- `qr.expired` reflects a `SESSION_EXPIRED` controller error and is the signal for showing a `reload()` or recreate-QR action.
- `{"enabled":true,"uri":null,"pending":false,"expired":false}` is an idle state with no active attempt, not an in-flight QR state.

## Exact Type Definition Entry Points

When an agent needs exact hook signatures or exported type definitions, read these installed files in order:

1. `node_modules/@hieco/wallet-react/dist/index.d.ts`
2. `node_modules/@hieco/wallet-react/README.md`
3. [packages/wallet-react on GitHub](https://github.com/powxenv/hieco/tree/main/packages/wallet-react)
