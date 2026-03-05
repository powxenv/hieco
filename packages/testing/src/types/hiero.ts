import type {
  Client,
  Status,
  Hbar,
  AccountId,
  TokenId,
  ContractId,
  TopicId,
  PrivateKey,
  PublicKey,
} from "@hiero-ledger/sdk";
import type { EntityId } from "@hieco/types";

export type {
  Client,
  Status,
  Hbar,
  AccountId,
  TokenId,
  ContractId,
  TopicId,
  PrivateKey,
  PublicKey,
  EntityId,
};

export const ENTITY_ID_REGEX = /^(\d{1,10})\.(\d{1,10})\.(\d{1,10})$/;

export type EntityNum = `${number}.${number}.${number}`;

export const parseEntityId = (value: string): EntityId | null => {
  if (!ENTITY_ID_REGEX.test(value)) return null;
  return value as EntityId;
};

export interface AccountState {
  accountId: EntityId;
  balance: Hbar;
  key?: string;
  alias?: string;
  autoRenewPeriod?: number;
  receiverSigRequired: boolean;
  deleted: boolean;
}

export interface TokenState {
  tokenId: EntityId;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  treasury: EntityId;
  adminKey?: string;
  kycKey?: string;
  freezeKey?: string;
  wipeKey?: string;
  supplyKey?: string;
  pauseKey?: string;
  feeScheduleKey?: string;
  paused: boolean;
  deleted: boolean;
}

export interface TokenAssociation {
  accountId: EntityId;
  tokenId: EntityId;
  balance: bigint;
  kycGranted: boolean;
  frozen: boolean;
}

export interface ContractState {
  contractId: EntityId;
  bytecode: string;
  adminKey?: string;
  autoRenewAccount?: EntityId;
  memo?: string;
  deleted: boolean;
}

export interface ContractCallInput {
  functionName: string;
  args: readonly unknown[];
  result: unknown;
  gasUsed: bigint;
}

export interface ContractCall {
  contractId: EntityId;
  functionName: string;
  args: readonly unknown[];
  result: unknown;
  gasUsed: bigint;
  timestamp: Date;
}

export interface TopicState {
  topicId: EntityId;
  memo?: string;
  adminKey?: string;
  submitKey?: string;
  runningHash: Uint8Array;
  sequenceNumber: bigint;
  autoRenewAccount?: EntityId;
  deleted: boolean;
}

export interface TopicMessage {
  topicId: EntityId;
  sequenceNumber: bigint;
  message: Uint8Array;
  timestamp: Date;
}

export const enum SnapshotStateKind {
  IDLE = "idle",
  CAPTURED = "captured",
  RESTORED = "restored",
}

export interface Snapshot {
  accounts: Map<EntityId, AccountState>;
  tokens: Map<EntityId, TokenState>;
  associations: Map<TokenAssociationKey, TokenAssociation>;
  contracts: Map<EntityId, ContractState>;
  topics: Map<EntityId, TopicState>;
  messages: Map<EntityId, readonly TopicMessage[]>;
  timestamp: Date;
}

export type TokenAssociationKey = `${EntityId}:${EntityId}`;

export interface TransactionReceipt {
  status: Status;
  accountId?: AccountId;
  tokenId?: TokenId;
  contractId?: ContractId;
  topicId?: TopicId;
  exchangeRate?: { hbars: number; cents: number };
  scheduleId?: unknown;
  totalSupply?: bigint;
  serials?: readonly bigint[];
}

export interface TransactionRecord {
  receipt: TransactionReceipt;
  transactionHash: Uint8Array;
  transactionId: string;
  consensusTimestamp: Date;
  transactionFee: Hbar;
  memo?: string;
}

export type AccountIdString = string;
export type TokenIdString = string;
export type ContractIdString = string;
export type TopicIdString = string;
