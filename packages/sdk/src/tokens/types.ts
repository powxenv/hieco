import type { EntityId } from "@hieco/utils";
import type { Amount } from "../shared/amount.ts";

export type TokenTypeParam = "FUNGIBLE_COMMON" | "NON_FUNGIBLE_UNIQUE";

export type TokenSupplyTypeParam = "INFINITE" | "FINITE";

export interface CustomFixedFeeParams {
  readonly amount: Amount;
  readonly denominatingTokenId?: EntityId;
  readonly feeCollectorAccountId: EntityId;
}

export interface CustomFractionalFeeParams {
  readonly numerator: number;
  readonly denominator: number;
  readonly min?: number;
  readonly max?: number;
  readonly netOfTransfers?: boolean;
  readonly feeCollectorAccountId: EntityId;
}

export interface CustomRoyaltyFeeParams {
  readonly numerator: number;
  readonly denominator: number;
  readonly fallbackAmount?: Amount;
  readonly fallbackDenominatingTokenId?: EntityId;
  readonly feeCollectorAccountId: EntityId;
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
  readonly treasury?: EntityId;
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
  readonly autoRenewAccountId?: EntityId;
  readonly autoRenewPeriodSeconds?: number;
  readonly expirationTime?: Date;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface MintTokenParams {
  readonly tokenId: EntityId;
  readonly amount?: Amount;
  readonly metadata?: ReadonlyArray<Uint8Array>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface BurnTokenParams {
  readonly tokenId: EntityId;
  readonly amount?: Amount;
  readonly serials?: ReadonlyArray<number>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface TransferTokenParams {
  readonly tokenId: EntityId;
  readonly from?: EntityId;
  readonly to: EntityId;
  readonly amount: Amount;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface TransferNftParams {
  readonly tokenId: EntityId;
  readonly serial: number;
  readonly from: EntityId;
  readonly to: EntityId;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface AssociateTokenParams {
  readonly accountId: EntityId;
  readonly tokenIds: ReadonlyArray<EntityId>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface DissociateTokenParams {
  readonly accountId: EntityId;
  readonly tokenIds: ReadonlyArray<EntityId>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface FreezeTokenParams {
  readonly tokenId: EntityId;
  readonly accountId: EntityId;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface UnfreezeTokenParams {
  readonly tokenId: EntityId;
  readonly accountId: EntityId;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface GrantKycParams {
  readonly tokenId: EntityId;
  readonly accountId: EntityId;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface RevokeKycParams {
  readonly tokenId: EntityId;
  readonly accountId: EntityId;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface PauseTokenParams {
  readonly tokenId: EntityId;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface UnpauseTokenParams {
  readonly tokenId: EntityId;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface WipeTokenParams {
  readonly tokenId: EntityId;
  readonly accountId: EntityId;
  readonly amount?: Amount;
  readonly serials?: ReadonlyArray<number>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface DeleteTokenParams {
  readonly tokenId: EntityId;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface UpdateTokenParams {
  readonly tokenId: EntityId;
  readonly name?: string;
  readonly symbol?: string;
  readonly treasury?: EntityId;
  readonly adminKey?: string | true;
  readonly kycKey?: string | true;
  readonly freezeKey?: string | true;
  readonly wipeKey?: string | true;
  readonly supplyKey?: string | true;
  readonly pauseKey?: string | true;
  readonly metadataKey?: string | true;
  readonly feeScheduleKey?: string | true;
  readonly autoRenewAccountId?: EntityId;
  readonly autoRenewPeriodSeconds?: number;
  readonly expirationTime?: Date;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface UpdateTokenFeeScheduleParams {
  readonly tokenId: EntityId;
  readonly customFees: ReadonlyArray<CustomFeeParams>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface TokenAirdropTokenTransferParams {
  readonly tokenId: EntityId;
  readonly accountId: EntityId;
  readonly amount: Amount;
  readonly expectedDecimals?: number;
  readonly approved?: boolean;
}

export interface TokenAirdropNftTransferParams {
  readonly tokenId: EntityId;
  readonly serial: number;
  readonly from: EntityId;
  readonly to: EntityId;
  readonly approved?: boolean;
}

export interface TokenAirdropParams {
  readonly tokenTransfers?: ReadonlyArray<TokenAirdropTokenTransferParams>;
  readonly nftTransfers?: ReadonlyArray<TokenAirdropNftTransferParams>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface PendingAirdropReference {
  readonly senderId: EntityId;
  readonly receiverId: EntityId;
  readonly tokenId?: EntityId;
  readonly nft?: {
    readonly tokenId: EntityId;
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
  readonly owner?: EntityId;
  readonly tokenIds?: ReadonlyArray<EntityId>;
  readonly nfts?: ReadonlyArray<{
    readonly tokenId: EntityId;
    readonly serial: number;
  }>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface TokenUpdateNftsParams {
  readonly tokenId: EntityId;
  readonly serialNumbers: ReadonlyArray<number>;
  readonly metadata: Uint8Array;
  readonly memo?: string;
  readonly maxFee?: Amount;
}
