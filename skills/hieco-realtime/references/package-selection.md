# Package Selection

Canonical docs:

- [`@hieco/realtime`](https://github.com/powxenv/hieco/tree/main/packages/realtime)
- [`@hieco/realtime-react`](https://github.com/powxenv/hieco/tree/main/packages/realtime-react)

## Choose The Package

| User context                                           | Choose                                                 | Why                                                                                         |
| ------------------------------------------------------ | ------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Worker, server process, service, script, non-React app | `@hieco/realtime`                                      | The core package gives direct control over Relay clients and pools.                         |
| React app that needs subscriptions in components       | `@hieco/realtime-react`                                | The React wrapper provides provider-owned client lifecycle and subscription hooks.          |
| React app that also needs manual low-level control     | `@hieco/realtime-react` and `@hieco/realtime` concepts | The React wrapper still sits on top of the core client. Use both references when answering. |

## Core Decision

Inside `@hieco/realtime`, choose between:

- `RelayWebSocketClient` for one connection
- `ConnectionPool` for multi-connection load distribution

If the user is inside React, start from `@hieco/realtime-react` unless they explicitly want manual lifecycle control.
