# Hieco Web

This app is the main Hieco website and playground. It combines the marketing site, ecosystem explanation pages, and showcase submission flow.

## What Lives Here

The app currently covers:

- the landing page and package demos
- the ecosystem explainer pages
- the project showcase index and detail pages
- wallet-connected showcase submission and edit flows

## Local Development

Install workspace dependencies first:

```bash
bun install
```

Start the app:

```bash
bun --filter web dev
```

Build the app:

```bash
bun --filter web build
```

Preview the production build:

```bash
bun --filter web preview
```

## Required Environment Variables

Create `apps/web/.env.local` with:

```bash
VITE_APP_TITLE=Hieco
VITE_CONVEX_URL=https://your-convex-deployment.convex.cloud
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
VITE_APP_URL=http://localhost:5878
VITE_HEDERA_NETWORK=testnet
```

Optional server-side variable:

```bash
SERVER_URL=http://localhost:5878
```

## Build Behavior

The web app depends on workspace packages, so its build script first builds the shared package outputs it consumes:

- `@hieco/utils`
- `@hieco/mirror`
- `@hieco/realtime`
- `@hieco/runtime`
- `@hieco/sdk`
- `@hieco/wallet`
- `@hieco/wallet-react`

That keeps the site aligned with the latest workspace artifacts instead of relying on stale generated output.

## Key Routes

- `/` is the main landing page with package demos
- `/ecosystem` explains how Hieco fits with Hedera, Hiero, Mirror Nodes, and wallets
- `/showcase` lists submitted projects
- `/showcase/$slug` shows one showcase entry

## Notes

- The root document mounts `WalletProvider` with the configured Hedera network and curated wallet list.
- Showcase write flows use wallet challenge signing.
- The app expects TanStack Query, Convex, and wallet state to be available at the root.
