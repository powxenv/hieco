import type { EntityId } from "@hieco/utils";
import type { TransactionDescriptor } from "../shared/params.ts";
import type {
  ScheduleInfoData,
  ScheduleReceipt,
  TransactionReceiptData,
} from "../results/shapes.ts";
import type { Result } from "../results/result.ts";
import { err, ok } from "../results/result.ts";
import { createError } from "../errors/error.ts";
import type {
  ScheduleCreateParams,
  ScheduleDeleteParams,
  ScheduleIdempotentCreateParams,
  ScheduleCollectSignaturesParams,
  ScheduleSignParams,
  ScheduleWaitOptions,
  ScheduleWaitExecutionOptions,
} from "../shared/params.ts";
import type { SchedulesNamespace } from "./namespace.ts";
import { ensureScheduleId } from "../transactions/api.ts";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createSchedulesNamespace(context: {
  readonly submit: (descriptor: TransactionDescriptor) => Promise<Result<TransactionReceiptData>>;
  readonly mirror: import("@hieco/mirror").MirrorNodeClient;
  readonly withSigner: (signer: import("@hiero-ledger/sdk").Signer) => {
    readonly submit: (descriptor: TransactionDescriptor) => Promise<Result<TransactionReceiptData>>;
  };
}): SchedulesNamespace {
  const submitWithOptionalSigner = (
    signer: import("@hiero-ledger/sdk").Signer | undefined,
    descriptor: TransactionDescriptor,
  ): Promise<Result<TransactionReceiptData>> => {
    const submit = signer ? context.withSigner(signer).submit : context.submit;
    return submit(descriptor);
  };

  const create = async (params: ScheduleCreateParams): Promise<Result<ScheduleReceipt>> => {
    const result = await context.submit({ kind: "schedules.create", params });
    if (!result.ok) return result;
    const scheduleId = ensureScheduleId(result);
    if (!scheduleId.ok) return scheduleId;
    return ok({
      receipt: result.value,
      transactionId: result.value.transactionId,
      scheduleId: scheduleId.value,
    });
  };

  create.tx = (params: ScheduleCreateParams): TransactionDescriptor => ({
    kind: "schedules.create",
    params,
  });

  const sign = async (
    scheduleId: EntityId,
    params: Omit<ScheduleSignParams, "scheduleId"> & {
      readonly signer?: import("@hiero-ledger/sdk").Signer;
    } = {},
  ): Promise<Result<TransactionReceiptData>> => {
    const scheduleParams: ScheduleSignParams = {
      scheduleId,
      ...(params.memo !== undefined ? { memo: params.memo } : {}),
      ...(params.maxFee !== undefined ? { maxFee: params.maxFee } : {}),
    };
    const result = await submitWithOptionalSigner(params.signer, {
      kind: "schedules.sign",
      params: scheduleParams,
    });
    if (!result.ok) return result;
    return ok(result.value);
  };

  sign.tx = (params: ScheduleSignParams): TransactionDescriptor => ({
    kind: "schedules.sign",
    params,
  });

  const deleteSchedule = async (
    scheduleId: EntityId,
    params: Omit<ScheduleDeleteParams, "scheduleId"> & {
      readonly signer?: import("@hiero-ledger/sdk").Signer;
    } = {},
  ): Promise<Result<TransactionReceiptData>> => {
    const scheduleParams: ScheduleDeleteParams = {
      scheduleId,
      ...(params.memo !== undefined ? { memo: params.memo } : {}),
      ...(params.maxFee !== undefined ? { maxFee: params.maxFee } : {}),
    };
    const result = await submitWithOptionalSigner(params.signer, {
      kind: "schedules.delete",
      params: scheduleParams,
    });
    if (!result.ok) return result;
    return ok(result.value);
  };

  deleteSchedule.tx = (params: ScheduleDeleteParams): TransactionDescriptor => ({
    kind: "schedules.delete",
    params,
  });

  const info = async (scheduleId: EntityId): Promise<Result<ScheduleInfoData>> => {
    const result = await context.mirror.schedule.getInfo(scheduleId);
    if (!result.success) {
      return err(
        createError(
          "MIRROR_QUERY_FAILED",
          `Mirror schedule.getInfo failed: ${result.error.message}`,
          {
            hint: "Verify mirror node connectivity",
            details: {
              status: result.error.status ?? "unknown",
              code: result.error.code ?? "unknown",
            },
          },
        ),
      );
    }
    return ok({ scheduleId, schedule: result.data });
  };

  const wait = async (
    scheduleId: EntityId,
    options: ScheduleWaitOptions = {},
  ): Promise<Result<ScheduleInfoData>> => {
    const timeoutMs = options.timeoutMs ?? 120_000;
    const pollIntervalMs = options.pollIntervalMs ?? 2_000;
    const stopWhenDeleted = options.stopWhenDeleted ?? true;
    const startedAt = Date.now();

    while (Date.now() - startedAt <= timeoutMs) {
      const infoResult = await info(scheduleId);
      if (!infoResult.ok) return infoResult;

      if (stopWhenDeleted && infoResult.value.schedule.deleted) {
        return err(
          createError(
            "SCHEDULE_DELETED",
            `Schedule ${scheduleId} is deleted and will not execute`,
            {
              hint: "Create a new schedule or verify required signatures",
              details: { scheduleId },
            },
          ),
        );
      }

      if (infoResult.value.schedule.executed_timestamp) {
        return infoResult;
      }

      await sleep(pollIntervalMs);
    }

    return err(
      createError(
        "SCHEDULE_NOT_EXECUTED",
        `Timed out waiting for schedule ${scheduleId} to execute`,
        {
          hint: "Increase timeout or verify signers",
          details: { scheduleId },
        },
      ),
    );
  };

  const createIdempotent = async (
    params: ScheduleIdempotentCreateParams,
  ): Promise<
    Result<
      | { readonly status: "created"; readonly schedule: ScheduleReceipt }
      | { readonly status: "existing"; readonly schedule: ScheduleReceipt }
    >
  > => {
    const result = await create(params);
    if (result.ok) return ok({ status: "created", schedule: result.value });

    const error = result.error;
    if (
      error.code === "TX_RECEIPT_FAILED" &&
      error.message.includes("IDENTICAL_SCHEDULE_ALREADY_CREATED") &&
      typeof error.details?.scheduleId === "string"
    ) {
      const scheduleId = error.details.scheduleId;
      const transactionId = error.transactionId ?? "";
      return ok({
        status: "existing",
        schedule: {
          receipt: {
            status: "IDENTICAL_SCHEDULE_ALREADY_CREATED",
            transactionId,
            scheduleId,
          },
          transactionId,
          scheduleId,
        },
      });
    }

    return result;
  };

  const collectSignatures = async (
    params: ScheduleCollectSignaturesParams,
  ): Promise<Result<ReadonlyArray<TransactionReceiptData>>> => {
    const receipts: TransactionReceiptData[] = [];
    for (const signer of params.signers) {
      const result = await sign(params.scheduleId, {
        signer,
        ...(params.memo !== undefined ? { memo: params.memo } : {}),
        ...(params.maxFee !== undefined ? { maxFee: params.maxFee } : {}),
      });
      if (!result.ok) return result;
      receipts.push(result.value);
    }
    return ok(receipts);
  };

  const waitForExecution = async (
    scheduleId: EntityId,
    options: ScheduleWaitExecutionOptions = {},
  ): Promise<Result<ScheduleInfoData>> => {
    return wait(scheduleId, {
      ...(options.timeoutMs !== undefined ? { timeoutMs: options.timeoutMs } : {}),
      ...(options.pollIntervalMs !== undefined ? { pollIntervalMs: options.pollIntervalMs } : {}),
      ...(options.stopWhenDeleted !== undefined
        ? { stopWhenDeleted: options.stopWhenDeleted }
        : {}),
    });
  };

  return {
    create,
    createIdempotent,
    sign,
    collectSignatures,
    delete: deleteSchedule,
    info,
    wait,
    waitForExecution,
  };
}
