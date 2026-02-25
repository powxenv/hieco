import { useEffect, useRef, useState } from "react";
import { useRealtimeClient } from "../context-hooks";
import type { RelaySubscription, RelayMessage } from "../../core/types/relay-types";
import type { ApiResult } from "@hiecom/mirror-js";

export interface UseContractLogsOptions {
  readonly address?: string | readonly string[];
  readonly topics?: readonly (string | readonly string[] | null)[];
  readonly enabled?: boolean;
}

export interface UseContractLogsResult {
  readonly logs: readonly RelayMessage["result"][];
  readonly isConnected: boolean;
  readonly error: Error | null;
}

export function useContractLogs(options: UseContractLogsOptions): UseContractLogsResult {
  const client = useRealtimeClient();
  const [logs, setLogs] = useState<readonly RelayMessage["result"][]>([]);
  const [error, setError] = useState<Error | null>(null);
  const subscriptionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (options.enabled === false) return;

    const callback = (message: RelayMessage) => {
      setLogs((prev) => [...prev, message.result]);
    };

    const subscription: RelaySubscription = {
      type: "logs",
      filter: { address: options.address, topics: options.topics },
    };

    client
      .subscribe(subscription, callback)
      .then((result: ApiResult<string>) => {
        if (result.success) {
          subscriptionIdRef.current = result.data;
        } else {
          setError(new Error(result.error.message));
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err : new Error(String(err)));
      });

    return () => {
      if (subscriptionIdRef.current) {
        void client.unsubscribe(subscriptionIdRef.current);
        subscriptionIdRef.current = null;
      }
    };
  }, [client, options.address, options.topics, options.enabled]);

  const isConnected = client.getState()._tag === "Connected";

  return { logs, isConnected, error };
}
