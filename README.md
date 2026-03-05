# @hieco

> Type-safe SDK for [Hiero](https://hiero.org) - Hedera Hashgraph Developer Ecosystem

## What is Hiero?

**Hiero** is the official developer ecosystem for [Hedera Hashgraph](https://hedera.com) - a decentralized public network.

It provides:

- **SDKs** - JavaScript, Java, Python, Go, Rust, Swift, C++
- **Mirror Node** - Archive node with REST API
- **JSON-RPC Relay** - Ethereum-compatible API (HIP-694)
- **Local Node** - Local development environment

## What is @hieco?

`@hieco` is a community-driven, type-safe SDK for Hiero services with first-class JavaScript framework integrations.

## Packages

| Package                                            | Description                                 |
| -------------------------------------------------- | ------------------------------------------- |
| [`@hieco/mirror`](packages/mirror)                 | REST API client for Mirror Node             |
| [`@hieco/mirror-react`](packages/mirror-react)     | React hooks with TanStack Query             |
| [`@hieco/mirror-preact`](packages/mirror-preact)   | Preact hooks with TanStack Query            |
| [`@hieco/mirror-solid`](packages/mirror-solid)     | SolidJS hooks with TanStack Query           |
| [`@hieco/mirror-cli`](packages/mirror-cli)         | CLI tool for Mirror Node REST API           |
| [`@hieco/realtime`](packages/realtime)             | WebSocket client for HIP-694 JSON-RPC Relay |
| [`@hieco/realtime-react`](packages/realtime-react) | React hooks for realtime                    |

## Documentation

See individual package READMEs for API reference and examples.

## Development

```bash
bun install
bun run build
bun run lint && bun run typecheck && bun run fmt
```

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
