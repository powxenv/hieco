import type { Schedule, EntityId } from "@hiecom/mirror-js";
import { state } from "../utils/state.js";
import type { Factory } from "./account.js";

export type ScheduleFixtureOptions = Partial<
  Pick<
    Schedule,
    | "schedule_id"
    | "creator_account_id"
    | "payer_account_id"
    | "transaction_body"
    | "signatures"
    | "memo"
    | "expiration_time"
    | "wait_for_expiry"
  >
> & {
  readonly timestamp?: string;
};

const nextScheduleId = (): EntityId => `0.0.${state.incrementSchedule()}` as EntityId;

const createSchedule = (options: ScheduleFixtureOptions = {}): Schedule => {
  const timestamp = options.timestamp ?? Date.now().toString();

  return {
    admin_key: null,
    consensus_timestamp: timestamp,
    creator_account_id: options.creator_account_id ?? ("0.0.1" as EntityId),
    deleted: false,
    executed_timestamp: null,
    expiration_time: options.expiration_time ?? null,
    memo: options.memo ?? "",
    payer_account_id: options.payer_account_id ?? ("0.0.1" as EntityId),
    schedule_id: options.schedule_id ?? nextScheduleId(),
    signatures: options.signatures ?? [],
    transaction_body: options.transaction_body ?? "0x",
    wait_for_expiry: options.wait_for_expiry ?? false,
  };
};

export const mockSchedule: Factory<Schedule, ScheduleFixtureOptions> = {
  build: (overrides) => createSchedule(overrides),
  buildList: (count, overrides) => Array.from({ length: count }, () => createSchedule(overrides)),
};
