# `@hieco/realtime-react` API Reference

Canonical docs:

- [`@hieco/realtime-react` README](https://github.com/powxenv/hieco/tree/main/packages/realtime-react)
- Package sources and installed lookup paths: [sources.md](sources.md)

Installed lookup paths:

- `node_modules/@hieco/realtime-react/README.md`
- `node_modules/@hieco/realtime-react/dist/index.d.ts`

## Provider Exports

| Export               | What it does                                                                  | Parameters                        | Returns                                          |
| -------------------- | ----------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------ |
| `RealtimeProvider`   | Provide the realtime client and stream state to React components.             | `props: RealtimeProviderProps`    | `ReactNode`                                      |
| `useRealtimeContext` | Read the full realtime context.                                               | none                              | `RealtimeContextValue`                           |
| `useRealtimeClient`  | Read the underlying `RelayWebSocketClient`.                                   | none                              | `RelayWebSocketClient`                           |
| `useStreamState`     | Read the current `StreamState`.                                               | none                              | `StreamState`                                    |
| `useChainId`         | Query the relay chain ID on demand and store the latest result in hook state. | none                              | object with `getChainId()` and the latest result |
| `useContractLogs`    | Subscribe to contract logs and keep them in component state.                  | `options: UseContractLogsOptions` | `UseContractLogsResult`                          |

## Type Definitions

### `RealtimeConfig`

```ts
interface RealtimeConfig {
  readonly network: NetworkType;
  readonly relayEndpoint: string;
}
```

### `RealtimeProviderProps`

```ts
interface RealtimeProviderProps {
  readonly children: ReactNode;
  readonly config: RealtimeConfig;
}
```

### `RealtimeContextValue`

```ts
interface RealtimeContextValue {
  readonly client: RelayWebSocketClient;
  readonly state: StreamState;
  readonly connect: () => Promise<void>;
  readonly disconnect: () => Promise<void>;
}
```

### `UseContractLogsOptions`

```ts
interface UseContractLogsOptions {
  readonly address?: string | readonly string[];
  readonly topics?: readonly (string | readonly string[] | null)[];
  readonly enabled?: boolean;
}
```

### `UseContractLogsResult`

```ts
interface UseContractLogsResult {
  readonly logs: readonly RelayMessage["result"][];
  readonly isConnected: boolean;
  readonly error: Error | null;
}
```

## Hook Behavior

### `RealtimeProvider`

Behavior:

1. constructs a `RelayWebSocketClient` from `config.network` and `config.relayEndpoint`
2. subscribes React state to `client.onStateChange(...)`
3. disconnects the client automatically on unmount
4. exposes `connect` and `disconnect` helpers through context

### `useChainId`

Behavior:

1. returns a stable `getChainId` function
2. calls `client.getChainId()`
3. stores the latest `ApiResult<string>` in local hook state
4. returns both the function and the most recent result

### `useContractLogs`

Behavior:

1. creates a `RelaySubscription` of type `"logs"`
2. subscribes when `enabled !== false`
3. appends every incoming `RelayMessage["result"]` to `logs`
4. unsubscribes automatically on cleanup
5. returns `isConnected` derived from `state._tag === "Connected"`

## Exact Type Definition Entry Points

When an agent needs exact hook signatures or field-level contracts, read these installed files in order:

1. `node_modules/@hieco/realtime-react/dist/index.d.ts`
2. `node_modules/@hieco/realtime-react/README.md`
3. `node_modules/@hieco/realtime/dist/index.d.ts`
