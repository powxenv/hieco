import type { EntityId } from "@hieco/utils";
import type { TransactionDescriptor } from "../../foundation/params.ts";
import type {
  ScheduleInfoData,
  ScheduleReceipt,
  TransactionReceiptData,
} from "../../foundation/results-shapes.ts";
import type { Result } from "../../foundation/results.ts";
import { err, ok } from "../../foundation/results.ts";
import { createError } from "../../foundation/errors.ts";
import type {
  ScheduleCreateParams,
  ScheduleDeleteParams,
  ScheduleSignParams,
  ScheduleWaitOptions,
} from "../../foundation/params.ts";
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
    const submit = params.signer ? context.withSigner(params.signer).submit : context.submit;
    const scheduleParams: ScheduleSignParams = {
      scheduleId,
      ...(params.memo !== undefined ? { memo: params.memo } : {}),
      ...(params.maxFee !== undefined ? { maxFee: params.maxFee } : {}),
    };
    const result = await submit({
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

  const del = async (
    scheduleId: EntityId,
    params: Omit<ScheduleDeleteParams, "scheduleId"> & {
      readonly signer?: import("@hiero-ledger/sdk").Signer;
    } = {},
  ): Promise<Result<TransactionReceiptData>> => {
    const submit = params.signer ? context.withSigner(params.signer).submit : context.submit;
    const scheduleParams: ScheduleDeleteParams = {
      scheduleId,
      ...(params.memo !== undefined ? { memo: params.memo } : {}),
      ...(params.maxFee !== undefined ? { maxFee: params.maxFee } : {}),
    };
    const result = await submit({
      kind: "schedules.delete",
      params: scheduleParams,
    });
    if (!result.ok) return result;
    return ok(result.value);
  };

  del.tx = (params: ScheduleDeleteParams): TransactionDescriptor => ({
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

  return {
    create,
    sign,
    delete: del,
    info,
    wait,
  };
}
