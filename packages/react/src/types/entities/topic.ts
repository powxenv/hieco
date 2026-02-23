import type { EntityId, Timestamp, Key } from "../rest-api";

export interface ChunkInfo {
  readonly initial_transaction_id: string;
  readonly nonce: number;
  readonly number: number;
  readonly total: number;
  readonly scheduled: boolean;
}

export interface FixedCustomFee {
  readonly amount: number;
  readonly collector_account_id: EntityId;
  readonly denominating_token_id: EntityId | null;
}

export interface ConsensusCustomFees {
  readonly created_timestamp: Timestamp;
  readonly fixed_fees: readonly FixedCustomFee[];
}

export interface Topic {
  readonly admin_key: Key | null;
  readonly auto_renew_account: EntityId | null;
  readonly auto_renew_period: number | null;
  readonly created_timestamp: Timestamp | null;
  readonly custom_fees: ConsensusCustomFees;
  readonly deleted: boolean | null;
  readonly fee_exempt_key_list: readonly Key[];
  readonly fee_schedule_key: Key | null;
  readonly memo: string;
  readonly submit_key: Key | null;
  readonly timestamp: Timestamp;
  readonly topic_id: EntityId;
}

export interface TopicMessage {
  readonly chunk_info: ChunkInfo | null;
  readonly consensus_timestamp: Timestamp;
  readonly message: string;
  readonly payer_account_id: EntityId;
  readonly running_hash: string;
  readonly running_hash_version: number;
  readonly sequence_number: number;
  readonly topic_id: EntityId;
}
