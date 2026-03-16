# Hieco

Hieco is a TypeScript-first toolkit for building Hedera apps without stitching every layer together by hand.

It brings wallet connection, signer-aware SDK flows, Mirror Node reads, realtime subscriptions, CLI tooling, MCP tooling, and framework wrappers into one package family with a shared mental model.

## Start Here

Choose the package family that matches the job you are doing.

| If you want to build...                                    | Start with                                                                                                                                                                           | Why                                                                            |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Server code, jobs, route handlers, or signer-aware scripts | [`@hieco/sdk`](./packages/sdk/README.md)                                                                                                                                             | It is the main fluent client for reads, writes, and transaction orchestration. |
| React apps with Hedera queries and mutations               | [`@hieco/react`](./packages/react/README.md)                                                                                                                                         | It wraps `@hieco/sdk` in a provider and TanStack Query-friendly hooks.         |
| Wallet connection outside React                            | [`@hieco/wallet`](./packages/wallet/README.md)                                                                                                                                       | It gives you the headless wallet runtime and signer lifecycle.                 |
| Wallet connection inside React                             | [`@hieco/wallet-react`](./packages/wallet-react/README.md)                                                                                                                           | It adds a React provider and controller hooks on top of `@hieco/wallet`.       |
| Read-only Mirror Node access                               | [`@hieco/mirror`](./packages/mirror/README.md)                                                                                                                                       | It gives you a typed client for public chain data.                             |
| Mirror reads in React, Preact, or Solid                    | [`@hieco/mirror-react`](./packages/mirror-react/README.md), [`@hieco/mirror-preact`](./packages/mirror-preact/README.md), [`@hieco/mirror-solid`](./packages/mirror-solid/README.md) | They expose framework-native query APIs over the same core Mirror client.      |
| Realtime relay subscriptions                               | [`@hieco/realtime`](./packages/realtime/README.md) or [`@hieco/realtime-react`](./packages/realtime-react/README.md)                                                                 | They handle connection lifecycle and live subscription flows.                  |
| Mirror data in a terminal                                  | [`@hieco/mirror-cli`](./packages/mirror-cli/README.md)                                                                                                                               | It is the read-only CLI companion to the Mirror package family.                |
| Mirror data for AI agents over MCP                         | [`@hieco/mirror-mcp`](./packages/mirror-mcp/README.md)                                                                                                                               | It exposes the same read-only data through a local MCP server.                 |
| Raw Hiero SDK types with Hieco’s runtime-aware packaging   | [`@hieco/runtime`](./packages/runtime/README.md)                                                                                                                                     | It is the runtime boundary used by the SDK and wallet layers.                  |

## Package Families

### Runtime layer

| Package                                          | Purpose                                                                                   |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| [`@hieco/runtime`](./packages/runtime/README.md) | Runtime-aware adapter over the Hiero SDK for browser, worker, workerd, and node consumers |

### Application layer

| Package                                                    | Purpose                                                    |
| ---------------------------------------------------------- | ---------------------------------------------------------- |
| [`@hieco/sdk`](./packages/sdk/README.md)                   | Fluent Hedera reads, writes, and transaction orchestration |
| [`@hieco/react`](./packages/react/README.md)               | React provider and hooks over `@hieco/sdk`                 |
| [`@hieco/wallet`](./packages/wallet/README.md)             | Headless wallet runtime and signer production              |
| [`@hieco/wallet-react`](./packages/wallet-react/README.md) | React wallet bindings over `@hieco/wallet`                 |

### Data layer

| Package                                                        | Purpose                                   |
| -------------------------------------------------------------- | ----------------------------------------- |
| [`@hieco/mirror`](./packages/mirror/README.md)                 | Typed Mirror Node client                  |
| [`@hieco/mirror-react`](./packages/mirror-react/README.md)     | React bindings for Mirror reads           |
| [`@hieco/mirror-preact`](./packages/mirror-preact/README.md)   | Preact bindings for Mirror reads          |
| [`@hieco/mirror-solid`](./packages/mirror-solid/README.md)     | Solid bindings for Mirror reads           |
| [`@hieco/realtime`](./packages/realtime/README.md)             | Low-level realtime relay client           |
| [`@hieco/realtime-react`](./packages/realtime-react/README.md) | React bindings for realtime subscriptions |

