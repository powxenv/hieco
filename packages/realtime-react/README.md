# @hieco/realtime-react

## Overview

`@hieco/realtime-react` wraps `@hieco/realtime` in a React provider and a small set of hooks for live Relay subscriptions.

It is built for:

- React apps that want connection state in context
- components that need automatic subscription cleanup
- live log feeds and manual Relay interactions from React

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

## When To Use This Package

Use `@hieco/realtime-react` when you want to:

- subscribe to Relay streams from React components
- reuse a single realtime client across a component tree
- show connection status, chain ID, or live log data in React

If you need direct control over WebSocket lifecycle outside React, use [`@hieco/realtime`](../realtime/README.md) directly.

## Quick Start

```tsx
"use client";

import { RealtimeProvider, useContractLogs, useStreamState } from "@hieco/realtime-react";

function ContractLogFeed() {
  const { logs, isConnected, error } = useContractLogs({
    address: "0x0000000000000000000000000000000000001389",
    enabled: true,
  });
  const state = useStreamState();

  if (!isConnected) return <div>{state._tag}</div>;
  if (error) return <div>{error.message}</div>;

  return <pre>{JSON.stringify(logs, null, 2)}</pre>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RealtimeProvider
      config={{
        network: "testnet",
        relayEndpoint: "wss://testnet.mirrornode.hedera.com/relay/ws",
      }}
    >
      {children}
      <ContractLogFeed />
    </RealtimeProvider>
  );
}
```

## Core Concepts

### Provider-Owned Client

`RealtimeProvider` creates and owns one `RelayWebSocketClient` based on:

- `network`
- `relayEndpoint`

The provider also mirrors the current `StreamState` into React context.

### Context Hooks

The base hooks are:

- `useRealtimeContext()`
- `useRealtimeClient()`
- `useStreamState()`
- `useChainId()`

These cover most manual control cases without exposing provider internals.

### Subscription Hook

`useContractLogs()` manages the full lifecycle of a logs subscription:

- subscribe on mount
- append messages as they arrive
- unsubscribe on cleanup

## Advanced

### Manual Connect And Disconnect

```tsx
"use client";

import { useRealtimeContext } from "@hieco/realtime-react";

export function ConnectionControls() {
  const { state, connect, disconnect } = useRealtimeContext();

  return (
    <div>
      <span>{state._tag}</span>
      <button onClick={() => void connect()}>Connect</button>
      <button onClick={() => void disconnect()}>Disconnect</button>
    </div>
  );
}
```

### Manual Custom Subscriptions

```tsx
"use client";

import { useRealtimeClient } from "@hieco/realtime-react";

export function SubscribeToHeads() {
  const client = useRealtimeClient();

  async function subscribe() {
    await client.subscribe({ type: "newHeads", filter: {} }, (message) => {
      console.log(message.result);
    });
  }

  return <button onClick={() => void subscribe()}>Subscribe</button>;
}
```

### Chain ID Queries

```tsx
"use client";

import { useChainId } from "@hieco/realtime-react";

export function ChainIdButton() {
  const { getChainId, result } = useChainId();

  return (
    <button onClick={() => void getChainId()}>
      {result?.success ? result.data : "Get chain ID"}
    </button>
  );
}
```

## API Reference

### Provider Exports

| Export                  | Kind      | Purpose                                              | Usage form                        |
| ----------------------- | --------- | ---------------------------------------------------- | --------------------------------- |
| `RealtimeProvider`      | component | Root provider for the Relay client and stream state. | `<RealtimeProvider config={...}>` |
| `RealtimeProviderProps` | type      | Props accepted by `RealtimeProvider`.                | `type RealtimeProviderProps`      |
| `RealtimeConfig`        | type      | Provider config.                                     | `{ network, relayEndpoint }`      |
| `RealtimeContextValue`  | type      | Context shape returned by `useRealtimeContext()`.    | `type RealtimeContextValue`       |

### Context Hooks

| Export               | Kind | Purpose                                       | Usage form             |
| -------------------- | ---- | --------------------------------------------- | ---------------------- |
| `useRealtimeContext` | hook | Access the full context value.                | `useRealtimeContext()` |
| `useRealtimeClient`  | hook | Access the underlying `RelayWebSocketClient`. | `useRealtimeClient()`  |
| `useStreamState`     | hook | Read the current `StreamState`.               | `useStreamState()`     |
| `useChainId`         | hook | Query the relay chain ID on demand.           | `useChainId()`         |

### Subscription Hooks

| Export                   | Kind | Purpose                                                      | Usage form                                         |
| ------------------------ | ---- | ------------------------------------------------------------ | -------------------------------------------------- |
| `useContractLogs`        | hook | Subscribe to `logs` and keep the results in component state. | `useContractLogs({ address?, topics?, enabled? })` |
| `UseContractLogsOptions` | type | Options accepted by `useContractLogs`.                       | `type UseContractLogsOptions`                      |
| `UseContractLogsResult`  | type | Result shape returned by `useContractLogs`.                  | `{ logs, isConnected, error }`                     |

## Related Packages

- [`@hieco/realtime`](../realtime/README.md) for the underlying Relay WebSocket client
- [`@hieco/react`](../react/README.md) for Hedera transaction and query hooks in React
