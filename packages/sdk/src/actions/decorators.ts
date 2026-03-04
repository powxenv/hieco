import type { HieroClient } from "../client.ts";
import type {
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
  TokenReceipt,
  MintReceipt,
  TransactionReceiptData,
  SdkResult,
  CreateTopicParams,
  UpdateTopicParams,
  DeleteTopicParams,
  SubmitMessageParams,
  TopicReceipt,
  MessageReceipt,
  DeployContractParams,
  ExecuteContractParams,
  CallContractParams,
  DeleteContractParams,
  UpdateContractParams,
  ContractReceipt,
  ContractExecuteReceipt,
  ContractCallResult,
  ScheduleTransactionParams,
  SignScheduleParams,
  DeleteScheduleParams,
  ScheduleReceipt,
  CreateFileParams,
  AppendFileParams,
  UpdateFileParams,
  DeleteFileParams,
  FileReceipt,
} from "../types.ts";

export interface TokenActions {
  createToken(params: CreateTokenParams): Promise<SdkResult<TokenReceipt>>;
  mintToken(params: MintTokenParams): Promise<SdkResult<MintReceipt>>;
  burnToken(params: BurnTokenParams): Promise<SdkResult<TransactionReceiptData>>;
  transferToken(params: TransferTokenParams): Promise<SdkResult<TransactionReceiptData>>;
  transferNft(params: TransferNftParams): Promise<SdkResult<TransactionReceiptData>>;
  associateToken(params: AssociateTokenParams): Promise<SdkResult<TransactionReceiptData>>;
  dissociateToken(params: DissociateTokenParams): Promise<SdkResult<TransactionReceiptData>>;
  freezeToken(params: FreezeTokenParams): Promise<SdkResult<TransactionReceiptData>>;
  unfreezeToken(params: UnfreezeTokenParams): Promise<SdkResult<TransactionReceiptData>>;
  grantKyc(params: GrantKycParams): Promise<SdkResult<TransactionReceiptData>>;
  revokeKyc(params: RevokeKycParams): Promise<SdkResult<TransactionReceiptData>>;
  pauseToken(params: PauseTokenParams): Promise<SdkResult<TransactionReceiptData>>;
  unpauseToken(params: UnpauseTokenParams): Promise<SdkResult<TransactionReceiptData>>;
  wipeToken(params: WipeTokenParams): Promise<SdkResult<TransactionReceiptData>>;
  deleteToken(params: DeleteTokenParams): Promise<SdkResult<TransactionReceiptData>>;
  updateToken(params: UpdateTokenParams): Promise<SdkResult<TransactionReceiptData>>;
  updateTokenFeeSchedule(
    params: UpdateTokenFeeScheduleParams,
  ): Promise<SdkResult<TransactionReceiptData>>;
}

export interface HcsActions {
  createTopic(params: CreateTopicParams): Promise<SdkResult<TopicReceipt>>;
  updateTopic(params: UpdateTopicParams): Promise<SdkResult<TransactionReceiptData>>;
  deleteTopic(params: DeleteTopicParams): Promise<SdkResult<TransactionReceiptData>>;
  submitMessage(params: SubmitMessageParams): Promise<SdkResult<MessageReceipt>>;
}

export function tokenActions(client: HieroClient): TokenActions {
  return {
    createToken: (params) => client.createToken(params),
    mintToken: (params) => client.mintToken(params),
    burnToken: (params) => client.burnToken(params),
    transferToken: (params) => client.transferToken(params),
    transferNft: (params) => client.transferNft(params),
    associateToken: (params) => client.associateToken(params),
    dissociateToken: (params) => client.dissociateToken(params),
    freezeToken: (params) => client.freezeToken(params),
    unfreezeToken: (params) => client.unfreezeToken(params),
    grantKyc: (params) => client.grantKyc(params),
    revokeKyc: (params) => client.revokeKyc(params),
    pauseToken: (params) => client.pauseToken(params),
    unpauseToken: (params) => client.unpauseToken(params),
    wipeToken: (params) => client.wipeToken(params),
    deleteToken: (params) => client.deleteToken(params),
    updateToken: (params) => client.updateToken(params),
    updateTokenFeeSchedule: (params) => client.updateTokenFeeSchedule(params),
  };
}

export function hcsActions(client: HieroClient): HcsActions {
  return {
    createTopic: (params) => client.createTopic(params),
    updateTopic: (params) => client.updateTopic(params),
    deleteTopic: (params) => client.deleteTopic(params),
    submitMessage: (params) => client.submitMessage(params),
  };
}

export interface ContractActions {
  deployContract(params: DeployContractParams): Promise<SdkResult<ContractReceipt>>;
  executeContract(params: ExecuteContractParams): Promise<SdkResult<ContractExecuteReceipt>>;
  callContract(params: CallContractParams): Promise<SdkResult<ContractCallResult>>;
  deleteContract(params: DeleteContractParams): Promise<SdkResult<TransactionReceiptData>>;
  updateContract(params: UpdateContractParams): Promise<SdkResult<TransactionReceiptData>>;
}

export interface ScheduleActions {
  scheduleTransaction(params: ScheduleTransactionParams): Promise<SdkResult<ScheduleReceipt>>;
  signSchedule(params: SignScheduleParams): Promise<SdkResult<TransactionReceiptData>>;
  deleteSchedule(params: DeleteScheduleParams): Promise<SdkResult<TransactionReceiptData>>;
}

export interface FileActions {
  createFile(params: CreateFileParams): Promise<SdkResult<FileReceipt>>;
  appendFile(params: AppendFileParams): Promise<SdkResult<TransactionReceiptData>>;
  updateFile(params: UpdateFileParams): Promise<SdkResult<TransactionReceiptData>>;
  deleteFile(params: DeleteFileParams): Promise<SdkResult<TransactionReceiptData>>;
}

export function contractActions(client: HieroClient): ContractActions {
  return {
    deployContract: (params) => client.deployContract(params),
    executeContract: (params) => client.executeContract(params),
    callContract: (params) => client.callContract(params),
    deleteContract: (params) => client.deleteContract(params),
    updateContract: (params) => client.updateContract(params),
  };
}

export function scheduleActions(client: HieroClient): ScheduleActions {
  return {
    scheduleTransaction: (params) => client.scheduleTransaction(params),
    signSchedule: (params) => client.signSchedule(params),
    deleteSchedule: (params) => client.deleteSchedule(params),
  };
}

export function fileActions(client: HieroClient): FileActions {
  return {
    createFile: (params) => client.createFile(params),
    appendFile: (params) => client.appendFile(params),
    updateFile: (params) => client.updateFile(params),
    deleteFile: (params) => client.deleteFile(params),
  };
}
