import type { EntityId, Timestamp, Key } from "../rest-api";

export interface ChunkInfo {
  initial_transaction_id: string;
  nonce: number;
  number: number;
  total: number;
  scheduled: boolean;
}

export interface FixedCustomFee {
  amount: number;
  collector_account_id: EntityId;
  denominating_token_id: EntityId | null;
}

export interface ConsensusCustomFees {
  created_timestamp: Timestamp;
  fixed_fees: FixedCustomFee[];
}

export interface Topic {
  admin_key: Key | null;
  auto_renew_account: EntityId | null;
  auto_renew_period: number | null;
  created_timestamp: Timestamp | null;
  custom_fees: ConsensusCustomFees;
  deleted: boolean | null;
  fee_exempt_key_list: Key[];
  fee_schedule_key: Key | null;
  memo: string;
  submit_key: Key | null;
  timestamp: Timestamp;
  topic_id: EntityId;
}

export interface TopicMessage {
  chunk_info: ChunkInfo | null;
  consensus_timestamp: Timestamp;
  message: string;
  payer_account_id: EntityId;
  running_hash: string;
  running_hash_version: number;
  sequence_number: number;
  topic_id: EntityId;
}
