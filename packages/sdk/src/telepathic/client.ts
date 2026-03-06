import type { Signer as HieroSigner } from "@hiero-ledger/sdk";
import type { EntityId } from "@hieco/utils";
import { HieroClient as LegacyClient } from "../core/client.ts";
import type { TopicWatchHandle } from "../domains/hcs/namespace.ts";
import type * as Params from "../foundation/params.ts";
import type * as Shapes from "../foundation/results-shapes.ts";
import type { Result } from "../foundation/results.ts";
import { fluentAction } from "./fluent.ts";
import { capabilityAudit } from "./capability.ts";

type MaybeArray<T> = T | ReadonlyArray<T>;

type BuilderResult<T, P extends object = Record<string, unknown>> = {
  readonly with: (params: Partial<P>) => BuilderResult<T, P>;
  readonly memo: (value: string) => BuilderResult<T, P>;
  readonly fee: (value: Params.Amount) => BuilderResult<T, P>;
  readonly from: (value: EntityId) => BuilderResult<T, P>;
  readonly to: (value: EntityId) => BuilderResult<T, P>;
  readonly hbar: (value: Params.Amount) => BuilderResult<T, P>;
  readonly amount: (value: Params.Amount) => BuilderResult<T, P>;
  readonly key: (value: string | true) => BuilderResult<T, P>;
  readonly publicKey: (value: string) => BuilderResult<T, P>;
  readonly id: (value: EntityId) => BuilderResult<T, P>;
  readonly token: (value: EntityId) => BuilderResult<T, P>;
  readonly account: (value: EntityId) => BuilderResult<T, P>;
  readonly topic: (value: EntityId) => BuilderResult<T, P>;
  readonly contract: (value: EntityId) => BuilderResult<T, P>;
  readonly file: (value: EntityId) => BuilderResult<T, P>;
  readonly schedule: (value: EntityId) => BuilderResult<T, P>;
  readonly serial: (value: number) => BuilderResult<T, P>;
  readonly serials: (values: ReadonlyArray<number>) => BuilderResult<T, P>;
  readonly tokenIds: (values: ReadonlyArray<EntityId>) => BuilderResult<T, P>;
  readonly owner: (value: EntityId) => BuilderResult<T, P>;
  readonly spender: (value: EntityId) => BuilderResult<T, P>;
  readonly payer: (value: EntityId) => BuilderResult<T, P>;
  readonly treasury: (value: EntityId) => BuilderResult<T, P>;
  readonly name: (value: string) => BuilderResult<T, P>;
  readonly symbol: (value: string) => BuilderResult<T, P>;
  readonly decimals: (value: number) => BuilderResult<T, P>;
  readonly supply: (value: Params.Amount) => BuilderResult<T, P>;
  readonly gas: (value: number) => BuilderResult<T, P>;
  readonly fn: (value: string) => BuilderResult<T, P>;
  readonly args: (values: ReadonlyArray<unknown>) => BuilderResult<T, P>;
  readonly typed: (values: Params.FunctionParamsConfig) => BuilderResult<T, P>;
  readonly payable: (value: Params.Amount) => BuilderResult<T, P>;
  readonly message: (value: string | Record<string, unknown> | Uint8Array) => BuilderResult<T, P>;
  readonly contents: (value: Uint8Array | string) => BuilderResult<T, P>;
  readonly keys: (values: ReadonlyArray<string>) => BuilderResult<T, P>;
  readonly value: (amount: Params.Amount) => BuilderResult<T, P>;
  readonly set: <K extends keyof P>(key: K, value: P[K]) => BuilderResult<T, P>;
  readonly push: <K extends keyof P>(
    key: K,
    value: P[K] extends MaybeArray<infer U> ? U : never,
  ) => BuilderResult<T, P>;
  readonly reset: () => BuilderResult<T, P>;
  readonly now: () => Promise<Result<T>>;
  readonly tx: () => Result<Params.TransactionDescriptor>;
  readonly queue: (params?: {
    readonly adminKey?: string | true;
    readonly payerAccountId?: EntityId;
    readonly expirationTime?: Date;
    readonly waitForExpiry?: boolean;
    readonly memo?: string;
    readonly maxFee?: Params.Amount;
  }) => Promise<Result<Shapes.ScheduleReceipt>>;
};

type QueryResult<T> = { readonly now: () => Promise<Result<T>> };

