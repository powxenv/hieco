import type { Amount } from "../shared/amount.ts";

export interface TransferParams {
  readonly from?: string;
  readonly to: string;
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
  readonly accountId: string;
  readonly key?: string;
  readonly memo?: string;
  readonly maxAutomaticTokenAssociations?: number;
  readonly autoRenewPeriodSeconds?: number;
  readonly expirationTime?: Date;
  readonly stakedAccountId?: string;
  readonly stakedNodeId?: number;
  readonly declineStakingReward?: boolean;
  readonly maxFee?: Amount;
}

export interface DeleteAccountParams {
  readonly accountId: string;
  readonly transferAccountId: string;
  readonly maxFee?: Amount;
}

export interface HbarAllowanceParams {
  readonly ownerAccountId: string;
  readonly spenderAccountId: string;
  readonly amount: Amount;
}

export interface TokenAllowanceParams {
  readonly tokenId: string;
  readonly ownerAccountId: string;
  readonly spenderAccountId: string;
  readonly amount: Amount;
}

export interface NftAllowanceParams {
  readonly tokenId: string;
  readonly ownerAccountId: string;
  readonly spenderAccountId: string;
  readonly serial?: number;
  readonly approveAll?: boolean;
}

export interface TokenAllowancesQueryParams {
  readonly spenderId?: string;
  readonly tokenId?: string;
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
  readonly ownerAccountId: string;
}

export interface DeleteTokenAllowanceParams {
  readonly tokenId: string;
  readonly ownerAccountId: string;
}

export interface DeleteNftAllowanceParams {
  readonly tokenId: string;
  readonly serial: number;
  readonly ownerAccountId: string;
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
  readonly ownerAccountId: string;
  readonly spenderAccountId: string;
  readonly amount: Amount;
}

export interface AdjustTokenAllowanceParams {
  readonly tokenId: string;
  readonly ownerAccountId: string;
  readonly spenderAccountId: string;
  readonly amount: Amount;
}

export interface AdjustNftAllowanceParams {
  readonly tokenId: string;
  readonly ownerAccountId: string;
  readonly spenderAccountId: string;
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
