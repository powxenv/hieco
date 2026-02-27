import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { ApiResult, ApiError, TransactionDetails } from "@hieco/mirror-js";
import type { EntityId } from "@hieco/mirror-js";
import { useMirrorNodeClient, useNetwork } from "../context-hooks";
import { mirrorNodeKeys, isSuccess, isApiError } from "@hieco/mirror-shared";

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

      if (isApiError(data)) {
        return false;
      }

      if (stopOnConfirmed && isSuccess(data)) {
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
