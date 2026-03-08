# Installation

Canonical docs:

- [`@hieco/realtime` README](https://github.com/powxenv/hieco/tree/main/packages/realtime)
- [`@hieco/realtime-react` README](https://github.com/powxenv/hieco/tree/main/packages/realtime-react)

## Core Client

```bash
npm install @hieco/realtime @hieco/mirror
```

```bash
pnpm add @hieco/realtime @hieco/mirror
```

```bash
yarn add @hieco/realtime @hieco/mirror
```

```bash
bun add @hieco/realtime @hieco/mirror
```

`@hieco/realtime` should be installed alongside `@hieco/mirror` in consuming apps that use the published package surface.

## React Wrapper

```bash
npm install @hieco/realtime @hieco/realtime-react @hieco/mirror
```

```bash
pnpm add @hieco/realtime @hieco/realtime-react @hieco/mirror
```

```bash
yarn add @hieco/realtime @hieco/realtime-react @hieco/mirror
```

```bash
bun add @hieco/realtime @hieco/realtime-react @hieco/mirror
```

Peer runtime expected by the host app:

- `react >= 18`
- `react-dom >= 18`
