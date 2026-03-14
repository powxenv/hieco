# @hieco/mirror

`@hieco/mirror` is the Hieco client for read-only Hedera data from Mirror Node.

Use it when you want typed access to public blockchain data without bringing in signer logic, transaction execution, or framework-specific state management.

## Why This Package Exists

Many Hedera apps spend most of their time reading:

- accounts and balances
- tokens and NFTs
- transactions
- contracts and logs
- topics and messages
- schedules, blocks, and network state

`@hieco/mirror` gives those reads a cleaner shape with one client, domain-specific APIs, and shared result types across the rest of the Hieco ecosystem.

## When To Use It

Choose `@hieco/mirror` when you are building:

- server-side data fetchers
- read-only dashboards
- indexing or reporting tools
- scripts that inspect public chain data
- framework wrappers or internal services that need Mirror Node access

If you want framework-native hooks, use one of the wrapper packages:

- [`@hieco/mirror-react`](../mirror-react/README.md)
- [`@hieco/mirror-preact`](../mirror-preact/README.md)
- [`@hieco/mirror-solid`](../mirror-solid/README.md)

## Installation

```bash
bun add @hieco/mirror
```

## Quick Start

```ts
import { MirrorNodeClient } from "@hieco/mirror";

const mirror = new MirrorNodeClient({ network: "testnet" });

const account = await mirror.account.getInfo("0.0.1001");
const transactions = await mirror.transaction.listPaginated({
  accountId: "0.0.1001",
  limit: 10,
  order: "desc",
});
```

## The Client Shape

`MirrorNodeClient` is organized by domain instead of by raw endpoint path.

Main namespaces include:

- `account`
- `balance`
- `block`
- `contract`
- `network`
- `schedule`
- `token`
- `topic`
- `transaction`

That keeps common tasks easy to discover and makes the same data model reusable across the CLI, MCP server, and framework packages.

## Common Workflows

### Read account data

```ts
const info = await mirror.account.getInfo("0.0.1001");
const balances = await mirror.balance.list({
  account: "0.0.1001",
  limit: 1,
});
```

### Inspect token and NFT state

```ts
const token = await mirror.token.getInfo("0.0.2001");
const nfts = await mirror.token.getNfts("0.0.2001", {
  serialNumber: 1,
});
```

### Explore contract activity

```ts
const contract = await mirror.contract.getInfo("0.0.3001");
const logs = await mirror.contract.getLogs("0.0.3001", {
  topic0: "0xddf252ad",
});
```

## API At A Glance

Core exports:

- `MirrorNodeClient`
- domain API classes such as `AccountApi`, `TokenApi`, and `ContractApi`
- shared pagination and response types
- Mirror result and network types re-exported from `@hieco/utils`

## Notes

- This package is read-only by design.
- `network` selects the built-in Hedera network, while `mirrorNodeUrl` lets you point at a custom endpoint.
- Framework wrappers in the repo use this package directly, so it is the source of truth for Mirror reads across the ecosystem.

## Related Packages

- [`@hieco/mirror-react`](../mirror-react/README.md), [`@hieco/mirror-preact`](../mirror-preact/README.md), and [`@hieco/mirror-solid`](../mirror-solid/README.md) for UI framework bindings
- [`@hieco/mirror-cli`](../mirror-cli/README.md) for terminal access
- [`@hieco/mirror-mcp`](../mirror-mcp/README.md) for MCP-based agent access
