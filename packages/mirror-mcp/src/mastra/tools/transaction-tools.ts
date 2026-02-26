import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { mirrorClient } from "../../config/client";
import { asEntityId } from "@hiecom/mirror-shared";

const entityIdSchema = z.string().regex(/^\d+\.\d+\.\d+$/);

export const getTransaction = createTool({
  id: "get-transaction",
  description: "Get detailed information about a specific Hedera transaction by ID",
  inputSchema: z.object({
    nonce: z.number().optional().describe("Transaction nonce for scheduled transactions"),
    scheduled: z.boolean().optional().describe("Whether this is a scheduled transaction"),
    transactionId: z.string().describe("Hedera transaction ID"),
  }),
  execute: async ({ transactionId, nonce, scheduled }) => {
    const result = await mirrorClient.transaction.getById(transactionId, { nonce, scheduled });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getTransactionsByAccount = createTool({
  id: "get-transactions-by-account",
  description: "Get all transactions for a specific Hedera account",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
    result: z.string().optional().describe("Filter by transaction result"),
    scheduled: z.boolean().optional().describe("Filter for scheduled transactions"),
    timestamp: z.string().optional().describe("ISO timestamp filter"),
    transactionHash: z.string().optional().describe("Filter by transaction hash"),
    transactionId: z.string().optional().describe("Filter by transaction ID"),
    transactionType: z.string().optional().describe("Filter by transaction type"),
    type: z.enum(["credit", "debit"]).optional().describe("Filter by credit/debit type"),
  }),
  execute: async ({
    accountId,
    result,
    scheduled,
    timestamp,
    transactionId,
    transactionHash,
    transactionType,
    type,
  }) => {
    const resultData = await mirrorClient.transaction.listByAccount(asEntityId(accountId), {
      result,
      scheduled,
      timestamp,
      transaction_id: transactionId,
      transactionhash: transactionHash,
      transactiontype: transactionType,
      type,
    });
    if (!resultData.success) throw new Error(resultData.error.message);
    return resultData.data;
  },
});

export const listTransactions = createTool({
  id: "list-transactions",
  description: "List all Hedera transactions. Returns all results.",
  inputSchema: z.object({
    account: entityIdSchema.optional().describe("Filter by account ID"),
    accountId: entityIdSchema.optional().describe("Filter by account ID (array supported)"),
    limit: z.number().optional().describe("Maximum number of results to return"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    result: z.string().optional().describe("Filter by transaction result"),
    scheduled: z.boolean().optional().describe("Filter for scheduled transactions"),
    timestamp: z.string().optional().describe("ISO timestamp filter"),
    transactionHash: z.string().optional().describe("Filter by transaction hash"),
    transactionId: z.string().optional().describe("Filter by transaction ID"),
    transactionType: z.string().optional().describe("Filter by transaction type"),
    transfersAccount: entityIdSchema.optional().describe("Filter by transfers account ID"),
    type: z.enum(["credit", "debit"]).optional().describe("Filter by credit/debit type"),
  }),
  execute: async (params) => {
    const result = await mirrorClient.transaction.listPaginated({
      account: params.account as `${number}.${number}.${number}` | undefined,
      "account.id": params.accountId as `${number}.${number}.${number}` | undefined,
      limit: params.limit,
      order: params.order,
      result: params.result,
      scheduled: params.scheduled,
      timestamp: params.timestamp,
      transaction_id: params.transactionId,
      transactionhash: params.transactionHash,
      transactiontype: params.transactionType,
      "transfers.account": params.transfersAccount as `${number}.${number}.${number}` | undefined,
      type: params.type,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});
