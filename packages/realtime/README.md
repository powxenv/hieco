# @hieco/realtime

## Overview

`@hieco/realtime` is the WebSocket client for Hedera Mirror Node Relay JSON-RPC streams.

It provides:

- direct Relay subscriptions through `RelayWebSocketClient`
- pooled connections through `ConnectionPool`
- typed JSON-RPC protocol helpers
- typed subscription payloads and stream state tracking

## Installation

```bash
npm install @hieco/realtime
```

```bash
pnpm add @hieco/realtime
```

```bash
yarn add @hieco/realtime
```

```bash
bun add @hieco/realtime
```

## When To Use This Package

Use `@hieco/realtime` when you want to:

- subscribe to contract logs or new block headers
- manage Relay subscriptions outside a UI framework
- run long-lived event listeners in workers or services
- control reconnection, connection pooling, and protocol handling directly

If you are working in React, use [`@hieco/realtime-react`](../realtime-react/README.md) unless you specifically need manual lifecycle control.

## Quick Start

```ts
import { RelayWebSocketClient } from "@hieco/realtime";

const client = new RelayWebSocketClient({
  network: "testnet",
  endpoint: "wss://testnet.mirrornode.hedera.com/relay/ws",
});

await client.connect();

const result = await client.subscribe(
  {
    type: "logs",
    filter: {
      address: "0x0000000000000000000000000000000000001389",
    },
  },
  (message) => {
    console.log(message.result);
  },
);

if (result.success) {
  await client.unsubscribe(result.data);
}

await client.disconnect();
```

## Core Concepts

### Stream Config

Every realtime client uses `StreamConfig`:

- `network`
- `endpoint`
- optional `reconnection`

### Stream State

Connection state is represented explicitly:

- `Disconnected`
- `Connecting`
- `Connected`
- `Error`

Use `getState()` or `onStateChange()` to drive your own runtime state machine.

### Subscription Model

`RelayWebSocketClient.subscribe(...)` takes:

- a `RelaySubscription`
- a callback that receives `RelayMessage`

The returned `ApiResult<string>` contains the local subscription ID used by `unsubscribe(...)`.

### Connection Pooling

`ConnectionPool` keeps multiple `RelayWebSocketClient` instances and routes new subscriptions with one of three strategies:

- `round-robin`
- `least-loaded`
- `random`

## Advanced

### Reconnection Configuration

```ts
const client = new RelayWebSocketClient({
  network: "testnet",
  endpoint: "wss://testnet.mirrornode.hedera.com/relay/ws",
  reconnection: {
    maxAttempts: 5,
    initialDelay: 1_000,
    maxDelay: 30_000,
    backoffMultiplier: 2,
  },
});
```

### New Heads Subscription

```ts
await client.subscribe({ type: "newHeads", filter: {} }, (message) => {
  console.log(message.result.number);
});
```

### Connection Pools

```ts
import { ConnectionPool } from "@hieco/realtime";

const pool = new ConnectionPool({
  network: "testnet",
  endpoint: "wss://testnet.mirrornode.hedera.com/relay/ws",
  poolSize: 3,
  strategy: "least-loaded",
});

await pool.connect();
console.log(pool.getPoolState());
await pool.disconnect();
```

### Protocol Types

The package exports the Relay JSON-RPC request and response types for tooling, tests, and integrations that want to model the wire format directly.

## API Reference

### Connection Exports

| Export                  | Kind  | Purpose                                              | Usage form                         |
| ----------------------- | ----- | ---------------------------------------------------- | ---------------------------------- | -------------- | --------- |
| `RelayWebSocketClient`  | class | Direct Relay WebSocket client.                       | `new RelayWebSocketClient(config)` |
| `ConnectionPool`        | class | Multi-connection subscription pool.                  | `new ConnectionPool(config)`       |
| `StreamConfig`          | type  | Config for a single realtime connection.             | `type StreamConfig`                |
| `StreamState`           | type  | Disconnected, connecting, connected, or error state. | `type StreamState`                 |
| `LoadBalancingStrategy` | type  | Pool routing strategy.                               | `"round-robin"                     | "least-loaded" | "random"` |
| `ConnectionPoolConfig`  | type  | Config for `ConnectionPool`.                         | `type ConnectionPoolConfig`        |

