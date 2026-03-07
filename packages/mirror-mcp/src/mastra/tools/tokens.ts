import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { getMirrorClient } from "../../client";
import { asEntityId } from "@hieco/utils";
import {
  entityIdSchema,
  limitSchema,
  serialNumberSchema,
  timestampSchema,
  toApiParams,
} from "../../schemas";
import { handleApiResult } from "../../errors";

export const getTokenInfo = createTool({
  id: "get-token-info",
  description:
    "Get detailed information about a Hedera token including name, symbol, total supply, and type",
  inputSchema: z.object({
    tokenId: entityIdSchema.describe("Hedera token ID in format 0.0.123"),
    timestamp: timestampSchema.describe("ISO timestamp to query token state at a specific time"),
  }),
  execute: async ({ tokenId, timestamp }) => {
    const result = await getMirrorClient().token.getInfo(asEntityId(tokenId), { timestamp });
    return handleApiResult(result, "getTokenInfo");
  },
});

export const getTokenBalances = createTool({
  id: "get-token-balances",
  description: "Get all account balances for a specific Hedera token",
  inputSchema: z.object({
    tokenId: entityIdSchema.describe("Hedera token ID in format 0.0.123"),
    accountId: entityIdSchema.optional().describe("Filter by account ID"),
    accountBalance: z.number().optional().describe("Filter by account balance"),
    accountPublicKey: z.string().optional().describe("Filter by account public key"),
    timestamp: timestampSchema.describe("ISO timestamp to query balances at a specific time"),
  }),
  execute: async ({ tokenId, accountId, accountBalance, accountPublicKey, timestamp }) => {
    const result = await getMirrorClient().token.getBalances(asEntityId(tokenId), {
      account: accountId ? asEntityId(accountId) : undefined,
      "account.balance": accountBalance,
      "account.publickey": accountPublicKey,
      timestamp,
    });
    return handleApiResult(result, "getTokenBalances");
  },
});

export const getTokenNfts = createTool({
  id: "get-token-nfts",
  description: "Get all NFTs for a specific Hedera NFT token",
  inputSchema: z.object({
    tokenId: entityIdSchema.describe("Hedera token ID in format 0.0.123"),
    accountId: entityIdSchema.optional().describe("Filter by account ID"),
    serialNumber: serialNumberSchema.describe("Filter by serial number"),
  }),
  execute: async ({ tokenId, accountId, serialNumber }) => {
    const result = await getMirrorClient().token.getNfts(asEntityId(tokenId), {
      "account.id": accountId ? asEntityId(accountId) : undefined,
      serial_number: serialNumber,
    });
    return handleApiResult(result, "getTokenNfts");
  },
});

export const getNftBySerial = createTool({
  id: "get-nft-by-serial",
  description: "Get a specific NFT by token ID and serial number",
  inputSchema: z.object({
    tokenId: entityIdSchema.describe("Hedera token ID in format 0.0.123"),
    serialNumber: z.number().describe("NFT serial number"),
  }),
  execute: async ({ tokenId, serialNumber }) => {
    const result = await getMirrorClient().token.getNft(asEntityId(tokenId), serialNumber);
    return handleApiResult(result, "getNftBySerial");
  },
});

export const getNftTransactions = createTool({
  id: "get-nft-transactions",
  description: "Get all transactions for a specific NFT",
  inputSchema: z.object({
    tokenId: entityIdSchema.describe("Hedera token ID in format 0.0.123"),
    serialNumber: z.number().describe("NFT serial number"),
    timestamp: timestampSchema.describe("ISO timestamp to query transactions at a specific time"),
  }),
  execute: async ({ tokenId, serialNumber, timestamp }) => {
    const result = await getMirrorClient().token.getNftTransactions(
      asEntityId(tokenId),
      serialNumber,
      {
        timestamp,
      },
    );
    return handleApiResult(result, "getNftTransactions");
  },
});

export const listTokens = createTool({
  id: "list-tokens",
  description: "List all Hedera tokens. Returns all results.",
  inputSchema: z.object({
    accountId: entityIdSchema.optional().describe("Filter by account ID"),
    tokenId: entityIdSchema.optional().describe("Filter by token ID"),
    limit: limitSchema.describe("Maximum number of results to return"),
    name: z.string().optional().describe("Filter by token name"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    publicKey: z.string().optional().describe("Filter by public key"),
    type: z
      .enum(["FUNGIBLE_COMMON", "NON_FUNGIBLE_UNIQUE"])
      .optional()
      .describe("Filter by token type"),
  }),
  execute: async (params) => {
    const apiParams = toApiParams({
      accountId: params.accountId,
      tokenId: params.tokenId,
      limit: params.limit,
      name: params.name,
      order: params.order,
      publicKey: params.publicKey,
      type: params.type,
    });
    const result = await getMirrorClient().token.listPaginated(apiParams);
    return handleApiResult(result, "listTokens");
  },
});
