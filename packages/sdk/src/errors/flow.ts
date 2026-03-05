import type { EntityId } from "@hieco/types";
import type { FlowError } from "./types.ts";

export type FlowErrorName =
  | "MISSING_SCHEDULE_ID"
  | "MISSING_CREATE_PARAMS"
  | "MIRROR_QUERY_FAILED"
  | "SCHEDULE_DELETED"
  | "SCHEDULE_NOT_EXECUTED";

export function flowError(name: FlowErrorName, message: string, scheduleId?: EntityId): FlowError {
  return { _tag: "FlowError", name, message, scheduleId };
}
