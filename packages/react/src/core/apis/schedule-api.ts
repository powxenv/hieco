import type { ApiResult, PaginationParams, QueryOperator, Timestamp } from "../../types/rest-api";
import type { Schedule } from "../../types/entities/schedule";
import type { EntityId } from "../../types/rest-api";
import type { CursorPaginator } from "../builders";
import { BaseApi } from "../base-api";

export interface ScheduleListParams extends PaginationParams {
  "account.id"?: EntityId | QueryOperator<EntityId>;
  "creator.account.id"?: EntityId | QueryOperator<EntityId>;
  "payer.account.id"?: EntityId | QueryOperator<EntityId>;
  schedule_id?: EntityId;
  admin_key?: string;
  deleted?: boolean;
  executed_timestamp?: Timestamp;
  expiration_timestamp?: Timestamp;
  memo?: string;
  wait_for_expiry_expiration?: Timestamp;
}

export class ScheduleApi extends BaseApi {
  async getInfo(scheduleId: EntityId): Promise<ApiResult<Schedule>> {
    return this.getSingle<Schedule>(`schedules/${scheduleId}`);
  }

  async listPaginated(params?: ScheduleListParams): Promise<ApiResult<Schedule[]>> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params["account.id"]) {
        builder.add("account.id", params["account.id"]);
      }
      if (params["creator.account.id"]) {
        builder.add("creator.account.id", params["creator.account.id"]);
      }
      if (params["payer.account.id"]) {
        builder.add("payer.account.id", params["payer.account.id"]);
      }
      if (params.schedule_id) {
        builder.add("schedule.id", params.schedule_id);
      }
      if (params.admin_key) {
        builder.add("adminkey", params.admin_key);
      }
      if (params.deleted !== undefined) {
        builder.add("deleted", params.deleted);
      }
      if (params.executed_timestamp) {
        builder.add("executed_timestamp", params.executed_timestamp);
      }
      if (params.expiration_timestamp) {
        builder.add("expiration_timestamp", params.expiration_timestamp);
      }
      if (params.memo) {
        builder.add("memo", params.memo);
      }
      if (params.wait_for_expiry_expiration) {
        builder.add("waitForExpiryExpiration", params.wait_for_expiry_expiration);
      }
    }

    return this.getAllPaginated<Schedule>("schedules", builder.build());
  }

  createSchedulePaginator(params?: ScheduleListParams): CursorPaginator<Schedule> {
    const builder = this.createQueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params["account.id"]) {
        builder.add("account.id", params["account.id"]);
      }
      if (params["creator.account.id"]) {
        builder.add("creator.account.id", params["creator.account.id"]);
      }
      if (params["payer.account.id"]) {
        builder.add("payer.account.id", params["payer.account.id"]);
      }
      if (params.schedule_id) {
        builder.add("schedule.id", params.schedule_id);
      }
      if (params.admin_key) {
        builder.add("adminkey", params.admin_key);
      }
      if (params.deleted !== undefined) {
        builder.add("deleted", params.deleted);
      }
      if (params.executed_timestamp) {
        builder.add("executed_timestamp", params.executed_timestamp);
      }
      if (params.expiration_timestamp) {
        builder.add("expiration_timestamp", params.expiration_timestamp);
      }
      if (params.memo) {
        builder.add("memo", params.memo);
      }
      if (params.wait_for_expiry_expiration) {
        builder.add("waitForExpiryExpiration", params.wait_for_expiry_expiration);
      }
    }

    return super.createPaginator<Schedule>("schedules", builder.build());
  }
}
