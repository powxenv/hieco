import type { EntityId } from "@hieco/utils";
import type {
  AccountInfo,
  Balance,
  Block,
  BlocksResponse,
  ContractAction,
  ContractCallResult,
  ContractInfo,
  ContractLog,
  ContractOpcodesResponse,
  ContractResult,
  ContractResultDetails,
  ContractResultsResponse,
  ContractState,
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
  Transaction,
  TransactionDetails,
  TransactionListParams,
  TransactionType,
  Transfer,
  TokenTransfer,
  NftTransfer,
  Topic,
  TopicMessage,
  BalancesResponse,
} from "@hieco/mirror";
import type { Result } from "../../foundation/results.ts";

export interface ReadPage<T> {
  readonly items: ReadonlyArray<T>;
  readonly next?: string;
}

export type AccountHistoryParams = Omit<TransactionListParams, "account" | "account.id">;

export type AccountTransfersParams = AccountHistoryParams;

export type AccountListParams = import("@hieco/mirror").AccountListParams;

export type AccountNftsParams = import("@hieco/mirror").AccountNftsParams;

export type AccountTokenAllowancesParams = PaginationParams & {
  readonly "spender.id"?: EntityId;
  readonly "token.id"?: EntityId;
};

export type AccountNftAllowancesParams = PaginationParams & {
  readonly "account.id"?: EntityId;
  readonly owner?: boolean;
  readonly "token.id"?: EntityId;
};

export type TokenBalancesParams = import("@hieco/mirror").TokenBalancesParams;

export type TokenRelationshipsParams = PaginationParams & { readonly "token.id"?: EntityId };

export type TokenTransfersParams = TransactionListParams;

export type TokenListParams = import("@hieco/mirror").TokenListParams;

export type TokenNftsParams = import("@hieco/mirror").TokenNftsParams;

export type ContractListParams = import("@hieco/mirror").ContractListParams;

export type ContractResultsParams = import("@hieco/mirror").ContractResultsParams;

export type ContractStateParams = import("@hieco/mirror").ContractStateParams;

export type ContractLogsParams = import("@hieco/mirror").ContractLogsParams;

export type TransactionSearchParams = TransactionListParams;

export type TransactionsByAccountParams = import("@hieco/mirror").TransactionsByAccountParams;

export type TopicMessagesParams = import("@hieco/mirror").TopicMessagesParams;

export type ScheduleListParams = import("@hieco/mirror").ScheduleListParams;

export type NetworkNodesParams = PaginationParams & {
  readonly "file.id"?: number;
  readonly "node.id"?: number;
};

export type BalancesListParams = import("@hieco/mirror").BalancesListParams;

export type BlocksListParams = import("@hieco/mirror").BlocksListParams;

export interface AccountTransferActivity {
  readonly transactionId: string;
  readonly consensusTimestamp: string;
  readonly name: TransactionType;
  readonly result: string;
  readonly transfers: ReadonlyArray<Transfer>;
  readonly tokenTransfers: ReadonlyArray<TokenTransfer>;
  readonly nftTransfers: ReadonlyArray<NftTransfer>;
}

export interface TokenTransferActivity {
  readonly tokenId: EntityId;
  readonly transactionId: string;
  readonly consensusTimestamp: string;
  readonly name: TransactionType;
  readonly result: string;
  readonly tokenTransfers: ReadonlyArray<TokenTransfer>;
  readonly nftTransfers: ReadonlyArray<NftTransfer>;
}

