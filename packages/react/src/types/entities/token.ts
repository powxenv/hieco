import type { EntityId, Timestamp, Key } from "../rest-api";

export interface TokenInfo {
  admin_key: Key | null;
  auto_renew_account: EntityId | null;
  auto_renew_period: number | null;
  created_timestamp: Timestamp;
  decimals: number;
  deleted: boolean;
  expiry_timestamp: Timestamp | null;
  fee_schedule_key: Key | null;
  freeze_default: boolean;
  freeze_key: Key | null;
  kyc_key: Key | null;
  supply_key: Key | null;
  wipe_key: Key | null;
  pause_key: Key | null;
  metadata_key: Key | null;
  max_supply: number | null;
  modified_timestamp: Timestamp;
  name: string;
  memo: string;
  pause_status: string;
  symbol: string;
  supply_type: "FINITE" | "INFINITE";
  token_id: EntityId;
  total_supply: number;
  treasury_account_id: EntityId;
  type: "FUNGIBLE_COMMON" | "NON_FUNGIBLE_UNIQUE";
  custom_fees: CustomFees;
  ipfs_hash?: string;
  metadata?: string;
}

export interface CustomFees {
  created_timestamp: Timestamp;
  fixed_fees?: FixedFee[];
  fractional_fees?: FractionalFee[];
  royalty_fees?: RoyaltyFee[];
}

export interface FixedFee {
  all_collectors_are_exempt: boolean;
  amount: number;
  collector_account_id: EntityId;
  denominating_token_id?: EntityId;
}

export interface FractionalFee {
  all_collectors_are_exempt: boolean;
  amount: {
    numerator: number;
    denominator: number;
  };
  collector_account_id: EntityId;
  denominating_token_id?: EntityId;
  maximum?: number;
  minimum?: number;
  net_of_transfers?: boolean;
}

export interface RoyaltyFee {
  all_collectors_are_exempt: boolean;
  amount: {
    numerator: number;
    denominator: number;
  };
  collector_account_id: EntityId;
  fallback_fee?: {
    amount: number;
    denominating_token_id: EntityId;
  };
}

export interface TokenDistribution {
  account: EntityId;
  balance: number;
  decimals: number;
}

export interface Nft {
  account: EntityId;
  created_timestamp: Timestamp;
  delegated_account_id?: EntityId;
  deleted: boolean;
  ipfs_hash?: string;
  metadata?: string;
  modified_timestamp: Timestamp;
  serial_number: number;
  token_id: EntityId;
  spender?: EntityId;
  symbol?: string;
  name?: string;
  treasury?: boolean;
}
