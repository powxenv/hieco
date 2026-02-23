import type { EntityId, Timestamp, Key } from "../rest-api";

export interface Transfer {
  readonly account: EntityId;
  readonly amount: number;
  readonly is_approval: boolean;
}

export interface TokenTransfer {
  readonly token_id: EntityId;
  readonly account: EntityId;
  readonly amount: number;
  readonly is_approval: boolean;
}

export interface NftTransfer {
  readonly is_approval: boolean;
  readonly receiver_account_id: EntityId;
  readonly sender_account_id: EntityId;
  readonly token_id: EntityId;
  readonly serial_number: number;
}

export interface StakingRewardTransfer {
  readonly account: EntityId;
  readonly amount: number;
}

export interface Transaction {
  readonly batch_key: Key | null;
  readonly bytes: string | null;
  readonly charged_tx_fee: number;
  readonly consensus_timestamp: Timestamp;
  readonly entity_id: EntityId | null;
  readonly max_fee: string;
  readonly memo_base64: string | null;
  readonly name: TransactionType;
  readonly nft_transfers: readonly NftTransfer[];
  readonly node: EntityId;
  readonly nonce: number | null;
  readonly parent_consensus_timestamp: Timestamp | null;
  readonly result: string;
  readonly scheduled: boolean;
  readonly staking_reward_transfers: readonly StakingRewardTransfer[];
  readonly token_transfers: readonly TokenTransfer[];
  readonly transaction_hash: string;
  readonly transaction_id: string;
  readonly transfers: readonly Transfer[];
  readonly valid_duration_seconds: string;
  readonly valid_start_timestamp: Timestamp;
}

export interface TransactionDetails extends Transaction {
  readonly assessed_custom_fees: readonly AssessedCustomFee[];
}

export interface AssessedCustomFee {
  readonly amount: number;
  readonly collector_account_id: EntityId;
  readonly effective_payer_account_ids: readonly EntityId[];
  readonly token_id: EntityId | null;
}

export type TransactionType =
  | "ATOMICBATCH"
  | "CONSENSUSCREATETOPIC"
  | "CONSENSUSDELETETOPIC"
  | "CONSENSUSSUBMITMESSAGE"
  | "CONSENSUSUPDATETOPIC"
  | "CONTRACTCALL"
  | "CONTRACTCREATEINSTANCE"
  | "CONTRACTDELETEINSTANCE"
  | "CONTRACTUPDATEINSTANCE"
  | "CRYPTOCREATEACCOUNT"
  | "CRYPTODELETE"
  | "CRYPTODELETEALLOWANCE"
  | "CRYPTOTRANSFER"
  | "CRYPTOUPDATEACCOUNT"
  | "ETHEREUMTRANSACTION"
  | "FILEAPPEND"
  | "FILECREATE"
  | "FILEDELETE"
  | "FILEUPDATE"
  | "FREEZEACCOUNT"
  | "KYCAWARDTOKEN"
  | "KYCBURNTOKEN"
  | "KYCREVOKETOKENKYC"
  | "KYCTOKENASSOCIATE"
  | "KYCTOKENDISSOCIATE"
  | "SCHEDULECREATE"
  | "SCHEDULEDELETE"
  | "SYSTEMDELETE"
  | "SYSTEMUNDELETE"
  | "TOKENASSOCIATE"
  | "TOKENBURN"
  | "TOKENCREATION"
  | "TOKENDELETE"
  | "TOKENDISSOCIATE"
  | "TOKENFREEZEACCOUNT"
  | "TOKENGRANTKYC"
  | "TOKENMINT"
  | "TOKENPAUSE"
  | "TOKENREVOKEKYC"
  | "TOKENSEIZE"
  | "TOKENUNFREEZEACCOUNT"
  | "TOKENUNPAUSE"
  | "TOKENUPDATE"
  | "TOKENWIPE";
