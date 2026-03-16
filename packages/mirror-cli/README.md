# @hieco/mirror-cli

`@hieco/mirror-cli` is the command-line companion to Hieco’s Mirror client.

It lets you inspect Hedera data from a terminal as quickly as you can think of the question.

## Why This Package Exists

Sometimes the fastest way to understand chain data is not a script or an app. It is a terminal command you can run right now.

`@hieco/mirror-cli` exists for that moment. It gives you:

- one `hieco` binary
- read-only commands across the main Mirror domains
- human-friendly output for exploration
- JSON output for shell scripts and automation

## When To Use It

Choose `@hieco/mirror-cli` when you want to:

- inspect accounts, tokens, transactions, contracts, or topics
- verify Mirror responses without writing code
- script read-only blockchain checks in CI or local tooling
- move quickly between “what does the data look like?” and “now automate it”

If you need a programmatic client, use [`@hieco/mirror`](../mirror/README.md).

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

The installed binary name is `hieco`.

## Quick Start

```bash
bunx @hieco/mirror-cli account 0.0.1001
bunx @hieco/mirror-cli balance 0.0.1001
bunx @hieco/mirror-cli token 0.0.2001
bunx @hieco/mirror-cli transactions:list --account 0.0.1001 --limit 10
bunx @hieco/mirror-cli network:exchange-rate
```

## Command Model

The CLI follows a consistent pattern:

- single-resource lookups such as `account`, `token`, and `transaction`
- filtered collection commands such as `balances`, `blocks`, and `contract:results`
- broad list commands such as `accounts:list`, `tokens:list`, and `topics:list`

Global flags available on every command:

- `-n, --network <network>`
- `-u, --mirror-url <url>`

Most commands also accept `-j, --json`.

## Common Workflows

### Explore data interactively

```bash
bunx @hieco/mirror-cli contract 0.0.3001
bunx @hieco/mirror-cli topic:messages 0.0.5005 --limit 20
```

### Use JSON in a shell pipeline

```bash
bunx @hieco/mirror-cli transactions:list --account 0.0.1001 --limit 25 --json > transactions.json
```

### Point at a different network

```bash
bunx @hieco/mirror-cli accounts:list --network testnet --limit 5
```

## Related Packages

- [`@hieco/mirror`](../mirror/README.md)
- [`@hieco/mirror-mcp`](../mirror-mcp/README.md)
