# `@hieco/sdk` API Reference

Canonical docs:

- [`@hieco/sdk` README](https://github.com/powxenv/hieco/tree/main/packages/sdk)
- Package sources and installed lookup paths: [sources.md](sources.md)

Installed lookup paths:

- `node_modules/@hieco/sdk/README.md`
- `node_modules/@hieco/sdk/dist/index.d.ts`
- `node_modules/@hieco/sdk/dist/index.js`

Use `dist/index.d.ts` as the authoritative source for exact exported signatures and full field-level type definitions.

## Factory Exports

| Export | Purpose | Parameters | Returns | Notes |
| --- | --- | --- | --- | --- |
| `hieco` | Create the fluent client. | `config?: ClientConfig` | `HiecoClient` | Main entry for server code or signer-backed browser code. |
| `hieco.fromEnv` | Create a server-scoped client from environment variables. | `options?: { allowMissingSigner?: boolean }` | `HiecoClient` | Intended for server runtimes. Reads `HIERO_*` environment variables. |
| `hieco.forTestnet` | Create a testnet client with default network config. | none | `HiecoClient` | Convenience factory. |
| `hieco.forMainnet` | Create a mainnet client with default network config. | none | `HiecoClient` | Convenience factory. |
| `hieco.forPreviewnet` | Create a previewnet client with default network config. | none | `HiecoClient` | Convenience factory. |
| `hieco.withSigner` | Create a signer-scoped client in one call. | `signer: Signer, config?: ClientConfig` | `HiecoClient` | Browser-friendly when the signer comes from a wallet. |
| `hieco.validateConfig` | Validate config without creating a client. | `config?: ClientConfig` | `Result<ClientRuntimeConfig>` | Useful for tooling or setup checks. |

## Key Factory Types

```ts
type HiecoClient = TelepathicClient;
type Signer = import("@hieco/sdk").Signer;
```

## Fluent Handle Model

`@hieco/sdk` uses a telepathic fluent model.

- read operations return query handles
- transaction-capable operations return action handles
- the `do` tree eagerly executes the same operations without the extra `.now()` call

### Query Handle

```ts
type QueryHandle<TData> = {
  readonly now: () => Promise<Result<TData>>;
};
```

### Action Handle

```ts
type ActionHandle<TData> = QueryHandle<TData> & {
  readonly tx: () => Result<TransactionDescriptor>;
  readonly queue: (params?: {
    readonly adminKey?: string | true;
    readonly payerAccountId?: string;
    readonly expirationTime?: Date;
    readonly waitForExpiry?: boolean;
    readonly memo?: string;
    readonly maxFee?: string | number | bigint;
  }) => Promise<Result<ScheduleReceipt>>;
};
```

## Common Surface Areas

Important namespaces include:

- `account`
- `token`
- `topic`
- `contract`
- `file`
- `schedule`
- `tx`
- `reads`
- `net`
- `batch`

The package also re-exports:

- `Signer`
- `PrivateKey`
- `PublicKey`
- `Mnemonic`
- `KeyList`
- result and error helpers
- `NETWORK_CONFIGS`, `isDefaultNetwork`, and `isValidEntityId`
- `NetworkType` and `TimestampFilter`

## Exact Type Definition Entry Points

When an agent needs every field, union member, or overload, read these installed files in order:

1. `node_modules/@hieco/sdk/dist/index.d.ts`
2. `node_modules/@hieco/sdk/README.md`
3. [packages/sdk on GitHub](https://github.com/powxenv/hieco/tree/main/packages/sdk)
