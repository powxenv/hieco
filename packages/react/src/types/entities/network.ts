import type { EntityId, Timestamp, Key } from "../rest-api";

export interface ExchangeRate {
  current_rate: Rate;
  next_rate: Rate;
  timestamp: Timestamp;
}

export interface Rate {
  cent_equality: number;
  expiration_time: Timestamp;
  hbar_equality: number;
}

export interface NetworkFee {
  data: FeeData[];
  timestamp: Timestamp;
}

export interface FeeData {
  denominator: number;
  gas: number;
  maximum: number;
  minimum: number;
  numerator: number;
  operations: number[];
  rate: number;
}

export interface ServiceEndpoint {
  domain_name?: string;
  ip_address_v4: string;
  port: number;
}

export interface TimestampRange {
  from: Timestamp;
  to: Timestamp | null;
}

export interface TimestampRangeNullable {
  from: Timestamp | null;
  to: Timestamp | null;
}

export interface NetworkNode {
  admin_key: Key | null;
  decline_reward: boolean | null;
  description: string | null;
  file_id: EntityId;
  max_stake: number | null;
  memo: string | null;
  min_stake: number | null;
  node_account_id: EntityId;
  node_id: number;
  node_cert_hash: string | null;
  public_key: string | null;
  reward_rate_start: number | null;
  service_endpoints: ServiceEndpoint[];
  stake: number | null;
  stake_not_rewarded: number | null;
  stake_rewarded: number | null;
  staking_period: TimestampRangeNullable;
  timestamp: TimestampRange;
}

export interface NetworkStake {
  max_stake_rewarded: number;
  max_staking_reward_rate_per_hbar: number;
  max_total_reward: number;
  node_reward_fee_fraction: number;
  reserved_staking_rewards: number;
  reward_balance_threshold: number;
  stake_total: number;
  staking_period: TimestampRange;
  staking_period_duration: number;
  staking_periods_stored: number;
  staking_reward_fee_fraction: number;
  staking_reward_rate: number;
  staking_start_threshold: number;
  timestamp: TimestampRange;
  unreserved_staking_reward_balance: number;
}

export interface NetworkSupply {
  timestamp: Timestamp;
  total_supply: number;
  released_supply: number;
}
