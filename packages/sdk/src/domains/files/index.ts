import type {
  AppendFileParams,
  CreateFileParams,
  DeleteFileParams,
  TransactionDescriptor,
  UpdateFileParams,
} from "../../shared/params.ts";
import type {
  FileContentsData,
  FileInfoData,
  FileReceipt,
  TransactionReceiptData,
} from "../../shared/results-shapes.ts";
import type { Result } from "../../shared/results.ts";
import { ok } from "../../shared/results.ts";
import { ensureFileId } from "../transactions/index.ts";
import { err } from "../../shared/results.ts";
import type { EntityId } from "@hieco/types";

export interface FilesNamespace {
  create: ((params: CreateFileParams) => Promise<Result<FileReceipt>>) & {
    tx: (params: CreateFileParams) => TransactionDescriptor;
  };
  append: ((params: AppendFileParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: AppendFileParams) => TransactionDescriptor;
  };
  update: ((params: UpdateFileParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: UpdateFileParams) => TransactionDescriptor;
  };
  delete: ((params: DeleteFileParams) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: DeleteFileParams) => TransactionDescriptor;
  };
  info: (fileId: EntityId) => Promise<Result<FileInfoData>>;
  contents: (fileId: EntityId) => Promise<Result<FileContentsData>>;
}

export function createFilesNamespace(context: {
  readonly submit: (descriptor: TransactionDescriptor) => Promise<Result<TransactionReceiptData>>;
  readonly queryFileInfo: (
    fileId: EntityId,
  ) => Promise<Result<import("@hiero-ledger/sdk").FileInfo>>;
  readonly queryFileContents: (fileId: EntityId) => Promise<Result<Uint8Array>>;
}): FilesNamespace {
  const create = async (params: CreateFileParams): Promise<Result<FileReceipt>> => {
    const result = await context.submit({ kind: "files.create", params });
    if (!result.ok) return result;
    const fileId = ensureFileId(result);
    if (!fileId.ok) return fileId;
    return ok({
      receipt: result.value,
      transactionId: result.value.transactionId,
      fileId: fileId.value,
    });
  };

  create.tx = (params: CreateFileParams): TransactionDescriptor => ({
    kind: "files.create",
    params,
  });

  const append = async (params: AppendFileParams): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "files.append", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  append.tx = (params: AppendFileParams): TransactionDescriptor => ({
    kind: "files.append",
    params,
  });

  const update = async (params: UpdateFileParams): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "files.update", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  update.tx = (params: UpdateFileParams): TransactionDescriptor => ({
    kind: "files.update",
    params,
  });

  const del = async (params: DeleteFileParams): Promise<Result<TransactionReceiptData>> => {
    const result = await context.submit({ kind: "files.delete", params });
    if (!result.ok) return result;
    return ok(result.value);
  };

  del.tx = (params: DeleteFileParams): TransactionDescriptor => ({
    kind: "files.delete",
    params,
  });

  const info = async (fileId: EntityId): Promise<Result<FileInfoData>> => {
    const result = await context.queryFileInfo(fileId);
    if (!result.ok) return err(result.error);
    return ok({ fileId, info: result.value });
  };

  const contents = async (fileId: EntityId): Promise<Result<FileContentsData>> => {
    const result = await context.queryFileContents(fileId);
    if (!result.ok) return err(result.error);
    return ok({ fileId, contents: result.value });
  };

  return {
    create,
    append,
    update,
    delete: del,
    info,
    contents,
  };
}
