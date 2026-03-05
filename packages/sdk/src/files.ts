import type {
  AppendFileParams,
  CreateFileParams,
  DeleteFileParams,
  TransactionDescriptor,
  UpdateFileParams,
} from "./types/params.ts";
import type { FileReceipt, TransactionReceiptData } from "./types/results-shapes.ts";
import type { Result } from "./types/results.ts";
import { ok } from "./types/results.ts";
import { ensureFileId } from "./transactions.ts";

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
}

export function createFilesNamespace(context: {
  readonly submit: (descriptor: TransactionDescriptor) => Promise<Result<TransactionReceiptData>>;
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

  del.tx = (params: DeleteFileParams): TransactionDescriptor => ({ kind: "files.delete", params });

  return {
    create,
    append,
    update,
    delete: del,
  };
}
