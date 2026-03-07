import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getMirrorClient } from "../../client";
import { entityIdSchema, limitSchema } from "../../schemas";
import { handleApiResult } from "../../errors";

export const getScheduleInfo = createTool({
  id: "get-schedule-info",
  description: "Get detailed information about a Hedera scheduled transaction",
  inputSchema: z.object({
    scheduleId: entityIdSchema.describe("Hedera schedule ID in format 0.0.123"),
  }),
  execute: async ({ scheduleId }) => {
    const result = await getMirrorClient().schedule.getInfo(scheduleId);
    return handleApiResult(result, "getScheduleInfo");
  },
});

export const listSchedules = createTool({
  id: "list-schedules",
  description: "List all Hedera scheduled transactions. Returns all results.",
  inputSchema: z.object({
    accountId: entityIdSchema.optional().describe("Filter by account ID"),
    adminKey: z.string().optional().describe("Filter by admin key"),
    creatorAccountId: entityIdSchema.optional().describe("Filter by creator account ID"),
    deleted: z.boolean().optional().describe("Filter for deleted schedules"),
    executedTimestamp: z.string().optional().describe("Filter by executed timestamp"),
    expirationTimestamp: z.string().optional().describe("Filter by expiration timestamp"),
    limit: limitSchema.describe("Maximum number of results to return"),
    memo: z.string().optional().describe("Filter by memo"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    payerAccountId: entityIdSchema.optional().describe("Filter by payer account ID"),
    scheduleId: entityIdSchema.optional().describe("Filter by schedule ID"),
    waitForExpiryExpiration: z.string().optional().describe("Filter by wait for expiry expiration"),
  }),
  execute: async (params) => {
    const apiParams = {
      "account.id": params.accountId,
      "creator.account.id": params.creatorAccountId,
      "payer.account.id": params.payerAccountId,
      schedule_id: params.scheduleId,
      admin_key: params.adminKey,
      deleted: params.deleted,
      executed_timestamp: params.executedTimestamp,
      expiration_timestamp: params.expirationTimestamp,
      limit: params.limit,
      memo: params.memo,
      order: params.order,
      wait_for_expiry_expiration: params.waitForExpiryExpiration,
    };
    const result = await getMirrorClient().schedule.listPaginated(apiParams);
    return handleApiResult(result, "listSchedules");
  },
});
