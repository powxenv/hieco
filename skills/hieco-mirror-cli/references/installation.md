# Installation

Canonical docs:

- [`@hieco/mirror-cli` README](https://github.com/powxenv/hieco/tree/main/packages/mirror-cli)
- Package sources and installed lookup paths: [sources.md](sources.md)

## Run Without Installing

```bash
bunx @hieco/mirror-cli --help
```

```bash
npx @hieco/mirror-cli --help
```

This is the recommended usage pattern for this CLI.

## Current Publishing Status

As of 2026-03-08, the npm registry page exists but the package is not published yet. The registry URL currently returns `404`.

Use `bunx` or `npx` as the intended package workflow once the package is published. Until then, use the package sources in [sources.md](sources.md) if an agent needs to inspect the package contents.

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
