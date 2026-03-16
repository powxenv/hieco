# @hieco/realtime-react

`@hieco/realtime-react` brings Hieco’s realtime relay client into React with a provider, hooks, and managed connection state.

It is the easiest way to add live Hedera updates to a React app without hand-rolling websocket orchestration.

## Why This Package Exists

Realtime React code gets messy fast when connection state, subscriptions, and cleanup all live in components. This package gives you:

- a `RealtimeProvider`
- shared client and connection state
- hooks for relay subscriptions
- an easier bridge between static reads and live updates

## When To Use It

Choose `@hieco/realtime-react` when you are building:

- live transaction feeds
- streaming dashboards
- React apps that combine initial Mirror reads with realtime updates
- components that should subscribe and unsubscribe cleanly with the tree

## Installation

```bash
npm install @hieco/realtime @hieco/realtime-react
```

```bash
pnpm add @hieco/realtime @hieco/realtime-react
```

```bash
yarn add @hieco/realtime @hieco/realtime-react
```

```bash
bun add @hieco/realtime @hieco/realtime-react
```

Peer dependencies expected from the host app:

- `react >= 18`
- `react-dom >= 18`

## Quick Start

```tsx
import { useEffect } from "react";
import {
  RealtimeProvider,
  useContractLogs,
  useRealtimeContext,
  useStreamState,
} from "@hieco/realtime-react";

function ContractLogFeed() {
  const { connect } = useRealtimeContext();
  const streamState = useStreamState();
  const { logs, isConnected, error } = useContractLogs({
    address: "0x0000000000000000000000000000000000001389",
    enabled: true,
  });

  useEffect(() => {
    void connect();
  }, [connect]);

  if (!isConnected) return <div>{streamState._tag}</div>;
  if (error) return <div>{error.message}</div>;

  return <pre>{JSON.stringify(logs, null, 2)}</pre>;
}

export function App() {
  return (
    <RealtimeProvider
      config={{
        network: "testnet",
        relayEndpoint: "wss://testnet.mirrornode.hedera.com/relay/ws",
      }}
    >
      <ContractLogFeed />
    </RealtimeProvider>
  );
}
```

## The Provider Model

`RealtimeProvider` owns:

- the active relay client
- the current stream state
- `connect()`
- `disconnect()`

That makes realtime connectivity feel like shared app infrastructure instead of one more local component concern.

The provider does not auto-connect by itself. Call `connect()` from `useRealtimeContext()` when the app is ready to open the relay connection.

## Useful Hooks

Common exports include:

- `useRealtimeClient()`
- `useStreamState()`
- `useChainId()`
- `useContractLogs()`

Use the provider and hooks first. Drop to the raw client only when you need manual subscription logic.

## Related Packages

- [`@hieco/realtime`](../realtime/README.md)
- [`@hieco/mirror-react`](../mirror-react/README.md) for “load current state, then stay live” flows
