import { useEffect, useRef, useState } from "react";
import { useRealtimeContext } from "../context-hooks";
import type { RelaySubscription, RelayMessage } from "@hieco/realtime";
import type { ApiResult } from "@hieco/mirror";

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
  const { client, state } = useRealtimeContext();
  const [logs, setLogs] = useState<readonly RelayMessage["result"][]>([]);
  const [error, setError] = useState<Error | null>(null);
  const subscriptionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (options.enabled === false) {
      return;
    }

    let disposed = false;
    setError(null);

    const callback = (message: RelayMessage) => {
      if (!disposed) {
        setLogs((prev) => [...prev, message.result]);
      }
    };

    const subscription: RelaySubscription = {
      type: "logs",
      filter: { address: options.address, topics: options.topics },
    };

    client
      .subscribe(subscription, callback)
      .then((result: ApiResult<string>) => {
        if (result.success) {
          if (disposed) {
            void client.unsubscribe(result.data);
            return;
          }

          subscriptionIdRef.current = result.data;
        } else {
          if (!disposed) {
            setError(new Error(result.error.message));
          }
        }
      })
      .catch((err: unknown) => {
        if (!disposed) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      });

    return () => {
      disposed = true;

      if (subscriptionIdRef.current) {
        void client.unsubscribe(subscriptionIdRef.current);
        subscriptionIdRef.current = null;
      }
    };
  }, [client, options.address, options.topics, options.enabled]);

  const isConnected = state._tag === "Connected";

  return { logs, isConnected, error };
}
