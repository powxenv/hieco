# `@hieco/wallet-react` API Reference

Canonical docs:

- [`@hieco/wallet-react` README](https://github.com/powxenv/hieco/tree/main/packages/wallet-react)
- Package sources and installed lookup paths: [sources.md](sources.md)

Installed lookup paths:

- `node_modules/@hieco/wallet-react/README.md`
- `node_modules/@hieco/wallet-react/dist/index.d.ts`
- `node_modules/@hieco/wallet-react/dist/index.js`
- `node_modules/@hieco/wallet-react/dist/ui/index.d.ts`
- `node_modules/@hieco/wallet-react/dist/ui/index.js`

Use the installed declaration files as the authoritative source for exact hook signatures and return types.

## Provider

| Export           | What it does                                        | Parameters            | Returns     |
| ---------------- | --------------------------------------------------- | --------------------- | ----------- |
| `WalletProvider` | Provide a Hieco wallet runtime to React components. | `WalletProviderProps` | `ReactNode` |

```ts
type WalletProviderProps = CreateWalletOptions & {
  readonly children: ReactNode;
  readonly wallet?: Wallet;
};
```

## Hooks

| Hook                  | What it does                                             | Parameters | Returns                                                   |
| --------------------- | -------------------------------------------------------- | ---------- | --------------------------------------------------------- | ---------- |
| `useWallet`           | Read the full wallet state and the main runtime actions. | none       | `UseWalletResult`                                         |
| `useWallets`          | Read the available wallet catalog.                       | none       | `readonly WalletOption[]`                                 |
| `useWalletAccount`    | Read the active wallet account.                          | none       | `WalletAccount                                            | null`      |
| `useWalletSigner`     | Read the active Hiero-compatible signer.                 | none       | `Signer                                                   | undefined` |
| `useConnect`          | Read the connect action.                                 | none       | `(options?: ConnectOptions) => Promise<WalletConnection>` |
| `useDisconnect`       | Read the disconnect action.                              | none       | `() => Promise<void>`                                     |
| `useSwitchChain`      | Read the chain switch action.                            | none       | `(chainId: string) => Promise<void>`                      |
| `useConnectionStatus` | Read only the wallet status.                             | none       | `WalletStatus`                                            |
| `useWalletError`      | Read only the current wallet error.                      | none       | `WalletError                                              | null`      |
| `useWalletModal`      | Read modal state and modal actions for the built-in UI.  | none       | `WalletModalState`                                        |

### `WalletModalState`

```ts
type WalletModalState = {
  readonly isOpen: boolean;
  readonly openModal: () => void;
  readonly closeModal: () => void;
  readonly toggleModal: () => void;
};
```

### `UseWalletResult`

```ts
type UseWalletResult = WalletState & {
  readonly connect: (options?: ConnectOptions) => Promise<WalletConnection>;
  readonly disconnect: () => Promise<void>;
  readonly restore: () => Promise<WalletConnection | null>;
  readonly switchChain: (chainId: string) => Promise<void>;
  readonly openModal: () => void;
  readonly closeModal: () => void;
  readonly toggleModal: () => void;
  readonly isModalOpen: boolean;
};
```

## UI Subpath

Import from `@hieco/wallet-react/ui`.

| Export                | What it does                                                   | Parameters | Returns     |
| --------------------- | -------------------------------------------------------------- | ---------- | ----------- |
| `WalletButton`        | Render the default connect button or connected account button. | none       | `ReactNode` |
| `WalletDialog`        | Render the default wallet connection dialog.                   | none       | `ReactNode` |
| `WalletAccountButton` | Render the connected account button directly.                  | none       | `ReactNode` |
| `WalletList`          | Render the built-in wallet picker list.                        | none       | `ReactNode` |

## Behavioral Notes

- `WalletProvider` can be used with no props.
- Pass `wallet={wallet}` when the app already created a runtime with `createWallet()`.
- The built-in UI is optional. The hooks remain the primary API.
- `useWalletSigner()` is the normal signer source for `@hieco/react`.

## Exact Type Definition Entry Points

When an agent needs exact hook signatures or UI exports, read these installed files in order:

1. `node_modules/@hieco/wallet-react/dist/index.d.ts`
2. `node_modules/@hieco/wallet-react/dist/ui/index.d.ts`
3. `node_modules/@hieco/wallet-react/README.md`
4. [packages/wallet-react on GitHub](https://github.com/powxenv/hieco/tree/main/packages/wallet-react)
