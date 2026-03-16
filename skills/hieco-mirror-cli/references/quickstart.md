# Quick Start

Canonical docs:

- [`@hieco/mirror-cli` README](https://github.com/powxenv/hieco/tree/main/packages/mirror-cli)

## First Commands

```bash
bunx @hieco/mirror-cli account 0.0.1001
bunx @hieco/mirror-cli balance 0.0.1001
bunx @hieco/mirror-cli token 0.0.2001
bunx @hieco/mirror-cli transaction 0.0.1001@1700000000@123456789
bunx @hieco/mirror-cli network:exchange-rate
```

You can swap `bunx` for `npx -y`, `pnpm dlx`, or `yarn dlx`.

## JSON Output

```bash
bunx @hieco/mirror-cli account 0.0.1001 --json
bunx @hieco/mirror-cli topic:messages 0.0.5005 --json
```

## Switch Networks

```bash
bunx @hieco/mirror-cli account 0.0.1001 --network testnet
bunx @hieco/mirror-cli tokens:list --network previewnet --limit 10
```

## Use A Custom Mirror Node

```bash
bunx @hieco/mirror-cli accounts:list --mirror-url https://testnet.mirrornode.hedera.com --limit 10
```
