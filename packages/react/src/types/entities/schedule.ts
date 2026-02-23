import type { EntityId, Timestamp, Key } from "../rest-api";

export interface ScheduleSignature {
  consensus_timestamp: Timestamp;
  public_key_prefix: string;
  signature: string;
  type: "CONTRACT" | "ED25519" | "RSA_3072" | "ECDSA_384" | "ECDSA_SECP256K1" | "UNKNOWN";
}

export interface Schedule {
  admin_key: Key | null;
  consensus_timestamp: Timestamp;
  creator_account_id: EntityId;
  deleted: boolean;
  executed_timestamp: Timestamp | null;
  expiration_time: Timestamp | null;
  memo: string;
  payer_account_id: EntityId;
  schedule_id: EntityId;
  signatures: ScheduleSignature[];
  transaction_body: string;
  wait_for_expiry: boolean;
}