export interface TelepathicClient {
  readonly audit: typeof capabilityAudit;
  readonly tx: {
    readonly submit: (
      descriptor: Params.TransactionDescriptor,
    ) => Promise<Result<Shapes.TransactionReceiptData>>;
    readonly record: (
      transactionId: string | { readonly transactionId: string },
    ) => Promise<Result<Shapes.TransactionRecordData>>;
    readonly receipt: (
      transactionId: string | { readonly transactionId: string },
      options?: {
        readonly includeChildren?: boolean;
        readonly includeDuplicates?: boolean;
        readonly validateStatus?: boolean;
      },
    ) => Promise<Result<Shapes.TransactionReceiptQueryData>>;
  };
  readonly account: {
    readonly send: (
      params?: Partial<Params.TransferParams>,
    ) => BuilderResult<Shapes.TransferResult, Params.TransferParams>;
    readonly transfer: (
      params?: Partial<Params.TransferParams>,
    ) => BuilderResult<Shapes.TransferResult, Params.TransferParams>;
    readonly create: (
      params?: Partial<Params.CreateAccountParams>,
    ) => BuilderResult<Shapes.CreateAccountResult, Params.CreateAccountParams>;
    readonly update: (
      params?: Partial<Params.UpdateAccountParams>,
    ) => BuilderResult<Shapes.UpdateAccountResult, Params.UpdateAccountParams>;
    readonly delete: (
      params?: Partial<Params.DeleteAccountParams>,
    ) => BuilderResult<Shapes.DeleteAccountResult, Params.DeleteAccountParams>;
    readonly allow: (
      params?: Partial<Params.ApproveAllowanceParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.ApproveAllowanceParams>;
    readonly allowances: (
      params?: Partial<Params.ApproveAllowanceParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.ApproveAllowanceParams>;
    readonly revokeNftAllowances: (
      params?: Partial<Params.DeleteNftAllowancesParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.DeleteNftAllowancesParams>;
    readonly allowancesDeleteNft: (
      params?: Partial<Params.DeleteNftAllowancesParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.DeleteNftAllowancesParams>;
    readonly allowanceSnapshot: (accountId: EntityId) => QueryResult<{
      readonly hbar: ReadonlyArray<import("@hieco/mirror").CryptoAllowance>;
      readonly tokens: ReadonlyArray<import("@hieco/mirror").TokenAllowance>;
      readonly nfts: ReadonlyArray<import("@hieco/mirror").NftAllowance>;
    }>;
    readonly ensureAllowances: (params: {
      readonly hbar?: ReadonlyArray<Params.HbarAllowanceParams>;
      readonly tokens?: ReadonlyArray<Params.TokenAllowanceParams>;
      readonly nfts?: ReadonlyArray<Params.NftAllowanceParams>;
      readonly memo?: string;
      readonly maxFee?: Params.Amount;
    }) => QueryResult<
      | { readonly status: "skipped"; readonly reason: "already-approved" }
      | { readonly status: "submitted"; readonly receipt: Shapes.TransactionReceiptData }
    >;
    readonly balance: (accountId?: EntityId) => QueryResult<{
      readonly hbar: string;
      readonly tokens: ReadonlyArray<{
        readonly tokenId: string;
        readonly balance: string;
        readonly decimals: number;
      }>;
    }>;
    readonly info: (accountId: EntityId) => QueryResult<Shapes.AccountInfoData>;
    readonly records: (accountId?: EntityId) => QueryResult<Shapes.AccountRecordsData>;
  };
  readonly token: {
    readonly create: (
      params?: Partial<Params.CreateTokenParams>,
    ) => BuilderResult<Shapes.TokenReceipt, Params.CreateTokenParams>;
    readonly mint: (
      params?: Partial<Params.MintTokenParams>,
    ) => BuilderResult<Shapes.MintReceipt, Params.MintTokenParams>;
    readonly burn: (
      params?: Partial<Params.BurnTokenParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.BurnTokenParams>;
    readonly send: (
      params?: Partial<Params.TransferTokenParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.TransferTokenParams>;
    readonly transfer: (
      params?: Partial<Params.TransferTokenParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.TransferTokenParams>;
    readonly sendNft: (
      params?: Partial<Params.TransferNftParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.TransferNftParams>;
    readonly transferNft: (
      params?: Partial<Params.TransferNftParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.TransferNftParams>;
    readonly associate: (
      params?: Partial<Params.AssociateTokenParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.AssociateTokenParams>;
    readonly dissociate: (
      params?: Partial<Params.DissociateTokenParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.DissociateTokenParams>;
    readonly freeze: (
      params?: Partial<Params.FreezeTokenParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.FreezeTokenParams>;
    readonly unfreeze: (
      params?: Partial<Params.UnfreezeTokenParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.UnfreezeTokenParams>;
    readonly grantKyc: (
      params?: Partial<Params.GrantKycParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.GrantKycParams>;
    readonly revokeKyc: (
      params?: Partial<Params.RevokeKycParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.RevokeKycParams>;
    readonly pause: (
      params?: Partial<Params.PauseTokenParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.PauseTokenParams>;
    readonly unpause: (
      params?: Partial<Params.UnpauseTokenParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.UnpauseTokenParams>;
    readonly wipe: (
      params?: Partial<Params.WipeTokenParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.WipeTokenParams>;
    readonly delete: (
      params?: Partial<Params.DeleteTokenParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.DeleteTokenParams>;
    readonly update: (
      params?: Partial<Params.UpdateTokenParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.UpdateTokenParams>;
    readonly fees: (
      params?: Partial<Params.UpdateTokenFeeScheduleParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.UpdateTokenFeeScheduleParams>;
    readonly airdrop: (
      params?: Partial<Params.TokenAirdropParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.TokenAirdropParams>;
    readonly claimAirdrop: (
      params?: Partial<Params.TokenClaimAirdropParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.TokenClaimAirdropParams>;
    readonly cancelAirdrop: (
      params?: Partial<Params.TokenCancelAirdropParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.TokenCancelAirdropParams>;
    readonly reject: (
      params?: Partial<Params.TokenRejectParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.TokenRejectParams>;
    readonly updateNfts: (
      params?: Partial<Params.TokenUpdateNftsParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.TokenUpdateNftsParams>;
    readonly info: (tokenId: EntityId) => QueryResult<Shapes.TokenInfoData>;
    readonly nft: (
      nft: string | { readonly tokenId: EntityId; readonly serial: number },
    ) => QueryResult<Shapes.TokenNftInfoData>;
    readonly allowances: (
      accountId: EntityId,
      params?: Params.TokenAllowancesQueryParams,
    ) => QueryResult<{
      readonly allowances: ReadonlyArray<import("@hieco/mirror").TokenAllowance>;
    }>;
  };
  readonly topic: {
    readonly create: (
      params?: Partial<Params.CreateTopicParams>,
    ) => BuilderResult<Shapes.TopicReceipt, Params.CreateTopicParams>;
    readonly update: (
      params?: Partial<Params.UpdateTopicParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.UpdateTopicParams>;
    readonly delete: (
      params?: Partial<Params.DeleteTopicParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.DeleteTopicParams>;
    readonly send: (
      params?: Partial<Params.SubmitMessageParams>,
    ) => BuilderResult<Shapes.MessageReceipt, Params.SubmitMessageParams>;
    readonly submit: (
      params?: Partial<Params.SubmitMessageParams>,
    ) => BuilderResult<Shapes.MessageReceipt, Params.SubmitMessageParams>;
    readonly sendJson: (
      params?: Partial<Params.SubmitJsonMessageParams>,
    ) => QueryResult<Shapes.MessageReceipt>;
    readonly submitJson: (
      params?: Partial<Params.SubmitJsonMessageParams>,
    ) => QueryResult<Shapes.MessageReceipt>;
    readonly sendMany: (
      params?: Partial<Params.BatchSubmitMessagesParams>,
    ) => QueryResult<ReadonlyArray<Shapes.MessageReceipt>>;
    readonly batchSubmit: (
      params?: Partial<Params.BatchSubmitMessagesParams>,
    ) => QueryResult<ReadonlyArray<Shapes.MessageReceipt>>;
    readonly watch: (
      topicId: EntityId,
      handler: (message: Params.TopicMessageData) => void,
      options?: Params.WatchTopicMessagesOptions,
    ) => TopicWatchHandle;
    readonly watchFrom: (
      topicId: EntityId,
      handler: (message: Params.TopicMessageData) => void,
      options?: Params.WatchTopicMessagesFromOptions,
    ) => TopicWatchHandle;
    readonly info: (topicId: EntityId) => QueryResult<Shapes.TopicInfoData>;
    readonly messages: (
      topicId: EntityId,
      params?: import("@hieco/mirror").TopicMessagesParams,
    ) => QueryResult<Shapes.TopicMessagesData>;
  };
  readonly contract: {
    readonly deploy: (
      params?: Partial<Params.DeployContractParams>,
    ) => BuilderResult<Shapes.ContractReceipt, Params.DeployContractParams>;
    readonly run: (
      params?: Partial<Params.ExecuteContractParams>,
    ) => BuilderResult<Shapes.ContractExecuteReceipt, Params.ExecuteContractParams>;
    readonly execute: (
      params?: Partial<Params.ExecuteContractParams>,
    ) => BuilderResult<Shapes.ContractExecuteReceipt, Params.ExecuteContractParams>;
    readonly runTyped: (
      params?: Partial<Params.ExecuteContractParamsTyped>,
    ) => BuilderResult<Shapes.ContractExecuteReceipt, Params.ExecuteContractParamsTyped>;
    readonly executeTyped: (
      params?: Partial<Params.ExecuteContractParamsTyped>,
    ) => BuilderResult<Shapes.ContractExecuteReceipt, Params.ExecuteContractParamsTyped>;
    readonly call: (
      params: Params.CallContractParams,
    ) => QueryResult<Shapes.ContractCallResult<unknown>>;
    readonly callTyped: (params: {
      readonly id: EntityId;
      readonly fn: string;
      readonly params: Params.FunctionParamsConfig;
      readonly gas?: number;
      readonly senderAccountId?: EntityId;
      readonly returns?: import("../domains/contracts/abi.ts").ReturnTypeHint;
    }) => QueryResult<Shapes.ContractCallResult<unknown>>;
    readonly preflight: (params: {
      readonly id: EntityId;
      readonly fn: string;
      readonly args?: ReadonlyArray<unknown>;
      readonly senderEvmAddress?: string;
      readonly gas?: number;
      readonly value?: string | number | bigint;
      readonly gasPrice?: string | number | bigint;
      readonly blockNumber?: string | number | bigint;
      readonly gasBuffer?: number;
    }) => QueryResult<Shapes.ContractPreflightData>;
    readonly withAbi: (
      abi: import("../domains/contracts/abi.ts").AbiSpec,
    ) => ReturnType<LegacyClient["contracts"]["withAbi"]>;
    readonly delete: (
      params?: Partial<Params.DeleteContractParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.DeleteContractParams>;
    readonly update: (
      params?: Partial<Params.UpdateContractParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.UpdateContractParams>;
    readonly info: (contractId: EntityId) => QueryResult<Shapes.ContractInfoData>;
    readonly logs: (
      contractId: EntityId,
      params?: import("@hieco/mirror").ContractLogsParams,
    ) => QueryResult<Shapes.ContractLogsData>;
    readonly bytecode: (contractId: EntityId) => QueryResult<Shapes.ContractBytecodeData>;
    readonly simulate: (
      params: Parameters<LegacyClient["contracts"]["simulate"]>[0],
    ) => QueryResult<Shapes.MirrorContractCallData>;
    readonly estimate: (
      params: Parameters<LegacyClient["contracts"]["estimateGas"]>[0],
    ) => QueryResult<Shapes.MirrorContractEstimateData>;
    readonly estimateGas: (
      params: Parameters<LegacyClient["contracts"]["estimateGas"]>[0],
    ) => QueryResult<Shapes.MirrorContractEstimateData>;
  };
  readonly file: {
    readonly create: (
      params?: Partial<Params.CreateFileParams>,
    ) => BuilderResult<Shapes.FileReceipt, Params.CreateFileParams>;
    readonly append: (
      params?: Partial<Params.AppendFileParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.AppendFileParams>;
    readonly update: (
      params?: Partial<Params.UpdateFileParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.UpdateFileParams>;
    readonly delete: (
      params?: Partial<Params.DeleteFileParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.DeleteFileParams>;
    readonly upload: (
      params?: Partial<Params.UploadFileParams>,
    ) => QueryResult<Shapes.FileChunkedReceipt>;
    readonly updateLarge: (
      params?: Partial<Params.UpdateLargeFileParams>,
    ) => QueryResult<Shapes.FileChunkedReceipt>;
    readonly info: (fileId: EntityId) => QueryResult<Shapes.FileInfoData>;
    readonly contents: (fileId: EntityId) => QueryResult<Shapes.FileContentsData>;
    readonly text: (
      fileId: EntityId,
    ) => QueryResult<{ readonly fileId: EntityId; readonly text: string }>;
    readonly contentsText: (
      fileId: EntityId,
    ) => QueryResult<{ readonly fileId: EntityId; readonly text: string }>;
    readonly json: <T = unknown>(
      fileId: EntityId,
    ) => QueryResult<{ readonly fileId: EntityId; readonly json: T }>;
    readonly contentsJson: <T = unknown>(
      fileId: EntityId,
    ) => QueryResult<{ readonly fileId: EntityId; readonly json: T }>;
  };
  readonly schedule: {
    readonly create: (
      params?: Partial<Params.ScheduleCreateParams>,
    ) => BuilderResult<Shapes.ScheduleReceipt, Params.ScheduleCreateParams>;
    readonly sign: (
      scheduleId: EntityId,
      params?: Omit<Params.ScheduleSignParams, "scheduleId"> & {
        readonly signer?: HieroSigner;
      },
    ) => QueryResult<Shapes.TransactionReceiptData>;
    readonly delete: (
      scheduleId: EntityId,
      params?: Omit<Params.ScheduleDeleteParams, "scheduleId"> & {
        readonly signer?: HieroSigner;
      },
    ) => QueryResult<Shapes.TransactionReceiptData>;
    readonly info: (scheduleId: EntityId) => QueryResult<Shapes.ScheduleInfoData>;
    readonly wait: (
      scheduleId: EntityId,
      options?: Params.ScheduleWaitOptions,
    ) => QueryResult<Shapes.ScheduleInfoData>;
    readonly createIdempotent: (
      params?: Partial<Params.ScheduleIdempotentCreateParams>,
    ) => QueryResult<
      | { readonly status: "created"; readonly schedule: Shapes.ScheduleReceipt }
      | { readonly status: "existing"; readonly schedule: Shapes.ScheduleReceipt }
    >;
    readonly collect: (
      params?: Partial<Params.ScheduleCollectSignaturesParams>,
    ) => QueryResult<ReadonlyArray<Shapes.TransactionReceiptData>>;
    readonly collectSignatures: (
      params?: Partial<Params.ScheduleCollectSignaturesParams>,
    ) => QueryResult<ReadonlyArray<Shapes.TransactionReceiptData>>;
    readonly waitForExecution: (
      scheduleId: EntityId,
      options?: Params.ScheduleWaitExecutionOptions,
    ) => QueryResult<Shapes.ScheduleInfoData>;
  };
  readonly node: {
    readonly create: (
      params?: Partial<Params.NodeCreateParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.NodeCreateParams>;
    readonly update: (
      params?: Partial<Params.NodeUpdateParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.NodeUpdateParams>;
    readonly delete: (
      params?: Partial<Params.NodeDeleteParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.NodeDeleteParams>;
  };
  readonly system: {
    readonly freeze: (
      params?: Partial<Params.FreezeNetworkParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.FreezeNetworkParams>;
  };
  readonly util: {
    readonly random: (
      params?: Partial<Params.PrngParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.PrngParams>;
  };
  readonly batch: {
    readonly atomic: (
      params?: Partial<Params.BatchAtomicParams>,
    ) => BuilderResult<Shapes.TransactionReceiptData, Params.BatchAtomicParams>;
  };
  readonly net: {
    readonly version: () => QueryResult<Shapes.NetworkVersionData>;
    readonly addressBook: (options?: {
      readonly fileId?: string;
      readonly limit?: number;
    }) => QueryResult<Shapes.AddressBookData>;
  };
  readonly transaction: TelepathicClient["tx"];
  readonly networkQuery: TelepathicClient["net"];
  readonly accounts: LegacyClient["accounts"];
  readonly tokens: LegacyClient["tokens"];
  readonly hcs: LegacyClient["hcs"];
  readonly contracts: LegacyClient["contracts"];
  readonly files: LegacyClient["files"];
  readonly schedules: LegacyClient["schedules"];
  readonly transactions: LegacyClient["transactions"];
  readonly network: LegacyClient["network"];
  readonly reads: LegacyClient["reads"];
  readonly mirror: LegacyClient["mirror"];
  readonly networkName: LegacyClient["networkName"];
  readonly operator: LegacyClient["operator"];
  readonly as: (signer: HieroSigner) => TelepathicClient;
  readonly with: (input: {
    readonly signer?: HieroSigner;
    readonly operator?: EntityId;
    readonly key?: string;
  }) => TelepathicClient;
  readonly submit: (
    descriptor: Params.TransactionDescriptor,
  ) => Promise<Result<Shapes.TransactionReceiptData>>;
  readonly destroy: () => void;
}

function createTelepathic(base: LegacyClient): TelepathicClient {
  const schedule = (
    params: Omit<Params.ScheduleCreateParams, "tx">,
    descriptor: Params.TransactionDescriptor,
  ) => base.schedules.create({ tx: descriptor, ...params });

  const plan = <P extends object, T>(
    seed: Partial<P>,
    execute: (params: P) => Promise<Result<T>>,
    tx: (params: P) => Params.TransactionDescriptor,
  ) =>
    fluentAction<P, Result<T>>({
      seed,
      execute,
      tx,
      schedule,
    });

  const queryPlan = <P extends object, T>(
    seed: Partial<P>,
    execute: (params: P) => Promise<Result<T>>,
  ) =>
    fluentAction<P, Result<T>>({
      seed,
      execute,
    });

  const query = <T>(execute: () => Promise<Result<T>>) => ({ now: execute });

  const tx = {
    submit: (descriptor: Params.TransactionDescriptor) => base.submit(descriptor),
    record: (transactionId: string | { readonly transactionId: string }) =>
      base.transactions.record(transactionId),
    receipt: (
      transactionId: string | { readonly transactionId: string },
      options?: {
        readonly includeChildren?: boolean;
        readonly includeDuplicates?: boolean;
        readonly validateStatus?: boolean;
      },
    ) => base.transactions.receipt(transactionId, options),
  };

  const net = {
    version: () => query(() => base.network.version()),
    addressBook: (options?: { readonly fileId?: string; readonly limit?: number }) =>
      query(() => base.network.addressBook(options)),
  };

  const api = {
    audit: capabilityAudit,
    tx,
    transaction: tx,
    account: {
      send: (params: Partial<Params.TransferParams> = {}) =>
        plan<Params.TransferParams, Shapes.TransferResult>(
          params,
          (value) => base.accounts.transfer(value),
          (value) => base.accounts.transfer.tx(value),
        ),
      transfer: (params: Partial<Params.TransferParams> = {}) =>
        plan<Params.TransferParams, Shapes.TransferResult>(
          params,
          (value) => base.accounts.transfer(value),
          (value) => base.accounts.transfer.tx(value),
        ),
      create: (params: Partial<Params.CreateAccountParams> = {}) =>
        plan<Params.CreateAccountParams, Shapes.CreateAccountResult>(
          params,
          (value) => base.accounts.create(value),
          (value) => base.accounts.create.tx(value),
        ),
      update: (params: Partial<Params.UpdateAccountParams> = {}) =>
        plan<Params.UpdateAccountParams, Shapes.UpdateAccountResult>(
          params,
          (value) => base.accounts.update(value),
          (value) => base.accounts.update.tx(value),
        ),
      delete: (params: Partial<Params.DeleteAccountParams> = {}) =>
        plan<Params.DeleteAccountParams, Shapes.DeleteAccountResult>(
          params,
          (value) => base.accounts.delete(value),
          (value) => base.accounts.delete.tx(value),
        ),
      allow: (params: Partial<Params.ApproveAllowanceParams> = {}) =>
        plan<Params.ApproveAllowanceParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.accounts.allowances(value),
          (value) => base.accounts.allowances.tx(value),
        ),
      allowances: (params: Partial<Params.ApproveAllowanceParams> = {}) =>
        plan<Params.ApproveAllowanceParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.accounts.allowances(value),
          (value) => base.accounts.allowances.tx(value),
        ),
      revokeNftAllowances: (params: Partial<Params.DeleteNftAllowancesParams> = {}) =>
        plan<Params.DeleteNftAllowancesParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.accounts.allowancesDeleteNft(value),
          (value) => base.accounts.allowancesDeleteNft.tx(value),
        ),
      allowancesDeleteNft: (params: Partial<Params.DeleteNftAllowancesParams> = {}) =>
        plan<Params.DeleteNftAllowancesParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.accounts.allowancesDeleteNft(value),
          (value) => base.accounts.allowancesDeleteNft.tx(value),
        ),
      allowanceSnapshot: (accountId: EntityId) =>
        query(() => base.accounts.allowancesList(accountId)),
      ensureAllowances: (params: {
        readonly hbar?: ReadonlyArray<Params.HbarAllowanceParams>;
        readonly tokens?: ReadonlyArray<Params.TokenAllowanceParams>;
        readonly nfts?: ReadonlyArray<Params.NftAllowanceParams>;
        readonly memo?: string;
        readonly maxFee?: Params.Amount;
      }) => query(() => base.accounts.allowancesEnsure(params)),
      balance: (accountId?: EntityId) => query(() => base.accounts.balance(accountId)),
      info: (accountId: EntityId) => query(() => base.accounts.info(accountId)),
      records: (accountId?: EntityId) => query(() => base.accounts.records(accountId)),
    },
    token: {
      create: (params: Partial<Params.CreateTokenParams> = {}) =>
        plan<Params.CreateTokenParams, Shapes.TokenReceipt>(
          params,
          (value) => base.tokens.create(value),
          (value) => base.tokens.create.tx(value),
        ),
      mint: (params: Partial<Params.MintTokenParams> = {}) =>
        plan<Params.MintTokenParams, Shapes.MintReceipt>(
          params,
          (value) => base.tokens.mint(value),
          (value) => base.tokens.mint.tx(value),
        ),
      burn: (params: Partial<Params.BurnTokenParams> = {}) =>
        plan<Params.BurnTokenParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.tokens.burn(value),
          (value) => base.tokens.burn.tx(value),
        ),
      send: (params: Partial<Params.TransferTokenParams> = {}) =>
        plan<Params.TransferTokenParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.tokens.transfer(value),
          (value) => base.tokens.transfer.tx(value),
        ),
      transfer: (params: Partial<Params.TransferTokenParams> = {}) =>
        plan<Params.TransferTokenParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.tokens.transfer(value),
          (value) => base.tokens.transfer.tx(value),
        ),
      sendNft: (params: Partial<Params.TransferNftParams> = {}) =>
        plan<Params.TransferNftParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.tokens.transferNft(value),
          (value) => base.tokens.transferNft.tx(value),
        ),
      transferNft: (params: Partial<Params.TransferNftParams> = {}) =>
        plan<Params.TransferNftParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.tokens.transferNft(value),
          (value) => base.tokens.transferNft.tx(value),
        ),
      associate: (params: Partial<Params.AssociateTokenParams> = {}) =>
        plan<Params.AssociateTokenParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.tokens.associate(value),
          (value) => base.tokens.associate.tx(value),
        ),
      dissociate: (params: Partial<Params.DissociateTokenParams> = {}) =>
        plan<Params.DissociateTokenParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.tokens.dissociate(value),
          (value) => base.tokens.dissociate.tx(value),
        ),
      freeze: (params: Partial<Params.FreezeTokenParams> = {}) =>
        plan<Params.FreezeTokenParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.tokens.freeze(value),
          (value) => base.tokens.freeze.tx(value),
        ),
      unfreeze: (params: Partial<Params.UnfreezeTokenParams> = {}) =>
        plan<Params.UnfreezeTokenParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.tokens.unfreeze(value),
          (value) => base.tokens.unfreeze.tx(value),
        ),
      grantKyc: (params: Partial<Params.GrantKycParams> = {}) =>
        plan<Params.GrantKycParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.tokens.grantKyc(value),
          (value) => base.tokens.grantKyc.tx(value),
        ),
      revokeKyc: (params: Partial<Params.RevokeKycParams> = {}) =>
        plan<Params.RevokeKycParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.tokens.revokeKyc(value),
          (value) => base.tokens.revokeKyc.tx(value),
        ),
      pause: (params: Partial<Params.PauseTokenParams> = {}) =>
        plan<Params.PauseTokenParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.tokens.pause(value),
          (value) => base.tokens.pause.tx(value),
        ),
      unpause: (params: Partial<Params.UnpauseTokenParams> = {}) =>
        plan<Params.UnpauseTokenParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.tokens.unpause(value),
          (value) => base.tokens.unpause.tx(value),
        ),
      wipe: (params: Partial<Params.WipeTokenParams> = {}) =>
        plan<Params.WipeTokenParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.tokens.wipe(value),
          (value) => base.tokens.wipe.tx(value),
        ),
      delete: (params: Partial<Params.DeleteTokenParams> = {}) =>
        plan<Params.DeleteTokenParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.tokens.delete(value),
          (value) => base.tokens.delete.tx(value),
        ),
      update: (params: Partial<Params.UpdateTokenParams> = {}) =>
        plan<Params.UpdateTokenParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.tokens.update(value),
          (value) => base.tokens.update.tx(value),
        ),
      fees: (params: Partial<Params.UpdateTokenFeeScheduleParams> = {}) =>
        plan<Params.UpdateTokenFeeScheduleParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.tokens.fees(value),
          (value) => base.tokens.fees.tx(value),
        ),
      airdrop: (params: Partial<Params.TokenAirdropParams> = {}) =>
        plan<Params.TokenAirdropParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.submit({ kind: "tokens.airdrop", params: value }),
          (value) => ({ kind: "tokens.airdrop", params: value }),
        ),
      claimAirdrop: (params: Partial<Params.TokenClaimAirdropParams> = {}) =>
        plan<Params.TokenClaimAirdropParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.submit({ kind: "tokens.claimAirdrop", params: value }),
          (value) => ({ kind: "tokens.claimAirdrop", params: value }),
        ),
      cancelAirdrop: (params: Partial<Params.TokenCancelAirdropParams> = {}) =>
        plan<Params.TokenCancelAirdropParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.submit({ kind: "tokens.cancelAirdrop", params: value }),
          (value) => ({ kind: "tokens.cancelAirdrop", params: value }),
        ),
      reject: (params: Partial<Params.TokenRejectParams> = {}) =>
        plan<Params.TokenRejectParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.submit({ kind: "tokens.reject", params: value }),
          (value) => ({ kind: "tokens.reject", params: value }),
        ),
      updateNfts: (params: Partial<Params.TokenUpdateNftsParams> = {}) =>
        plan<Params.TokenUpdateNftsParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.submit({ kind: "tokens.updateNfts", params: value }),
          (value) => ({ kind: "tokens.updateNfts", params: value }),
        ),
      info: (tokenId: EntityId) => query(() => base.tokens.info(tokenId)),
      nft: (nft: string | { readonly tokenId: EntityId; readonly serial: number }) =>
        query(() => base.tokens.nftInfo(nft)),
      allowances: (accountId: EntityId, params?: Params.TokenAllowancesQueryParams) =>
        query(() => base.tokens.allowancesList(accountId, params)),
    },
    topic: {
      create: (params: Partial<Params.CreateTopicParams> = {}) =>
        plan<Params.CreateTopicParams, Shapes.TopicReceipt>(
          params,
          (value) => base.hcs.create(value),
          (value) => base.hcs.create.tx(value),
        ),
      update: (params: Partial<Params.UpdateTopicParams> = {}) =>
        plan<Params.UpdateTopicParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.hcs.update(value),
          (value) => base.hcs.update.tx(value),
        ),
      delete: (params: Partial<Params.DeleteTopicParams> = {}) =>
        plan<Params.DeleteTopicParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.hcs.delete(value),
          (value) => base.hcs.delete.tx(value),
        ),
      send: (params: Partial<Params.SubmitMessageParams> = {}) =>
        plan<Params.SubmitMessageParams, Shapes.MessageReceipt>(
          params,
          (value) => base.hcs.submit(value),
          (value) => base.hcs.submit.tx(value),
        ),
      submit: (params: Partial<Params.SubmitMessageParams> = {}) =>
        plan<Params.SubmitMessageParams, Shapes.MessageReceipt>(
          params,
          (value) => base.hcs.submit(value),
          (value) => base.hcs.submit.tx(value),
        ),
      sendJson: (params: Partial<Params.SubmitJsonMessageParams> = {}) =>
        queryPlan<Params.SubmitJsonMessageParams, Shapes.MessageReceipt>(params, (value) =>
          base.hcs.submitJson(value),
        ),
      submitJson: (params: Partial<Params.SubmitJsonMessageParams> = {}) =>
        queryPlan<Params.SubmitJsonMessageParams, Shapes.MessageReceipt>(params, (value) =>
          base.hcs.submitJson(value),
        ),
      sendMany: (params: Partial<Params.BatchSubmitMessagesParams> = {}) =>
        queryPlan<Params.BatchSubmitMessagesParams, ReadonlyArray<Shapes.MessageReceipt>>(
          params,
          (value) => base.hcs.batchSubmit(value),
        ),
      batchSubmit: (params: Partial<Params.BatchSubmitMessagesParams> = {}) =>
        queryPlan<Params.BatchSubmitMessagesParams, ReadonlyArray<Shapes.MessageReceipt>>(
          params,
          (value) => base.hcs.batchSubmit(value),
        ),
      watch: (
        topicId: EntityId,
        handler: (message: Params.TopicMessageData) => void,
        options?: Params.WatchTopicMessagesOptions,
      ) => base.hcs.watch(topicId, handler, options),
      watchFrom: (
        topicId: EntityId,
        handler: (message: Params.TopicMessageData) => void,
        options?: Params.WatchTopicMessagesFromOptions,
      ) => base.hcs.watchFrom(topicId, handler, options),
      info: (topicId: EntityId) => query(() => base.hcs.info(topicId)),
      messages: (topicId: EntityId, params?: import("@hieco/mirror").TopicMessagesParams) =>
        query(() => base.hcs.messages(topicId, params)),
    },
    contract: {
      deploy: (params: Partial<Params.DeployContractParams> = {}) =>
        plan<Params.DeployContractParams, Shapes.ContractReceipt>(
          params,
          (value) => base.contracts.deploy(value),
          (value) => base.contracts.deploy.tx(value),
        ),
      run: (params: Partial<Params.ExecuteContractParams> = {}) =>
        plan<Params.ExecuteContractParams, Shapes.ContractExecuteReceipt>(
          params,
          (value) => base.contracts.execute(value),
          (value) => base.contracts.execute.tx(value),
        ),
      execute: (params: Partial<Params.ExecuteContractParams> = {}) =>
        plan<Params.ExecuteContractParams, Shapes.ContractExecuteReceipt>(
          params,
          (value) => base.contracts.execute(value),
          (value) => base.contracts.execute.tx(value),
        ),
      runTyped: (params: Partial<Params.ExecuteContractParamsTyped> = {}) =>
        plan<Params.ExecuteContractParamsTyped, Shapes.ContractExecuteReceipt>(
          params,
          (value) => base.contracts.executeTyped(value),
          (value) => ({ kind: "contracts.execute.typed", params: value }),
        ),
      executeTyped: (params: Partial<Params.ExecuteContractParamsTyped> = {}) =>
        plan<Params.ExecuteContractParamsTyped, Shapes.ContractExecuteReceipt>(
          params,
          (value) => base.contracts.executeTyped(value),
          (value) => ({ kind: "contracts.execute.typed", params: value }),
        ),
      call: (params: Params.CallContractParams) => query(() => base.contracts.call(params)),
      callTyped: (params: {
        readonly id: EntityId;
        readonly fn: string;
        readonly params: Params.FunctionParamsConfig;
        readonly gas?: number;
        readonly senderAccountId?: EntityId;
        readonly returns?: import("../domains/contracts/abi.ts").ReturnTypeHint;
      }) => query(() => base.contracts.callTyped(params)),
      preflight: (params: {
        readonly id: EntityId;
        readonly fn: string;
        readonly args?: ReadonlyArray<unknown>;
        readonly senderEvmAddress?: string;
        readonly gas?: number;
        readonly value?: string | number | bigint;
        readonly gasPrice?: string | number | bigint;
        readonly blockNumber?: string | number | bigint;
        readonly gasBuffer?: number;
      }) => query(() => base.contracts.preflight(params)),
      withAbi: (abi: import("../domains/contracts/abi.ts").AbiSpec) => base.contracts.withAbi(abi),
      delete: (params: Partial<Params.DeleteContractParams> = {}) =>
        plan<Params.DeleteContractParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.contracts.delete(value),
          (value) => base.contracts.delete.tx(value),
        ),
      update: (params: Partial<Params.UpdateContractParams> = {}) =>
        plan<Params.UpdateContractParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.contracts.update(value),
          (value) => base.contracts.update.tx(value),
        ),
      info: (contractId: EntityId) => query(() => base.contracts.info(contractId)),
      logs: (contractId: EntityId, params?: import("@hieco/mirror").ContractLogsParams) =>
        query(() => base.contracts.logs(contractId, params)),
      bytecode: (contractId: EntityId) => query(() => base.contracts.bytecode(contractId)),
      simulate: (params: Parameters<typeof base.contracts.simulate>[0]) =>
        query(() => base.contracts.simulate(params)),
      estimate: (params: Parameters<typeof base.contracts.estimateGas>[0]) =>
        query(() => base.contracts.estimateGas(params)),
      estimateGas: (params: Parameters<typeof base.contracts.estimateGas>[0]) =>
        query(() => base.contracts.estimateGas(params)),
    },
    file: {
      create: (params: Partial<Params.CreateFileParams> = {}) =>
        plan<Params.CreateFileParams, Shapes.FileReceipt>(
          params,
          (value) => base.files.create(value),
          (value) => base.files.create.tx(value),
        ),
      append: (params: Partial<Params.AppendFileParams> = {}) =>
        plan<Params.AppendFileParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.files.append(value),
          (value) => base.files.append.tx(value),
        ),
      update: (params: Partial<Params.UpdateFileParams> = {}) =>
        plan<Params.UpdateFileParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.files.update(value),
          (value) => base.files.update.tx(value),
        ),
      delete: (params: Partial<Params.DeleteFileParams> = {}) =>
        plan<Params.DeleteFileParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.files.delete(value),
          (value) => base.files.delete.tx(value),
        ),
      upload: (params: Partial<Params.UploadFileParams> = {}) =>
        queryPlan<Params.UploadFileParams, Shapes.FileChunkedReceipt>(params, (value) =>
          base.files.upload(value),
        ),
      updateLarge: (params: Partial<Params.UpdateLargeFileParams> = {}) =>
        queryPlan<Params.UpdateLargeFileParams, Shapes.FileChunkedReceipt>(params, (value) =>
          base.files.updateLarge(value),
        ),
      info: (fileId: EntityId) => query(() => base.files.info(fileId)),
      contents: (fileId: EntityId) => query(() => base.files.contents(fileId)),
      text: (fileId: EntityId) => query(() => base.files.contentsText(fileId)),
      contentsText: (fileId: EntityId) => query(() => base.files.contentsText(fileId)),
      json: <T = unknown>(fileId: EntityId) => query(() => base.files.contentsJson<T>(fileId)),
      contentsJson: <T = unknown>(fileId: EntityId) =>
        query(() => base.files.contentsJson<T>(fileId)),
    },
    schedule: {
      create: (params: Partial<Params.ScheduleCreateParams> = {}) =>
        plan<Params.ScheduleCreateParams, Shapes.ScheduleReceipt>(
          params,
          (value) => base.schedules.create(value),
          (value) => base.schedules.create.tx(value),
        ),
      sign: (
        scheduleId: EntityId,
        params?: Omit<Params.ScheduleSignParams, "scheduleId"> & { readonly signer?: HieroSigner },
      ) => query(() => base.schedules.sign(scheduleId, params)),
      delete: (
        scheduleId: EntityId,
        params?: Omit<Params.ScheduleDeleteParams, "scheduleId"> & {
          readonly signer?: HieroSigner;
        },
      ) => query(() => base.schedules.delete(scheduleId, params)),
      info: (scheduleId: EntityId) => query(() => base.schedules.info(scheduleId)),
      wait: (scheduleId: EntityId, options?: Params.ScheduleWaitOptions) =>
        query(() => base.schedules.wait(scheduleId, options)),
      createIdempotent: (params: Partial<Params.ScheduleIdempotentCreateParams> = {}) =>
        queryPlan<
          Params.ScheduleIdempotentCreateParams,
          | { readonly status: "created"; readonly schedule: Shapes.ScheduleReceipt }
          | { readonly status: "existing"; readonly schedule: Shapes.ScheduleReceipt }
        >(params, (value) => base.schedules.createIdempotent(value)),
      collect: (params: Partial<Params.ScheduleCollectSignaturesParams> = {}) =>
        queryPlan<
          Params.ScheduleCollectSignaturesParams,
          ReadonlyArray<Shapes.TransactionReceiptData>
        >(params, (value) => base.schedules.collectSignatures(value)),
      collectSignatures: (params: Partial<Params.ScheduleCollectSignaturesParams> = {}) =>
        queryPlan<
          Params.ScheduleCollectSignaturesParams,
          ReadonlyArray<Shapes.TransactionReceiptData>
        >(params, (value) => base.schedules.collectSignatures(value)),
      waitForExecution: (scheduleId: EntityId, options?: Params.ScheduleWaitExecutionOptions) =>
        query(() => base.schedules.waitForExecution(scheduleId, options)),
    },
    node: {
      create: (params: Partial<Params.NodeCreateParams> = {}) =>
        plan<Params.NodeCreateParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.submit({ kind: "nodes.create", params: value }),
          (value) => ({ kind: "nodes.create", params: value }),
        ),
      update: (params: Partial<Params.NodeUpdateParams> = {}) =>
        plan<Params.NodeUpdateParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.submit({ kind: "nodes.update", params: value }),
          (value) => ({ kind: "nodes.update", params: value }),
        ),
      delete: (params: Partial<Params.NodeDeleteParams> = {}) =>
        plan<Params.NodeDeleteParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.submit({ kind: "nodes.delete", params: value }),
          (value) => ({ kind: "nodes.delete", params: value }),
        ),
    },
    system: {
      freeze: (params: Partial<Params.FreezeNetworkParams> = {}) =>
        plan<Params.FreezeNetworkParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.submit({ kind: "system.freeze", params: value }),
          (value) => ({ kind: "system.freeze", params: value }),
        ),
    },
    util: {
      random: (params: Partial<Params.PrngParams> = {}) =>
        plan<Params.PrngParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.submit({ kind: "util.random", params: value }),
          (value) => ({ kind: "util.random", params: value }),
        ),
    },
    batch: {
      atomic: (params: Partial<Params.BatchAtomicParams> = {}) =>
        plan<Params.BatchAtomicParams, Shapes.TransactionReceiptData>(
          params,
          (value) => base.submit({ kind: "batch.atomic", params: value }),
          (value) => ({ kind: "batch.atomic", params: value }),
        ),
    },
    net,
    networkQuery: net,
    accounts: base.accounts,
    tokens: base.tokens,
    hcs: base.hcs,
    contracts: base.contracts,
    files: base.files,
    schedules: base.schedules,
    transactions: base.transactions,
    network: base.network,
    reads: base.reads,
    mirror: base.mirror,
    networkName: base.networkName,
    operator: base.operator,
    as: (signer: HieroSigner) => createTelepathic(base.as(signer)),
    with: (input: {
      readonly signer?: HieroSigner;
      readonly operator?: EntityId;
      readonly key?: string;
    }) => createTelepathic(base.with(input)),
    submit: (descriptor: Params.TransactionDescriptor) => base.submit(descriptor),
    destroy: () => base.destroy(),
  };

  return api;
}

export function hiero(config: Params.ClientConfig = {}): TelepathicClient {
  return createTelepathic(new LegacyClient(config));
}
