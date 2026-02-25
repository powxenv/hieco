import type { AccountInfo, EntityId } from "@hiecom/mirror-js";
import { state } from "../utils/state.js";

export type AccountFixtureOptions = Partial<
  Pick<AccountInfo, "account" | "alias" | "expiry_timestamp">
> & {
  readonly hbar?: number;
};

export interface Factory<T, O = {}> {
  readonly build: (overrides?: Partial<O> & Partial<T>) => T;
  readonly buildList: (count: number, overrides?: Partial<O> & Partial<T>) => readonly T[];
}

const nextAccountId = (): EntityId => `0.0.${state.incrementAccount()}` as EntityId;

const createAccount = (options: AccountFixtureOptions = {}): AccountInfo => {
  const accountId = options.account ?? nextAccountId();

  return {
    account: accountId,
    alias: options.alias ?? null,
    auto_renew_period: null,
    balance: {
      balance: options.hbar ?? 100000000000,
      timestamp: Date.now().toString(),
      tokens: [],
    },
    created_timestamp: null,
    decline_reward: false,
    deleted: null,
    ethereum_nonce: null,
    evm_address: null,
    expiry_timestamp: options.expiry_timestamp ?? null,
    key: null,
    max_automatic_token_associations: null,
    memo: null,
    pending_reward: 0,
    receiver_sig_required: null,
    staked_account_id: null,
    staked_node_id: null,
    stake_period_start: null,
  };
};

export const mockAccount: Factory<AccountInfo, AccountFixtureOptions> = {
  build: (overrides) => createAccount(overrides),
  buildList: (count, overrides) => Array.from({ length: count }, () => createAccount(overrides)),
};
