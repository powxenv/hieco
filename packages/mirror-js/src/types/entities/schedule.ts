import type { EntityId, Timestamp, Key } from "../rest-api";

export interface ScheduleSignature {
  readonly consensus_timestamp: Timestamp;
  readonly public_key_prefix: string;
  readonly signature: string;
  readonly type: "CONTRACT" | "ED25519" | "RSA_3072" | "ECDSA_384" | "ECDSA_SECP256K1" | "UNKNOWN";
}

export interface Schedule {
  readonly admin_key: Key | null;
  readonly consensus_timestamp: Timestamp;
  readonly creator_account_id: EntityId;
  readonly deleted: boolean;
  readonly executed_timestamp: Timestamp | null;
  readonly expiration_time: Timestamp | null;
  readonly memo: string;
  readonly payer_account_id: EntityId;
  readonly schedule_id: EntityId;
  readonly signatures: readonly ScheduleSignature[];
  readonly transaction_body: string;
  readonly wait_for_expiry: boolean;
}
