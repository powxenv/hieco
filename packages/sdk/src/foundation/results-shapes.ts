import type { EntityId } from "@hieco/utils";
import type {
  AccountInfo,
  ContractInfo,
  ContractLog,
  Schedule,
  TokenInfo,
  Topic,
  TopicMessage,
} from "@hieco/mirror";
import type {
  FileInfo,
  TransactionRecord,
  TransactionReceipt,
  TokenNftInfo,
  NetworkVersionInfo,
  NodeAddressBook,
} from "@hiero-ledger/sdk";

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

export interface ContractCallResult<T = unknown> {
  readonly contractId: EntityId;
  readonly gasUsed: number;
  readonly errorMessage: string;
  readonly raw: Uint8Array;
  readonly value: T;
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

export interface FileChunkedReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly fileId: EntityId;
  readonly chunks: number;
}

export interface AccountInfoData {
  readonly accountId: EntityId;
  readonly account: AccountInfo;
}

export interface TokenInfoData {
  readonly tokenId: EntityId;
  readonly token: TokenInfo;
}

export interface ContractInfoData {
  readonly contractId: EntityId;
  readonly contract: ContractInfo;
}

export interface ContractLogsData {
  readonly contractId: EntityId;
  readonly logs: ReadonlyArray<ContractLog>;
}

export interface TopicInfoData {
  readonly topicId: EntityId;
  readonly topic: Topic;
}

export interface TopicMessagesData {
  readonly topicId: EntityId;
  readonly messages: ReadonlyArray<TopicMessage>;
}

export interface FileInfoData {
  readonly fileId: EntityId;
  readonly info: FileInfo;
}

export interface FileContentsData {
  readonly fileId: EntityId;
  readonly contents: Uint8Array;
}

export interface ScheduleInfoData {
  readonly scheduleId: EntityId;
  readonly schedule: Schedule;
}

export interface TransactionRecordData {
  readonly transactionId: string;
  readonly record: TransactionRecord;
}

export interface TransactionReceiptQueryData {
  readonly transactionId: string;
  readonly receipt: TransactionReceipt;
}

export interface AccountRecordsData {
  readonly accountId: EntityId;
  readonly records: ReadonlyArray<TransactionRecord>;
}

export interface ContractBytecodeData {
  readonly contractId: EntityId;
  readonly bytecode: Uint8Array;
}

export interface TokenNftInfoData {
  readonly nftId: string;
  readonly nfts: ReadonlyArray<TokenNftInfo>;
}

export interface NetworkVersionData {
  readonly info: NetworkVersionInfo;
}

export interface AddressBookData {
  readonly book: NodeAddressBook;
}

export interface MirrorContractCallData {
  readonly contractId: EntityId;
  readonly raw: string;
  readonly bytes: Uint8Array;
}

export interface MirrorContractEstimateData {
  readonly contractId: EntityId;
  readonly gas: number;
}
