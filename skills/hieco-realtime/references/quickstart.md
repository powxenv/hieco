# Quick Start

Canonical docs:

- [`@hieco/realtime` quick start](https://github.com/powxenv/hieco/tree/main/packages/realtime)
- [`@hieco/realtime-react` quick start](https://github.com/powxenv/hieco/tree/main/packages/realtime-react)

## `@hieco/realtime`

```ts
import { RelayWebSocketClient } from "@hieco/realtime";

const client = new RelayWebSocketClient({
  network: "testnet",
  relayEndpoint: "wss://testnet.mirrornode.hedera.com/relay/ws",
});

await client.connect();

const subscriptionId = await client.subscribe({ type: "newHeads" }, (message) => {
  console.log(message);
});

await client.unsubscribe(subscriptionId);
await client.disconnect();
```

## `@hieco/realtime-react`

```tsx
import { RealtimeProvider, useContractLogs, useStreamState } from "@hieco/realtime-react";

function ContractLogFeed() {
  const { logs, isConnected, error } = useContractLogs({
    address: "0x0000000000000000000000000000000000001389",
    enabled: true,
  });
  const state = useStreamState();

  if (!isConnected) return <div>{state._tag}</div>;
  if (error) return <div>{error.message}</div>;

  return <pre>{JSON.stringify(logs, null, 2)}</pre>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <RealtimeProvider
      config={{
        network: "testnet",
        relayEndpoint: "wss://testnet.mirrornode.hedera.com/relay/ws",
      }}
    >
      {children}
      <ContractLogFeed />
    </RealtimeProvider>
  );
}
```
