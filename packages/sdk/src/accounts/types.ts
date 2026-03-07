import type { EntityId } from "@hieco/utils";
import type { Amount } from "../shared/amount.ts";

export interface TransferParams {
  readonly from?: EntityId;
  readonly to: EntityId;
  readonly hbar: Amount;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface CreateAccountParams {
  readonly publicKey: string;
  readonly initialBalance?: Amount;
  readonly memo?: string;
  readonly maxAutomaticTokenAssociations?: number;
  readonly receiverSignatureRequired?: boolean;
  readonly autoRenewPeriodSeconds?: number;
  readonly maxFee?: Amount;
}

export interface UpdateAccountParams {
  readonly accountId: EntityId;
  readonly key?: string;
  readonly memo?: string;
  readonly maxAutomaticTokenAssociations?: number;
  readonly autoRenewPeriodSeconds?: number;
  readonly expirationTime?: Date;
  readonly stakedAccountId?: EntityId;
  readonly stakedNodeId?: number;
  readonly declineStakingReward?: boolean;
  readonly maxFee?: Amount;
}

export interface DeleteAccountParams {
  readonly accountId: EntityId;
  readonly transferAccountId: EntityId;
  readonly maxFee?: Amount;
}

export interface HbarAllowanceParams {
  readonly ownerAccountId: EntityId;
  readonly spenderAccountId: EntityId;
  readonly amount: Amount;
}

export interface TokenAllowanceParams {
  readonly tokenId: EntityId;
  readonly ownerAccountId: EntityId;
  readonly spenderAccountId: EntityId;
  readonly amount: Amount;
}

export interface NftAllowanceParams {
  readonly tokenId: EntityId;
  readonly ownerAccountId: EntityId;
  readonly spenderAccountId: EntityId;
  readonly serial?: number;
  readonly approveAll?: boolean;
}

export interface TokenAllowancesQueryParams {
  readonly spenderId?: EntityId;
  readonly tokenId?: EntityId;
  readonly limit?: number;
  readonly order?: "asc" | "desc";
}

export interface ApproveAllowanceParams {
  readonly hbar?: ReadonlyArray<HbarAllowanceParams>;
  readonly tokens?: ReadonlyArray<TokenAllowanceParams>;
  readonly nfts?: ReadonlyArray<NftAllowanceParams>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface DeleteHbarAllowanceParams {
  readonly ownerAccountId: EntityId;
}

export interface DeleteTokenAllowanceParams {
  readonly tokenId: EntityId;
  readonly ownerAccountId: EntityId;
}

export interface DeleteNftAllowanceParams {
  readonly tokenId: EntityId;
  readonly serial: number;
  readonly ownerAccountId: EntityId;
}

export interface DeleteAllowanceParams {
  readonly hbar?: ReadonlyArray<DeleteHbarAllowanceParams>;
  readonly tokens?: ReadonlyArray<DeleteTokenAllowanceParams>;
  readonly nfts?: ReadonlyArray<DeleteNftAllowanceParams>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface DeleteNftAllowancesParams {
  readonly nfts: ReadonlyArray<DeleteNftAllowanceParams>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface AdjustHbarAllowanceParams {
  readonly ownerAccountId: EntityId;
  readonly spenderAccountId: EntityId;
  readonly amount: Amount;
}

export interface AdjustTokenAllowanceParams {
  readonly tokenId: EntityId;
  readonly ownerAccountId: EntityId;
  readonly spenderAccountId: EntityId;
  readonly amount: Amount;
}

export interface AdjustNftAllowanceParams {
  readonly tokenId: EntityId;
  readonly ownerAccountId: EntityId;
  readonly spenderAccountId: EntityId;
  readonly serial?: number;
  readonly approveAll?: boolean;
}

export interface AdjustAllowanceParams {
  readonly hbar?: ReadonlyArray<AdjustHbarAllowanceParams>;
  readonly tokens?: ReadonlyArray<AdjustTokenAllowanceParams>;
  readonly nfts?: ReadonlyArray<AdjustNftAllowanceParams>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}
