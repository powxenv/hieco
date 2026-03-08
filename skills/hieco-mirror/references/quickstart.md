# Quick Start

Canonical docs:

- [`@hieco/mirror` quick start](https://github.com/powxenv/hieco/tree/main/packages/mirror)
- [`@hieco/mirror-react` quick start](https://github.com/powxenv/hieco/tree/main/packages/mirror-react)
- [`@hieco/mirror-preact` quick start](https://github.com/powxenv/hieco/tree/main/packages/mirror-preact)
- [`@hieco/mirror-solid` quick start](https://github.com/powxenv/hieco/tree/main/packages/mirror-solid)

## `@hieco/mirror`

```ts
import { MirrorNodeClient } from "@hieco/mirror";

const client = new MirrorNodeClient({ network: "testnet" });

const account = await client.account.getInfo("0.0.1001");

if (account.success) {
  console.log(account.data.account);
}
```

## `@hieco/mirror-react`

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MirrorNodeProvider, useAccountInfo } from "@hieco/mirror-react";

const queryClient = new QueryClient();

function AccountCard() {
  const account = useAccountInfo({ accountId: "0.0.1001" });
  return <pre>{JSON.stringify(account.data, null, 2)}</pre>;
}

export function Providers() {
  return (
    <QueryClientProvider client={queryClient}>
      <MirrorNodeProvider config={{ defaultNetwork: "testnet" }}>
        <AccountCard />
      </MirrorNodeProvider>
    </QueryClientProvider>
  );
}
```

## `@hieco/mirror-preact`

The provider and hook shape matches the React wrapper. Swap the imports to `@hieco/mirror-preact` and `@tanstack/preact-query`.

## `@hieco/mirror-solid`

The provider shape matches the React and Preact wrappers. Query functions use `create*` naming, for example `createAccountInfo(...)` and `createAccounts(...)`.
