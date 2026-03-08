# Quick Start

Canonical docs:

- [`@hieco/sdk` quick start](https://github.com/powxenv/hieco/tree/main/packages/sdk)
- [`@hieco/react` quick start](https://github.com/powxenv/hieco/tree/main/packages/react)

## `@hieco/sdk` In Server Code

```ts
import { hieco } from "@hieco/sdk";

const client = hieco.fromEnv();

const account = await client.account.info("0.0.1001").now();

if (account.ok) {
  console.log(account.value.accountId);
}
```

## `@hieco/sdk` In Browser Code With A Wallet Signer

```ts
import { hieco, type Signer } from "@hieco/sdk";

export function createWalletClient(signer: Signer) {
  return hieco({ network: "testnet" }).as(signer);
}
```

```ts
const client = createWalletClient(signer);
const receipt = await client.account.send({ to: "0.0.2002", hbar: 1 }).now();
```

## `@hieco/react` In A React App

```tsx
"use client";

import { HiecoProvider, useAccountInfo } from "@hieco/react";

function AccountCard({ accountId }: { accountId: string }) {
  const account = useAccountInfo(accountId);

  if (account.isPending) return <div>Loading...</div>;
  if (account.isError) return <div>{account.error.message}</div>;

  return <div>{account.data?.accountId}</div>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return <HiecoProvider config={{ network: "testnet" }}>{children}</HiecoProvider>;
}
```

## `@hieco/react` In A Signer-Driven App

```tsx
"use client";

import { HiecoProvider, type Signer } from "@hieco/react";

export function Providers({
  children,
  signer,
}: {
  children: React.ReactNode;
  signer: Signer | undefined;
}) {
  return (
    <HiecoProvider config={{ network: "testnet" }} signer={signer}>
      {children}
    </HiecoProvider>
  );
}
```

The signer is runtime session state. It can be `undefined` on first render and become available after the user connects a wallet.

## `@hieco/react/appkit`

```tsx
"use client";

import { createHiecoAppKit, HiecoAppKitProvider } from "@hieco/react/appkit";

await createHiecoAppKit({
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  networks: ["testnet"],
  metadata: {
    name: "My App",
    description: "Hieco AppKit integration",
    url: "https://example.com",
    icons: ["https://example.com/icon.png"],
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <HiecoAppKitProvider config={{ network: "testnet" }}>{children}</HiecoAppKitProvider>;
}
```