export interface ReadsNamespace {
  readonly accounts: {
    readonly list: (params?: AccountListParams) => Promise<Result<ReadPage<AccountInfo>>>;
    readonly listPageByUrl: (url: string) => Promise<Result<ReadPage<AccountInfo>>>;
    readonly info: (
      accountId: EntityId,
      params?: { readonly timestamp?: Timestamp; readonly transactions?: boolean },
    ) => Promise<Result<AccountInfo>>;
    readonly balances: (accountId: EntityId) => Promise<Result<Balance>>;
    readonly tokens: (
      accountId: EntityId,
      params?: TokenRelationshipsParams,
    ) => Promise<Result<ReadPage<TokenRelationship>>>;
    readonly nfts: (
      accountId: EntityId,
      params?: AccountNftsParams,
    ) => Promise<Result<ReadPage<TokenRelationship>>>;
    readonly rewards: (
      accountId: EntityId,
      params?: PaginationParams & { readonly timestamp?: Timestamp },
    ) => Promise<Result<ReadPage<StakingReward>>>;
    readonly allowances: {
      readonly crypto: (
        accountId: EntityId,
        params?: PaginationParams & { readonly "spender.id"?: EntityId },
      ) => Promise<Result<ReadPage<CryptoAllowance>>>;
      readonly token: (
        accountId: EntityId,
        params?: AccountTokenAllowancesParams,
      ) => Promise<Result<ReadPage<TokenAllowance>>>;
      readonly nft: (
        accountId: EntityId,
        params?: AccountNftAllowancesParams,
      ) => Promise<Result<ReadPage<NftAllowance>>>;
    };
    readonly airdrops: {
      readonly outstanding: (
        accountId: EntityId,
        params?: {
          readonly limit?: number;
          readonly order?: "asc" | "desc";
          readonly "receiver.id"?: EntityId;
          readonly serial_number?: number;
          readonly "token.id"?: EntityId;
        },
      ) => Promise<Result<TokenAirdropsResponse>>;
      readonly pending: (
        accountId: EntityId,
        params?: {
          readonly limit?: number;
          readonly order?: "asc" | "desc";
          readonly "sender.id"?: EntityId;
          readonly serial_number?: number;
          readonly "token.id"?: EntityId;
        },
      ) => Promise<Result<TokenAirdropsResponse>>;
    };
    readonly history: (
      accountId: EntityId,
      params?: AccountHistoryParams,
    ) => Promise<Result<ReadPage<Transaction>>>;
    readonly transfers: (
      accountId: EntityId,
      params?: AccountTransfersParams,
    ) => Promise<Result<ReadPage<AccountTransferActivity>>>;
  };
  readonly tokens: {
    readonly list: (params?: TokenListParams) => Promise<Result<ReadPage<TokenInfo>>>;
    readonly listPageByUrl: (url: string) => Promise<Result<ReadPage<TokenInfo>>>;
    readonly info: (
      tokenId: EntityId,
      params?: { readonly timestamp?: Timestamp },
    ) => Promise<Result<TokenInfo>>;
    readonly balances: (
      tokenId: EntityId,
      params?: TokenBalancesParams,
    ) => Promise<Result<ReadPage<TokenDistribution>>>;
    readonly balancesSnapshot: (
      tokenId: EntityId,
      params?: TokenBalancesParams,
    ) => Promise<Result<import("@hieco/mirror").TokenBalancesResponse>>;
    readonly nfts: (tokenId: EntityId, params?: TokenNftsParams) => Promise<Result<ReadPage<Nft>>>;
    readonly nft: (tokenId: EntityId, serial: number) => Promise<Result<Nft>>;
    readonly nftTransactions: (
      tokenId: EntityId,
      serial: number,
      params?: PaginationParams & { readonly timestamp?: Timestamp },
    ) => Promise<Result<ReadPage<Transaction>>>;
    readonly relationships: (
      accountId: EntityId,
      params?: TokenRelationshipsParams,
    ) => Promise<Result<ReadPage<TokenRelationship>>>;
    readonly transfers: (
      tokenId: EntityId,
      params?: TokenTransfersParams,
    ) => Promise<Result<ReadPage<TokenTransferActivity>>>;
  };
  readonly contracts: {
    readonly list: (params?: ContractListParams) => Promise<Result<ReadPage<ContractInfo>>>;
    readonly listPageByUrl: (url: string) => Promise<Result<ReadPage<ContractInfo>>>;
    readonly info: (
      contractIdOrAddress: EntityId | string,
      params?: { readonly timestamp?: Timestamp },
    ) => Promise<Result<ContractInfo>>;
    readonly call: (
      params: import("@hieco/mirror").ContractCallParams,
    ) => Promise<Result<ContractCallResult>>;
    readonly results: (
      contractId: EntityId,
      params?: ContractResultsParams,
    ) => Promise<Result<ReadPage<ContractResult>>>;
    readonly result: (
      contractId: EntityId,
      timestamp: Timestamp,
    ) => Promise<Result<ContractResult>>;
    readonly state: (
      contractId: EntityId,
      params?: ContractStateParams,
    ) => Promise<Result<ReadPage<ContractState>>>;
    readonly logs: (
      contractId: EntityId,
      params?: ContractLogsParams,
    ) => Promise<Result<ReadPage<ContractLog>>>;
    readonly resultsAll: (params?: {
      readonly limit?: number;
      readonly order?: "asc" | "desc";
      readonly from?: string;
      readonly block_hash?: string;
      readonly block_number?: number;
      readonly internal?: boolean;
      readonly timestamp?: Timestamp;
      readonly transaction_index?: number;
    }) => Promise<Result<ContractResultsResponse>>;
    readonly resultByTransactionIdOrHash: (
      transactionIdOrHash: string,
      params?: { readonly nonce?: number },
    ) => Promise<Result<ContractResultDetails>>;
    readonly resultActions: (
      transactionIdOrHash: string,
      params?: PaginationParams & { readonly index?: number },
    ) => Promise<Result<{ readonly actions: ReadonlyArray<ContractAction> }>>;
    readonly resultOpcodes: (
      transactionIdOrHash: string,
      params?: { readonly stack?: boolean; readonly memory?: boolean; readonly storage?: boolean },
    ) => Promise<Result<ContractOpcodesResponse>>;
    readonly logsAll: (
      params?: PaginationParams & {
        readonly index?: number;
        readonly timestamp?: Timestamp;
        readonly topic0?: string;
        readonly topic1?: string;
        readonly topic2?: string;
        readonly topic3?: string;
        readonly "transaction.hash"?: string;
      },
    ) => Promise<Result<ReadPage<ContractLog>>>;
  };
  readonly transactions: {
    readonly get: (
      transactionId: string,
      params?: { readonly nonce?: number; readonly scheduled?: boolean },
    ) => Promise<Result<TransactionDetails>>;
    readonly byAccount: (
      accountId: EntityId,
      params?: TransactionsByAccountParams,
    ) => Promise<Result<ReadPage<Transaction>>>;
    readonly list: (params?: TransactionSearchParams) => Promise<Result<ReadPage<Transaction>>>;
    readonly listPageByUrl: (url: string) => Promise<Result<ReadPage<Transaction>>>;
    readonly search: (params?: TransactionSearchParams) => Promise<Result<ReadPage<Transaction>>>;
  };
  readonly topics: {
    readonly list: (params?: PaginationParams) => Promise<Result<ReadPage<Topic>>>;
    readonly listPageByUrl: (url: string) => Promise<Result<ReadPage<Topic>>>;
    readonly info: (topicId: EntityId) => Promise<Result<Topic>>;
    readonly messages: (
      topicId: EntityId,
      params?: TopicMessagesParams,
    ) => Promise<Result<ReadPage<TopicMessage>>>;
    readonly message: (topicId: EntityId, sequenceNumber: number) => Promise<Result<TopicMessage>>;
    readonly messageByTimestamp: (timestamp: string) => Promise<Result<TopicMessage>>;
  };
  readonly schedules: {
    readonly list: (params?: ScheduleListParams) => Promise<Result<ReadPage<Schedule>>>;
    readonly listPageByUrl: (url: string) => Promise<Result<ReadPage<Schedule>>>;
    readonly info: (scheduleId: EntityId) => Promise<Result<Schedule>>;
  };
  readonly network: {
    readonly exchangeRate: (params?: {
      readonly timestamp?: Timestamp;
    }) => Promise<Result<ExchangeRate>>;
    readonly fees: (
      params?: PaginationParams & { readonly timestamp?: Timestamp },
    ) => Promise<Result<NetworkFee>>;
    readonly nodes: (params?: NetworkNodesParams) => Promise<Result<ReadPage<NetworkNode>>>;
    readonly nodesPageByUrl: (url: string) => Promise<Result<ReadPage<NetworkNode>>>;
    readonly stake: () => Promise<Result<NetworkStake>>;
    readonly supply: () => Promise<Result<NetworkSupply>>;
  };
  readonly balances: {
    readonly snapshot: (params?: BalancesListParams) => Promise<Result<BalancesResponse>>;
    readonly list: (
      params?: BalancesListParams,
    ) => Promise<Result<ReadPage<import("@hieco/mirror").AccountBalance>>>;
    readonly listPageByUrl: (
      url: string,
    ) => Promise<Result<ReadPage<import("@hieco/mirror").AccountBalance>>>;
  };
  readonly blocks: {
    readonly snapshot: (params?: BlocksListParams) => Promise<Result<BlocksResponse>>;
    readonly list: (params?: BlocksListParams) => Promise<Result<ReadPage<Block>>>;
    readonly listPageByUrl: (url: string) => Promise<Result<ReadPage<Block>>>;
    readonly get: (hashOrNumber: string) => Promise<Result<Block>>;
  };
}
