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
  readonly maxAttempts?: number;
  readonly maxNodeAttempts?: number;
  readonly requestTimeoutMs?: number;
  readonly grpcDeadlineMs?: number;
  readonly minBackoffMs?: number;
  readonly maxBackoffMs?: number;
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

export interface DeployContractBase {
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

export type DeployContractParams =
  | (DeployContractBase & {
      readonly bytecode: string;
      readonly bytecodeFileId?: never;
    })
  | (DeployContractBase & {
      readonly bytecode?: never;
      readonly bytecodeFileId: EntityId;
    });

export interface DeployArtifactParams extends DeployContractBase {
  readonly bytecode: string | Uint8Array;
  readonly chunkSize?: number;
  readonly fileKeys?: ReadonlyArray<string>;
  readonly forceFile?: boolean;
}

export interface AccountInfoFlowOptions {
  readonly maxAttempts?: number;
  readonly retryDelayMs?: number;
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

export interface NodeServiceEndpointParams {
  readonly ipAddressV4?: Uint8Array;
  readonly domainName?: string;
  readonly port: number;
}

export interface NodeCreateParams {
  readonly accountId: EntityId;
  readonly description?: string;
  readonly gossipEndpoints: ReadonlyArray<NodeServiceEndpointParams>;
  readonly serviceEndpoints?: ReadonlyArray<NodeServiceEndpointParams>;
  readonly gossipCaCertificate: Uint8Array;
  readonly grpcCertificateHash?: Uint8Array;
  readonly grpcWebProxyEndpoint?: NodeServiceEndpointParams;
  readonly adminKey?: string | true;
  readonly declineReward?: boolean;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface NodeUpdateParams {
  readonly nodeId: string | number | bigint;
  readonly accountId?: EntityId;
  readonly description?: string;
  readonly clearDescription?: boolean;
  readonly gossipEndpoints?: ReadonlyArray<NodeServiceEndpointParams>;
  readonly serviceEndpoints?: ReadonlyArray<NodeServiceEndpointParams>;
  readonly gossipCaCertificate?: Uint8Array;
  readonly grpcCertificateHash?: Uint8Array;
  readonly grpcWebProxyEndpoint?: NodeServiceEndpointParams;
  readonly clearGrpcWebProxyEndpoint?: boolean;
  readonly adminKey?: string | true;
  readonly declineReward?: boolean;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface NodeDeleteParams {
  readonly nodeId: string | number | bigint;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export type FreezeIntent =
  | "freeze-only"
  | "prepare-upgrade"
  | "freeze-upgrade"
  | "freeze-abort"
  | "telemetry-upgrade";

export interface FreezeNetworkParams {
  readonly startTimestamp?: Date | string | number;
  readonly fileId?: EntityId;
  readonly fileHash?: Uint8Array | string;
  readonly type?: FreezeIntent;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface SystemDeleteParams {
  readonly fileId?: EntityId;
  readonly contractId?: EntityId;
  readonly expirationTime?: Date;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface SystemUndeleteParams {
  readonly fileId?: EntityId;
  readonly contractId?: EntityId;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface LiveHashAddParams {
  readonly accountId: EntityId;
  readonly hash: Uint8Array;
  readonly keys: ReadonlyArray<string>;
  readonly durationSeconds: number;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface LiveHashDeleteParams {
  readonly accountId: EntityId;
  readonly hash: Uint8Array;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface LiveHashQueryParams {
  readonly accountId: EntityId;
  readonly hash: Uint8Array;
}

export interface EthereumSendRawParams {
  readonly ethereumData: Uint8Array | string;
  readonly callDataFileId?: EntityId;
  readonly maxGasAllowance?: Amount;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface PrngParams {
  readonly range?: number;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface BatchAtomicParams {
  readonly txs: ReadonlyArray<TransactionDescriptor>;
  readonly batchKey: string;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface WatchTopicMessagesOptions {
  readonly startTime?: Date;
  readonly endTime?: Date;
  readonly limit?: number;
  readonly onError?: (error: Error) => void;
}

export interface WatchTopicMessagesFromOptions {
  readonly sinceSequence?: number;
  readonly sinceTimestamp?: string;
  readonly resume?: boolean;
  readonly limit?: number;
  readonly onError?: (error: Error) => void;
}

export interface SubmitJsonMessageParams {
  readonly topicId: EntityId;
  readonly data: unknown;
  readonly maxChunks?: number;
  readonly chunkSize?: number;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface BatchSubmitMessagesParams {
  readonly topicId: EntityId;
  readonly messages: ReadonlyArray<Uint8Array | string | Record<string, unknown>>;
  readonly concurrency?: number;
  readonly maxChunks?: number;
  readonly chunkSize?: number;
  readonly memo?: string;
  readonly maxFee?: Amount;
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

export interface ScheduleIdempotentCreateParams {
  readonly tx: TransactionDescriptor;
  readonly adminKey?: string | true;
  readonly payerAccountId?: EntityId;
  readonly expirationTime?: Date;
  readonly waitForExpiry?: boolean;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface ScheduleCollectSignaturesParams {
  readonly scheduleId: EntityId;
  readonly signers: ReadonlyArray<import("@hiero-ledger/sdk").Signer>;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface ScheduleWaitExecutionOptions {
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
  | { readonly kind: "accounts.allowances.adjust"; readonly params: AdjustAllowanceParams }
  | { readonly kind: "accounts.allowances.deleteNft"; readonly params: DeleteNftAllowancesParams }
  | { readonly kind: "legacy.liveHash.add"; readonly params: LiveHashAddParams }
  | { readonly kind: "legacy.liveHash.delete"; readonly params: LiveHashDeleteParams }
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
  | { readonly kind: "tokens.airdrop"; readonly params: TokenAirdropParams }
  | { readonly kind: "tokens.claimAirdrop"; readonly params: TokenClaimAirdropParams }
  | { readonly kind: "tokens.cancelAirdrop"; readonly params: TokenCancelAirdropParams }
  | { readonly kind: "tokens.reject"; readonly params: TokenRejectParams }
  | { readonly kind: "tokens.updateNfts"; readonly params: TokenUpdateNftsParams }
  | { readonly kind: "nodes.create"; readonly params: NodeCreateParams }
  | { readonly kind: "nodes.update"; readonly params: NodeUpdateParams }
  | { readonly kind: "nodes.delete"; readonly params: NodeDeleteParams }
  | { readonly kind: "system.freeze"; readonly params: FreezeNetworkParams }
  | { readonly kind: "system.delete"; readonly params: SystemDeleteParams }
  | { readonly kind: "system.undelete"; readonly params: SystemUndeleteParams }
  | { readonly kind: "evm.ethereum"; readonly params: EthereumSendRawParams }
  | { readonly kind: "util.random"; readonly params: PrngParams }
  | { readonly kind: "batch.atomic"; readonly params: BatchAtomicParams }
  | { readonly kind: "schedules.create"; readonly params: ScheduleCreateParams }
  | { readonly kind: "schedules.sign"; readonly params: ScheduleSignParams }
  | { readonly kind: "schedules.delete"; readonly params: ScheduleDeleteParams };
