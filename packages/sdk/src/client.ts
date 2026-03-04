import { Client, Hbar } from "@hiero-ledger/sdk";
import type { EntityId, NetworkType } from "@hieco/types";
import type {
  HieroClientConfig,
  TransferParams,
  CreateAccountParams,
  UpdateAccountParams,
  DeleteAccountParams,
  ApproveAllowanceParams,
  CreateTokenParams,
  MintTokenParams,
  BurnTokenParams,
  TransferTokenParams,
  TransferNftParams,
  AssociateTokenParams,
  DissociateTokenParams,
  FreezeTokenParams,
  UnfreezeTokenParams,
  GrantKycParams,
  RevokeKycParams,
  PauseTokenParams,
  UnpauseTokenParams,
  WipeTokenParams,
  DeleteTokenParams,
  UpdateTokenParams,
  UpdateTokenFeeScheduleParams,
  CreateTopicParams,
  UpdateTopicParams,
  DeleteTopicParams,
  SubmitMessageParams,
  DeployContractParams,
  ExecuteContractParams,
  CallContractParams,
  DeleteContractParams,
  UpdateContractParams,
  ScheduleTransactionParams,
  SignScheduleParams,
  DeleteScheduleParams,
  CreateFileParams,
  AppendFileParams,
  UpdateFileParams,
  DeleteFileParams,
  WatchTopicMessagesParams,
  TransferResult,
  CreateAccountResult,
  UpdateAccountResult,
  DeleteAccountResult,
  TokenReceipt,
  MintReceipt,
  TopicReceipt,
  MessageReceipt,
  ContractReceipt,
  ContractExecuteReceipt,
  ContractCallResult,
  ScheduleReceipt,
  FileReceipt,
  TransactionReceiptData,
  SdkResult,
  Unsubscribe,
  TransactionMiddleware,
  TransactionEvent,
  TransactionEventPayloads,
  LogLevel,
  HieroClientRef,
  ActionDeps,
} from "./types.ts";
import { resolveConfig, validateOperatorForBrowser } from "./config.ts";
import type { ResolvedConfig } from "./config.ts";
import { TransactionEventEmitter } from "./events/emitter.ts";
import { createRetryMiddleware } from "./middleware/retry.ts";
import { createLoggingMiddleware } from "./middleware/logging.ts";
import {
  transfer,
  createAccount,
  updateAccount,
  deleteAccount,
  approveAllowance,
} from "./actions/crypto.ts";
import {
  createToken,
  mintToken,
  burnToken,
  transferToken,
  transferNft,
  associateToken,
  dissociateToken,
  freezeToken,
  unfreezeToken,
  grantKyc,
  revokeKyc,
  pauseToken,
  unpauseToken,
  wipeToken,
  deleteToken,
  updateToken,
  updateTokenFeeSchedule,
} from "./actions/token.ts";
import { createTopic, updateTopic, deleteTopic, submitMessage } from "./actions/consensus.ts";
import {
  deployContract,
  executeContract,
  callContract,
  deleteContract,
  updateContract,
} from "./actions/contract.ts";
import { scheduleTransaction, signSchedule, deleteSchedule } from "./actions/schedule.ts";
import { createFile, appendFile, updateFile, deleteFile } from "./actions/file.ts";
import { ContractBuilder } from "./builders/contract-builder.ts";
import { watchTopicMessages as watchTopicMessagesSubscription } from "./subscriptions/watch-topic-messages.ts";

export class HieroClient {
  private readonly nativeClient: Client;
  private readonly config: ResolvedConfig;
  private readonly emitter: TransactionEventEmitter;
  private readonly resolvedMiddleware: ReadonlyArray<TransactionMiddleware>;

  constructor(config: HieroClientConfig = {}) {
    this.config = resolveConfig(config);

    const validationError = validateOperatorForBrowser(this.config);
    if (validationError) {
      throw new Error(validationError.message);
    }

    this.nativeClient = this.createNativeClient();
    this.emitter = new TransactionEventEmitter();
    this.resolvedMiddleware = this.buildMiddlewareStack();
  }

  get network(): NetworkType {
    return this.config.network;
  }

  get operatorAccountId(): EntityId | undefined {
    return this.config.operatorId;
  }

