# Installation

Canonical docs:

- [`@hieco/mirror-cli` README](https://github.com/powxenv/hieco/tree/main/packages/mirror-cli)
- Package sources and installed lookup paths: [sources.md](sources.md)

## Run Without Installing

```bash
bunx @hieco/mirror-cli --help
```

```bash
npx -y @hieco/mirror-cli --help
```

```bash
pnpm dlx @hieco/mirror-cli --help
```

```bash
yarn dlx @hieco/mirror-cli --help
```

## Global Installation

```bash
npm install --global @hieco/mirror-cli
```

```bash
pnpm add --global @hieco/mirror-cli
```

```bash
yarn global add @hieco/mirror-cli
```

```bash
bun add --global @hieco/mirror-cli
```

## Package Entry

- package name: `@hieco/mirror-cli`
- binary name: `hieco`
- runtime entry: `dist/index.js`

## Verify Invocation

```bash
bunx @hieco/mirror-cli --help
bunx @hieco/mirror-cli account --help
bunx @hieco/mirror-cli contract:call --help
```
