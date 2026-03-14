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
bun add @hieco/realtime-react @hieco/realtime @hieco/mirror
```

Peer dependencies expected from the host app:

- `react >= 18`
- `react-dom >= 18`

## Quick Start

```tsx
import { RealtimeProvider } from "@hieco/realtime-react";

export function App({ children }: { children: React.ReactNode }) {
  return (
    <RealtimeProvider
      config={{
        network: "testnet",
        relayEndpoint: "wss://testnet.hashio.io/api/v1/ws",
      }}
    >
      {children}
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

That makes it easier to treat realtime connectivity as shared app infrastructure instead of one more local component concern.

## Notes

- This package depends on `@hieco/realtime` for the underlying client.
- It is a good companion to `@hieco/mirror-react` when you want “load the current view, then stay live.”

## Related Packages

- [`@hieco/realtime`](../realtime/README.md)
- [`@hieco/mirror-react`](../mirror-react/README.md)
