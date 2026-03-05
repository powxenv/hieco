import type { EntityId } from "@hieco/utils";
import type { TransactionDescriptor } from "../../foundation/params.ts";
import type {
  FileContentsData,
  FileInfoData,
  FileReceipt,
  FileChunkedReceipt,
  TransactionReceiptData,
} from "../../foundation/results-shapes.ts";
import type { Result } from "../../foundation/results.ts";

export interface FilesNamespace {
  create: ((
    params: import("../../foundation/params.ts").CreateFileParams,
  ) => Promise<Result<FileReceipt>>) & {
    tx: (params: import("../../foundation/params.ts").CreateFileParams) => TransactionDescriptor;
  };
  append: ((
    params: import("../../foundation/params.ts").AppendFileParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../../foundation/params.ts").AppendFileParams) => TransactionDescriptor;
  };
  update: ((
    params: import("../../foundation/params.ts").UpdateFileParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../../foundation/params.ts").UpdateFileParams) => TransactionDescriptor;
  };
  delete: ((
    params: import("../../foundation/params.ts").DeleteFileParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../../foundation/params.ts").DeleteFileParams) => TransactionDescriptor;
  };
  upload: (
    params: import("../../foundation/params.ts").UploadFileParams,
  ) => Promise<Result<FileChunkedReceipt>>;
  updateLarge: (
    params: import("../../foundation/params.ts").UpdateLargeFileParams,
  ) => Promise<Result<FileChunkedReceipt>>;
  info: (fileId: EntityId) => Promise<Result<FileInfoData>>;
  contents: (fileId: EntityId) => Promise<Result<FileContentsData>>;
  contentsText: (
    fileId: EntityId,
  ) => Promise<Result<{ readonly fileId: EntityId; readonly text: string }>>;
  contentsJson: <T = unknown>(
    fileId: EntityId,
  ) => Promise<Result<{ readonly fileId: EntityId; readonly json: T }>>;
}
