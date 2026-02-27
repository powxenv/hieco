import type { AccountInfo, EntityId } from "@hieco/mirror-js";
import type { Factory, AccountFixtureOptions } from "./account.js";
import { mockAccount } from "./account.js";

export type StakingInfoFixtureOptions = AccountFixtureOptions & {
  readonly stakedAccountId?: string | null;
  readonly stakedNodeId?: number | null;
  readonly stakePeriodStart?: string | null;
  readonly pendingReward?: number;
  readonly declineReward?: boolean;
};

const createStakedAccount = (
  options: StakingInfoFixtureOptions & AccountFixtureOptions = {},
): AccountInfo => {
  const baseAccount = mockAccount.build({
    account: options.account,
  });

  const balance = options.hbar ?? baseAccount.balance.balance;

  return {
    ...baseAccount,
    staked_account_id: (options.stakedAccountId ?? null) as EntityId | null,
    staked_node_id: options.stakedNodeId ?? null,
    stake_period_start: options.stakePeriodStart ?? null,
    pending_reward: options.pendingReward ?? 0,
    decline_reward: options.declineReward ?? false,
    balance: {
      timestamp: baseAccount.balance.timestamp,
      balance,
      tokens: baseAccount.balance.tokens,
    },
  };
};

export const mockStakedAccount: Factory<
  AccountInfo,
  StakingInfoFixtureOptions & AccountFixtureOptions
> = {
  build: (overrides) => createStakedAccount(overrides),
  buildList: (count, overrides) =>
    Array.from({ length: count }, () => createStakedAccount(overrides)),
};

export const stakingAccountBuilder = {
  nodeStaker(options: {
    readonly account?: EntityId;
    readonly nodeId?: number;
    readonly hbar?: number;
    readonly pendingReward?: number;
  }): AccountInfo {
    return createStakedAccount({
      account: options.account,
      hbar: options.hbar,
      stakedNodeId: options.nodeId ?? 0,
      stakedAccountId: null,
      pendingReward: options.pendingReward ?? 0,
    });
  },

  accountStaker(options: {
    readonly account?: EntityId;
    readonly stakedAccountId?: EntityId;
    readonly hbar?: number;
    readonly pendingReward?: number;
  }): AccountInfo {
    return createStakedAccount({
      account: options.account,
      hbar: options.hbar,
      stakedAccountId: options.stakedAccountId ?? ("0.0.1" as const),
      stakedNodeId: null,
      pendingReward: options.pendingReward ?? 0,
    });
  },

  declinedRewards(options: { readonly account?: EntityId; readonly hbar?: number }): AccountInfo {
    return createStakedAccount({
      account: options.account,
      hbar: options.hbar,
      declineReward: true,
      stakedAccountId: null,
      stakedNodeId: null,
      pendingReward: 0,
    });
  },
};
