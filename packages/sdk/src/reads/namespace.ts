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
  AccountListParams,
  AccountNftsParams,
  BalancesListParams,
  BlocksListParams,
  ContractListParams,
  ContractLogsParams,
  ContractResultsParams,
  ContractStateParams,
  ScheduleListParams,
  TokenBalancesParams,
  TokenListParams,
  TokenNftsParams,
  TopicMessagesParams,
  TransactionsByAccountParams,
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
import type { Result } from "../results/result.ts";

export type {
  AccountListParams,
  AccountNftsParams,
  BalancesListParams,
  BlocksListParams,
  ContractListParams,
  ContractLogsParams,
  ContractResultsParams,
  ContractStateParams,
  ScheduleListParams,
  TokenBalancesParams,
  TokenListParams,
  TokenNftsParams,
  TopicMessagesParams,
  TransactionsByAccountParams,
} from "@hieco/mirror";

export interface ReadPage<T> {
  readonly items: ReadonlyArray<T>;
  readonly next?: string;
}

export type AccountHistoryParams = Omit<TransactionListParams, "account" | "account.id">;

export type AccountTransfersParams = AccountHistoryParams;

export type AccountTokenAllowancesParams = PaginationParams & {
  readonly "spender.id"?: string;
  readonly "token.id"?: string;
};

export type AccountNftAllowancesParams = PaginationParams & {
  readonly "account.id"?: string;
  readonly owner?: boolean;
  readonly "token.id"?: string;
};

export type TokenRelationshipsParams = PaginationParams & { readonly "token.id"?: string };

export type TokenTransfersParams = TransactionListParams;

export type TransactionSearchParams = TransactionListParams;

