import { useContext, useState } from "react";
import { RealtimeContext } from "./provider";
import type { RealtimeContextValue } from "./provider";
import type { StreamState, RelayWebSocketClient } from "../core";
import type { ApiResult } from "@hiecom/mirror-js";

export function useRealtimeContext(): RealtimeContextValue {
  const context = useContext(RealtimeContext);
  if (context === null) {
    throw new Error("useRealtimeContext must be used within a RealtimeProvider");
  }
  return context;
}

export function useRealtimeClient(): RelayWebSocketClient {
  const { client } = useRealtimeContext();
  return client;
}

export function useStreamState(): StreamState {
  const { state } = useRealtimeContext();
  return state;
}

export function useChainId(): {
  getChainId: () => Promise<ApiResult<string>>;
  result: ApiResult<string> | null;
} {
  const { client } = useRealtimeContext();
  const [result, setResult] = useState<ApiResult<string> | null>(null);

  const getChainId = () => {
    const promise = client.getChainId();
    promise.then(setResult);
    return promise;
  };

  return { getChainId, result };
}
