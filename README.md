# Hieco

Hieco is a TypeScript-first toolkit for building Hedera apps without stitching the stack together by hand.

It brings wallet connection, transaction flows, Mirror Node reads, realtime streams, CLI tools, and MCP tooling into one ecosystem that feels like modern application development instead of infrastructure assembly.

## Why Hieco Exists

Building on Hedera usually means crossing a few different layers at once:

- wallet connection in the browser
- signer-aware transactions
- read-only data from Mirror Node
- realtime subscriptions
- framework bindings that fit how teams actually build apps

Hieco sits above the lower-level network and SDK surfaces and turns them into package families with clearer boundaries, stronger typing, and more predictable developer ergonomics.

In practice:

- Hedera is the network
- Hiero is the lower-level SDK and ecosystem foundation
- Hieco is the application-facing toolkit that helps those pieces feel cohesive

## Start Here

Choose the path that matches the app you want to ship.

| If you want to build... | Start with | Why |
| --- | --- | --- |
| A React app with wallet connection | [`@hieco/wallet-react`](./packages/wallet-react/README.md) | It gives you the provider and headless hooks for wallet UI. |
| A React app with Hedera reads and writes | [`@hieco/react`](./packages/react/README.md) | It wraps the core SDK with TanStack Query-friendly hooks. |
| Server code, jobs, route handlers, or scripts | [`@hieco/sdk`](./packages/sdk/README.md) | It is the core fluent client for Hedera queries and transactions. |
| Read-only Mirror Node access | [`@hieco/mirror`](./packages/mirror/README.md) | It gives you a typed client for accounts, tokens, contracts, topics, and more. |
| Mirror reads inside React, Preact, or Solid | [`@hieco/mirror-react`](./packages/mirror-react/README.md), [`@hieco/mirror-preact`](./packages/mirror-preact/README.md), [`@hieco/mirror-solid`](./packages/mirror-solid/README.md) | They add framework-native query hooks on top of `@hieco/mirror`. |
| Live relay streams | [`@hieco/realtime`](./packages/realtime/README.md) or [`@hieco/realtime-react`](./packages/realtime-react/README.md) | They handle realtime subscriptions over the Hedera relay layer. |
| Mirror Node data in a terminal | [`@hieco/mirror-cli`](./packages/mirror-cli/README.md) | It gives you a read-only CLI for quick inspection and scripting. |
| Mirror Node data for AI agents through MCP | [`@hieco/mirror-mcp`](./packages/mirror-mcp/README.md) | It exposes the same data as a local MCP server. |

## Quick Tour

### React app with wallet and Hedera hooks

This is the most common app path: connect a wallet, derive a signer, and use that signer inside Hieco’s React layer.

```bash
bun add @hieco/wallet @hieco/wallet-react @hieco/react @hieco/sdk @tanstack/react-query
```

```tsx
import type { ReactNode } from "react";
import { HiecoProvider, useAccountInfo } from "@hieco/react";
import { WalletProvider, useWallet } from "@hieco/wallet-react";

function HiecoRuntime({ children }: { children: ReactNode }) {
  const wallet = useWallet();

  return (
    <HiecoProvider config={{ network: "testnet" }} signer={wallet.session?.signer}>
      {children}
    </HiecoProvider>
  );
}

function AccountCard() {
  const account = useAccountInfo({ accountId: "0.0.1001" });

  if (account.isPending) return <div>Loading...</div>;
  if (account.isError) return <div>{account.error.message}</div>;

  return <pre>{JSON.stringify(account.data, null, 2)}</pre>;
}

export function App() {
  return (
    <WalletProvider
      projectId="YOUR_WALLETCONNECT_PROJECT_ID"
      app={{
        name: "My Hieco App",
        description: "Wallet connection for My Hieco App",
        url: "https://example.com",
        icons: ["https://example.com/icon.png"],
      }}
    >
      <HiecoRuntime>
        <AccountCard />
      </HiecoRuntime>
    </WalletProvider>
  );
}
```

