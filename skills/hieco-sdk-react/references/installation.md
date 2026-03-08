# Installation

Canonical docs:

- [`@hieco/sdk` installation](https://github.com/powxenv/hieco/tree/main/packages/sdk)
- [`@hieco/react` installation](https://github.com/powxenv/hieco/tree/main/packages/react)

## Core SDK

```bash
npm install @hieco/sdk
```

```bash
pnpm add @hieco/sdk
```

```bash
yarn add @hieco/sdk
```

```bash
bun add @hieco/sdk
```

## React SDK

```bash
npm install @hieco/react @hieco/sdk @tanstack/react-query
```

```bash
pnpm add @hieco/react @hieco/sdk @tanstack/react-query
```

```bash
yarn add @hieco/react @hieco/sdk @tanstack/react-query
```

```bash
bun add @hieco/react @hieco/sdk @tanstack/react-query
```

Peer runtime expected by the host app:

- `react >= 18`
- `react-dom >= 18`

## Optional AppKit Bridge

```bash
npm install @reown/appkit @hashgraph/hedera-wallet-connect
```

```bash
pnpm add @reown/appkit @hashgraph/hedera-wallet-connect
```

```bash
yarn add @reown/appkit @hashgraph/hedera-wallet-connect
```

```bash
bun add @reown/appkit @hashgraph/hedera-wallet-connect
```

Use these only when the React app actually integrates Reown AppKit.

## Environment Variables For Server Runtime

`hieco.fromEnv()` reads:

- `HIERO_NETWORK`
- `HIERO_OPERATOR_ID` or `HIERO_ACCOUNT_ID`
- `HIERO_PRIVATE_KEY`
- `HIERO_MIRROR_URL`

Use these in server-only code. Do not expose server credentials to browser bundles.
