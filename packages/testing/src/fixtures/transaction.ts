import type { Transaction, EntityId } from "@hiecom/mirror-js";
import { state } from "../utils/state.js";
import type { Factory } from "./account.js";

export type TransactionFixtureOptions = Partial<
  Pick<Transaction, "transaction_id" | "name" | "consensus_timestamp" | "charged_tx_fee" | "result">
> & {
  readonly timestamp?: Date;
  readonly from?: string;
  readonly to?: string;
  readonly amount?: number;
};

const nextTransactionId = (): string => `${state.incrementTransaction()}-0-123456789`;

const createTransaction = (options: TransactionFixtureOptions = {}): Transaction => {
  const timestamp = options.timestamp ?? new Date();

  const transfers =
    options.from && options.to
      ? [
          {
            account: options.from as EntityId,
            amount: -(options.amount ?? 0),
            is_approval: false,
          },
          {
            account: options.to as EntityId,
            amount: options.amount ?? 0,
            is_approval: false,
          },
        ]
      : [];

  return {
    batch_key: null,
    bytes: null,
    charged_tx_fee: options.charged_tx_fee ?? 100000,
    consensus_timestamp: timestamp.toISOString(),
    entity_id: null,
    max_fee: "1000000",
    memo_base64: null,
    name: (options.name ?? "CRYPTOTRANSFER") as Transaction["name"],
    nft_transfers: [],
    node: "0.0.3" as EntityId,
    nonce: null,
    parent_consensus_timestamp: null,
    result: options.result ?? "SUCCESS",
    scheduled: false,
    staking_reward_transfers: [],
    token_transfers: [],
    transaction_hash: "mock-hash",
    transaction_id: options.transaction_id ?? nextTransactionId(),
    transfers,
    valid_duration_seconds: "120",
    valid_start_timestamp: timestamp.toISOString(),
  };
};

export const mockTransaction: Factory<Transaction, TransactionFixtureOptions> = {
  build: (overrides) => createTransaction(overrides),
  buildList: (count, overrides) =>
    Array.from({ length: count }, () => createTransaction(overrides)),
};
