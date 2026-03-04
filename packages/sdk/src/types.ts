import type { EntityId, NetworkType } from "@hieco/types";
import type { Client, Signer as HieroSigner } from "@hiero-ledger/sdk";
import type { SdkError } from "./errors/types.ts";
import { configurationError } from "./errors/messages.ts";
import type { TransactionEventEmitter } from "./events/emitter.ts";

export type SdkResult<T> =
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: SdkError };

export type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export type TransactionType =
  | "transfer"
  | "createAccount"
  | "updateAccount"
  | "deleteAccount"
  | "approveAllowance"
  | "createToken"
  | "mintToken"
  | "burnToken"
  | "transferToken"
  | "transferNft"
  | "associateToken"
  | "dissociateToken"
  | "freezeToken"
  | "unfreezeToken"
  | "grantKyc"
  | "revokeKyc"
  | "pauseToken"
  | "unpauseToken"
  | "wipeToken"
  | "deleteToken"
  | "updateToken"
  | "updateTokenFeeSchedule"
  | "createTopic"
  | "updateTopic"
  | "deleteTopic"
  | "submitMessage"
  | "deployContract"
  | "executeContract"
  | "deleteContract"
  | "updateContract"
  | "scheduleTransaction"
  | "signSchedule"
  | "deleteSchedule"
  | "createFile"
  | "appendFile"
  | "updateFile"
  | "deleteFile";

export type LogLevel = "none" | "error" | "warn" | "info" | "debug" | "trace";

export type TokenTypeParam = "FUNGIBLE_COMMON" | "NON_FUNGIBLE_UNIQUE";

export type TokenSupplyTypeParam = "INFINITE" | "FINITE";

