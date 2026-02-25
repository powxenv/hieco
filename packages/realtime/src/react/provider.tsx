import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";
import type { NetworkType } from "@hiecom/mirror-js";
import { RelayWebSocketClient, type StreamState } from "../core";

export type RealtimeClient = RelayWebSocketClient;

export interface RealtimeConfig {
  readonly network: NetworkType;
  readonly relayEndpoint: string;
}

export interface RealtimeContextValue {
  readonly client: RealtimeClient;
  readonly state: StreamState;
  readonly connect: () => Promise<void>;
  readonly disconnect: () => Promise<void>;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export interface RealtimeProviderProps {
  readonly children: ReactNode;
  readonly config: RealtimeConfig;
}

export function RealtimeProvider({ children, config }: RealtimeProviderProps): ReactNode {
  const [client] = useState(
    () =>
      new RelayWebSocketClient({
        network: config.network,
        endpoint: config.relayEndpoint,
      }),
  );

  const [state, setState] = useState(client.getState());

  const connect = useCallback(async () => {
    await client.connect();
    setState(client.getState());
  }, [client]);

  const disconnect = useCallback(async () => {
    await client.disconnect();
    setState(client.getState());
  }, [client]);

  const value = useMemo<RealtimeContextValue>(
    () => ({ client, state, connect, disconnect }),
    [client, state, connect, disconnect],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export { RealtimeContext };
