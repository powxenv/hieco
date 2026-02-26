# @hiecom/realtime-react

React hooks for `@hiecom/realtime` with automatic subscription management.

## Install

```bash
# bun
bun add @hiecom/realtime @hiecom/realtime-react

# npm
npm install @hiecom/realtime @hiecom/realtime-react

# pnpm
pnpm add @hiecom/realtime @hiecom/realtime-react

# yarn
yarn add @hiecom/realtime @hiecom/realtime-react
```

## Quick Start

### Step 1: Wrap your app with provider

```tsx
import { RealtimeProvider } from "@hiecom/realtime-react";

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
import { useContractLogs, useStreamState, useChainId } from "@hiecom/realtime-react";

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

## Connection Management

Manually connect and disconnect:

```tsx
import { useRealtimeContext } from "@hiecom/realtime-react";

function ConnectionControls() {
  const { client, state, connect, disconnect } = useRealtimeContext();

  return (
    <div>
      <p>Status: {state._tag}</p>
      {state._tag === "Disconnected" && (
        <button onClick={() => connect()}>Connect</button>
      )}
      {state._tag === "Connected" && (
        <button onClick={() => disconnect()}>Disconnect</button>
      )}
    </div>
  );
}
```

## Subscription Options

### Contract Logs

```tsx
const { logs, isConnected, error } = useContractLogs({
  address: "0x...",
  topics: ["0x..."] as const,
  enabled: true,
});
```

### Automatic Cleanup

All subscriptions are automatically cleaned up on unmount:

```tsx
function MyComponent() {
  const { logs } = useContractLogs({ address: "0x..." });

  return <div>{logs.length} logs received</div>;
}
// Subscription automatically unsubscribes when component unmounts
```

## Using Core Client Directly

For advanced use cases, access the core client:

```tsx
import { useRealtimeClient } from "@hiecom/realtime-react";
import type { RelaySubscription } from "@hiecom/realtime";

function CustomSubscription() {
  const client = useRealtimeClient();

  const subscribe = async () => {
    const { data } = await client.subscribe(
      { type: "newHeads", filter: {} },
      (message) => console.log("New block:", message.result),
    );
    return data;
  };

  return <button onClick={subscribe}>Subscribe to New Blocks</button>;
}
```

## Connection Pool

Use `@hiecom/realtime` connection pool with React:

```tsx
import { ConnectionPool } from "@hiecom/realtime";
import { RealtimeProvider } from "@hiecom/realtime-react";

const pool = new ConnectionPool({
  network: "testnet",
  endpoint: "wss://testnet.mirrornode.hedera.com/relay/ws",
  poolSize: 3,
  strategy: "least-loaded",
});

await pool.connect();

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

## License

MIT
