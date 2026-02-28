import { useQuery } from "@tanstack/solid-query";
import { createSignal } from "solid-js";
import type { Accessor } from "solid-js";
import type { UseQueryResult } from "@tanstack/solid-query";
import type { ApiResult, ApiError, EntityId, TransactionDetails } from "@hieco/mirror";
import { useMirrorNodeClient, useNetwork } from "../context-hooks";
import { mirrorNodeKeys } from "@hieco/mirror-shared";

export interface CreatePollTransactionOptions {
  readonly transactionId: EntityId;
  readonly maxAttempts?: number;
  readonly intervalMs?: number;
  readonly stopOnConfirmed?: boolean;
  readonly enabled?: boolean;
}

export type CreatePollTransactionResult = UseQueryResult<ApiResult<TransactionDetails>, ApiError>;

export function createPollTransaction(
  options: Accessor<CreatePollTransactionOptions>,
): CreatePollTransactionResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();
  const attempts = createSignal(0);

  return useQuery(() => {
    const opts = options();
    const [attemptsValue, setAttempts] = attempts;

    return {
      queryKey: mirrorNodeKeys.transaction.info(network(), opts.transactionId),
      queryFn: async () => {
        setAttempts(attemptsValue() + 1);
        if (attemptsValue() > (opts.maxAttempts ?? 60)) {
          throw new Error(`Transaction polling exceeded max attempts: ${opts.maxAttempts}`);
        }
        return client().transaction.getById(opts.transactionId);
      },
      get refetchInterval() {
        return opts.intervalMs ?? 1000;
      },
      refetchIntervalInBackground: true,
    };
  });
}
