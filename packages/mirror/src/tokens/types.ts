import type { Key } from "@hieco/utils";

export interface TokenInfo {
  readonly admin_key: Key | null;
  readonly auto_renew_account: string | null;
  readonly auto_renew_period: number | null;
  readonly created_timestamp: string;
  readonly decimals: number;
  readonly deleted: boolean;
  readonly expiry_timestamp: string | null;
  readonly fee_schedule_key: Key | null;
  readonly freeze_default: boolean;
  readonly freeze_key: Key | null;
  readonly kyc_key: Key | null;
  readonly supply_key: Key | null;
  readonly wipe_key: Key | null;
  readonly pause_key: Key | null;
  readonly metadata_key: Key | null;
  readonly max_supply: number | null;
  readonly modified_timestamp: string;
  readonly name: string;
  readonly memo: string;
  readonly pause_status: string;
  readonly symbol: string;
  readonly supply_type: "FINITE" | "INFINITE";
  readonly token_id: string;
  readonly total_supply: number;
  readonly treasury_account_id: string;
  readonly type: "FUNGIBLE_COMMON" | "NON_FUNGIBLE_UNIQUE";
  readonly custom_fees: CustomFees;
  readonly ipfs_hash?: string;
  readonly metadata?: string;
}

export interface CustomFees {
  readonly created_timestamp: string;
  readonly fixed_fees?: readonly FixedFee[];
  readonly fractional_fees?: readonly FractionalFee[];
  readonly royalty_fees?: readonly RoyaltyFee[];
}

export interface FixedFee {
  readonly all_collectors_are_exempt: boolean;
  readonly amount: number;
  readonly collector_account_id: string;
  readonly denominating_token_id?: string;
}

export interface FractionalFee {
  readonly all_collectors_are_exempt: boolean;
  readonly amount: {
    readonly numerator: number;
    readonly denominator: number;
  };
  readonly collector_account_id: string;
  readonly denominating_token_id?: string;
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
  readonly collector_account_id: string;
  readonly fallback_fee?: {
    readonly amount: number;
    readonly denominating_token_id: string;
  };
}

export interface TokenDistribution {
  readonly account: string;
  readonly balance: number;
  readonly decimals: number;
}

export interface TokenBalancesResponse {
  readonly timestamp: string | null;
  readonly balances: readonly TokenDistribution[];
  readonly links: {
    readonly next?: string;
  };
}

export interface Nft {
  readonly account: string;
  readonly created_timestamp: string;
  readonly delegated_account_id?: string;
  readonly deleted: boolean;
  readonly ipfs_hash?: string;
  readonly metadata?: string;
  readonly modified_timestamp: string;
  readonly serial_number: number;
  readonly token_id: string;
  readonly spender?: string;
  readonly symbol?: string;
  readonly name?: string;
  readonly treasury?: boolean;
}
