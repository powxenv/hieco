import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getMirrorClient } from "../../client";
import { entityIdSchema, limitSchema, timestampSchema, hex64Schema } from "../../schemas";
import { handleApiResult } from "../../errors";

export const getTransaction = createTool({
  id: "get-transaction",
  description: "Get detailed information about a specific Hedera transaction by ID",
  inputSchema: z.object({
    nonce: z.number().optional().describe("Transaction nonce for scheduled transactions"),
    scheduled: z.boolean().optional().describe("Whether this is a scheduled transaction"),
    transactionId: z.string().describe("Hedera transaction ID"),
  }),
  execute: async ({ transactionId, nonce, scheduled }) => {
    const result = await getMirrorClient().transaction.getById(transactionId, { nonce, scheduled });
    return handleApiResult(result, "getTransaction");
  },
});

export const getTransactionsByAccount = createTool({
  id: "get-transactions-by-account",
  description: "Get all transactions for a specific Hedera account",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
    result: z.string().optional().describe("Filter by transaction result"),
    scheduled: z.boolean().optional().describe("Filter for scheduled transactions"),
    timestamp: timestampSchema.describe("ISO timestamp filter"),
    transactionHash: hex64Schema.describe("Filter by transaction hash"),
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
    const resultData = await getMirrorClient().transaction.listByAccount(accountId, {
      result,
      scheduled,
      timestamp,
      transaction_id: transactionId,
      transactionhash: transactionHash,
      transactiontype: transactionType,
      type,
    });
    return handleApiResult(resultData, "getTransactionsByAccount");
  },
});

export const listTransactions = createTool({
  id: "list-transactions",
  description: "List all Hedera transactions. Returns all results.",
  inputSchema: z.object({
    account: entityIdSchema.optional().describe("Filter by account ID"),
    accountId: entityIdSchema.optional().describe("Filter by account ID (array supported)"),
    limit: limitSchema.describe("Maximum number of results to return"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    result: z.string().optional().describe("Filter by transaction result"),
    scheduled: z.boolean().optional().describe("Filter for scheduled transactions"),
    timestamp: timestampSchema.describe("ISO timestamp filter"),
    transactionHash: hex64Schema.describe("Filter by transaction hash"),
    transactionId: z.string().optional().describe("Filter by transaction ID"),
    transactionType: z.string().optional().describe("Filter by transaction type"),
    transfersAccount: entityIdSchema.optional().describe("Filter by transfers account ID"),
    type: z.enum(["credit", "debit"]).optional().describe("Filter by credit/debit type"),
  }),
  execute: async (params) => {
    const apiParams = {
      account: params.account,
      "account.id": params.accountId,
      limit: params.limit,
      order: params.order,
      result: params.result,
      scheduled: params.scheduled,
      timestamp: params.timestamp,
      transaction_id: params.transactionId,
      transactionhash: params.transactionHash,
      transactiontype: params.transactionType,
      "transfers.account": params.transfersAccount,
      type: params.type,
    };
    const result = await getMirrorClient().transaction.listPaginated(apiParams);
    return handleApiResult(result, "listTransactions");
  },
});
