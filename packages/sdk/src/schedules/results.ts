import type { Schedule } from "@hieco/mirror";
import type { TransactionReceiptData } from "../results/transaction.ts";

export interface ScheduleReceipt {
  readonly receipt: TransactionReceiptData;
  readonly transactionId: string;
  readonly scheduleId: string;
}

export interface ScheduleInfoData {
  readonly scheduleId: string;
  readonly schedule: Schedule;
}
