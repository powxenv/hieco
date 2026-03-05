import type { Signer as HieroSigner } from "@hiero-ledger/sdk";
import type { MirrorNodeClient, Schedule } from "@hieco/mirror";
import type { EntityId } from "@hieco/types";
import type { ApiError } from "@hieco/types";
import type {
  DeleteScheduleParams,
  ScheduleReceipt,
  ScheduleTransactionParams,
  SdkResult,
  SignScheduleParams,
  TransactionReceiptData,
} from "../types.ts";
import { flowError } from "../errors/flow.ts";

export interface ScheduledTransactionFlowClient {
  readonly mirror: MirrorNodeClient;
  scheduleTransaction(params: ScheduleTransactionParams): Promise<SdkResult<ScheduleReceipt>>;
  signSchedule(params: SignScheduleParams): Promise<SdkResult<TransactionReceiptData>>;
  deleteSchedule(params: DeleteScheduleParams): Promise<SdkResult<TransactionReceiptData>>;
  withSigner(signer: HieroSigner): ScheduledTransactionFlowClient;
}

export type ScheduledTransactionFlowInit =
  | { readonly scheduleId: EntityId }
  | { readonly create: ScheduleTransactionParams };

export interface ScheduledTransactionFlowWaitOptions {
  readonly timeoutMs?: number;
  readonly pollIntervalMs?: number;
  readonly stopWhenDeleted?: boolean;
}

export interface ScheduledTransactionFlowInfo {
  readonly scheduleId: EntityId;
  readonly schedule: Schedule;
}

export interface ScheduledTransactionFlowCreateResult {
  readonly scheduleId: EntityId;
  readonly receipt: ScheduleReceipt;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function apiErrorMessage(error: ApiError): string {
  const extra = [error.status, error.code].filter(Boolean).join(" ");
  return extra ? `${error.message} (${extra})` : error.message;
}

export class ScheduledTransactionFlow {
  private readonly client: ScheduledTransactionFlowClient;
  private readonly createParams?: ScheduleTransactionParams;
  private scheduleId?: EntityId;
  private createReceipt?: ScheduleReceipt;

  constructor(client: ScheduledTransactionFlowClient, init: ScheduledTransactionFlowInit) {
    this.client = client;

    if ("create" in init) {
      this.createParams = init.create;
    } else {
      this.scheduleId = init.scheduleId;
    }
  }

  get id(): EntityId | undefined {
    return this.scheduleId;
  }

  get receipt(): ScheduleReceipt | undefined {
    return this.createReceipt;
  }

  async create(): Promise<SdkResult<ScheduledTransactionFlowCreateResult>> {
    if (!this.createParams) {
      return {
        success: false,
        error: flowError(
          "MISSING_CREATE_PARAMS",
          "This flow was created from an existing scheduleId and cannot create a new schedule",
          this.scheduleId,
        ),
      };
    }

    const result = await this.client.scheduleTransaction(this.createParams);
    if (!result.success) return result;

    this.scheduleId = result.data.scheduleId;
    this.createReceipt = result.data;

    return {
      success: true,
      data: {
        scheduleId: result.data.scheduleId,
        receipt: result.data,
      },
    };
  }

  async sign(
    params: Omit<SignScheduleParams, "scheduleId"> & { readonly signer?: HieroSigner } = {},
  ): Promise<SdkResult<TransactionReceiptData>> {
    const scheduleId = this.scheduleId;
    if (!scheduleId) {
      return {
        success: false,
        error: flowError(
          "MISSING_SCHEDULE_ID",
          "Schedule ID is missing. Call create() first or construct the flow with a scheduleId",
        ),
      };
    }

    const client = params.signer ? this.client.withSigner(params.signer) : this.client;
    return client.signSchedule({ ...params, scheduleId });
  }

  async delete(
    params: Omit<DeleteScheduleParams, "scheduleId"> & { readonly signer?: HieroSigner } = {},
  ): Promise<SdkResult<TransactionReceiptData>> {
    const scheduleId = this.scheduleId;
    if (!scheduleId) {
      return {
        success: false,
        error: flowError(
          "MISSING_SCHEDULE_ID",
          "Schedule ID is missing. Call create() first or construct the flow with a scheduleId",
        ),
      };
    }

    const client = params.signer ? this.client.withSigner(params.signer) : this.client;
    return client.deleteSchedule({ ...params, scheduleId });
  }

  async getInfo(): Promise<SdkResult<ScheduledTransactionFlowInfo>> {
    const scheduleId = this.scheduleId;
    if (!scheduleId) {
      return {
        success: false,
        error: flowError(
          "MISSING_SCHEDULE_ID",
          "Schedule ID is missing. Call create() first or construct the flow with a scheduleId",
        ),
      };
    }

    const result = await this.client.mirror.schedule.getInfo(scheduleId);
    if (!result.success) {
      return {
        success: false,
        error: flowError(
          "MIRROR_QUERY_FAILED",
          `Mirror schedule.getInfo failed: ${apiErrorMessage(result.error)}`,
          scheduleId,
        ),
      };
    }

    return {
      success: true,
      data: {
        scheduleId,
        schedule: result.data,
      },
    };
  }

  async waitForExecuted(
    options: ScheduledTransactionFlowWaitOptions = {},
  ): Promise<SdkResult<ScheduledTransactionFlowInfo>> {
    const scheduleId = this.scheduleId;
    if (!scheduleId) {
      return {
        success: false,
        error: flowError(
          "MISSING_SCHEDULE_ID",
          "Schedule ID is missing. Call create() first or construct the flow with a scheduleId",
        ),
      };
    }

    const timeoutMs = options.timeoutMs ?? 120_000;
    const pollIntervalMs = options.pollIntervalMs ?? 2_000;
    const stopWhenDeleted = options.stopWhenDeleted ?? true;
    const startedAt = Date.now();

    while (Date.now() - startedAt <= timeoutMs) {
      const info = await this.getInfo();
      if (!info.success) return info;

      if (stopWhenDeleted && info.data.schedule.deleted) {
        return {
          success: false,
          error: flowError(
            "SCHEDULE_DELETED",
            `Schedule ${scheduleId} is deleted and will not execute`,
            scheduleId,
          ),
        };
      }

      if (info.data.schedule.executed_timestamp) {
        return info;
      }

      await sleep(pollIntervalMs);
    }

    return {
      success: false,
      error: flowError(
        "SCHEDULE_NOT_EXECUTED",
        `Timed out waiting for schedule ${scheduleId} to execute`,
        scheduleId,
      ),
    };
  }
}
