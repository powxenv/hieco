import type { ApiResult, PaginationParams, QueryOperator } from "@hieco/utils";
import type { Schedule } from "./types";
import { QueryBuilder, type CursorPaginator, type PaginatedResponse } from "../shared/builders";
import { BaseApi } from "../shared/base";

export interface ScheduleListParams extends PaginationParams {
  "account.id"?: string | QueryOperator<string>;
  "creator.account.id"?: string | QueryOperator<string>;
  "payer.account.id"?: string | QueryOperator<string>;
  schedule_id?: string;
  admin_key?: string;
  deleted?: boolean;
  executed_timestamp?: string;
  expiration_timestamp?: string;
  memo?: string;
  wait_for_expiry_expiration?: string;
}

export class ScheduleApi extends BaseApi {
  async getInfo(scheduleId: string): Promise<ApiResult<Schedule>> {
    return this.getSingle<Schedule>(`schedules/${scheduleId}`);
  }

  private buildScheduleListParams(params?: ScheduleListParams): Record<string, string> {
    const builder = new QueryBuilder();

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

    return builder.build();
  }

  async listPaginated(params?: ScheduleListParams): Promise<ApiResult<Schedule[]>> {
    return this.getAllPaginated<Schedule>("schedules", this.buildScheduleListParams(params));
  }

  async listPaginatedPage(
    params?: ScheduleListParams,
  ): Promise<ApiResult<PaginatedResponse<Schedule>>> {
    return this.getSinglePage<Schedule>("schedules", this.buildScheduleListParams(params));
  }

  async listPaginatedPageByUrl(url: string): Promise<ApiResult<PaginatedResponse<Schedule>>> {
    return this.getSinglePageByUrl<Schedule>(url);
  }

  createSchedulePaginator(params?: ScheduleListParams): CursorPaginator<Schedule> {
    return super.createPaginator<Schedule>("schedules", this.buildScheduleListParams(params));
  }
}
