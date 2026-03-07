import type { EntityId } from "@hieco/utils";
import type { TransactionDescriptor } from "../shared/params.ts";
import type {
  ScheduleInfoData,
  ScheduleReceipt,
  TransactionReceiptData,
} from "../results/shapes.ts";
import type { Result } from "../results/result.ts";

export interface SchedulesNamespace {
  create: ((
    params: import("../shared/params.ts").ScheduleCreateParams,
  ) => Promise<Result<ScheduleReceipt>>) & {
    tx: (params: import("../shared/params.ts").ScheduleCreateParams) => TransactionDescriptor;
  };
  sign: ((
    scheduleId: EntityId,
    params?: Omit<import("../shared/params.ts").ScheduleSignParams, "scheduleId"> & {
      readonly signer?: import("@hiero-ledger/sdk").Signer;
    },
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").ScheduleSignParams) => TransactionDescriptor;
  };
  delete: ((
    scheduleId: EntityId,
    params?: Omit<import("../shared/params.ts").ScheduleDeleteParams, "scheduleId"> & {
      readonly signer?: import("@hiero-ledger/sdk").Signer;
    },
  ) => Promise<Result<TransactionReceiptData>>) & {
    tx: (params: import("../shared/params.ts").ScheduleDeleteParams) => TransactionDescriptor;
  };
  info: (scheduleId: EntityId) => Promise<Result<ScheduleInfoData>>;
  wait: (
    scheduleId: EntityId,
    options?: import("../shared/params.ts").ScheduleWaitOptions,
  ) => Promise<Result<ScheduleInfoData>>;
  createIdempotent: (
    params: import("../shared/params.ts").ScheduleIdempotentCreateParams,
  ) => Promise<
    Result<
      | { readonly status: "created"; readonly schedule: ScheduleReceipt }
      | { readonly status: "existing"; readonly schedule: ScheduleReceipt }
    >
  >;
  collectSignatures: (
    params: import("../shared/params.ts").ScheduleCollectSignaturesParams,
  ) => Promise<Result<ReadonlyArray<TransactionReceiptData>>>;
  waitForExecution: (
    scheduleId: EntityId,
    options?: import("../shared/params.ts").ScheduleWaitExecutionOptions,
  ) => Promise<Result<ScheduleInfoData>>;
}
