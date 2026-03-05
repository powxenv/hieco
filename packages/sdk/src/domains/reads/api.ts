import type { EntityId } from "@hieco/utils";
import type {
  AccountBalance,
  AccountInfo,
  ApiResult,
  Balance,
  BalancesResponse,
  Block,
  BlocksResponse,
  ContractAction,
  ContractCallParams,
  ContractCallResult,
  ContractInfo,
  ContractLog,
  ContractOpcodesResponse,
  ContractResult,
  ContractResultDetails,
  ContractResultsResponse,
  ContractResultsParams,
  ContractState,
  ContractStateParams,
  ContractLogsParams,
  CryptoAllowance,
  ExchangeRate,
  NetworkFee,
  NetworkNode,
  NetworkStake,
  NetworkSupply,
  Nft,
  NftAllowance,
  PaginationParams,
  Schedule,
  StakingReward,
  Timestamp,
  TokenAllowance,
  TokenAirdropsResponse,
  TokenDistribution,
  TokenInfo,
  TokenRelationship,
  TokenBalancesParams,
  TokenBalancesResponse,
  Transaction,
  TransactionDetails,
  TransactionListParams,
  Topic,
  TopicMessage,
} from "@hieco/mirror";
import { createError } from "../../foundation/errors.ts";
import type { Result } from "../../foundation/results.ts";
import { err, ok } from "../../foundation/results.ts";
import type {
  AccountHistoryParams,
  AccountTransfersParams,
  AccountListParams,
  AccountNftsParams,
  AccountTokenAllowancesParams,
  AccountNftAllowancesParams,
  BalancesListParams,
  BlocksListParams,
  ContractListParams,
  ReadPage,
  ReadsNamespace,
  ScheduleListParams,
  TokenListParams,
  TokenNftsParams,
  TokenRelationshipsParams,
  TokenTransfersParams,
  TransactionSearchParams,
  TransactionsByAccountParams,
  TopicMessagesParams,
  AccountTransferActivity,
  TokenTransferActivity,
  NetworkNodesParams,
} from "./namespace.ts";

const defaultLimit = 25;

function toReadPage<T>(input: {
  readonly items: ReadonlyArray<T>;
  readonly next?: string;
}): ReadPage<T> {
  return { items: input.items, ...(input.next ? { next: input.next } : {}) };
}

function mapMirrorError(
  context: string,
  error: { readonly message: string; readonly status?: number; readonly code?: string },
) {
  return createError("MIRROR_QUERY_FAILED", context, {
    hint: "Verify mirror node connectivity",
    details: {
      status: error.status ?? "unknown",
      code: error.code ?? "unknown",
    },
  });
}

function mapAccountTransferActivity(transaction: Transaction): AccountTransferActivity {
  return {
    transactionId: transaction.transaction_id,
    consensusTimestamp: transaction.consensus_timestamp,
    name: transaction.name,
    result: transaction.result,
    transfers: transaction.transfers,
    tokenTransfers: transaction.token_transfers,
    nftTransfers: transaction.nft_transfers,
  };
}

function mapTokenTransferActivity(
  transaction: Transaction,
  tokenId: EntityId,
): TokenTransferActivity {
  return {
    tokenId,
    transactionId: transaction.transaction_id,
    consensusTimestamp: transaction.consensus_timestamp,
    name: transaction.name,
    result: transaction.result,
    tokenTransfers: transaction.token_transfers,
    nftTransfers: transaction.nft_transfers,
  };
}

function withLimit<T extends PaginationParams | undefined>(params?: T): PaginationParams {
  return {
    ...(params ?? {}),
    ...(params?.limit ? {} : { limit: defaultLimit }),
  };
}

async function readMirrorPage<T>(
  response: ApiResult<import("@hieco/mirror").PaginatedResponse<T>>,
  errorMessage: string,
): Promise<Result<ReadPage<T>>> {
  if (!response.success) {
    return err(mapMirrorError(errorMessage, response.error));
  }
  const page = response.data;
  const keys = Object.keys(page).filter((key) => key !== "links");
  const arrayKey = keys.find((key) => Array.isArray(page[key]));
  const items =
    arrayKey && Array.isArray(page[arrayKey]) ? (page[arrayKey] as ReadonlyArray<T>) : [];
  return ok(toReadPage({ items, ...(page.links?.next ? { next: page.links.next } : {}) }));
}

