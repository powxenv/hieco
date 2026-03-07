import { useRef } from "preact/hooks";
import { useQuery } from "@tanstack/preact-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/preact-query";
import type { ApiResult, ApiError, TransactionDetails } from "@hieco/mirror";
import type { EntityId } from "@hieco/mirror";
import { useMirrorNodeClient, useNetwork } from "../context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";

export interface UsePollTransactionOptions extends Omit<
  UseQueryOptions<ApiResult<TransactionDetails>, ApiError>,
  "queryKey" | "queryFn"
> {
  readonly transactionId: EntityId;
  readonly maxAttempts?: number;
  readonly intervalMs?: number;
  readonly stopOnConfirmed?: boolean;
}

export type UsePollTransactionResult = UseQueryResult<ApiResult<TransactionDetails>, ApiError>;

export function usePollTransaction(options: UsePollTransactionOptions): UsePollTransactionResult {
  const {
    transactionId,
    maxAttempts = 60,
    intervalMs = 1000,
    stopOnConfirmed = true,
    ...queryOptions
  } = options;

  const client = useMirrorNodeClient();
  const { network } = useNetwork();
  const attemptsRef = useRef(0);

  return useQuery({
    ...queryOptions,
    queryKey: mirrorNodeKeys.transaction.info(network, transactionId),
    queryFn: async () => {
      attemptsRef.current++;
      if (attemptsRef.current > maxAttempts) {
        throw new Error(`Transaction polling exceeded max attempts: ${maxAttempts}`);
      }
      return client.transaction.getById(transactionId);
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return intervalMs;

      if (!data.success) {
        return false;
      }

      if (stopOnConfirmed) {
        const result = data.data.result;
        if (result === "SUCCESS") {
          return false;
        }
      }

      return intervalMs;
    },
    refetchIntervalInBackground: true,
  });
}