### `RelayWebSocketClient`

| Member          | Kind   | Purpose                                               | Usage form                                 |
| --------------- | ------ | ----------------------------------------------------- | ------------------------------------------ |
| `connect`       | method | Open the WebSocket connection.                        | `client.connect()`                         |
| `disconnect`    | method | Close the connection and clear tracked subscriptions. | `client.disconnect()`                      |
| `subscribe`     | method | Subscribe to a relay stream.                          | `client.subscribe(subscription, callback)` |
| `unsubscribe`   | method | Unsubscribe by local subscription ID.                 | `client.unsubscribe(subscriptionId)`       |
| `getChainId`    | method | Query the relay chain ID.                             | `client.getChainId()`                      |
| `getState`      | method | Read the current stream state.                        | `client.getState()`                        |
| `onStateChange` | method | Listen for state changes.                             | `client.onStateChange(listener)`           |

### `ConnectionPool`

| Member                        | Kind   | Purpose                                           | Usage form                               |
| ----------------------------- | ------ | ------------------------------------------------- | ---------------------------------------- |
| `connect`                     | method | Open every client in the pool.                    | `pool.connect()`                         |
| `disconnect`                  | method | Close every client in the pool.                   | `pool.disconnect()`                      |
| `subscribe`                   | method | Subscribe through the selected pooled connection. | `pool.subscribe(subscription, callback)` |
| `unsubscribe`                 | method | Unsubscribe by pooled subscription ID.            | `pool.unsubscribe(subscriptionId)`       |
| `getPoolState`                | method | Inspect each connection state and load.           | `pool.getPoolState()`                    |
| `getTotalActiveSubscriptions` | method | Count pooled subscriptions.                       | `pool.getTotalActiveSubscriptions()`     |

### Subscription Exports

| Export                 | Kind     | Purpose                                        | Usage form                 |
| ---------------------- | -------- | ---------------------------------------------- | -------------------------- | -------------------------- |
| `RelaySubscription`    | type     | Subscription request payload.                  | `{ type: "logs"            | "newHeads", filter: ... }` |
| `RelayMessage`         | type     | Message received from a subscription callback. | `type RelayMessage`        |
| `LogResult`            | type     | Contract log payload.                          | `type LogResult`           |
| `NewHeadsResult`       | type     | New block header payload.                      | `type NewHeadsResult`      |
| `SubscriptionId`       | type     | Branded subscription identifier.               | `type SubscriptionId`      |
| `createSubscriptionId` | function | Brand a raw string as `SubscriptionId`.        | `createSubscriptionId(id)` |

### Protocol Exports

| Export                | Kind | Purpose                               | Usage form                 |
| --------------------- | ---- | ------------------------------------- | -------------------------- |
| `JsonRpcRequest`      | type | Outgoing JSON-RPC request shape.      | `type JsonRpcRequest`      |
| `JsonRpcResponse`     | type | Incoming JSON-RPC response shape.     | `type JsonRpcResponse`     |
| `SubscribeResponse`   | type | Successful subscribe response.        | `type SubscribeResponse`   |
| `UnsubscribeResponse` | type | Successful unsubscribe response.      | `type UnsubscribeResponse` |
| `ChainIdResponse`     | type | Successful chain ID response.         | `type ChainIdResponse`     |
| `JsonRpcErrorCode`    | type | Supported Relay JSON-RPC error codes. | `type JsonRpcErrorCode`    |

## Related Packages

- [`@hieco/realtime-react`](../realtime-react/README.md) for React bindings over this client
- [`@hieco/mirror`](../mirror/README.md) for REST reads from the Hedera Mirror Node API
