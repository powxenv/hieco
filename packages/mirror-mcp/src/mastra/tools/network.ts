import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { mirrorClient } from "../../client";
import { limitSchema, nodeIdSchema, timestampSchema } from "../../schemas";
import { handleApiResult } from "../../errors";

export const getExchangeRate = createTool({
  id: "get-exchange-rate",
  description: "Get the current HBAR to USD exchange rate from the Hedera network",
  inputSchema: z.object({
    timestamp: timestampSchema.describe("ISO timestamp to query exchange rate at a specific time"),
  }),
  execute: async ({ timestamp }) => {
    const result = await mirrorClient.network.getExchangeRate({ timestamp });
    return handleApiResult(result, "getExchangeRate");
  },
});

export const getNetworkFees = createTool({
  id: "get-network-fees",
  description: "Get current network fee schedules for different transaction types",
  inputSchema: z.object({
    limit: limitSchema.describe("Maximum number of results to return"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    timestamp: timestampSchema.describe("ISO timestamp to query fees at a specific time"),
  }),
  execute: async ({ timestamp, limit, order }) => {
    const result = await mirrorClient.network.getFees({
      timestamp,
      limit,
      order,
    });
    return handleApiResult(result, "getNetworkFees");
  },
});

export const getNetworkNodes = createTool({
  id: "get-network-nodes",
  description: "Get information about Hedera network nodes (consensus nodes)",
  inputSchema: z.object({
    fileId: z.number().optional().describe("Filter by file ID"),
    limit: limitSchema.describe("Maximum number of results to return"),
    nodeId: nodeIdSchema.describe("Filter by node ID"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
  }),
  execute: async ({ fileId, nodeId, limit, order }) => {
    const result = await mirrorClient.network.getNodes({
      "file.id": fileId,
      "node.id": nodeId,
      limit,
      order,
    });
    return handleApiResult(result, "getNetworkNodes");
  },
});

export const getNetworkStake = createTool({
  id: "get-network-stake",
  description: "Get current network staking information including node stakes",
  inputSchema: z.object({}),
  execute: async () => {
    const result = await mirrorClient.network.getStake();
    return handleApiResult(result, "getNetworkStake");
  },
});

export const getNetworkSupply = createTool({
  id: "get-network-supply",
  description: "Get current HBAR token supply information",
  inputSchema: z.object({}),
  execute: async () => {
    const result = await mirrorClient.network.getSupply();
    return handleApiResult(result, "getNetworkSupply");
  },
});

export const listNetworkNodes = createTool({
  id: "list-network-nodes",
  description: "List all Hedera network nodes. Returns all results.",
  inputSchema: z.object({
    fileId: z.number().optional().describe("Filter by file ID"),
    limit: limitSchema.describe("Maximum number of results to return"),
    nodeId: nodeIdSchema.describe("Filter by node ID"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
  }),
  execute: async ({ fileId, nodeId, limit, order }) => {
    const result = await mirrorClient.network.listPaginated({
      "file.id": fileId,
      "node.id": nodeId,
      limit,
      order,
    });
    return handleApiResult(result, "listNetworkNodes");
  },
});
