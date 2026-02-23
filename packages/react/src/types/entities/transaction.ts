import type { EntityId, Timestamp, Key } from "../rest-api";

export interface Transfer {
  account: EntityId;
  amount: number;
  is_approval: boolean;
}

export interface TokenTransfer {
  token_id: EntityId;
  account: EntityId;
  amount: number;
  is_approval: boolean;
}

export interface NftTransfer {
  is_approval: boolean;
  receiver_account_id: EntityId;
  sender_account_id: EntityId;
  token_id: EntityId;
  serial_number: number;
}

export interface StakingRewardTransfer {
  account: EntityId;
  amount: number;
}

export interface Transaction {
  batch_key: Key | null;
  bytes: string | null;
  charged_tx_fee: number;
  consensus_timestamp: Timestamp;
  entity_id: EntityId | null;
  max_fee: string;
  memo_base64: string | null;
  name: TransactionType;
  nft_transfers: NftTransfer[];
  node: EntityId;
  nonce: number | null;
  parent_consensus_timestamp: Timestamp | null;
  result: string;
  scheduled: boolean;
  staking_reward_transfers: StakingRewardTransfer[];
  token_transfers: TokenTransfer[];
  transaction_hash: string;
  transaction_id: string;
  transfers: Transfer[];
  valid_duration_seconds: string;
  valid_start_timestamp: Timestamp;
}

export interface TransactionDetails extends Transaction {
  assessed_custom_fees: AssessedCustomFee[];
}

export interface AssessedCustomFee {
  amount: number;
  collector_account_id: EntityId;
  effective_payer_account_ids: EntityId[];
  token_id: EntityId | null;
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
