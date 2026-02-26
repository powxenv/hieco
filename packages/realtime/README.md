# @hiecom/realtime

Real-time WebSocket client for Hedera Mirror Node HIP-694 JSON-RPC Relay.

## Features

- **WebSocket Connection** - Real-time subscription to Hedera events
- **Auto-Reconnection** - Automatic reconnection with exponential backoff
- **Subscription Management** - Track and restore subscriptions across reconnections
- **Connection Pool** - Distribute subscriptions across multiple connections
- **Load Balancing** - Round-robin, least-loaded, or random strategies
- **Type-Safe** - Full TypeScript support

## Installation

```bash
# bun
bun add @hiecom/realtime

# npm
npm install @hiecom/realtime

# pnpm
pnpm add @hiecom/realtime

# yarn
yarn add @hiecom/realtime
```

## Quick Start

```typescript
import { RelayWebSocketClient } from "@hiecom/realtime";

const client = new RelayWebSocketClient({
  network: "testnet",
  endpoint: "wss://testnet.mirrornode.hedera.com/relay/ws",
});

await client.connect();

const { data: subscriptionId } = await client.subscribe(
  { type: "logs", filter: { address: "0x..." } },
  (message) => console.log("Log:", message.result.transactionHash),
);

await client.unsubscribe(subscriptionId);
await client.disconnect();
```

## API Reference

### StreamConfig

```typescript
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

### RelayWebSocketClient

#### Constructor

```typescript
new RelayWebSocketClient(config: StreamConfig)
```

#### Methods

```typescript
// Connect to WebSocket
connect(): Promise<ApiResult<null>>

// Disconnect from WebSocket
disconnect(): Promise<void>

// Subscribe to events
subscribe(
  subscription: RelaySubscription,
  callback: (message: RelayMessage) => void
): Promise<ApiResult<string>>

// Unsubscribe from events
unsubscribe(subscriptionId: string): Promise<ApiResult<boolean>>

// Get current connection state
getState(): StreamState

// Get chain ID
getChainId(): Promise<ApiResult<string>>
```

### ConnectionPool

#### Constructor

```typescript
new ConnectionPool(config: ConnectionPoolConfig)
```

#### Configuration

```typescript
interface ConnectionPoolConfig {
  readonly network: NetworkType;
  readonly endpoint: string;
  readonly poolSize: number;
  readonly strategy: LoadBalancingStrategy;
  readonly reconnection?: {
    readonly maxAttempts: number;
    readonly initialDelay: number;
    readonly maxDelay: number;
    readonly backoffMultiplier: number;
  };
}
```

#### Methods

```typescript
// Connect all connections in pool
connect(): Promise<ApiResult<null>>

// Disconnect all connections
disconnect(): Promise<void>

// Subscribe (auto-routed to best connection)
subscribe(
  subscription: RelaySubscription,
  callback: (message: RelayMessage) => void
): Promise<ApiResult<string>>

// Unsubscribe
unsubscribe(subscriptionId: string): Promise<ApiResult<boolean>>

// Get pool state
getPoolState(): readonly {
  connectionIndex: number;
  state: StreamState;
  activeSubscriptions: number;
}[]

// Get total active subscriptions
getTotalActiveSubscriptions(): number
```

### Load Balancing Strategies

- `round-robin` - Distribute subscriptions sequentially across connections
- `least-loaded` - Route to connection with fewest active subscriptions
- `random` - Distribute subscriptions randomly

## Subscription Types

### Logs Subscription

Subscribe to contract event logs:

```typescript
await client.subscribe(
  {
    type: "logs",
    filter: {
      address: "0x0000000000000000000000000000000001234",
      topics: ["0x..."] as const,
    },
  },
  (message) => console.log(message.result),
);
```

### New Heads Subscription

Subscribe to new block headers:

```typescript
await client.subscribe({ type: "newHeads", filter: {} }, (message) =>
  console.log("New block:", message.result.number),
);
```

## Stream State

```typescript
type StreamState =
  | { readonly _tag: "Disconnected" }
  | { readonly _tag: "Connecting" }
  | { readonly _tag: "Connected"; readonly connectionId: string }
  | { readonly _tag: "Error"; readonly error: ApiError };
```

## Endpoints

| Network    | WebSocket Endpoint                                |
| ---------- | ------------------------------------------------- |
| Mainnet    | `wss://mainnet.mirrornode.hedera.com/relay/ws`    |
| Testnet    | `wss://testnet.mirrornode.hedera.com/relay/ws`    |
| Previewnet | `wss://previewnet.mirrornode.hedera.com/relay/ws` |

## Examples

### Auto-Reconnection

```typescript
const client = new RelayWebSocketClient({
  network: "testnet",
  endpoint: "wss://testnet.mirrornode.hedera.com/relay/ws",
  reconnection: {
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  },
});

await client.connect();
await client.subscribe({ type: "logs", filter: {} }, callback);

// Connection drops and reconnects...
// All subscriptions are automatically restored
```

### Connection Pool

```typescript
import { ConnectionPool } from "@hiecom/realtime";

const pool = new ConnectionPool({
  network: "testnet",
  endpoint: "wss://testnet.mirrornode.hedera.com/relay/ws",
  poolSize: 3,
  strategy: "least-loaded",
});

await pool.connect();

const { data: subscriptionId } = await pool.subscribe(
  { type: "logs", filter: { address: "0x..." } },
  (msg) => console.log("Log:", msg.result.transactionHash),
);

console.log("Pool state:", pool.getPoolState());
console.log("Total subscriptions:", pool.getTotalActiveSubscriptions());
```

## Framework Packages

For React, use the framework-specific package:

- [`@hiecom/realtime-react`](https://www.npmjs.com/package/@hiecom/realtime-react) - React hooks with automatic subscription management

## Related Packages

- [`@hiecom/types`](https://github.com/powxenv/hiecom/tree/main/packages/types) - Shared TypeScript types (internal)
- [`@hiecom/mirror-js`](https://www.npmjs.com/package/@hiecom/mirror-js) - REST API client

## License

MIT