async function readMirrorList<T>(
  response: ApiResult<T[]>,
  errorMessage: string,
  next?: string,
): Promise<Result<ReadPage<T>>> {
  if (!response.success) {
    return err(mapMirrorError(errorMessage, response.error));
  }
  return ok(toReadPage({ items: response.data, ...(next ? { next } : {}) }));
}

export function createReadsNamespace(context: {
  readonly mirror: import("@hieco/mirror").MirrorNodeClient;
}): ReadsNamespace {
  const accountList = async (
    params?: AccountListParams,
  ): Promise<Result<ReadPage<AccountInfo>>> => {
    const result = await context.mirror.account.listPaginatedPage(withLimit(params));
    return readMirrorPage(result, "Mirror account.listPaginatedPage failed");
  };

  const accountListPageByUrl = async (url: string): Promise<Result<ReadPage<AccountInfo>>> => {
    const result = await context.mirror.account.listPaginatedPageByUrl(url);
    return readMirrorPage(result, "Mirror account.listPaginatedPageByUrl failed");
  };

  const accountInfo = async (
    accountId: EntityId,
    params?: { readonly timestamp?: Timestamp; readonly transactions?: boolean },
  ): Promise<Result<AccountInfo>> => {
    const result = await context.mirror.account.getInfo(accountId, params);
    if (!result.success) {
      return err(mapMirrorError("Mirror account.getInfo failed", result.error));
    }
    return ok(result.data);
  };

  const accountBalances = async (accountId: EntityId): Promise<Result<Balance>> => {
    const result = await context.mirror.account.getBalances(accountId);
    if (!result.success) {
      return err(mapMirrorError("Mirror account.getBalances failed", result.error));
    }
    return ok(result.data);
  };

  const accountTokens = async (
    accountId: EntityId,
    params?: TokenRelationshipsParams,
  ): Promise<Result<ReadPage<TokenRelationship>>> => {
    const result = await context.mirror.account.getTokens(accountId, params);
    return readMirrorList(result, "Mirror account.getTokens failed");
  };

  const accountNfts = async (
    accountId: EntityId,
    params?: AccountNftsParams,
  ): Promise<Result<ReadPage<TokenRelationship>>> => {
    const result = await context.mirror.account.getNfts(accountId, params);
    return readMirrorList(result, "Mirror account.getNfts failed");
  };

  const accountRewards = async (
    accountId: EntityId,
    params?: PaginationParams & { readonly timestamp?: Timestamp },
  ): Promise<Result<ReadPage<StakingReward>>> => {
    const result = await context.mirror.account.getStakingRewards(accountId, params);
    return readMirrorList(result, "Mirror account.getStakingRewards failed");
  };

  const accountAllowanceCrypto = async (
    accountId: EntityId,
    params?: PaginationParams & { readonly "spender.id"?: EntityId },
  ): Promise<Result<ReadPage<CryptoAllowance>>> => {
    const result = await context.mirror.account.getCryptoAllowances(accountId, params);
    return readMirrorList(result, "Mirror account.getCryptoAllowances failed");
  };

  const accountAllowanceToken = async (
    accountId: EntityId,
    params?: AccountTokenAllowancesParams,
  ): Promise<Result<ReadPage<TokenAllowance>>> => {
    const result = await context.mirror.account.getTokenAllowances(accountId, params);
    return readMirrorList(result, "Mirror account.getTokenAllowances failed");
  };

  const accountAllowanceNft = async (
    accountId: EntityId,
    params?: AccountNftAllowancesParams,
  ): Promise<Result<ReadPage<NftAllowance>>> => {
    const result = await context.mirror.account.getNftAllowances(accountId, params);
    return readMirrorList(result, "Mirror account.getNftAllowances failed");
  };

  const accountAirdropsOutstanding = async (
    accountId: EntityId,
    params?: {
      readonly limit?: number;
      readonly order?: "asc" | "desc";
      readonly "receiver.id"?: EntityId;
      readonly serial_number?: number;
      readonly "token.id"?: EntityId;
    },
  ): Promise<Result<TokenAirdropsResponse>> => {
    const result = await context.mirror.account.getOutstandingAirdrops(accountId, params);
    if (!result.success) {
      return err(mapMirrorError("Mirror account.getOutstandingAirdrops failed", result.error));
    }
    return ok(result.data);
  };

  const accountAirdropsPending = async (
    accountId: EntityId,
    params?: {
      readonly limit?: number;
      readonly order?: "asc" | "desc";
      readonly "sender.id"?: EntityId;
      readonly serial_number?: number;
      readonly "token.id"?: EntityId;
    },
  ): Promise<Result<TokenAirdropsResponse>> => {
    const result = await context.mirror.account.getPendingAirdrops(accountId, params);
    if (!result.success) {
      return err(mapMirrorError("Mirror account.getPendingAirdrops failed", result.error));
    }
    return ok(result.data);
  };

  const accountHistory = async (
    accountId: EntityId,
    params?: AccountHistoryParams,
  ): Promise<Result<ReadPage<Transaction>>> => {
    const searchParams: TransactionListParams = {
      ...params,
      ...withLimit(params),
      account: accountId,
    };
    const page = await readMirrorPage(
      await context.mirror.transaction.listPaginatedPage(searchParams),
      "Mirror transaction.listPaginatedPage failed",
    );
    return page;
  };

  const accountTransfers = async (
    accountId: EntityId,
    params?: AccountTransfersParams,
  ): Promise<Result<ReadPage<AccountTransferActivity>>> => {
    const searchParams: TransactionListParams = {
      ...params,
      ...withLimit(params),
      account: accountId,
    };
    const page = await readMirrorPage(
      await context.mirror.transaction.listPaginatedPage(searchParams),
      "Mirror transaction.listPaginatedPage failed",
    );
    if (!page.ok) return page;
    const items = page.value.items.map(mapAccountTransferActivity);
    return ok(toReadPage({ items, ...(page.value.next ? { next: page.value.next } : {}) }));
  };

  const tokenBalances = async (
    tokenId: EntityId,
    params?: TokenBalancesParams,
  ): Promise<Result<ReadPage<TokenDistribution>>> => {
    const result = await context.mirror.token.getBalances(tokenId, params);
    return readMirrorList(result, "Mirror token.getBalances failed");
  };

  const tokenBalancesSnapshot = async (
    tokenId: EntityId,
    params?: TokenBalancesParams,
  ): Promise<Result<TokenBalancesResponse>> => {
    const result = await context.mirror.token.getBalancesSnapshot(tokenId, params);
    if (!result.success) {
      return err(mapMirrorError("Mirror token.getBalancesSnapshot failed", result.error));
    }
    return ok(result.data);
  };

  const tokenList = async (params?: TokenListParams): Promise<Result<ReadPage<TokenInfo>>> => {
    const result = await context.mirror.token.listPaginatedPage(withLimit(params));
    return readMirrorPage(result, "Mirror token.listPaginatedPage failed");
  };

  const tokenListPageByUrl = async (url: string): Promise<Result<ReadPage<TokenInfo>>> => {
    const result = await context.mirror.token.listPaginatedPageByUrl(url);
    return readMirrorPage(result, "Mirror token.listPaginatedPageByUrl failed");
  };

  const tokenInfo = async (
    tokenId: EntityId,
    params?: { readonly timestamp?: Timestamp },
  ): Promise<Result<TokenInfo>> => {
    const result = await context.mirror.token.getInfo(tokenId, params);
    if (!result.success) {
      return err(mapMirrorError("Mirror token.getInfo failed", result.error));
    }
    return ok(result.data);
  };

  const tokenRelationships = async (
    accountId: EntityId,
    params?: TokenRelationshipsParams,
  ): Promise<Result<ReadPage<TokenRelationship>>> => {
    const result = await context.mirror.account.getTokens(accountId, params);
    return readMirrorList(result, "Mirror account.getTokens failed");
  };

  const tokenNfts = async (
    tokenId: EntityId,
    params?: TokenNftsParams,
  ): Promise<Result<ReadPage<Nft>>> => {
    const result = await context.mirror.token.getNfts(tokenId, params);
    return readMirrorPage(result, "Mirror token.getNfts failed");
  };

  const tokenNft = async (tokenId: EntityId, serial: number): Promise<Result<Nft>> => {
    const result = await context.mirror.token.getNft(tokenId, serial);
    if (!result.success) {
      return err(mapMirrorError("Mirror token.getNft failed", result.error));
    }
    return ok(result.data);
  };

  const tokenNftTransactions = async (
    tokenId: EntityId,
    serial: number,
    params?: PaginationParams & { readonly timestamp?: Timestamp },
  ): Promise<Result<ReadPage<Transaction>>> => {
    const result = await context.mirror.token.getNftTransactions(tokenId, serial, params);
    return readMirrorList(result, "Mirror token.getNftTransactions failed");
  };

  const tokenTransfers = async (
    tokenId: EntityId,
    params?: TokenTransfersParams,
  ): Promise<Result<ReadPage<TokenTransferActivity>>> => {
    const searchParams = {
      ...params,
      ...withLimit(params),
      "token.transfers.token": tokenId,
    } satisfies TransactionListParams & {
      readonly "token.transfers.token": EntityId;
    };
    const page = await readMirrorPage(
      await context.mirror.transaction.listPaginatedPage(searchParams),
      "Mirror transaction.listPaginatedPage failed",
    );
    if (!page.ok) return page;
    const items = page.value.items.map((transaction) =>
      mapTokenTransferActivity(transaction, tokenId),
    );
    return ok(toReadPage({ items, ...(page.value.next ? { next: page.value.next } : {}) }));
  };

  const contractResults = async (
    contractId: EntityId,
    params?: ContractResultsParams,
  ): Promise<Result<ReadPage<ContractResult>>> => {
    const result = await context.mirror.contract.getResults(contractId, params);
    return readMirrorList(result, "Mirror contract.getResults failed");
  };

  const contractList = async (
    params?: ContractListParams,
  ): Promise<Result<ReadPage<ContractInfo>>> => {
    const result = await context.mirror.contract.listPaginatedPage(withLimit(params));
    return readMirrorPage(result, "Mirror contract.listPaginatedPage failed");
  };

  const contractListPageByUrl = async (url: string): Promise<Result<ReadPage<ContractInfo>>> => {
    const result = await context.mirror.contract.listPaginatedPageByUrl(url);
    return readMirrorPage(result, "Mirror contract.listPaginatedPageByUrl failed");
  };

  const contractInfo = async (
    contractIdOrAddress: EntityId | string,
    params?: { readonly timestamp?: Timestamp },
  ): Promise<Result<ContractInfo>> => {
    const result = await context.mirror.contract.getInfo(contractIdOrAddress, params);
    if (!result.success) {
      return err(mapMirrorError("Mirror contract.getInfo failed", result.error));
    }
    return ok(result.data);
  };

  const contractCall = async (params: ContractCallParams): Promise<Result<ContractCallResult>> => {
    const result = await context.mirror.contract.call(params);
    if (!result.success) {
      return err(mapMirrorError("Mirror contract.call failed", result.error));
    }
    return ok(result.data);
  };

  const contractResult = async (
    contractId: EntityId,
    timestamp: Timestamp,
  ): Promise<Result<ContractResult>> => {
    const result = await context.mirror.contract.getResult(contractId, timestamp);
    if (!result.success) {
      return err(mapMirrorError("Mirror contract.getResult failed", result.error));
    }
    return ok(result.data);
  };

  const contractState = async (
    contractId: EntityId,
    params?: ContractStateParams,
  ): Promise<Result<ReadPage<ContractState>>> => {
    const result = await context.mirror.contract.getState(contractId, params);
    return readMirrorList(result, "Mirror contract.getState failed");
  };

  const contractLogs = async (
    contractId: EntityId,
    params?: ContractLogsParams,
  ): Promise<Result<ReadPage<ContractLog>>> => {
    const result = await context.mirror.contract.getLogs(contractId, params);
    return readMirrorList(result, "Mirror contract.getLogs failed");
  };

  const contractResultsAll = async (params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly from?: string;
    readonly block_hash?: string;
    readonly block_number?: number;
    readonly internal?: boolean;
    readonly timestamp?: Timestamp;
    readonly transaction_index?: number;
  }): Promise<Result<ContractResultsResponse>> => {
    const result = await context.mirror.contract.getAllResults(params);
    if (!result.success) {
      return err(mapMirrorError("Mirror contract.getAllResults failed", result.error));
    }
    return ok(result.data);
  };

  const contractResultByTransactionIdOrHash = async (
    transactionIdOrHash: string,
    params?: { readonly nonce?: number },
  ): Promise<Result<ContractResultDetails>> => {
    const result = await context.mirror.contract.getResultByTransactionIdOrHash(
      transactionIdOrHash,
      params,
    );
    if (!result.success) {
      return err(
        mapMirrorError("Mirror contract.getResultByTransactionIdOrHash failed", result.error),
      );
    }
    return ok(result.data);
  };

  const contractResultActions = async (
    transactionIdOrHash: string,
    params?: PaginationParams & { readonly index?: number },
  ): Promise<Result<{ readonly actions: ReadonlyArray<ContractAction> }>> => {
    const result = await context.mirror.contract.getResultActions(transactionIdOrHash, params);
    if (!result.success) {
      return err(mapMirrorError("Mirror contract.getResultActions failed", result.error));
    }
    return ok({ actions: result.data.actions });
  };

  const contractResultOpcodes = async (
    transactionIdOrHash: string,
    params?: { readonly stack?: boolean; readonly memory?: boolean; readonly storage?: boolean },
  ): Promise<Result<ContractOpcodesResponse>> => {
    const result = await context.mirror.contract.getResultOpcodes(transactionIdOrHash, params);
    if (!result.success) {
      return err(mapMirrorError("Mirror contract.getResultOpcodes failed", result.error));
    }
    return ok(result.data);
  };

  const contractLogsAll = async (
    params?: PaginationParams & {
      readonly index?: number;
      readonly timestamp?: Timestamp;
      readonly topic0?: string;
      readonly topic1?: string;
      readonly topic2?: string;
      readonly topic3?: string;
      readonly "transaction.hash"?: string;
    },
  ): Promise<Result<ReadPage<ContractLog>>> => {
    const result = await context.mirror.contract.getAllContractLogs(params);
    return readMirrorPage(result, "Mirror contract.getAllContractLogs failed");
  };

  const transactionSearch = async (
    params?: TransactionSearchParams,
  ): Promise<Result<ReadPage<Transaction>>> => {
    const pageParams = withLimit(params);
    const result = await context.mirror.transaction.listPaginatedPage(pageParams);
    return readMirrorPage(result, "Mirror transaction.listPaginatedPage failed");
  };

  const transactionGet = async (
    transactionId: string,
    params?: { readonly nonce?: number; readonly scheduled?: boolean },
  ): Promise<Result<TransactionDetails>> => {
    const result = await context.mirror.transaction.getById(transactionId, params);
    if (!result.success) {
      return err(mapMirrorError("Mirror transaction.getById failed", result.error));
    }
    return ok(result.data);
  };

  const transactionByAccount = async (
    accountId: EntityId,
    params?: TransactionsByAccountParams,
  ): Promise<Result<ReadPage<Transaction>>> => {
    const result = await context.mirror.transaction.listByAccount(accountId, params);
    return readMirrorList(result, "Mirror transaction.listByAccount failed");
  };

  const transactionList = async (
    params?: TransactionSearchParams,
  ): Promise<Result<ReadPage<Transaction>>> => {
    const result = await context.mirror.transaction.listPaginatedPage(withLimit(params));
    return readMirrorPage(result, "Mirror transaction.listPaginatedPage failed");
  };

  const transactionListPageByUrl = async (url: string): Promise<Result<ReadPage<Transaction>>> => {
    const result = await context.mirror.transaction.listPaginatedPageByUrl(url);
    return readMirrorPage(result, "Mirror transaction.listPaginatedPageByUrl failed");
  };

  const topicsList = async (params?: PaginationParams): Promise<Result<ReadPage<Topic>>> => {
    const result = await context.mirror.topic.listPaginatedPage(withLimit(params));
    return readMirrorPage(result, "Mirror topic.listPaginatedPage failed");
  };

  const topicsListPageByUrl = async (url: string): Promise<Result<ReadPage<Topic>>> => {
    const result = await context.mirror.topic.listPaginatedPageByUrl(url);
    return readMirrorPage(result, "Mirror topic.listPaginatedPageByUrl failed");
  };

  const topicInfo = async (topicId: EntityId): Promise<Result<Topic>> => {
    const result = await context.mirror.topic.getInfo(topicId);
    if (!result.success) {
      return err(mapMirrorError("Mirror topic.getInfo failed", result.error));
    }
    return ok(result.data);
  };

  const topicMessages = async (
    topicId: EntityId,
    params?: TopicMessagesParams,
  ): Promise<Result<ReadPage<TopicMessage>>> => {
    const result = await context.mirror.topic.getMessages(topicId, params);
    return readMirrorList(result, "Mirror topic.getMessages failed");
  };

  const topicMessage = async (
    topicId: EntityId,
    sequenceNumber: number,
  ): Promise<Result<TopicMessage>> => {
    const result = await context.mirror.topic.getMessage(topicId, sequenceNumber);
    if (!result.success) {
      return err(mapMirrorError("Mirror topic.getMessage failed", result.error));
    }
    return ok(result.data);
  };

  const topicMessageByTimestamp = async (timestamp: string): Promise<Result<TopicMessage>> => {
    const result = await context.mirror.topic.getMessageByTimestamp(timestamp);
    if (!result.success) {
      return err(mapMirrorError("Mirror topic.getMessageByTimestamp failed", result.error));
    }
    return ok(result.data);
  };

  const schedulesList = async (
    params?: ScheduleListParams,
  ): Promise<Result<ReadPage<Schedule>>> => {
    const result = await context.mirror.schedule.listPaginatedPage(withLimit(params));
    return readMirrorPage(result, "Mirror schedule.listPaginatedPage failed");
  };

  const schedulesListPageByUrl = async (url: string): Promise<Result<ReadPage<Schedule>>> => {
    const result = await context.mirror.schedule.listPaginatedPageByUrl(url);
    return readMirrorPage(result, "Mirror schedule.listPaginatedPageByUrl failed");
  };

  const scheduleInfo = async (scheduleId: EntityId): Promise<Result<Schedule>> => {
    const result = await context.mirror.schedule.getInfo(scheduleId);
    if (!result.success) {
      return err(mapMirrorError("Mirror schedule.getInfo failed", result.error));
    }
    return ok(result.data);
  };

  const networkExchangeRate = async (params?: {
    readonly timestamp?: Timestamp;
  }): Promise<Result<ExchangeRate>> => {
    const result = await context.mirror.network.getExchangeRate(params);
    if (!result.success) {
      return err(mapMirrorError("Mirror network.getExchangeRate failed", result.error));
    }
    return ok(result.data);
  };

  const networkFees = async (
    params?: PaginationParams & { readonly timestamp?: Timestamp },
  ): Promise<Result<NetworkFee>> => {
    const result = await context.mirror.network.getFees(params);
    if (!result.success) {
      return err(mapMirrorError("Mirror network.getFees failed", result.error));
    }
    return ok(result.data);
  };

  const networkNodes = async (
    params?: NetworkNodesParams,
  ): Promise<Result<ReadPage<NetworkNode>>> => {
    const result = await context.mirror.network.listPaginatedPage(withLimit(params));
    return readMirrorPage(result, "Mirror network.listPaginatedPage failed");
  };

  const networkNodesPageByUrl = async (url: string): Promise<Result<ReadPage<NetworkNode>>> => {
    const result = await context.mirror.network.listPaginatedPageByUrl(url);
    return readMirrorPage(result, "Mirror network.listPaginatedPageByUrl failed");
  };

  const networkStake = async (): Promise<Result<NetworkStake>> => {
    const result = await context.mirror.network.getStake();
    if (!result.success) {
      return err(mapMirrorError("Mirror network.getStake failed", result.error));
    }
    return ok(result.data);
  };

  const networkSupply = async (): Promise<Result<NetworkSupply>> => {
    const result = await context.mirror.network.getSupply();
    if (!result.success) {
      return err(mapMirrorError("Mirror network.getSupply failed", result.error));
    }
    return ok(result.data);
  };

  const balancesSnapshot = async (
    params?: BalancesListParams,
  ): Promise<Result<BalancesResponse>> => {
    const result = await context.mirror.balance.getBalances(params);
    if (!result.success) {
      return err(mapMirrorError("Mirror balance.getBalances failed", result.error));
    }
    return ok(result.data);
  };

  const balancesList = async (
    params?: BalancesListParams,
  ): Promise<Result<ReadPage<AccountBalance>>> => {
    const result = await context.mirror.balance.listPaginatedPage(withLimit(params));
    return readMirrorPage(result, "Mirror balance.listPaginatedPage failed");
  };

  const balancesListPageByUrl = async (url: string): Promise<Result<ReadPage<AccountBalance>>> => {
    const result = await context.mirror.balance.listPaginatedPageByUrl(url);
    return readMirrorPage(result, "Mirror balance.listPaginatedPageByUrl failed");
  };

  const blocksSnapshot = async (params?: BlocksListParams): Promise<Result<BlocksResponse>> => {
    const result = await context.mirror.block.getBlocks(params);
    if (!result.success) {
      return err(mapMirrorError("Mirror block.getBlocks failed", result.error));
    }
    return ok(result.data);
  };

  const blocksList = async (params?: BlocksListParams): Promise<Result<ReadPage<Block>>> => {
    const result = await context.mirror.block.listPaginatedPage(withLimit(params));
    return readMirrorPage(result, "Mirror block.listPaginatedPage failed");
  };

  const blocksListPageByUrl = async (url: string): Promise<Result<ReadPage<Block>>> => {
    const result = await context.mirror.block.listPaginatedPageByUrl(url);
    return readMirrorPage(result, "Mirror block.listPaginatedPageByUrl failed");
  };

  const blockGet = async (hashOrNumber: string): Promise<Result<Block>> => {
    const result = await context.mirror.block.getBlock(hashOrNumber);
    if (!result.success) {
      return err(mapMirrorError("Mirror block.getBlock failed", result.error));
    }
    return ok(result.data);
  };

  return {
    accounts: {
      list: accountList,
      listPageByUrl: accountListPageByUrl,
      info: accountInfo,
      balances: accountBalances,
      tokens: accountTokens,
      nfts: accountNfts,
      rewards: accountRewards,
      allowances: {
        crypto: accountAllowanceCrypto,
        token: accountAllowanceToken,
        nft: accountAllowanceNft,
      },
      airdrops: {
        outstanding: accountAirdropsOutstanding,
        pending: accountAirdropsPending,
      },
      history: accountHistory,
      transfers: accountTransfers,
    },
    tokens: {
      list: tokenList,
      listPageByUrl: tokenListPageByUrl,
      info: tokenInfo,
      balances: tokenBalances,
      balancesSnapshot: tokenBalancesSnapshot,
      nfts: tokenNfts,
      nft: tokenNft,
      nftTransactions: tokenNftTransactions,
      relationships: tokenRelationships,
      transfers: tokenTransfers,
    },
    contracts: {
      list: contractList,
      listPageByUrl: contractListPageByUrl,
      info: contractInfo,
      call: contractCall,
      results: contractResults,
      result: contractResult,
      state: contractState,
      logs: contractLogs,
      resultsAll: contractResultsAll,
      resultByTransactionIdOrHash: contractResultByTransactionIdOrHash,
      resultActions: contractResultActions,
      resultOpcodes: contractResultOpcodes,
      logsAll: contractLogsAll,
    },
    transactions: {
      get: transactionGet,
      byAccount: transactionByAccount,
      list: transactionList,
      listPageByUrl: transactionListPageByUrl,
      search: transactionSearch,
    },
    topics: {
      list: topicsList,
      listPageByUrl: topicsListPageByUrl,
      info: topicInfo,
      messages: topicMessages,
      message: topicMessage,
      messageByTimestamp: topicMessageByTimestamp,
    },
    schedules: {
      list: schedulesList,
      listPageByUrl: schedulesListPageByUrl,
      info: scheduleInfo,
    },
    network: {
      exchangeRate: networkExchangeRate,
      fees: networkFees,
      nodes: networkNodes,
      nodesPageByUrl: networkNodesPageByUrl,
      stake: networkStake,
      supply: networkSupply,
    },
    balances: {
      snapshot: balancesSnapshot,
      list: balancesList,
      listPageByUrl: balancesListPageByUrl,
    },
    blocks: {
      snapshot: blocksSnapshot,
      list: blocksList,
      listPageByUrl: blocksListPageByUrl,
      get: blockGet,
    },
  };
}
