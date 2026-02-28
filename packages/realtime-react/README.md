# @hieco/realtime-react

React hooks for `@hieco/realtime` with automatic subscription management.

## Features

- **Auto-Subscription Management** - Subscriptions automatically cleaned up on unmount
- **Connection Management** - Connect, disconnect, and monitor connection state
- **Real-time Updates** - Receive live contract logs and block headers
- **Type-Safe** - Full TypeScript support

## Installation

```bash
# bun
bun add @hieco/realtime @hieco/realtime-react

# npm
npm install @hieco/realtime @hieco/realtime-react

# pnpm
pnpm add @hieco/realtime @hieco/realtime-react

# yarn
yarn add @hieco/realtime @hieco/realtime-react
```

## Quick Start

### Step 1: Wrap your app with provider

```tsx
import { RealtimeProvider } from "@hieco/realtime-react";

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
import { useContractLogs, useStreamState } from "@hieco/realtime-react";

function ContractLogs() {
  const { logs, isConnected, error } = useContractLogs({
    address: "0x...",
    enabled: true,
  });

  const state = useStreamState();

  if (!isConnected) return <div>Connecting...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>State: {state._tag}</p>
      <ul>
        {logs.map((log, i) => (
          <li key={i}>{log.transactionHash}</li>
        ))}
      </ul>
    </div>
  );
}
```

## API Reference

### Provider

```typescript
<RealtimeProvider
  config={{
    network: NetworkType;
    relayEndpoint: string;
    reconnection?: ReconnectionConfig;
  }}
>
  {children}
</RealtimeProvider>
```

### Context Hooks

```typescript
// Access full context value
useRealtimeContext(): {
  client: RelayWebSocketClient;
  state: StreamState;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

// Access client instance
useRealtimeClient(): RelayWebSocketClient

// Get current connection state
useStreamState(): StreamState
```

### Subscription Hooks

```typescript
// Subscribe to contract logs
useContractLogs(options: {
  address?: string;
  topics?: readonly string[];
  enabled?: boolean;
}): {
  logs: LogResult[];
  isConnected: boolean;
  error: ApiError | null;
}

// Get chain ID
useChainId(): {
  result: ApiResult<string> | null;
  getChainId: () => Promise<void>;
}
```

## Examples

### Connection Management

```tsx
import { useRealtimeContext } from "@hieco/realtime-react";

function ConnectionControls() {
  const { state, connect, disconnect } = useRealtimeContext();

  return (
    <div>
      <p>Status: {state._tag}</p>
      {state._tag === "Disconnected" && <button onClick={() => connect()}>Connect</button>}
      {state._tag === "Connected" && <button onClick={() => disconnect()}>Disconnect</button>}
    </div>
  );
}
```

### Custom Subscription

```tsx
import { useRealtimeClient } from "@hieco/realtime-react";

function CustomSubscription() {
  const client = useRealtimeClient();
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);

  const subscribe = async () => {
    const { data } = await client.subscribe({ type: "newHeads", filter: {} }, (message) => {
      console.log("New block:", message.result.number);
    });
    setSubscriptionId(data);
  };

  return (
    <div>
      <button onClick={subscribe} disabled={!subscriptionId}>
        {subscriptionId ? "Subscribed" : "Subscribe"}
      </button>
    </div>
  );
}
```

## Configuration

```typescript
interface RealtimeConfig {
  network: "mainnet" | "testnet" | "previewnet";
  relayEndpoint: string;
  reconnection?: {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffMultiplier: number;
  };
}
```

## Endpoints

| Network    | WebSocket Endpoint                                |
| ---------- | ------------------------------------------------- |
| Mainnet    | `wss://mainnet.mirrornode.hedera.com/relay/ws`    |
| Testnet    | `wss://testnet.mirrornode.hedera.com/relay/ws`    |
| Previewnet | `wss://previewnet.mirrornode.hedera.com/relay/ws` |

## Related Packages

- [`@hieco/realtime`](https://www.npmjs.com/package/@hieco/realtime) - Core WebSocket client
- [`@hieco/mirror`](https://www.npmjs.com/package/@hieco/mirror) - REST API client

## License

MIT
