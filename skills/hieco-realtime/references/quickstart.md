# Quick Start

Canonical docs:

- [`@hieco/realtime` quick start](https://github.com/powxenv/hieco/tree/main/packages/realtime)
- [`@hieco/realtime-react` quick start](https://github.com/powxenv/hieco/tree/main/packages/realtime-react)

## `@hieco/realtime`

```ts
import { RelayWebSocketClient } from "@hieco/realtime";

const client = new RelayWebSocketClient({
  network: "testnet",
  endpoint: "wss://testnet.mirrornode.hedera.com/relay/ws",
});

const connected = await client.connect();

if (!connected.success) {
  throw new Error(connected.error.message);
}

const subscription = await client.subscribe({ type: "newHeads" }, (message) => {
  console.log(message.result);
});

if (subscription.success) {
  await client.unsubscribe(subscription.data);
}

await client.disconnect();
```

## `@hieco/realtime-react`

```tsx
import { useEffect } from "react";
import {
  RealtimeProvider,
  useContractLogs,
  useRealtimeContext,
  useStreamState,
} from "@hieco/realtime-react";

function ContractLogFeed() {
  const { connect } = useRealtimeContext();
  const { logs, isConnected, error } = useContractLogs({
    address: "0x0000000000000000000000000000000000001389",
    enabled: true,
  });
  const state = useStreamState();

  useEffect(() => {
    void connect();
  }, [connect]);

  if (!isConnected) return <div>{state._tag}</div>;
  if (error) return <div>{error.message}</div>;

  return <pre>{JSON.stringify(logs, null, 2)}</pre>;
}
```
