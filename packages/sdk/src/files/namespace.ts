import type { TransactionDescriptor } from "../shared/params.ts";
import type {
  FileContentsData,
  FileInfoData,
  FileReceipt,
  FileChunkedReceipt,
  TransactionReceiptData,
} from "../results/shapes.ts";
import type { Result } from "../results/result.ts";

export interface FilesNamespace {
  create: ((
    params: import("../shared/params.ts").CreateFileParams,
  ) => Promise<Result<FileReceipt>>) & {
    tx: (params: import("../shared/params.ts").CreateFileParams) => TransactionDescriptor;
  };
  append: ((
    params: import("../shared/params.ts").AppendFileParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").AppendFileParams) => TransactionDescriptor;
  };
  update: ((
    params: import("../shared/params.ts").UpdateFileParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").UpdateFileParams) => TransactionDescriptor;
  };
  delete: ((
    params: import("../shared/params.ts").DeleteFileParams,
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").DeleteFileParams) => TransactionDescriptor;
  };
  upload: (
    params: import("../shared/params.ts").UploadFileParams,
  ) => Promise<Result<FileChunkedReceipt>>;
  updateLarge: (
    params: import("../shared/params.ts").UpdateLargeFileParams,
  ) => Promise<Result<FileChunkedReceipt>>;
  info: (fileId: string) => Promise<Result<FileInfoData>>;
  contents: (fileId: string) => Promise<Result<FileContentsData>>;
  contentsText: (
    fileId: string,
  ) => Promise<Result<{ readonly fileId: string; readonly text: string }>>;
  contentsJson: <T = unknown>(
    fileId: string,
  ) => Promise<Result<{ readonly fileId: string; readonly json: T }>>;
}
