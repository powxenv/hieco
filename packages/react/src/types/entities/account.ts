import type { EntityId, Timestamp, Key } from "../rest-api";

export interface AccountInfo {
  readonly account: EntityId;
  readonly alias: string | null;
  readonly auto_renew_period: number | null;
  readonly balance: Balance;
  readonly created_timestamp: Timestamp | null;
  readonly decline_reward: boolean;
  readonly deleted: boolean | null;
  readonly ethereum_nonce: number | null;
  readonly evm_address: string | null;
  readonly expiry_timestamp: Timestamp | null;
  readonly key: Key | null;
  readonly max_automatic_token_associations: number | null;
  readonly memo: string | null;
  readonly pending_reward: number;
  readonly receiver_sig_required: boolean | null;
  readonly staked_account_id: EntityId | null;
  readonly staked_node_id: number | null;
  readonly stake_period_start: Timestamp | null;
}

export interface Balance {
  readonly timestamp: Timestamp;
  readonly balance: number | null;
  readonly tokens: readonly TokenBalance[];
}

export interface TokenBalance {
  readonly token_id: EntityId;
  readonly balance: number;
}

export interface TokenRelationship {
  readonly token_id: EntityId;
  readonly balance: number;
  readonly created_timestamp: Timestamp;
  readonly decimals: number;
  readonly freeze_status: string;
  readonly kyc_status: string;
  readonly automatic_association: boolean;
}

export interface CryptoAllowance {
  readonly owner: EntityId;
  readonly spender: EntityId;
  readonly amount: number;
  readonly owner_already_approved: boolean;
}

export interface TokenAllowance {
  readonly owner: EntityId;
  readonly spender: EntityId;
  readonly token_id: EntityId;
  readonly amount: number;
  readonly owner_already_approved: boolean;
}

export interface NftAllowance {
  readonly owner: EntityId;
  readonly spender: EntityId;
  readonly token_id: EntityId;
  readonly approved_for_all: boolean;
  readonly serial_numbers: readonly number[];
}

export interface StakingReward {
  readonly account_id: EntityId;
  readonly amount: number;
  readonly account_reward_sum: number;
  readonly calculated_timestamp: Timestamp;
  readonly node_id: number;
  readonly reward_sum: number;
}

export interface TokenAirdrop {
  readonly token_id: EntityId;
  readonly serial_numbers: readonly number[];
  readonly sender_account_id: EntityId;
  readonly receiver_account_id: EntityId;
}

export interface TokenAirdropsResponse {
  readonly airdrops: readonly TokenAirdrop[];
  readonly links: {
    readonly next?: string;
  };
}
