import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { mirrorClient } from "../../mirror-client";
import { asEntityId } from "@hieco/utils";
import { entityIdSchema, limitSchema, toApiParams } from "../../schemas";
import { handleApiResult } from "../../errors";

export const getScheduleInfo = createTool({
  id: "get-schedule-info",
  description: "Get detailed information about a Hedera scheduled transaction",
  inputSchema: z.object({
    scheduleId: entityIdSchema.describe("Hedera schedule ID in format 0.0.123"),
  }),
  execute: async ({ scheduleId }) => {
    const result = await mirrorClient.schedule.getInfo(asEntityId(scheduleId));
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
    const apiParams = toApiParams({
      accountId: params.accountId,
      creatorAccountId: params.creatorAccountId,
      payerAccountId: params.payerAccountId,
      scheduleId: params.scheduleId,
      adminKey: params.adminKey,
      deleted: params.deleted,
      executedTimestamp: params.executedTimestamp,
      expirationTimestamp: params.expirationTimestamp,
      limit: params.limit,
      memo: params.memo,
      order: params.order,
      waitForExpiryExpiration: params.waitForExpiryExpiration,
    });
    const result = await mirrorClient.schedule.listPaginated(apiParams);
    return handleApiResult(result, "listSchedules");
  },
});
