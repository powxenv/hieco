import type { TransactionDescriptor } from "../../foundation/params.ts";
import type {
  FileContentsData,
  FileInfoData,
  FileReceipt,
  FileChunkedReceipt,
  TransactionReceiptData,
} from "../../foundation/results-shapes.ts";
import type { Result } from "../../foundation/results.ts";
import { ok } from "../../foundation/results.ts";
import { ensureFileId } from "../transactions/api.ts";
import { err } from "../../foundation/results.ts";
import type {
  AppendFileParams,
  CreateFileParams,
  DeleteFileParams,
  UpdateFileParams,
  UploadFileParams,
  UpdateLargeFileParams,
} from "../../foundation/params.ts";
import type { FilesNamespace } from "./namespace.ts";
import type { EntityId } from "@hieco/utils";
import { createError } from "../../foundation/errors.ts";

export function createFilesNamespace(context: {
  readonly submit: (descriptor: TransactionDescriptor) => Promise<Result<TransactionReceiptData>>;
  readonly queryFileInfo: (
    fileId: EntityId,
  ) => Promise<Result<import("@hiero-ledger/sdk").FileInfo>>;
  readonly queryFileContents: (fileId: EntityId) => Promise<Result<Uint8Array>>;
}): FilesNamespace {
  const defaultChunkSize = 2048;

  const toBytes = (input: Uint8Array | string): Uint8Array =>
    typeof input === "string" ? new TextEncoder().encode(input) : input;

  const splitChunks = (data: Uint8Array, chunkSize: number): ReadonlyArray<Uint8Array> => {
    if (data.length === 0) return [new Uint8Array()];
    if (chunkSize <= 0) return [data];
    const chunks: Uint8Array[] = [];
    for (let offset = 0; offset < data.length; offset += chunkSize) {
      chunks.push(data.subarray(offset, offset + chunkSize));
    }
    return chunks;
  };
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

  const contentsText = async (
    fileId: EntityId,
  ): Promise<Result<{ readonly fileId: EntityId; readonly text: string }>> => {
    const result = await contents(fileId);
    if (!result.ok) return result;
    const text = new TextDecoder().decode(result.value.contents);
    return ok({ fileId, text });
  };

  const contentsJson = async <T = unknown>(
    fileId: EntityId,
  ): Promise<Result<{ readonly fileId: EntityId; readonly json: T }>> => {
    const text = await contentsText(fileId);
    if (!text.ok) return text;
    try {
      const json = JSON.parse(text.value.text) as T;
      return ok({ fileId, json });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON";
      return err(
        createError("FILE_QUERY_FAILED", `File contents JSON parse failed: ${message}`, {
          hint: "Ensure file contents contain valid JSON",
          details: { fileId },
        }),
      );
    }
  };

  const upload = async (params: UploadFileParams): Promise<Result<FileChunkedReceipt>> => {
    const chunkSize = params.chunkSize ?? defaultChunkSize;
    if (chunkSize <= 0) {
      return err(
        createError("UNEXPECTED_ERROR", "Chunk size must be greater than 0", {
          hint: "Provide a chunkSize greater than zero",
        }),
      );
    }
    const bytes = toBytes(params.contents);
    const chunks = splitChunks(bytes, chunkSize);
    const first = chunks[0] ?? new Uint8Array();
    const rest = chunks.length > 1 ? chunks.slice(1) : [];

    const createResult = await create({
      contents: first,
      ...(params.keys ? { keys: params.keys } : {}),
      ...(params.expirationTime ? { expirationTime: params.expirationTime } : {}),
      ...(params.memo ? { memo: params.memo } : {}),
      ...(params.maxFee !== undefined ? { maxFee: params.maxFee } : {}),
    });
    if (!createResult.ok) return createResult;

    const fileId = createResult.value.fileId;
    let receipt = createResult.value.receipt;
    let transactionId = createResult.value.transactionId;

    for (const chunk of rest) {
      const appendResult = await append({
        fileId,
        contents: chunk,
        ...(params.memo ? { memo: params.memo } : {}),
        ...(params.maxFee !== undefined ? { maxFee: params.maxFee } : {}),
      });
      if (!appendResult.ok) return appendResult;
      receipt = appendResult.value;
      transactionId = appendResult.value.transactionId;
    }

    return ok({ receipt, transactionId, fileId, chunks: chunks.length });
  };

  const updateLarge = async (
    params: UpdateLargeFileParams,
  ): Promise<Result<FileChunkedReceipt>> => {
    const chunkSize = params.chunkSize ?? defaultChunkSize;
    if (chunkSize <= 0) {
      return err(
        createError("UNEXPECTED_ERROR", "Chunk size must be greater than 0", {
          hint: "Provide a chunkSize greater than zero",
        }),
      );
    }
    const bytes = toBytes(params.contents);
    const chunks = splitChunks(bytes, chunkSize);
    const first = chunks[0] ?? new Uint8Array();
    const rest = chunks.length > 1 ? chunks.slice(1) : [];

    const updateResult = await update({
      fileId: params.fileId,
      contents: first,
      ...(params.memo ? { memo: params.memo } : {}),
      ...(params.maxFee !== undefined ? { maxFee: params.maxFee } : {}),
    });
    if (!updateResult.ok) return updateResult;

    let receipt = updateResult.value;
    let transactionId = updateResult.value.transactionId;

    for (const chunk of rest) {
      const appendResult = await append({
        fileId: params.fileId,
        contents: chunk,
        ...(params.memo ? { memo: params.memo } : {}),
        ...(params.maxFee !== undefined ? { maxFee: params.maxFee } : {}),
      });
      if (!appendResult.ok) return appendResult;
      receipt = appendResult.value;
      transactionId = appendResult.value.transactionId;
    }

    return ok({ receipt, transactionId, fileId: params.fileId, chunks: chunks.length });
  };

  return {
    create,
    append,
    update,
    delete: del,
    upload,
    updateLarge,
    info,
    contents,
    contentsText,
    contentsJson,
  };
}
