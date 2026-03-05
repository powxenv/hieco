import type { EntityId } from "@hieco/utils";
import type { TransactionDescriptor } from "../../foundation/params.ts";
import type {
  ScheduleInfoData,
  ScheduleReceipt,
  TransactionReceiptData,
} from "../../foundation/results-shapes.ts";
import type { Result } from "../../foundation/results.ts";

export interface SchedulesNamespace {
  create: ((
    params: import("../../foundation/params.ts").ScheduleCreateParams,
  ) => Promise<Result<ScheduleReceipt>>) & {
    tx: (
      params: import("../../foundation/params.ts").ScheduleCreateParams,
    ) => TransactionDescriptor;
  };
  sign: ((
    scheduleId: EntityId,
    params?: Omit<import("../../foundation/params.ts").ScheduleSignParams, "scheduleId"> & {
      readonly signer?: import("@hiero-ledger/sdk").Signer;
    },
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../../foundation/params.ts").ScheduleSignParams) => TransactionDescriptor;
  };
  delete: ((
    scheduleId: EntityId,
    params?: Omit<import("../../foundation/params.ts").ScheduleDeleteParams, "scheduleId"> & {
      readonly signer?: import("@hiero-ledger/sdk").Signer;
    },
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (
      params: import("../../foundation/params.ts").ScheduleDeleteParams,
    ) => TransactionDescriptor;
  };
  info: (scheduleId: EntityId) => Promise<Result<ScheduleInfoData>>;
  wait: (
    scheduleId: EntityId,
    options?: import("../../foundation/params.ts").ScheduleWaitOptions,
  ) => Promise<Result<ScheduleInfoData>>;
}