### Tooling layer

| Package                                                | Purpose                    |
| ------------------------------------------------------ | -------------------------- |
| [`@hieco/mirror-cli`](./packages/mirror-cli/README.md) | Read-only Mirror CLI       |
| [`@hieco/mirror-mcp`](./packages/mirror-mcp/README.md) | MCP server for Mirror data |

### Shared internals

| Package                                      | Purpose                                                                      |
| -------------------------------------------- | ---------------------------------------------------------------------------- |
| [`@hieco/utils`](./packages/utils/README.md) | Shared internal types, network helpers, query keys, and validation utilities |

## How The Pieces Fit Together

Hieco is easiest to reason about in layers:

- wallet packages connect the user and produce a signer
- `@hieco/sdk` uses that signer to build and submit transactions
- `@hieco/react` turns that SDK model into React-native queries and mutations
- Mirror packages read public chain data without signer authority
- realtime packages subscribe to what changes next
- CLI and MCP tooling sit on top of the same Mirror client so humans and agents see the same data model

`@hieco/runtime` sits underneath the SDK and wallet layers so runtime-sensitive SDK types resolve cleanly in browsers, workers, and Node-style environments.

## Packaging And Runtime Support

The published packages follow a consistent build-to-`dist` model, but the exact entrypoint shape depends on the package type:

- publish artifacts come from `dist`
- library package manifests expose explicit conditional exports
- CLI and MCP packages publish their executable `dist` entrypoints through `bin`
- Bun builds target browser-friendly ESM output unless a package needs a separate node entry

Most library packages declare `browser`, `worker`, `workerd`, `node`, and `default` export conditions. `@hieco/runtime` publishes separate browser and node entry files because it is the runtime boundary for the underlying Hiero SDK itself, while `@hieco/mirror-cli` and `@hieco/mirror-mcp` stay focused on executable `bin` entrypoints.

## Quick Tour

### React app with wallet connection and Hedera hooks

```bash
npm install @hieco/wallet @hieco/wallet-react @hieco/react @hieco/sdk @tanstack/react-query
pnpm add @hieco/wallet @hieco/wallet-react @hieco/react @hieco/sdk @tanstack/react-query
yarn add @hieco/wallet @hieco/wallet-react @hieco/react @hieco/sdk @tanstack/react-query
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

```bash
npm install @hieco/sdk
pnpm add @hieco/sdk
yarn add @hieco/sdk
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

### Read-only Mirror access

```bash
npm install @hieco/mirror
pnpm add @hieco/mirror
yarn add @hieco/mirror
bun add @hieco/mirror
```

```ts
import { MirrorNodeClient } from "@hieco/mirror";

const mirror = new MirrorNodeClient({ network: "testnet" });
const account = await mirror.account.getInfo("0.0.1001");
```

## Local Development

This repo uses Bun workspaces for development and release workflows.

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

| Path                                | Purpose                                      |
| ----------------------------------- | -------------------------------------------- |
| [`packages/`](./packages)           | Publishable package families                 |
| [`skills/`](./skills)               | Agent-facing package guidance and references |
| [`examples/`](./examples)           | Runnable examples                            |
| [`apps/`](./apps)                   | App surfaces built on the packages           |
| [`brainstorming/`](./brainstorming) | Notes, research, and product exploration     |

## Skills

The repo also ships package-specific agent skills so humans and agents can follow the same package boundaries and terminology.

- [`skills/hieco-sdk`](./skills/hieco-sdk)
- [`skills/hieco-wallet`](./skills/hieco-wallet)
- [`skills/hieco-mirror`](./skills/hieco-mirror)
- [`skills/hieco-realtime`](./skills/hieco-realtime)
- [`skills/hieco-mirror-cli`](./skills/hieco-mirror-cli)

Install them with [flins.tech](https://flins.tech/):

```bash
flins search
flins add powxenv/hieco
flins add powxenv/hieco --skill hieco-sdk
flins add powxenv/hieco --skill hieco-wallet
flins add powxenv/hieco --skill hieco-mirror
flins add powxenv/hieco --skill hieco-realtime
flins add powxenv/hieco --skill hieco-mirror-cli
```

## License

[MIT](./LICENSE)
