# @hiecom/realtime

Real-time streaming client for Hedera Mirror Node data via WebSocket (HIP-694 JSON-RPC Relay).

## Install

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

## Usage

```typescript
import { RelayWebSocketClient } from "@hiecom/realtime";

const client = new RelayWebSocketClient({
  network: "testnet",
  endpoint: "wss://testnet.mirrornode.hedera.com/relay/ws",
});

await client.connect();

const { data: subscriptionId } = await client.subscribe(
  { type: "logs", filter: { address: "0x..." } },
  (msg) => console.log("Log:", msg.result.transactionHash),
);

await client.unsubscribe(subscriptionId);
await client.disconnect();
```

## Client

```typescript
const client = new RelayWebSocketClient({
  network: "mainnet",
  endpoint: "wss://mainnet.mirrornode.hedera.com/relay/ws",
  reconnection: {
    maxAttempts: 5,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
  },
});

const client = new RelayWebSocketClient({
  network: "testnet",
  endpoint: "wss://testnet.mirrornode.hedera.com/relay/ws",
});

const client = new RelayWebSocketClient({
  network: "previewnet",
  endpoint: "wss://previewnet.mirrornode.hedera.com/relay/ws",
});
```

### API Methods

**Connection**

```typescript
await client.connect();
await client.disconnect();
client.getState();
await client.getChainId();
```

**Subscriptions**

```typescript
client.subscribe(
  { type: "logs", filter: { address: "0x...", topics: ["0x..."] } },
  (message) => console.log(message.result),
);

client.subscribe(
  { type: "newHeads", filter: {} },
  (message) => console.log(message.result),
);

await client.unsubscribe(subscriptionId);
```

## Connection Pool

Distribute subscriptions across multiple WebSocket connections with load balancing:

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

await pool.unsubscribe(subscriptionId);
await pool.disconnect();
```

### Load Balancing Strategies

- `round-robin` - Distribute subscriptions sequentially
- `least-loaded` - Use connection with fewest active subscriptions
- `random` - Distribute subscriptions randomly

## React

### Step 1: Wrap your app with provider

```tsx
import { RealtimeProvider } from "@hiecom/realtime";

export function App() {
  return (
    <RealtimeProvider
      config={{
        network: "testnet",
        relayEndpoint: "wss://testnet.mirrornode.hedera.com/relay/ws",
      }}
    >
      <YourApp />
    </RealtimeProvider>
  );
}
```

### Step 2: Use hooks in your components

```tsx
import { useContractLogs, useStreamState, useChainId } from "@hiecom/realtime";

function ContractLogs() {
  const { logs, isConnected, error } = useContractLogs({
    address: "0x...",
    enabled: true,
  });

  const state = useStreamState();
  const { result: chainId, getChainId } = useChainId();

  if (!isConnected) return <div>Connecting...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>State: {state._tag}</p>
      <button onClick={() => getChainId()}>Get Chain ID</button>
      {chainId?.success && <p>Chain ID: {chainId.data}</p>}
      <ul>
        {logs.map((log, i) => (
          <li key={i}>{log.transactionHash}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Available Hooks

- `useRealtimeContext` - Access realtime context value
- `useRealtimeClient` - Access client instance
- `useStreamState` - Get current connection state
- `useContractLogs` - Subscribe to contract event logs
- `useChainId` - Get current chain ID

## Subscription Types

### Logs

Subscribe to contract event logs:

```typescript
await client.subscribe(
  {
    type: "logs",
    filter: {
      address: "0x...",
      topics: ["0x..."] as const,
    },
  },
  (message) => console.log(message.result),
);
```

### New Heads

Subscribe to new block headers:

```typescript
await client.subscribe(
  { type: "newHeads", filter: {} },
  (message) => console.log(message.result),
);
```

## Auto-Reconnection

Subscriptions are automatically restored after reconnection:

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

## Endpoints

| Network    | WebSocket Endpoint                                |
| ---------- | ------------------------------------------------- |
| Mainnet    | `wss://mainnet.mirrornode.hedera.com/relay/ws`    |
| Testnet    | `wss://testnet.mirrornode.hedera.com/relay/ws`    |
| Previewnet | `wss://previewnet.mirrornode.hedera.com/relay/ws` |

## Response Format

Every method returns a typed result:

```typescript
const result = await client.subscribe({ type: "logs", filter: {} }, callback);

if (result.success) {
  console.log("Subscription ID:", result.data);
} else {
  console.error(result.error.message);
}
```

## License

MIT
