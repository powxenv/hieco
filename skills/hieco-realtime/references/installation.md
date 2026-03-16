# Installation

Canonical docs:

- [`@hieco/realtime` README](https://github.com/powxenv/hieco/tree/main/packages/realtime)
- [`@hieco/realtime-react` README](https://github.com/powxenv/hieco/tree/main/packages/realtime-react)

## Core Client

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

## React Wrapper

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

Peer runtime expected by the host app:

- `react >= 18`
- `react-dom >= 18`

Add `@hieco/mirror` separately when the app also needs current-state reads alongside realtime subscriptions.
