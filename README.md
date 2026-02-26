# @hiecom

> Type-safe SDK for [Hiero](https://hiero.org) - Hedera Hashgraph Developer Ecosystem

## What is Hiero?

**Hiero** is the official developer ecosystem for [Hedera Hashgraph](https://hedera.com) - a decentralized public network.

It provides:
- **SDKs** - JavaScript, Java, Python, Go, Rust, Swift, C++
- **Mirror Node** - Archive node with REST API
- **JSON-RPC Relay** - Ethereum-compatible API (HIP-694)
- **Local Node** - Local development environment

## What is @hiecom?

`@hiecom` is a community-driven, type-safe SDK for Hiero services with first-class JavaScript framework integrations.

## Packages

| Package                                                 | Description                                      |
| ------------------------------------------------------- | ------------------------------------------------ |
| [`@hiecom/mirror-js`](packages/mirror-js)             | REST API client for Mirror Node                  |
| [`@hiecom/mirror-react`](packages/mirror-react)       | React hooks with TanStack Query                  |
| [`@hiecom/mirror-preact`](packages/mirror-preact)     | Preact hooks with TanStack Query                 |
| [`@hiecom/mirror-solid`](packages/mirror-solid)       | SolidJS hooks with TanStack Query                |
| [`@hiecom/realtime`](packages/realtime)               | WebSocket client for HIP-694 JSON-RPC Relay      |
| [`@hiecom/realtime-react`](packages/realtime-react)   | React hooks for realtime                         |
| [`@hiecom/testing`](packages/testing)                 | Testing utilities with MSW fixtures              |

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
