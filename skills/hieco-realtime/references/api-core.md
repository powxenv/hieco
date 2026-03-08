# `@hieco/realtime` API Reference

Canonical docs:

- [`@hieco/realtime` README](https://github.com/powxenv/hieco/tree/main/packages/realtime)
- Package sources and installed lookup paths: [sources.md](sources.md)

Installed lookup paths:

- `node_modules/@hieco/realtime/README.md`
- `node_modules/@hieco/realtime/dist/index.d.ts`
- `node_modules/@hieco/realtime/dist/index.js`

Use `dist/index.d.ts` as the authoritative source for exact connection, pool, and subscription type definitions.

## Table Of Contents

- Connection exports
- Stream and protocol types
- `RelayWebSocketClient`
- `ConnectionPool`
- Subscription types
- Protocol types

## Connection Exports

| Export                  | What it does                                  | Parameters                     | Returns   |
| ----------------------- | --------------------------------------------- | ------------------------------ | --------- |
| `RelayWebSocketClient`  | Direct Relay WebSocket client.                | `config: StreamConfig`         | instance  |
| `ConnectionPool`        | Pool of realtime clients with load balancing. | `config: ConnectionPoolConfig` | instance  |
| `StreamConfig`          | Config for a single realtime connection.      | none                           | type only |
| `StreamState`           | Realtime connection state union.              | none                           | type only |
| `LoadBalancingStrategy` | Pool routing strategy.                        | none                           | type only |
| `ConnectionPoolConfig`  | Config for `ConnectionPool`.                  | none                           | type only |

## Stream And Protocol Types

### `StreamConfig`

```ts
interface StreamConfig {
  readonly network: NetworkType;
  readonly endpoint: string;
  readonly reconnection?: {
    readonly maxAttempts: number;
    readonly initialDelay: number;
    readonly maxDelay: number;
    readonly backoffMultiplier: number;
  };
}
```

### `StreamState`

```ts
type StreamState =
  | { readonly _tag: "Disconnected" }
  | { readonly _tag: "Connecting" }
  | { readonly _tag: "Connected"; readonly connectionId: string }
  | { readonly _tag: "Error"; readonly error: ApiError };
```

### `ConnectionPoolConfig`

```ts
interface ConnectionPoolConfig extends Omit<StreamConfig, "reconnection"> {
  readonly poolSize: number;
  readonly strategy: "round-robin" | "least-loaded" | "random";
  readonly reconnection?: StreamConfig["reconnection"];
}
```

## `RelayWebSocketClient`

| Member          | What it does                                          | Parameters                                                                   | Returns                                                                |
| --------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `connect`       | Open the WebSocket connection.                        | none                                                                         | `Promise<ApiResult<null>>`                                             |
| `disconnect`    | Close the connection and clear tracked subscriptions. | none                                                                         | `Promise<void>`                                                        |
| `subscribe`     | Subscribe to a relay stream.                          | `subscription: RelaySubscription, callback: (message: RelayMessage) => void` | `Promise<ApiResult<string>>` where `data` is the local subscription ID |
| `unsubscribe`   | Unsubscribe by local subscription ID.                 | `subscriptionId: string`                                                     | `Promise<ApiResult<boolean>>`                                          |
| `getChainId`    | Query the relay chain ID.                             | none                                                                         | `Promise<ApiResult<string>>`                                           |
| `getState`      | Read the current stream state synchronously.          | none                                                                         | `StreamState`                                                          |
| `onStateChange` | Listen for stream state changes.                      | `listener: (state: StreamState) => void`                                     | `() => void` unsubscribe function                                      |

## `ConnectionPool`

| Member                        | What it does                                      | Parameters                                                                   | Returns                                                                                   |
| ----------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `connect`                     | Open every client in the pool.                    | none                                                                         | `Promise<ApiResult<null>>`                                                                |
| `disconnect`                  | Close every client in the pool.                   | none                                                                         | `Promise<void>`                                                                           |
| `subscribe`                   | Subscribe through the selected pooled connection. | `subscription: RelaySubscription, callback: (message: RelayMessage) => void` | `Promise<ApiResult<string>>` where `data` is the pooled local ID                          |
| `unsubscribe`                 | Unsubscribe by pooled subscription ID.            | `subscriptionId: string`                                                     | `Promise<ApiResult<boolean>>`                                                             |
| `getPoolState`                | Inspect each connection state and load.           | none                                                                         | `readonly { connectionIndex: number; state: StreamState; activeSubscriptions: number }[]` |
| `getTotalActiveSubscriptions` | Count pooled subscriptions.                       | none                                                                         | `number`                                                                                  |

## Subscription Types

### `RelaySubscription`

```ts
interface RelaySubscription {
  readonly type: "logs" | "newHeads";
  readonly filter: {
    readonly address?: string | readonly string[];
    readonly topics?: readonly (string | readonly string[] | null)[];
  };
}
```

### `LogResult`

```ts
interface LogResult {
  readonly address: string;
  readonly blockHash: string;
  readonly blockNumber: string;
  readonly data: string;
  readonly logIndex: string;
  readonly topics: readonly string[];
  readonly transactionHash: string;
  readonly transactionIndex: string;
}
```

### `NewHeadsResult`

```ts
interface NewHeadsResult {
  readonly hash: string;
  readonly parentHash: string;
  readonly sha3Uncles: string;
  readonly logsBloom: string;
  readonly transactionsRoot: string;
  readonly stateRoot: string;
  readonly receiptsRoot: string;
  readonly number: string;
  readonly gasLimit: string;
  readonly gasUsed: string;
  readonly timestamp: string;
  readonly extraData: string;
  readonly difficulty: string;
  readonly miner: string;
  readonly nonce: string;
  readonly size?: string;
  readonly totalDifficulty?: string;
  readonly mixHash?: string;
}
```

### `RelayMessage`

```ts
interface RelayMessage {
  readonly subscription: string;
  readonly result: LogResult | NewHeadsResult;
}
```

## Protocol Types

| Export                | Definition                                                                                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `JsonRpcRequest`      | `{ readonly jsonrpc: "2.0"; readonly id: number; readonly method: "eth_subscribe" \| "eth_unsubscribe" \| "eth_chainId"; readonly params: unknown[] }`                                                         |
| `JsonRpcResponse`     | `{ readonly jsonrpc: "2.0"; readonly id?: number; readonly result?: unknown; readonly error?: { readonly code: number; readonly message: string }; readonly method?: string; readonly params?: RelayMessage }` |
| `SubscribeResponse`   | `{ readonly jsonrpc: "2.0"; readonly id: number; readonly result: string }`                                                                                                                                    |
| `UnsubscribeResponse` | `{ readonly jsonrpc: "2.0"; readonly id: number; readonly result: boolean }`                                                                                                                                   |
| `ChainIdResponse`     | `{ readonly jsonrpc: "2.0"; readonly id: number; readonly result: string }`                                                                                                                                    |
| `JsonRpcErrorCode`    | `-32700 \| -32600 \| -32601 \| -32602 \| -32603 \| -32608 \| 4001 \| 4002 \| 4003`                                                                                                                             |

## Exact Type Definition Entry Points

When an agent needs the exact class signatures or public type exports, read these installed files in order:

1. `node_modules/@hieco/realtime/dist/index.d.ts`
2. `node_modules/@hieco/realtime/README.md`
3. [packages/realtime on GitHub](https://github.com/powxenv/hieco/tree/main/packages/realtime)
