import type { EntityId } from "@hieco/utils";
import type { Amount } from "../shared/amount.ts";

export interface CreateFileParams {
  readonly contents: Uint8Array | string;
  readonly keys?: ReadonlyArray<string>;
  readonly expirationTime?: Date;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface AppendFileParams {
  readonly fileId: EntityId;
  readonly contents: Uint8Array | string;
  readonly maxChunks?: number;
  readonly chunkSize?: number;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface UpdateFileParams {
  readonly fileId: EntityId;
  readonly contents?: Uint8Array | string;
  readonly keys?: ReadonlyArray<string>;
  readonly expirationTime?: Date;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface UploadFileParams {
  readonly contents: Uint8Array | string;
  readonly keys?: ReadonlyArray<string>;
  readonly expirationTime?: Date;
  readonly memo?: string;
  readonly maxFee?: Amount;
  readonly chunkSize?: number;
}

export interface UpdateLargeFileParams {
  readonly fileId: EntityId;
  readonly contents: Uint8Array | string;
  readonly memo?: string;
  readonly maxFee?: Amount;
  readonly chunkSize?: number;
}

export interface DeleteFileParams {
  readonly fileId: EntityId;
  readonly memo?: string;
  readonly maxFee?: Amount;
}