  get logLevel(): LogLevel {
    return this.config.logLevel;
  }

  on<E extends TransactionEvent>(
    event: E,
    listener: (payload: TransactionEventPayloads[E]) => void,
  ): () => void {
    return this.emitter.on(event, listener);
  }

  off<E extends TransactionEvent>(
    event: E,
    listener: (payload: TransactionEventPayloads[E]) => void,
  ): void {
    this.emitter.off(event, listener);
  }

  async transfer(params: TransferParams): Promise<SdkResult<TransferResult>> {
    return transfer(this.actionDeps(), params);
  }

  async createAccount(params: CreateAccountParams): Promise<SdkResult<CreateAccountResult>> {
    return createAccount(this.actionDeps(), params);
  }

  async updateAccount(params: UpdateAccountParams): Promise<SdkResult<UpdateAccountResult>> {
    return updateAccount(this.actionDeps(), params);
  }

  async deleteAccount(params: DeleteAccountParams): Promise<SdkResult<DeleteAccountResult>> {
    return deleteAccount(this.actionDeps(), params);
  }

  async approveAllowance(
    params: ApproveAllowanceParams,
  ): Promise<SdkResult<TransactionReceiptData>> {
    return approveAllowance(this.actionDeps(), params);
  }

  async createToken(params: CreateTokenParams): Promise<SdkResult<TokenReceipt>> {
    return createToken(this.actionDeps(), params);
  }

  async mintToken(params: MintTokenParams): Promise<SdkResult<MintReceipt>> {
    return mintToken(this.actionDeps(), params);
  }

  async burnToken(params: BurnTokenParams): Promise<SdkResult<TransactionReceiptData>> {
    return burnToken(this.actionDeps(), params);
  }

  async transferToken(params: TransferTokenParams): Promise<SdkResult<TransactionReceiptData>> {
    return transferToken(this.actionDeps(), params);
  }

  async transferNft(params: TransferNftParams): Promise<SdkResult<TransactionReceiptData>> {
    return transferNft(this.actionDeps(), params);
  }

  async associateToken(params: AssociateTokenParams): Promise<SdkResult<TransactionReceiptData>> {
    return associateToken(this.actionDeps(), params);
  }

  async dissociateToken(params: DissociateTokenParams): Promise<SdkResult<TransactionReceiptData>> {
    return dissociateToken(this.actionDeps(), params);
  }

  async freezeToken(params: FreezeTokenParams): Promise<SdkResult<TransactionReceiptData>> {
    return freezeToken(this.actionDeps(), params);
  }

  async unfreezeToken(params: UnfreezeTokenParams): Promise<SdkResult<TransactionReceiptData>> {
    return unfreezeToken(this.actionDeps(), params);
  }

  async grantKyc(params: GrantKycParams): Promise<SdkResult<TransactionReceiptData>> {
    return grantKyc(this.actionDeps(), params);
  }

  async revokeKyc(params: RevokeKycParams): Promise<SdkResult<TransactionReceiptData>> {
    return revokeKyc(this.actionDeps(), params);
  }

  async pauseToken(params: PauseTokenParams): Promise<SdkResult<TransactionReceiptData>> {
    return pauseToken(this.actionDeps(), params);
  }

  async unpauseToken(params: UnpauseTokenParams): Promise<SdkResult<TransactionReceiptData>> {
    return unpauseToken(this.actionDeps(), params);
  }

  async wipeToken(params: WipeTokenParams): Promise<SdkResult<TransactionReceiptData>> {
    return wipeToken(this.actionDeps(), params);
  }

  async deleteToken(params: DeleteTokenParams): Promise<SdkResult<TransactionReceiptData>> {
    return deleteToken(this.actionDeps(), params);
  }

  async updateToken(params: UpdateTokenParams): Promise<SdkResult<TransactionReceiptData>> {
    return updateToken(this.actionDeps(), params);
  }

  async updateTokenFeeSchedule(
    params: UpdateTokenFeeScheduleParams,
  ): Promise<SdkResult<TransactionReceiptData>> {
    return updateTokenFeeSchedule(this.actionDeps(), params);
  }

  async createTopic(params: CreateTopicParams): Promise<SdkResult<TopicReceipt>> {
    return createTopic(this.actionDeps(), params);
  }

