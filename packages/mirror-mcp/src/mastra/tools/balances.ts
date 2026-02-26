import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { mirrorClient } from "../../mirror-client";
import { limitSchema } from "../../schemas";
import { handleApiResult } from "../../errors";

export const getBalances = createTool({
  id: "get-balances",
  description:
    "Get account balances with optional filters. Returns aggregated balance information.",
  inputSchema: z.object({
    account: z.string().optional().describe("Filter by account ID"),
    accountBalance: z.number().optional().describe("Filter by account balance"),
    limit: limitSchema.describe("Maximum number of results to return"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    publicKey: z.string().optional().describe("Filter by public key"),
    timestamp: z.string().optional().describe("ISO timestamp to query balances at a specific time"),
  }),
  execute: async ({ account, accountBalance, limit, order, publicKey, timestamp }) => {
    const result = await mirrorClient.balance.getBalances({
      account,
      "account.balance": accountBalance,
      limit,
      order,
      public_key: publicKey,
      timestamp,
    });
    return handleApiResult(result, "getBalances");
  },
});

export const listBalances = createTool({
  id: "list-balances",
  description: "List all account balances. Returns all results.",
  inputSchema: z.object({
    account: z.string().optional().describe("Filter by account ID"),
    accountBalance: z.number().optional().describe("Filter by account balance"),
    limit: limitSchema.describe("Maximum number of results to return"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    publicKey: z.string().optional().describe("Filter by public key"),
    timestamp: z.string().optional().describe("ISO timestamp to query balances at a specific time"),
  }),
  execute: async ({ account, accountBalance, limit, order, publicKey, timestamp }) => {
    const result = await mirrorClient.balance.listPaginated({
      account,
      "account.balance": accountBalance,
      limit,
      order,
      public_key: publicKey,
      timestamp,
    });
    return handleApiResult(result, "listBalances");
  },
});