### Server code with the core SDK

When you are outside the UI and just want a fluent Hedera client, start here.

```bash
bun add @hieco/sdk
```

```ts
import { hieco } from "@hieco/sdk";

const client = hieco.fromEnv();
const account = await client.account.info("0.0.1001").now();

if (account.ok) {
  console.log(account.value.accountId);
}
```

### Read-only Mirror Node access

If your app only needs blockchain data and not transaction execution, the Mirror family is the simpler path.

```bash
bun add @hieco/mirror
```

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

## Package Families

### Application layer

These packages are for reads, writes, signers, and wallet-connected app flows.

| Package | Use it when you need... |
| --- | --- |
| [`@hieco/sdk`](./packages/sdk/README.md) | A fluent Hedera client for server code, scripts, and signer-scoped app logic |
| [`@hieco/react`](./packages/react/README.md) | React providers and TanStack Query hooks over `@hieco/sdk` |
| [`@hieco/wallet`](./packages/wallet/README.md) | A headless wallet runtime outside React |
| [`@hieco/wallet-react`](./packages/wallet-react/README.md) | React wallet state and connection flows |

### Mirror layer

These packages are for read-only blockchain data from Mirror Node.

| Package | Use it when you need... |
| --- | --- |
| [`@hieco/mirror`](./packages/mirror/README.md) | A typed Mirror Node client in plain TypeScript |
| [`@hieco/mirror-react`](./packages/mirror-react/README.md) | Mirror hooks in React |
| [`@hieco/mirror-preact`](./packages/mirror-preact/README.md) | Mirror hooks in Preact |
| [`@hieco/mirror-solid`](./packages/mirror-solid/README.md) | Mirror hooks in Solid |
| [`@hieco/mirror-cli`](./packages/mirror-cli/README.md) | Read-only Mirror inspection from the terminal |
| [`@hieco/mirror-mcp`](./packages/mirror-mcp/README.md) | Mirror data exposed to MCP-compatible agents |

### Realtime layer

These packages are for subscriptions and streaming updates from the Hedera relay surface.

| Package | Use it when you need... |
| --- | --- |
| [`@hieco/realtime`](./packages/realtime/README.md) | A low-level realtime client |
| [`@hieco/realtime-react`](./packages/realtime-react/README.md) | React bindings for realtime subscriptions |

### Shared internals

| Package | What it is |
| --- | --- |
| [`@hieco/utils`](./packages/utils/README.md) | Private shared types and helpers used across the workspace |

## How The Pieces Fit Together

Hieco is easiest to reason about when you keep the layers separate:

- Wallet packages connect the user and produce a signer.
- SDK packages use that signer to read, build, and submit transactions.
- Mirror packages read public chain data without transaction authority.
- Realtime packages listen for what changes next.

That separation keeps browser state simpler, server code cleaner, and framework bindings easier to compose.

## Local Development

This repo uses Bun workspaces.

```bash
bun install
```

Common workspace commands:

```bash
bun run build
bun run lint
bun run typecheck
bun run fmt
```

Quality check before shipping changes:

```bash
bun run lint && bun run typecheck && bun run fmt
```

## Repository Map

| Path | Purpose |
| --- | --- |
| [`packages/`](./packages) | Publishable package families |
| [`skills/`](./skills) | Agent-facing package guidance and references |
| [`examples/`](./examples) | Runnable examples |
| [`apps/`](./apps) | App surfaces built on the packages |
| [`brainstorming/`](./brainstorming) | Notes, research, and product exploration |

## Skills

The repo includes package-specific agent skills so humans and agents can follow the same mental model:

- [`skills/hieco-sdk`](./skills/hieco-sdk)
- [`skills/hieco-wallet`](./skills/hieco-wallet)
- [`skills/hieco-mirror`](./skills/hieco-mirror)
- [`skills/hieco-realtime`](./skills/hieco-realtime)
- [`skills/hieco-mirror-cli`](./skills/hieco-mirror-cli)

## License

[MIT](./LICENSE)
