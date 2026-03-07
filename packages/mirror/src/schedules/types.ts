import type { Key } from "@hieco/utils";

export interface ScheduleSignature {
  readonly consensus_timestamp: string;
  readonly public_key_prefix: string;
  readonly signature: string;
  readonly type: "CONTRACT" | "ED25519" | "RSA_3072" | "ECDSA_384" | "ECDSA_SECP256K1" | "UNKNOWN";
}

export interface Schedule {
  readonly admin_key: Key | null;
  readonly consensus_timestamp: string;
  readonly creator_account_id: string;
  readonly deleted: boolean;
  readonly executed_timestamp: string | null;
  readonly expiration_time: string | null;
  readonly memo: string;
  readonly payer_account_id: string;
  readonly schedule_id: string;
  readonly signatures: readonly ScheduleSignature[];
  readonly transaction_body: string;
  readonly wait_for_expiry: boolean;
}
