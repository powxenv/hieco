import type { EntityId, NetworkType } from "@hieco/utils";
import type { Signer as HieroSigner } from "@hiero-ledger/sdk";

export type Amount = number | string | bigint;

export interface ClientConfig {
  readonly network?: NetworkType;
  readonly operator?: EntityId;
  readonly key?: string;
  readonly signer?: HieroSigner;
  readonly mirrorUrl?: string;
  readonly maxFee?: Amount;
}

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

export interface CreateTopicParams {
  readonly adminKey?: string | true;
  readonly submitKey?: string | true;
  readonly feeScheduleKey?: string | true;
  readonly autoRenewAccountId?: EntityId;
  readonly autoRenewPeriodSeconds?: number;
  readonly customFees?: ReadonlyArray<CustomFixedFeeParams>;
  readonly feeExemptKeys?: ReadonlyArray<string>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface UpdateTopicParams {
  readonly topicId: EntityId;
  readonly adminKey?: string | true;
  readonly submitKey?: string | true;
  readonly feeScheduleKey?: string | true;
  readonly autoRenewAccountId?: EntityId;
  readonly autoRenewPeriodSeconds?: number;
  readonly expirationTime?: Date;
  readonly customFees?: ReadonlyArray<CustomFixedFeeParams>;
  readonly feeExemptKeys?: ReadonlyArray<string>;
  readonly clearAdminKey?: boolean;
  readonly clearSubmitKey?: boolean;
  readonly clearAutoRenewAccountId?: boolean;
  readonly clearFeeScheduleKey?: boolean;
  readonly clearFeeExemptKeys?: boolean;
  readonly clearCustomFees?: boolean;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface DeleteTopicParams {
  readonly topicId: EntityId;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface SubmitMessageParams {
  readonly topicId: EntityId;
  readonly message: string | Record<string, unknown> | Uint8Array;
  readonly maxChunks?: number;
  readonly chunkSize?: number;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface ConstructorParamsConfig {
  readonly types: ReadonlyArray<string>;
  readonly values: ReadonlyArray<unknown>;
}

export interface FunctionParamsConfig {
  readonly types: ReadonlyArray<string>;
  readonly values: ReadonlyArray<unknown>;
}

export interface DeployContractParams {
  readonly bytecode: string;
  readonly gas?: number;
  readonly constructorParams?: ConstructorParamsConfig;
  readonly adminKey?: string | true;
  readonly initialBalance?: Amount;
  readonly autoRenewPeriodSeconds?: number;
  readonly autoRenewAccountId?: EntityId;
  readonly maxAutomaticTokenAssociations?: number;
  readonly stakedAccountId?: EntityId;
  readonly stakedNodeId?: number;
  readonly declineStakingReward?: boolean;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface ExecuteContractParams {
  readonly id: EntityId;
  readonly fn: string;
  readonly args?: ReadonlyArray<unknown>;
  readonly gas?: number;
  readonly payableAmount?: Amount;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface ExecuteContractParamsTyped {
  readonly id: EntityId;
  readonly fn: string;
  readonly params: FunctionParamsConfig;
  readonly gas?: number;
  readonly payableAmount?: Amount;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface CallContractParams {
  readonly id: EntityId;
  readonly fn: string;
  readonly args?: ReadonlyArray<unknown>;
  readonly gas?: number;
  readonly senderAccountId?: EntityId;
  readonly returns?: import("../domains/contracts/abi.ts").ReturnTypeHint;
}

export interface DeleteContractParams {
  readonly contractId: EntityId;
  readonly transferAccountId?: EntityId;
  readonly transferContractId?: EntityId;
  readonly permanentRemoval?: boolean;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface UpdateContractParams {
  readonly contractId: EntityId;
  readonly adminKey?: string | true;
  readonly expirationTime?: Date;
  readonly autoRenewPeriodSeconds?: number;
  readonly autoRenewAccountId?: EntityId;
  readonly maxAutomaticTokenAssociations?: number;
  readonly stakedAccountId?: EntityId;
  readonly stakedNodeId?: number;
  readonly declineStakingReward?: boolean;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface ScheduleCreateParams {
  readonly tx: TransactionDescriptor;
  readonly adminKey?: string | true;
  readonly payerAccountId?: EntityId;
  readonly expirationTime?: Date;
  readonly waitForExpiry?: boolean;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface ScheduleSignParams {
  readonly scheduleId: EntityId;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface ScheduleDeleteParams {
  readonly scheduleId: EntityId;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface CreateFileParams {
  readonly contents: Uint8Array | string;
  readonly keys?: ReadonlyArray<string>;
  readonly expirationTime?: Date;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface AppendFileParams {
  readonly fileId: EntityId;
  readonly contents: Uint8Array | string;
  readonly maxChunks?: number;
  readonly chunkSize?: number;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface UpdateFileParams {
  readonly fileId: EntityId;
  readonly contents?: Uint8Array | string;
  readonly keys?: ReadonlyArray<string>;
  readonly expirationTime?: Date;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface UploadFileParams {
  readonly contents: Uint8Array | string;
  readonly keys?: ReadonlyArray<string>;
  readonly expirationTime?: Date;
  readonly memo?: string;
  readonly maxFee?: Amount;
  readonly chunkSize?: number;
}

export interface UpdateLargeFileParams {
  readonly fileId: EntityId;
  readonly contents: Uint8Array | string;
  readonly memo?: string;
  readonly maxFee?: Amount;
  readonly chunkSize?: number;
}

export interface DeleteFileParams {
  readonly fileId: EntityId;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface WatchTopicMessagesOptions {
  readonly startTime?: Date;
  readonly endTime?: Date;
  readonly limit?: number;
  readonly onError?: (error: Error) => void;
}

export interface TopicMessageData {
  readonly consensusTimestamp: string;
  readonly contents: Uint8Array;
  readonly runningHash: Uint8Array;
  readonly sequenceNumber: number;
  readonly topicId: string;
  readonly json: () => unknown;
  readonly text: () => string;
}

export interface ScheduleWaitOptions {
  readonly timeoutMs?: number;
  readonly pollIntervalMs?: number;
  readonly stopWhenDeleted?: boolean;
}

export type TransactionDescriptor =
  | { readonly kind: "accounts.transfer"; readonly params: TransferParams }
  | { readonly kind: "accounts.create"; readonly params: CreateAccountParams }
  | { readonly kind: "accounts.update"; readonly params: UpdateAccountParams }
  | { readonly kind: "accounts.delete"; readonly params: DeleteAccountParams }
  | { readonly kind: "accounts.allowances"; readonly params: ApproveAllowanceParams }
  | { readonly kind: "accounts.allowances.deleteNft"; readonly params: DeleteNftAllowancesParams }
  | { readonly kind: "tokens.create"; readonly params: CreateTokenParams }
  | { readonly kind: "tokens.mint"; readonly params: MintTokenParams }
  | { readonly kind: "tokens.burn"; readonly params: BurnTokenParams }
  | { readonly kind: "tokens.transfer"; readonly params: TransferTokenParams }
  | { readonly kind: "tokens.transferNft"; readonly params: TransferNftParams }
  | { readonly kind: "tokens.associate"; readonly params: AssociateTokenParams }
  | { readonly kind: "tokens.dissociate"; readonly params: DissociateTokenParams }
  | { readonly kind: "tokens.freeze"; readonly params: FreezeTokenParams }
  | { readonly kind: "tokens.unfreeze"; readonly params: UnfreezeTokenParams }
  | { readonly kind: "tokens.grantKyc"; readonly params: GrantKycParams }
  | { readonly kind: "tokens.revokeKyc"; readonly params: RevokeKycParams }
  | { readonly kind: "tokens.pause"; readonly params: PauseTokenParams }
  | { readonly kind: "tokens.unpause"; readonly params: UnpauseTokenParams }
  | { readonly kind: "tokens.wipe"; readonly params: WipeTokenParams }
  | { readonly kind: "tokens.delete"; readonly params: DeleteTokenParams }
  | { readonly kind: "tokens.update"; readonly params: UpdateTokenParams }
  | { readonly kind: "tokens.fees"; readonly params: UpdateTokenFeeScheduleParams }
  | { readonly kind: "hcs.create"; readonly params: CreateTopicParams }
  | { readonly kind: "hcs.update"; readonly params: UpdateTopicParams }
  | { readonly kind: "hcs.delete"; readonly params: DeleteTopicParams }
  | { readonly kind: "hcs.submit"; readonly params: SubmitMessageParams }
  | { readonly kind: "contracts.deploy"; readonly params: DeployContractParams }
  | { readonly kind: "contracts.execute"; readonly params: ExecuteContractParams }
  | { readonly kind: "contracts.execute.typed"; readonly params: ExecuteContractParamsTyped }
  | { readonly kind: "contracts.delete"; readonly params: DeleteContractParams }
  | { readonly kind: "contracts.update"; readonly params: UpdateContractParams }
  | { readonly kind: "files.create"; readonly params: CreateFileParams }
  | { readonly kind: "files.append"; readonly params: AppendFileParams }
  | { readonly kind: "files.update"; readonly params: UpdateFileParams }
  | { readonly kind: "files.delete"; readonly params: DeleteFileParams }
  | { readonly kind: "schedules.create"; readonly params: ScheduleCreateParams }
  | { readonly kind: "schedules.sign"; readonly params: ScheduleSignParams }
  | { readonly kind: "schedules.delete"; readonly params: ScheduleDeleteParams };
