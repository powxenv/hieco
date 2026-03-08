# Package Selection

Canonical docs:

- [`@hieco/mirror`](https://github.com/powxenv/hieco/tree/main/packages/mirror)
- [`@hieco/mirror-react`](https://github.com/powxenv/hieco/tree/main/packages/mirror-react)
- [`@hieco/mirror-preact`](https://github.com/powxenv/hieco/tree/main/packages/mirror-preact)
- [`@hieco/mirror-solid`](https://github.com/powxenv/hieco/tree/main/packages/mirror-solid)

## Choose The Package

| User context                                        | Choose                 | Why                                                                          |
| --------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------- |
| Node script, worker, server route, CLI, data loader | `@hieco/mirror`        | The core client is the direct typed REST API surface.                        |
| React app with TanStack Query                       | `@hieco/mirror-react`  | The React wrapper gives provider-owned client state and query hooks.         |
| Preact app with TanStack Query                      | `@hieco/mirror-preact` | Same mirror surface, adapted to Preact and `@tanstack/preact-query`.         |
| Solid app with TanStack Query                       | `@hieco/mirror-solid`  | Same mirror surface, adapted to Solid resources and `@tanstack/solid-query`. |

## Shared Model

Every wrapper sits on top of the same core Mirror Node client:

- `@hieco/mirror` is the source of truth for domain methods and types.
- Framework wrappers keep the same domain grouping: accounts, balances, blocks, contracts, network, schedules, tokens, topics, transactions.

## Rule Of Thumb

- If the user is not in React, Preact, or Solid, start from `@hieco/mirror`.
- If the task is framework-specific, load the core API file and the matching wrapper API file.
