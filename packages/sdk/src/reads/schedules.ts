import type { ReadsNamespace, ScheduleListParams } from "./namespace.ts";
import { readPage, readSingle, type ReadsContext, withDefaultLimit } from "./shared.ts";

export function createSchedulesReads(context: ReadsContext): ReadsNamespace["schedules"] {
  const list = async (params?: ScheduleListParams) => {
    return readPage(
      await context.mirror.schedule.listPaginatedPage(withDefaultLimit(params)),
      "Mirror schedule.listPaginatedPage failed",
    );
  };

  const listPageByUrl = async (url: string) => {
    return readPage(
      await context.mirror.schedule.listPaginatedPageByUrl(url),
      "Mirror schedule.listPaginatedPageByUrl failed",
    );
  };

  const info = async (scheduleId: string) => {
    return readSingle(
      await context.mirror.schedule.getInfo(scheduleId),
      "Mirror schedule.getInfo failed",
    );
  };

  return {
    list,
    listPageByUrl,
    info,
  };
}
