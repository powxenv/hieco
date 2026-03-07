import type { Amount } from "../shared/amount.ts";

export interface CreateFileParams {
  readonly contents: Uint8Array | string;
  readonly keys?: ReadonlyArray<string>;
  readonly expirationTime?: Date;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface AppendFileParams {
  readonly fileId: string;
  readonly contents: Uint8Array | string;
  readonly maxChunks?: number;
  readonly chunkSize?: number;
  readonly memo?: string;
  readonly maxFee?: Amount;
}

export interface UpdateFileParams {
  readonly fileId: string;
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
  readonly fileId: string;
  readonly contents: Uint8Array | string;
  readonly memo?: string;
  readonly maxFee?: Amount;
  readonly chunkSize?: number;
}

export interface DeleteFileParams {
  readonly fileId: string;
  readonly memo?: string;
  readonly maxFee?: Amount;
}
