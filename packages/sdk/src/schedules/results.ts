import type { EntityId } from "@hieco/utils";
import type { Schedule } from "@hieco/mirror";
import type { TransactionReceiptData } from "../results/transaction.ts";

export interface ScheduleReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly scheduleId: EntityId;
}

export interface ScheduleInfoData {
  readonly scheduleId: EntityId;
  readonly schedule: Schedule;
}
