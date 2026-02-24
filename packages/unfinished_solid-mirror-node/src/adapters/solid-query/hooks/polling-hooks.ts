import { createSignal } from "solid-js";
import { useQuery } from "@tanstack/solid-query";
import type { UseQueryOptions, UseQueryResult } from "@tanstack/solid-query";
import type { ApiResult, ApiError, TransactionDetails } from "@hiecom/mirror-node";
import type { EntityId } from "@hiecom/mirror-node";
import { useMirrorNodeClient, useNetwork } from "../../../solid/hooks";
import { mirrorNodeKeys } from "../query-keys";
import { isSuccess, isApiError } from "../utils/type-guards";
import type { Accessor } from "solid-js";

export interface UsePollTransactionOptions extends Omit<
  UseQueryOptions<ApiResult<TransactionDetails>, ApiError>,
  "queryKey" | "queryFn"
> {
  transactionId: Accessor<EntityId>;
  maxAttempts?: number;
  intervalMs?: number;
  stopOnConfirmed?: boolean;
}

export type UsePollTransactionResult = UseQueryResult<ApiResult<TransactionDetails>, ApiError>;

export function usePollTransaction(options: UsePollTransactionOptions): UsePollTransactionResult {
  const {
    transactionId,
    maxAttempts = 60,
    intervalMs = 1000,
    stopOnConfirmed = true,
  } = options;

  const client = useMirrorNodeClient();
  const { network } = useNetwork();
  const [attempts, setAttempts] = createSignal(0);

  return useQuery(() => ({
    queryKey: mirrorNodeKeys.transaction.info(network(), transactionId()),
    queryFn: async () => {
      setAttempts((prev) => prev + 1);
      if (attempts() > maxAttempts) {
        throw new Error(`Transaction polling exceeded max attempts: ${maxAttempts}`);
      }
      return client().transaction.getById(transactionId());
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
  }));
}