export type NetworkNodesParams = PaginationParams & {
  readonly "file.id"?: number;
  readonly "node.id"?: number;
};

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
  readonly tokenId: string;
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
      accountId: string,
      params?: { readonly timestamp?: string; readonly transactions?: boolean },
    ) => Promise<Result<AccountInfo>>;
    readonly balances: (accountId: string) => Promise<Result<Balance>>;
    readonly tokens: (
      accountId: string,
      params?: TokenRelationshipsParams,
    ) => Promise<Result<ReadPage<TokenRelationship>>>;
    readonly nfts: (
      accountId: string,
      params?: AccountNftsParams,
    ) => Promise<Result<ReadPage<TokenRelationship>>>;
    readonly rewards: (
      accountId: string,
      params?: PaginationParams & { readonly timestamp?: string },
    ) => Promise<Result<ReadPage<StakingReward>>>;
    readonly allowances: {
      readonly crypto: (
        accountId: string,
        params?: PaginationParams & { readonly "spender.id"?: string },
      ) => Promise<Result<ReadPage<CryptoAllowance>>>;
      readonly token: (
        accountId: string,
        params?: AccountTokenAllowancesParams,
      ) => Promise<Result<ReadPage<TokenAllowance>>>;
      readonly nft: (
        accountId: string,
        params?: AccountNftAllowancesParams,
      ) => Promise<Result<ReadPage<NftAllowance>>>;
    };
    readonly airdrops: {
      readonly outstanding: (
        accountId: string,
        params?: {
          readonly limit?: number;
          readonly order?: "asc" | "desc";
          readonly "receiver.id"?: string;
          readonly serial_number?: number;
          readonly "token.id"?: string;
        },
      ) => Promise<Result<TokenAirdropsResponse>>;
      readonly pending: (
        accountId: string,
        params?: {
          readonly limit?: number;
          readonly order?: "asc" | "desc";
          readonly "sender.id"?: string;
          readonly serial_number?: number;
          readonly "token.id"?: string;
        },
      ) => Promise<Result<TokenAirdropsResponse>>;
    };
    readonly history: (
      accountId: string,
      params?: AccountHistoryParams,
    ) => Promise<Result<ReadPage<Transaction>>>;
    readonly transfers: (
      accountId: string,
      params?: AccountTransfersParams,
    ) => Promise<Result<ReadPage<AccountTransferActivity>>>;
  };
  readonly tokens: {
    readonly list: (params?: TokenListParams) => Promise<Result<ReadPage<TokenInfo>>>;
    readonly listPageByUrl: (url: string) => Promise<Result<ReadPage<TokenInfo>>>;
    readonly info: (
      tokenId: string,
      params?: { readonly timestamp?: string },
    ) => Promise<Result<TokenInfo>>;
    readonly balances: (
      tokenId: string,
      params?: TokenBalancesParams,
    ) => Promise<Result<ReadPage<TokenDistribution>>>;
    readonly balancesSnapshot: (
      tokenId: string,
      params?: TokenBalancesParams,
    ) => Promise<Result<import("@hieco/mirror").TokenBalancesResponse>>;
    readonly nfts: (tokenId: string, params?: TokenNftsParams) => Promise<Result<ReadPage<Nft>>>;
    readonly nft: (tokenId: string, serial: number) => Promise<Result<Nft>>;
    readonly nftTransactions: (
      tokenId: string,
      serial: number,
      params?: PaginationParams & { readonly timestamp?: string },
    ) => Promise<Result<ReadPage<Transaction>>>;
    readonly relationships: (
      accountId: string,
      params?: TokenRelationshipsParams,
    ) => Promise<Result<ReadPage<TokenRelationship>>>;
    readonly transfers: (
      tokenId: string,
      params?: TokenTransfersParams,
    ) => Promise<Result<ReadPage<TokenTransferActivity>>>;
  };
  readonly contracts: {
    readonly list: (params?: ContractListParams) => Promise<Result<ReadPage<ContractInfo>>>;
    readonly listPageByUrl: (url: string) => Promise<Result<ReadPage<ContractInfo>>>;
    readonly info: (
      contractIdOrAddress: string,
      params?: { readonly timestamp?: string },
    ) => Promise<Result<ContractInfo>>;
    readonly call: (
      params: import("@hieco/mirror").ContractCallParams,
    ) => Promise<Result<ContractCallResult>>;
    readonly results: (
      contractId: string,
      params?: ContractResultsParams,
    ) => Promise<Result<ReadPage<ContractResult>>>;
    readonly result: (contractId: string, timestamp: string) => Promise<Result<ContractResult>>;
    readonly state: (
      contractId: string,
      params?: ContractStateParams,
    ) => Promise<Result<ReadPage<ContractState>>>;
    readonly logs: (
      contractId: string,
      params?: ContractLogsParams,
    ) => Promise<Result<ReadPage<ContractLog>>>;
    readonly resultsAll: (params?: {
      readonly limit?: number;
      readonly order?: "asc" | "desc";
      readonly from?: string;
      readonly block_hash?: string;
      readonly block_number?: number;
      readonly internal?: boolean;
      readonly timestamp?: string;
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
        readonly timestamp?: string;
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
      accountId: string,
      params?: TransactionsByAccountParams,
    ) => Promise<Result<ReadPage<Transaction>>>;
    readonly list: (params?: TransactionSearchParams) => Promise<Result<ReadPage<Transaction>>>;
    readonly listPageByUrl: (url: string) => Promise<Result<ReadPage<Transaction>>>;
    readonly search: (params?: TransactionSearchParams) => Promise<Result<ReadPage<Transaction>>>;
  };
  readonly topics: {
    readonly list: (params?: PaginationParams) => Promise<Result<ReadPage<Topic>>>;
    readonly listPageByUrl: (url: string) => Promise<Result<ReadPage<Topic>>>;
    readonly info: (topicId: string) => Promise<Result<Topic>>;
    readonly messages: (
      topicId: string,
      params?: TopicMessagesParams,
    ) => Promise<Result<ReadPage<TopicMessage>>>;
    readonly message: (topicId: string, sequenceNumber: number) => Promise<Result<TopicMessage>>;
    readonly messageByTimestamp: (timestamp: string) => Promise<Result<TopicMessage>>;
  };
  readonly schedules: {
    readonly list: (params?: ScheduleListParams) => Promise<Result<ReadPage<Schedule>>>;
    readonly listPageByUrl: (url: string) => Promise<Result<ReadPage<Schedule>>>;
    readonly info: (scheduleId: string) => Promise<Result<Schedule>>;
  };
  readonly network: {
    readonly exchangeRate: (params?: {
      readonly timestamp?: string;
    }) => Promise<Result<ExchangeRate>>;
    readonly fees: (
      params?: PaginationParams & { readonly timestamp?: string },
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
