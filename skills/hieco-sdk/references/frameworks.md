# Framework Guidance

Canonical docs:

- [`@hieco/sdk` framework recipes](https://github.com/powxenv/hieco/tree/main/packages/sdk)
- [`@hieco/react` advanced usage](https://github.com/powxenv/hieco/tree/main/packages/react)

## Shared Rule

- Server code uses `@hieco/sdk`.
- Client React code uses `@hieco/react`.
- Wallet signers live in client runtime state.
- Server credentials stay on the server.

## Next.js

Use `@hieco/sdk` in:

- route handlers
- server actions
- server components that stay server-only

Use `@hieco/react` in:

- client components
- app-level providers
- query and mutation hooks

Typical split:

1. `hieco.fromEnv()` in server-only code.
2. `<HiecoProvider config={{ network }}>` in the client provider tree.
3. Pass wallet signers only on the client.

## TanStack Start

Use `@hieco/sdk` in:

- server functions
- server-side loaders

Use `@hieco/react` in:

- React route components
- client-side hook usage

If the app already owns a `QueryClient`, pass it to `HiecoProvider`.

## React Router Framework Mode

Use `@hieco/sdk` in:

- loaders
- actions
- server entry points

Use `@hieco/react` in:

- route components
- layout providers
- hook-driven UI code

## Hydration And SSR

`HiecoProvider` can work with:

- its own internally created `QueryClient`
- an existing `QueryClient`
- dehydrated TanStack Query state

If the task is about hydration, load `api-react.md` and focus on:

- `HiecoProvider`
- `queryClient`
- `queryClientConfig`
- `dehydratedState`
