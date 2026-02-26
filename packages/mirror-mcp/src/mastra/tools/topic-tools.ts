import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { mirrorClient } from "../../config/client";
import { asEntityId } from "@hiecom/mirror-shared";

const entityIdSchema = z.string().regex(/^\d+\.\d+\.\d+$/);

export const getTopicInfo = createTool({
  id: "get-topic-info",
  description: "Get detailed information about a Hedera consensus topic",
  inputSchema: z.object({
    topicId: entityIdSchema.describe("Hedera topic ID in format 0.0.123"),
  }),
  execute: async ({ topicId }) => {
    const result = await mirrorClient.topic.getInfo(asEntityId(topicId));
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getTopicMessages = createTool({
  id: "get-topic-messages",
  description: "Get all messages from a Hedera consensus topic",
  inputSchema: z.object({
    topicId: entityIdSchema.describe("Hedera topic ID in format 0.0.123"),
    encoding: z.enum(["base64", "utf-8"]).optional().describe("Message encoding format"),
    sequenceNumber: z.number().optional().describe("Filter by sequence number"),
    timestamp: z.string().optional().describe("ISO timestamp filter"),
    transactionId: z.string().optional().describe("Filter by transaction ID"),
    scheduled: z.boolean().optional().describe("Filter for scheduled transactions"),
  }),
  execute: async ({ topicId, encoding, sequenceNumber, timestamp, transactionId, scheduled }) => {
    const result = await mirrorClient.topic.getMessages(asEntityId(topicId), {
      encoding,
      sequencenumber: sequenceNumber,
      timestamp,
      transaction_id: transactionId,
      scheduled,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getTopicMessage = createTool({
  id: "get-topic-message",
  description: "Get a specific topic message by topic ID and sequence number",
  inputSchema: z.object({
    topicId: entityIdSchema.describe("Hedera topic ID in format 0.0.123"),
    sequenceNumber: z.number().describe("Message sequence number"),
  }),
  execute: async ({ topicId, sequenceNumber }) => {
    const result = await mirrorClient.topic.getMessage(asEntityId(topicId), sequenceNumber);
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getMessageByTimestamp = createTool({
  id: "get-message-by-timestamp",
  description: "Get a topic message by its timestamp",
  inputSchema: z.object({
    timestamp: z.string().describe("ISO timestamp of the message"),
  }),
  execute: async ({ timestamp }) => {
    const result = await mirrorClient.topic.getMessageByTimestamp(timestamp);
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const listTopics = createTool({
  id: "list-topics",
  description: "List all Hedera consensus topics. Returns all results.",
  inputSchema: z.object({
    limit: z.number().optional().describe("Maximum number of results to return"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
  }),
  execute: async ({ limit, order }) => {
    const result = await mirrorClient.topic.listPaginated({ limit, order });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});
