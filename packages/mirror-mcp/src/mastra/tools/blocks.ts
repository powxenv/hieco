import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getMirrorClient } from "../../client";
import { limitSchema } from "../../schemas";
import { handleApiResult } from "../../errors";

export const getBlocks = createTool({
  id: "get-blocks",
  description: "Get block information with optional filters. Returns aggregated block data.",
  inputSchema: z.object({
    blockNumber: z.number().optional().describe("Filter by block number"),
    limit: limitSchema.describe("Maximum number of results to return"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    timestamp: z.string().optional().describe("ISO timestamp filter"),
  }),
  execute: async ({ blockNumber, limit, order, timestamp }) => {
    const result = await getMirrorClient().block.getBlocks({
      block_number: blockNumber,
      limit,
      order,
      timestamp,
    });
    return handleApiResult(result, "getBlocks");
  },
});

export const getBlock = createTool({
  id: "get-block",
  description: "Get a specific block by hash or number",
  inputSchema: z.object({
    hashOrNumber: z.string().describe("Block hash or block number as string"),
  }),
  execute: async ({ hashOrNumber }) => {
    const result = await getMirrorClient().block.getBlock(hashOrNumber);
    return handleApiResult(result, "getBlock");
  },
});

export const listBlocks = createTool({
  id: "list-blocks",
  description: "List all Hedera blocks. Returns all results.",
  inputSchema: z.object({
    blockNumber: z.number().optional().describe("Filter by block number"),
    limit: limitSchema.describe("Maximum number of results to return"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    timestamp: z.string().optional().describe("ISO timestamp filter"),
  }),
  execute: async ({ blockNumber, limit, order, timestamp }) => {
    const result = await getMirrorClient().block.listPaginated({
      block_number: blockNumber,
      limit,
      order,
      timestamp,
    });
    return handleApiResult(result, "listBlocks");
  },
});
