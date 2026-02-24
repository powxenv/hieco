import type { EntityId, Timestamp, Key } from "../rest-api";

export interface TokenInfo {
  readonly admin_key: Key | null;
  readonly auto_renew_account: EntityId | null;
  readonly auto_renew_period: number | null;
  readonly created_timestamp: Timestamp;
  readonly decimals: number;
  readonly deleted: boolean;
  readonly expiry_timestamp: Timestamp | null;
  readonly fee_schedule_key: Key | null;
  readonly freeze_default: boolean;
  readonly freeze_key: Key | null;
  readonly kyc_key: Key | null;
  readonly supply_key: Key | null;
  readonly wipe_key: Key | null;
  readonly pause_key: Key | null;
  readonly metadata_key: Key | null;
  readonly max_supply: number | null;
  readonly modified_timestamp: Timestamp;
  readonly name: string;
  readonly memo: string;
  readonly pause_status: string;
  readonly symbol: string;
  readonly supply_type: "FINITE" | "INFINITE";
  readonly token_id: EntityId;
  readonly total_supply: number;
  readonly treasury_account_id: EntityId;
  readonly type: "FUNGIBLE_COMMON" | "NON_FUNGIBLE_UNIQUE";
  readonly custom_fees: CustomFees;
  readonly ipfs_hash?: string;
  readonly metadata?: string;
}

export interface CustomFees {
  readonly created_timestamp: Timestamp;
  readonly fixed_fees?: readonly FixedFee[];
  readonly fractional_fees?: readonly FractionalFee[];
  readonly royalty_fees?: readonly RoyaltyFee[];
}

export interface FixedFee {
  readonly all_collectors_are_exempt: boolean;
  readonly amount: number;
  readonly collector_account_id: EntityId;
  readonly denominating_token_id?: EntityId;
}

export interface FractionalFee {
  readonly all_collectors_are_exempt: boolean;
  readonly amount: {
    readonly numerator: number;
    readonly denominator: number;
  };
  readonly collector_account_id: EntityId;
  readonly denominating_token_id?: EntityId;
  readonly maximum?: number;
  readonly minimum?: number;
  readonly net_of_transfers?: boolean;
}

export interface RoyaltyFee {
  readonly all_collectors_are_exempt: boolean;
  readonly amount: {
    readonly numerator: number;
    readonly denominator: number;
  };
  readonly collector_account_id: EntityId;
  readonly fallback_fee?: {
    readonly amount: number;
    readonly denominating_token_id: EntityId;
  };
}

export interface TokenDistribution {
  readonly account: EntityId;
  readonly balance: number;
  readonly decimals: number;
}

export interface Nft {
  readonly account: EntityId;
  readonly created_timestamp: Timestamp;
  readonly delegated_account_id?: EntityId;
  readonly deleted: boolean;
  readonly ipfs_hash?: string;
  readonly metadata?: string;
  readonly modified_timestamp: Timestamp;
  readonly serial_number: number;
  readonly token_id: EntityId;
  readonly spender?: EntityId;
  readonly symbol?: string;
  readonly name?: string;
  readonly treasury?: boolean;
}
