import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { mirrorClient } from "../../config/client";

export const getBlocks = createTool({
  id: "get-blocks",
  description: "Get block information with optional filters. Returns aggregated block data.",
  inputSchema: z.object({
    blockNumber: z.number().optional().describe("Filter by block number"),
    limit: z.number().optional().describe("Maximum number of results to return"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    timestamp: z.string().optional().describe("ISO timestamp filter"),
  }),
  execute: async ({ blockNumber, limit, order, timestamp }) => {
    const result = await mirrorClient.block.getBlocks({
      block_number: blockNumber,
      limit,
      order,
      timestamp,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getBlock = createTool({
  id: "get-block",
  description: "Get a specific block by hash or number",
  inputSchema: z.object({
    hashOrNumber: z.string().describe("Block hash or block number as string"),
  }),
  execute: async ({ hashOrNumber }) => {
    const result = await mirrorClient.block.getBlock(hashOrNumber);
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const listBlocks = createTool({
  id: "list-blocks",
  description: "List all Hedera blocks. Returns all results.",
  inputSchema: z.object({
    blockNumber: z.number().optional().describe("Filter by block number"),
    limit: z.number().optional().describe("Maximum number of results to return"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    timestamp: z.string().optional().describe("ISO timestamp filter"),
  }),
  execute: async ({ blockNumber, limit, order, timestamp }) => {
    const result = await mirrorClient.block.listPaginated({
      block_number: blockNumber,
      limit,
      order,
      timestamp,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});
