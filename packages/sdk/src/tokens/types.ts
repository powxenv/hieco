import type { Amount } from "../shared/amount.ts";

export type TokenTypeParam = "FUNGIBLE_COMMON" | "NON_FUNGIBLE_UNIQUE";

export type TokenSupplyTypeParam = "INFINITE" | "FINITE";

export interface CustomFixedFeeParams {
  readonly amount: Amount;
  readonly denominatingTokenId?: string;
  readonly feeCollectorAccountId: string;
}

export interface CustomFractionalFeeParams {
  readonly numerator: number;
  readonly denominator: number;
  readonly min?: number;
  readonly max?: number;
  readonly netOfTransfers?: boolean;
  readonly feeCollectorAccountId: string;
}

export interface CustomRoyaltyFeeParams {
  readonly numerator: number;
  readonly denominator: number;
  readonly fallbackAmount?: Amount;
  readonly fallbackDenominatingTokenId?: string;
  readonly feeCollectorAccountId: string;
}

export type CustomFeeParams =
  | ({ readonly type: "fixed" } & CustomFixedFeeParams)
  | ({ readonly type: "fractional" } & CustomFractionalFeeParams)
  | ({ readonly type: "royalty" } & CustomRoyaltyFeeParams);

export interface CreateTokenParams {
  readonly name: string;
  readonly symbol: string;
  readonly decimals?: number;
  readonly supply?: Amount;
  readonly treasury?: string;
  readonly tokenType?: TokenTypeParam;
  readonly supplyType?: TokenSupplyTypeParam;
  readonly maxSupply?: Amount;
  readonly freezeDefault?: boolean;
  readonly adminKey?: string | true;
  readonly kycKey?: string | true;
  readonly freezeKey?: string | true;
  readonly wipeKey?: string | true;
  readonly supplyKey?: string | true;
  readonly pauseKey?: string | true;
  readonly metadataKey?: string | true;
  readonly feeScheduleKey?: string | true;
  readonly customFees?: ReadonlyArray<CustomFeeParams>;
  readonly autoRenewAccountId?: string;
  readonly autoRenewPeriodSeconds?: number;
  readonly expirationTime?: Date;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface MintTokenParams {
  readonly tokenId: string;
  readonly amount?: Amount;
  readonly metadata?: ReadonlyArray<Uint8Array>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface BurnTokenParams {
  readonly tokenId: string;
  readonly amount?: Amount;
  readonly serials?: ReadonlyArray<number>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface TransferTokenParams {
  readonly tokenId: string;
  readonly from?: string;
  readonly to: string;
  readonly amount: Amount;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface TransferNftParams {
  readonly tokenId: string;
  readonly serial: number;
  readonly from: string;
  readonly to: string;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface AssociateTokenParams {
  readonly accountId: string;
  readonly tokenIds: ReadonlyArray<string>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface DissociateTokenParams {
  readonly accountId: string;
  readonly tokenIds: ReadonlyArray<string>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface FreezeTokenParams {
  readonly tokenId: string;
  readonly accountId: string;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface UnfreezeTokenParams {
  readonly tokenId: string;
  readonly accountId: string;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface GrantKycParams {
  readonly tokenId: string;
  readonly accountId: string;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface RevokeKycParams {
  readonly tokenId: string;
  readonly accountId: string;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface PauseTokenParams {
  readonly tokenId: string;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface UnpauseTokenParams {
  readonly tokenId: string;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface WipeTokenParams {
  readonly tokenId: string;
  readonly accountId: string;
  readonly amount?: Amount;
  readonly serials?: ReadonlyArray<number>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface DeleteTokenParams {
  readonly tokenId: string;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface UpdateTokenParams {
  readonly tokenId: string;
  readonly name?: string;
  readonly symbol?: string;
  readonly treasury?: string;
  readonly adminKey?: string | true;
  readonly kycKey?: string | true;
  readonly freezeKey?: string | true;
  readonly wipeKey?: string | true;
  readonly supplyKey?: string | true;
  readonly pauseKey?: string | true;
  readonly metadataKey?: string | true;
  readonly feeScheduleKey?: string | true;
  readonly autoRenewAccountId?: string;
  readonly autoRenewPeriodSeconds?: number;
  readonly expirationTime?: Date;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface UpdateTokenFeeScheduleParams {
  readonly tokenId: string;
  readonly customFees: ReadonlyArray<CustomFeeParams>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface TokenAirdropTokenTransferParams {
  readonly tokenId: string;
  readonly accountId: string;
  readonly amount: Amount;
  readonly expectedDecimals?: number;
  readonly approved?: boolean;
}

export interface TokenAirdropNftTransferParams {
  readonly tokenId: string;
  readonly serial: number;
  readonly from: string;
  readonly to: string;
  readonly approved?: boolean;
}

export interface TokenAirdropParams {
  readonly tokenTransfers?: ReadonlyArray<TokenAirdropTokenTransferParams>;
  readonly nftTransfers?: ReadonlyArray<TokenAirdropNftTransferParams>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface PendingAirdropReference {
  readonly senderId: string;
  readonly receiverId: string;
  readonly tokenId?: string;
  readonly nft?: {
    readonly tokenId: string;
    readonly serial: number;
  };
}

export interface TokenClaimAirdropParams {
  readonly pendingAirdropIds: ReadonlyArray<string | PendingAirdropReference>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface TokenCancelAirdropParams {
  readonly pendingAirdropIds: ReadonlyArray<string | PendingAirdropReference>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface TokenRejectParams {
  readonly owner?: string;
  readonly tokenIds?: ReadonlyArray<string>;
  readonly nfts?: ReadonlyArray<{
    readonly tokenId: string;
    readonly serial: number;
  }>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface TokenUpdateNftsParams {
  readonly tokenId: string;
  readonly serialNumbers: ReadonlyArray<number>;
  readonly metadata: Uint8Array;
  readonly memo?: string;
  readonly maxFee?: Amount;
}
