import type { Key } from "@hieco/utils";

export interface Transfer {
  readonly account: string;
  readonly amount: number;
  readonly is_approval: boolean;
}

export interface TokenTransfer {
  readonly token_id: string;
  readonly account: string;
  readonly amount: number;
  readonly is_approval: boolean;
}

export interface NftTransfer {
  readonly is_approval: boolean;
  readonly receiver_account_id: string;
  readonly sender_account_id: string;
  readonly token_id: string;
  readonly serial_number: number;
}

export interface StakingRewardTransfer {
  readonly account: string;
  readonly amount: number;
}

export interface Transaction {
  readonly batch_key: Key | null;
  readonly bytes: string | null;
  readonly charged_tx_fee: number;
  readonly consensus_timestamp: string;
  readonly entity_id: string | null;
  readonly max_fee: string;
  readonly memo_base64: string | null;
  readonly name: TransactionType;
  readonly nft_transfers: readonly NftTransfer[];
  readonly node: string;
  readonly nonce: number | null;
  readonly parent_consensus_timestamp: string | null;
  readonly result: string;
  readonly scheduled: boolean;
  readonly staking_reward_transfers: readonly StakingRewardTransfer[];
  readonly token_transfers: readonly TokenTransfer[];
  readonly transaction_hash: string;
  readonly transaction_id: string;
  readonly transfers: readonly Transfer[];
  readonly valid_duration_seconds: string;
  readonly valid_start_timestamp: string;
}

export interface TransactionDetails extends Transaction {
  readonly assessed_custom_fees: readonly AssessedCustomFee[];
}

export interface AssessedCustomFee {
  readonly amount: number;
  readonly collector_account_id: string;
  readonly effective_payer_account_ids: readonly string[];
  readonly token_id: string | null;
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
