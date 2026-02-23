import type { EntityId, Timestamp, Key } from "../rest-api";

export interface AccountInfo {
  account: EntityId;
  alias: string | null;
  auto_renew_period: number | null;
  balance: Balance;
  created_timestamp: Timestamp | null;
  decline_reward: boolean;
  deleted: boolean | null;
  ethereum_nonce: number | null;
  evm_address: string | null;
  expiry_timestamp: Timestamp | null;
  key: Key | null;
  max_automatic_token_associations: number | null;
  memo: string | null;
  pending_reward: number;
  receiver_sig_required: boolean | null;
  staked_account_id: EntityId | null;
  staked_node_id: number | null;
  stake_period_start: Timestamp | null;
}

export interface Balance {
  timestamp: Timestamp;
  balance: number | null;
  tokens: TokenBalance[];
}

export interface TokenBalance {
  token_id: EntityId;
  balance: number;
}

export interface TokenRelationship {
  token_id: EntityId;
  balance: number;
  created_timestamp: Timestamp;
  decimals: number;
  freeze_status: string;
  kyc_status: string;
  automatic_association: boolean;
}

export interface CryptoAllowance {
  owner: EntityId;
  spender: EntityId;
  amount: number;
  owner_already_approved: boolean;
}

export interface TokenAllowance {
  owner: EntityId;
  spender: EntityId;
  token_id: EntityId;
  amount: number;
  owner_already_approved: boolean;
}

export interface NftAllowance {
  owner: EntityId;
  spender: EntityId;
  token_id: EntityId;
  approved_for_all: boolean;
  serial_numbers: number[];
}

export interface StakingReward {
  account_id: EntityId;
  amount: number;
  account_reward_sum: number;
  calculated_timestamp: Timestamp;
  node_id: number;
  reward_sum: number;
}
