# @hieco/realtime

`@hieco/realtime` is the Hieco client for live Hedera relay streams over the realtime JSON-RPC layer.

Use it when your app needs to move from “what happened?” to “what is happening right now?”

## Why This Package Exists

Mirror reads are great for current state, but some apps need to stay subscribed to new events as they arrive. This package gives you:

- a realtime relay client
- connection lifecycle management
- subscription primitives for live chain updates
- a reusable foundation for framework bindings

## When To Use It

Choose `@hieco/realtime` when you are building:

- live dashboards
- transaction or block feeds
- event-driven backend services
- apps that need websocket-style subscriptions without React

If you want the React wrapper, use [`@hieco/realtime-react`](../realtime-react/README.md).

## Installation

```bash
bun add @hieco/realtime @hieco/utils
```

## Quick Start

```ts
import { RelayWebSocketClient } from "@hieco/realtime";

const client = new RelayWebSocketClient({
  network: "testnet",
  endpoint: "wss://testnet.hashio.io/api/v1/ws",
});

await client.connect();

const unsubscribe = await client.subscribeNewHeads((message) => {
  console.log(message);
});
```

## The Realtime Model

The package is centered around connection and subscription primitives:

- connect
- subscribe
- react to stream state
- disconnect cleanly

That keeps it useful in scripts, services, and custom UI integrations where you want low-level control.

## API At A Glance

The package exports connection utilities, relay message types, and stream state types, including:

- realtime connection classes
- stream config and stream state types
- JSON-RPC request and response shapes
- subscription result types such as new heads and logs

## Notes

- This package is the low-level realtime layer in the Hieco ecosystem.
- It pairs well with `@hieco/mirror` when you want initial state plus live updates.

## Related Packages

- [`@hieco/realtime-react`](../realtime-react/README.md)
- [`@hieco/mirror`](../mirror/README.md)
