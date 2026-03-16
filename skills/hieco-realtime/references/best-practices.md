# Best Practices

Canonical docs:

- [`@hieco/realtime` README](https://github.com/powxenv/hieco/tree/main/packages/realtime)
- [`@hieco/realtime-react` README](https://github.com/powxenv/hieco/tree/main/packages/realtime-react)

## Connection Ownership

- Use `RelayWebSocketClient` when one connection is enough.
- Use `ConnectionPool` only when the task genuinely needs pooled subscriptions or load balancing.
- In React, prefer `RealtimeProvider` unless the user explicitly wants manual lifecycle control.

## Subscription Lifecycle

- Keep the sequence explicit: connect, subscribe, handle messages, unsubscribe, disconnect.
- Treat stream state as real application state, not as background side effects.
- Keep subscription identifiers and unsubscribe paths reachable in the code sample.

## Error Handling

- Surface connection state with `getState()` or `useStreamState()`.
- Do not hide malformed payloads or validation errors.
- When the task is low-level protocol work, answer from the core realtime package, not the React wrapper.

## React Usage

- Use `RealtimeProvider` once high in the tree.
- Call `connect()` when the app is ready to open the relay connection. The provider does not auto-connect.
- Use `useContractLogs()` for component-bound log subscriptions.
- Reach for `useRealtimeClient()` only when the task needs manual subscriptions or chain ID reads.
