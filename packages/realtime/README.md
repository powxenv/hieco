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

## Quick Start

```ts
import { RelayWebSocketClient } from "@hieco/realtime";

const client = new RelayWebSocketClient({
  network: "testnet",
  endpoint: "wss://testnet.mirrornode.hedera.com/relay/ws",
});

const connected = await client.connect();

if (!connected.success) {
  throw new Error(connected.error.message);
}

const subscription = await client.subscribe({ type: "newHeads" }, (message) => {
  console.log(message.result);
});

if (subscription.success) {
  await client.unsubscribe(subscription.data);
}

await client.disconnect();
```

## The Realtime Model

The package is centered around connection and subscription primitives:

- connect
- subscribe
- react to stream state
- unsubscribe
- disconnect cleanly

That keeps it useful in scripts, services, and custom UI integrations where you want low-level control.

## Client Choices

Inside the package there are two main connection models:

- `RelayWebSocketClient` for one connection
- `ConnectionPool` for multiple coordinated connections

Start with `RelayWebSocketClient`. Reach for `ConnectionPool` only when the app genuinely needs pooled subscriptions or load distribution.

## Packaging And Runtime Support

The package ships browser-friendly ESM output with conditional exports for `browser`, `worker`, `workerd`, `node`, and `default`.

That does not change the runtime model of the websocket client itself, but it does make the package easier to consume in modern browser, edge, and server toolchains.

## Related Packages

- [`@hieco/realtime-react`](../realtime-react/README.md)
- [`@hieco/mirror`](../mirror/README.md) when you want initial state plus live updates