  async updateTopic(params: UpdateTopicParams): Promise<SdkResult<TransactionReceiptData>> {
    return updateTopic(this.actionDeps(), params);
  }

  async deleteTopic(params: DeleteTopicParams): Promise<SdkResult<TransactionReceiptData>> {
    return deleteTopic(this.actionDeps(), params);
  }

  async submitMessage(params: SubmitMessageParams): Promise<SdkResult<MessageReceipt>> {
    return submitMessage(this.actionDeps(), params);
  }

  async deployContract(params: DeployContractParams): Promise<SdkResult<ContractReceipt>> {
    return deployContract(this.actionDeps(), params);
  }

  async executeContract(params: ExecuteContractParams): Promise<SdkResult<ContractExecuteReceipt>> {
    return executeContract(this.actionDeps(), params);
  }

  async callContract(params: CallContractParams): Promise<SdkResult<ContractCallResult>> {
    return callContract(this.actionDeps(), params);
  }

  async deleteContract(params: DeleteContractParams): Promise<SdkResult<TransactionReceiptData>> {
    return deleteContract(this.actionDeps(), params);
  }

  async updateContract(params: UpdateContractParams): Promise<SdkResult<TransactionReceiptData>> {
    return updateContract(this.actionDeps(), params);
  }

  async scheduleTransaction(
    params: ScheduleTransactionParams,
  ): Promise<SdkResult<ScheduleReceipt>> {
    return scheduleTransaction(this.actionDeps(), params);
  }

  async signSchedule(params: SignScheduleParams): Promise<SdkResult<TransactionReceiptData>> {
    return signSchedule(this.actionDeps(), params);
  }

  async deleteSchedule(params: DeleteScheduleParams): Promise<SdkResult<TransactionReceiptData>> {
    return deleteSchedule(this.actionDeps(), params);
  }

  async createFile(params: CreateFileParams): Promise<SdkResult<FileReceipt>> {
    return createFile(this.actionDeps(), params);
  }

  async appendFile(params: AppendFileParams): Promise<SdkResult<TransactionReceiptData>> {
    return appendFile(this.actionDeps(), params);
  }

  async updateFile(params: UpdateFileParams): Promise<SdkResult<TransactionReceiptData>> {
    return updateFile(this.actionDeps(), params);
  }

  async deleteFile(params: DeleteFileParams): Promise<SdkResult<TransactionReceiptData>> {
    return deleteFile(this.actionDeps(), params);
  }

  watchTopicMessages(params: WatchTopicMessagesParams): Unsubscribe {
    return watchTopicMessagesSubscription(this.nativeClient, params);
  }

  contracts(): ContractBuilder {
    return new ContractBuilder();
  }

  extend<T>(decorator: (client: HieroClient) => T): HieroClient & T {
    const extensions = decorator(this);
    return Object.assign(this, extensions) as HieroClient & T;
  }

  destroy(): void {
    this.nativeClient.close();
    this.emitter.removeAllListeners();
  }

  private createNativeClient(): Client {
    const client = Client.forName(this.config.network);

    if (this.config.operatorId && this.config.operatorKey) {
      client.setOperator(this.config.operatorId, this.config.operatorKey);
    }

    client.setDefaultMaxTransactionFee(new Hbar(this.config.maxTransactionFee));

    return client;
  }

  private buildMiddlewareStack(): ReadonlyArray<TransactionMiddleware> {
    const stack: Array<TransactionMiddleware> = [];

    if (this.config.retry !== false) {
      stack.push(createRetryMiddleware(this.config.retry));
    }

    if (this.config.logLevel !== "none") {
      stack.push(createLoggingMiddleware(this.config.logLevel));
    }

    stack.push(...this.config.middleware);

    return stack;
  }

  private clientRef(): HieroClientRef {
    return {
      network: this.config.network,
      operatorAccountId: this.config.operatorId,
    };
  }

  private actionDeps(): ActionDeps {
    return {
      nativeClient: this.nativeClient,
      operatorKey: this.config.operatorKey,
      middleware: this.resolvedMiddleware,
      emitter: this.emitter,
      clientRef: this.clientRef(),
    };
  }
}