export interface TransferParams {
  readonly from: EntityId;
  readonly to: EntityId;
  readonly amount: number | string;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface CreateAccountParams {
  readonly publicKey: string;
  readonly initialBalance?: number | string;
  readonly memo?: string;
  readonly maxAutomaticTokenAssociations?: number;
  readonly receiverSignatureRequired?: boolean;
  readonly autoRenewPeriodSeconds?: number;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
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
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface DeleteAccountParams {
  readonly accountId: EntityId;
  readonly transferAccountId: EntityId;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface CustomFixedFeeParams {
  readonly amount: number | string;
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
  readonly fallbackAmount?: number | string;
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
  readonly initialSupply?: number | string;
  readonly treasury?: EntityId;
  readonly tokenType?: TokenTypeParam;
  readonly supplyType?: TokenSupplyTypeParam;
  readonly maxSupply?: number | string;
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
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface MintTokenParams {
  readonly tokenId: EntityId;
  readonly amount?: number | string;
  readonly metadata?: ReadonlyArray<Uint8Array>;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface BurnTokenParams {
  readonly tokenId: EntityId;
  readonly amount?: number | string;
  readonly serials?: ReadonlyArray<number>;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface TransferTokenParams {
  readonly tokenId: EntityId;
  readonly from: EntityId;
  readonly to: EntityId;
  readonly amount: number | string;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface TransferNftParams {
  readonly tokenId: EntityId;
  readonly serial: number;
  readonly from: EntityId;
  readonly to: EntityId;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface AssociateTokenParams {
  readonly accountId: EntityId;
  readonly tokenIds: ReadonlyArray<EntityId>;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface DissociateTokenParams {
  readonly accountId: EntityId;
  readonly tokenIds: ReadonlyArray<EntityId>;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface FreezeTokenParams {
  readonly tokenId: EntityId;
  readonly accountId: EntityId;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface UnfreezeTokenParams {
  readonly tokenId: EntityId;
  readonly accountId: EntityId;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface GrantKycParams {
  readonly tokenId: EntityId;
  readonly accountId: EntityId;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface RevokeKycParams {
  readonly tokenId: EntityId;
  readonly accountId: EntityId;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface PauseTokenParams {
  readonly tokenId: EntityId;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface UnpauseTokenParams {
  readonly tokenId: EntityId;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface WipeTokenParams {
  readonly tokenId: EntityId;
  readonly accountId: EntityId;
  readonly amount?: number | string;
  readonly serials?: ReadonlyArray<number>;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface DeleteTokenParams {
  readonly tokenId: EntityId;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
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
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface UpdateTokenFeeScheduleParams {
  readonly tokenId: EntityId;
  readonly customFees: ReadonlyArray<CustomFeeParams>;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface HbarAllowanceParams {
  readonly ownerAccountId: EntityId;
  readonly spenderAccountId: EntityId;
  readonly amount: number | string;
}

export interface TokenAllowanceParams {
  readonly tokenId: EntityId;
  readonly ownerAccountId: EntityId;
  readonly spenderAccountId: EntityId;
  readonly amount: number | string;
}

export interface NftAllowanceParams {
  readonly tokenId: EntityId;
  readonly ownerAccountId: EntityId;
  readonly spenderAccountId: EntityId;
  readonly serial?: number;
  readonly approveAll?: boolean;
}

export interface ApproveAllowanceParams {
  readonly hbarAllowances?: ReadonlyArray<HbarAllowanceParams>;
  readonly tokenAllowances?: ReadonlyArray<TokenAllowanceParams>;
  readonly nftAllowances?: ReadonlyArray<NftAllowanceParams>;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
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
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
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
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface DeleteTopicParams {
  readonly topicId: EntityId;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface SubmitMessageParams {
  readonly topicId: EntityId;
  readonly message: string | Record<string, unknown> | Uint8Array;
  readonly maxChunks?: number;
  readonly chunkSize?: number;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
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
  readonly initialBalance?: number | string;
  readonly autoRenewPeriodSeconds?: number;
  readonly autoRenewAccountId?: EntityId;
  readonly maxAutomaticTokenAssociations?: number;
  readonly stakedAccountId?: EntityId;
  readonly stakedNodeId?: number;
  readonly declineStakingReward?: boolean;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface ExecuteContractParams {
  readonly contractId: EntityId;
  readonly functionName: string;
  readonly functionParams?: FunctionParamsConfig;
  readonly gas?: number;
  readonly payableAmount?: number | string;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface CallContractParams {
  readonly contractId: EntityId;
  readonly functionName: string;
  readonly functionParams?: FunctionParamsConfig;
  readonly gas?: number;
  readonly senderAccountId?: EntityId;
}

export interface DeleteContractParams {
  readonly contractId: EntityId;
  readonly transferAccountId?: EntityId;
  readonly transferContractId?: EntityId;
  readonly permanentRemoval?: boolean;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
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
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface ScheduleTransactionParams {
  readonly transaction: {
    readonly type: TransactionType;
    readonly params: Record<string, unknown>;
  };
  readonly adminKey?: string | true;
  readonly payerAccountId?: EntityId;
  readonly expirationTime?: Date;
  readonly waitForExpiry?: boolean;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface SignScheduleParams {
  readonly scheduleId: EntityId;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface DeleteScheduleParams {
  readonly scheduleId: EntityId;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface CreateFileParams {
  readonly contents: Uint8Array | string;
  readonly keys?: ReadonlyArray<string>;
  readonly expirationTime?: Date;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface AppendFileParams {
  readonly fileId: EntityId;
  readonly contents: Uint8Array | string;
  readonly maxChunks?: number;
  readonly chunkSize?: number;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface UpdateFileParams {
  readonly fileId: EntityId;
  readonly contents?: Uint8Array | string;
  readonly keys?: ReadonlyArray<string>;
  readonly expirationTime?: Date;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface DeleteFileParams {
  readonly fileId: EntityId;
  readonly memo?: string;
  readonly maxFee?: number | string;
  readonly retry?: RetryConfig | false;
}

export interface WatchTopicMessagesParams {
  readonly topicId: EntityId;
  readonly startTime?: Date;
  readonly endTime?: Date;
  readonly limit?: number;
  readonly handler: (message: TopicMessageData) => void;
  readonly onError?: (error: Error) => void;
}

export interface TopicMessageData {
  readonly consensusTimestamp: string;
  readonly contents: Uint8Array;
  readonly runningHash: Uint8Array;
  readonly sequenceNumber: number;
  readonly topicId: string;
}

export type Unsubscribe = () => void;

export interface TransactionReceiptData {
  readonly status: string;
  readonly transactionId: string;
  readonly accountId?: EntityId;
  readonly fileId?: EntityId;
  readonly contractId?: EntityId;
  readonly topicId?: EntityId;
  readonly tokenId?: EntityId;
  readonly scheduleId?: EntityId;
  readonly totalSupply?: string;
  readonly serialNumbers?: ReadonlyArray<number>;
  readonly topicSequenceNumber?: string;
}

export interface TransferResult {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
}

export interface CreateAccountResult {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly accountId: EntityId;
}

export interface UpdateAccountResult {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
}

export interface DeleteAccountResult {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
}

export interface TokenReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly tokenId: EntityId;
}

export interface MintReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly totalSupply: string;
  readonly serialNumbers?: ReadonlyArray<number>;
}

export interface TopicReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly topicId: EntityId;
}

export interface MessageReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly topicSequenceNumber: string;
}

export interface ContractReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly contractId: EntityId;
}

export interface ContractExecuteReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
}

export interface ContractCallResult {
  readonly contractId: EntityId;
  readonly gasUsed: number;
  readonly result: Uint8Array;
  readonly errorMessage: string;
}

export interface ScheduleReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly scheduleId: EntityId;
}

export interface FileReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly fileId: EntityId;
}

export type TransactionEvent =
  | "transaction:before"
  | "transaction:signed"
  | "transaction:submitted"
  | "transaction:confirmed"
  | "transaction:error"
  | "transaction:retry";

export interface TransactionEventPayloads {
  readonly "transaction:before": TransactionBeforePayload;
  readonly "transaction:signed": TransactionSignedPayload;
  readonly "transaction:submitted": TransactionSubmittedPayload;
  readonly "transaction:confirmed": TransactionConfirmedPayload;
  readonly "transaction:error": TransactionErrorPayload;
  readonly "transaction:retry": TransactionRetryPayload;
}

export interface TransactionBeforePayload {
  readonly type: TransactionType;
  readonly params: Record<string, unknown>;
}

export interface TransactionSignedPayload {
  readonly type: TransactionType;
  readonly transactionId: string;
}

export interface TransactionSubmittedPayload {
  readonly type: TransactionType;
  readonly transactionId: string;
  readonly nodeId: string;
}

export interface TransactionConfirmedPayload {
  readonly type: TransactionType;
  readonly transactionId: string;
  readonly receipt: TransactionReceiptData;
  readonly durationMs: number;
}

export interface TransactionErrorPayload {
  readonly type: TransactionType;
  readonly error: SdkError;
}

export interface TransactionRetryPayload {
  readonly type: TransactionType;
  readonly attempt: number;
  readonly reason: string;
  readonly delayMs: number;
}

export interface TransactionContext {
  readonly type: TransactionType;
  readonly params: Record<string, unknown>;
  readonly client: HieroClientRef;
  readonly attempt: number;
  readonly transactionId: string | undefined;
  readonly startedAt: number;
  readonly retry?: RetryConfig | false;
}

export interface HieroClientRef {
  readonly network: NetworkType;
  readonly operatorAccountId: EntityId | undefined;
}

export type TransactionMiddleware = (
  context: TransactionContext,
  next: () => Promise<SdkResult<TransactionReceiptData>>,
) => Promise<SdkResult<TransactionReceiptData>>;

export interface RetryConfig {
  readonly maxRetries?: number;
  readonly initialDelayMs?: number;
  readonly maxDelayMs?: number;
  readonly backoffMultiplier?: number;
  readonly jitter?: boolean;
  readonly retryableStatuses?: ReadonlyArray<string>;
}

export interface HieroClientConfig {
  readonly network?: NetworkType;
  readonly operatorId?: EntityId;
  readonly operatorKey?: string;
  readonly signer?: HieroSigner;
  readonly mirrorUrl?: string;
  readonly maxTransactionFee?: number | string;
  readonly logLevel?: LogLevel;
  readonly middleware?: ReadonlyArray<TransactionMiddleware>;
  readonly retry?: RetryConfig | false;
}

export type SigningContext =
  | { readonly _tag: "operator"; readonly operatorKey: string }
  | { readonly _tag: "signer"; readonly signer: HieroSigner };

export function requireSigningContext(input: {
  readonly operatorKey: string | undefined;
  readonly signer: HieroSigner | undefined;
}): SdkResult<SigningContext> {
  if (input.signer) {
    return { success: true, data: { _tag: "signer", signer: input.signer } };
  }

  if (input.operatorKey) {
    return { success: true, data: { _tag: "operator", operatorKey: input.operatorKey } };
  }

  return {
    success: false,
    error: configurationError("signer", "A signer or operatorKey is required to sign transactions"),
  };
}

export const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelayMs: 500,
  maxDelayMs: 10_000,
  backoffMultiplier: 2,
  jitter: true,
  retryableStatuses: ["BUSY", "PLATFORM_TRANSACTION_NOT_CREATED", "PLATFORM_NOT_ACTIVE"],
};

export interface TransactionParamsMap {
  readonly transfer: TransferParams;
  readonly createAccount: CreateAccountParams;
  readonly updateAccount: UpdateAccountParams;
  readonly deleteAccount: DeleteAccountParams;
  readonly approveAllowance: ApproveAllowanceParams;
  readonly createToken: CreateTokenParams;
  readonly mintToken: MintTokenParams;
  readonly burnToken: BurnTokenParams;
  readonly transferToken: TransferTokenParams;
  readonly transferNft: TransferNftParams;
  readonly associateToken: AssociateTokenParams;
  readonly dissociateToken: DissociateTokenParams;
  readonly freezeToken: FreezeTokenParams;
  readonly unfreezeToken: UnfreezeTokenParams;
  readonly grantKyc: GrantKycParams;
  readonly revokeKyc: RevokeKycParams;
  readonly pauseToken: PauseTokenParams;
  readonly unpauseToken: UnpauseTokenParams;
  readonly wipeToken: WipeTokenParams;
  readonly deleteToken: DeleteTokenParams;
  readonly updateToken: UpdateTokenParams;
  readonly updateTokenFeeSchedule: UpdateTokenFeeScheduleParams;
  readonly createTopic: CreateTopicParams;
  readonly updateTopic: UpdateTopicParams;
  readonly deleteTopic: DeleteTopicParams;
  readonly submitMessage: SubmitMessageParams;
  readonly deployContract: DeployContractParams;
  readonly executeContract: ExecuteContractParams;
  readonly deleteContract: DeleteContractParams;
  readonly updateContract: UpdateContractParams;
  readonly scheduleTransaction: ScheduleTransactionParams;
  readonly signSchedule: SignScheduleParams;
  readonly deleteSchedule: DeleteScheduleParams;
  readonly createFile: CreateFileParams;
  readonly appendFile: AppendFileParams;
  readonly updateFile: UpdateFileParams;
  readonly deleteFile: DeleteFileParams;
}

export type AnyTransactionParams = TransactionParamsMap[TransactionType];

export interface ActionDeps {
  readonly nativeClient: Client;
  readonly operatorKey: string | undefined;
  readonly signer: HieroSigner | undefined;
  readonly middleware: ReadonlyArray<TransactionMiddleware>;
  readonly emitter: TransactionEventEmitter;
  readonly clientRef: HieroClientRef;
}

export function requireOperatorKey(operatorKey: string | undefined): SdkResult<string> {
  if (!operatorKey) {
    return {
      success: false,
      error: configurationError(
        "operatorKey",
        "Operator private key is required to sign transactions",
      ),
    };
  }
  return { success: true, data: operatorKey };
}
