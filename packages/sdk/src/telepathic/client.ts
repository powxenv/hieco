import type { Signer as HieroSigner } from "@hiero-ledger/sdk";
import type { EntityId } from "@hieco/utils";
import { HieroClient as LegacyClient } from "../core/client.ts";
import type * as Params from "../foundation/params.ts";
import type * as Shapes from "../foundation/results-shapes.ts";
import type { Result } from "../foundation/results.ts";
import { fluentAction } from "./fluent.ts";
import { capabilityAudit } from "./capability.ts";

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
  readonly account: Readonly<Record<string, unknown>>;
  readonly token: Readonly<Record<string, unknown>>;
  readonly topic: Readonly<Record<string, unknown>>;
  readonly contract: Readonly<Record<string, unknown>>;
  readonly file: Readonly<Record<string, unknown>>;
  readonly schedule: Readonly<Record<string, unknown>>;
  readonly node: Readonly<Record<string, unknown>>;
  readonly system: Readonly<Record<string, unknown>>;
  readonly util: Readonly<Record<string, unknown>>;
  readonly batch: Readonly<Record<string, unknown>>;
  readonly net: Readonly<Record<string, unknown>>;
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

  const api = {
    audit: capabilityAudit,
    tx: {
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
    },
    account: {
      send: (params: Partial<Params.TransferParams> = {}) =>
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
      revokeNftAllowances: (params: Partial<Params.DeleteNftAllowancesParams> = {}) =>
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
      sendNft: (params: Partial<Params.TransferNftParams> = {}) =>
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
      sendJson: (params: Partial<Params.SubmitJsonMessageParams> = {}) =>
        queryPlan<Params.SubmitJsonMessageParams, Shapes.MessageReceipt>(params, (value) =>
          base.hcs.submitJson(value),
        ),
      sendMany: (params: Partial<Params.BatchSubmitMessagesParams> = {}) =>
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
      runTyped: (params: Partial<Params.ExecuteContractParamsTyped> = {}) =>
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
      json: <T = unknown>(fileId: EntityId) => query(() => base.files.contentsJson<T>(fileId)),
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
    net: {
      version: () => query(() => base.network.version()),
      addressBook: (options?: { readonly fileId?: string; readonly limit?: number }) =>
        query(() => base.network.addressBook(options)),
    },
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
