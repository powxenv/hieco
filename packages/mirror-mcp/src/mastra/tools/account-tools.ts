import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { mirrorClient } from "../../config/client";
import { asEntityId } from "@hiecom/mirror-shared";

const entityIdSchema = z.string().regex(/^\d+\.\d+\.\d+$/);

export const getAccountInfo = createTool({
  id: "get-account-info",
  description: "Get detailed information about a Hedera account including balance, memo, and keys",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
    timestamp: z
      .string()
      .optional()
      .describe("ISO timestamp to query account state at a specific time"),
    transactions: z.boolean().optional().describe("Include transaction information"),
  }),
  execute: async ({ accountId, timestamp, transactions }) => {
    const result = await mirrorClient.account.getInfo(asEntityId(accountId), {
      timestamp,
      transactions,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getAccountBalances = createTool({
  id: "get-account-balances",
  description: "Get all token balances for a Hedera account including hbar balance",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
  }),
  execute: async ({ accountId }) => {
    const result = await mirrorClient.account.getBalances(asEntityId(accountId));
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getAccountTokens = createTool({
  id: "get-account-tokens",
  description: "Get all tokens associated with a Hedera account",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
    tokenId: entityIdSchema.optional().describe("Filter by specific token ID"),
  }),
  execute: async ({ accountId, tokenId }) => {
    const result = await mirrorClient.account.getTokens(asEntityId(accountId), {
      "token.id": tokenId ? asEntityId(tokenId) : undefined,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getAccountNfts = createTool({
  id: "get-account-nfts",
  description: "Get all NFTs held by a Hedera account",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
    spenderId: entityIdSchema.optional().describe("Filter by spender ID"),
    tokenId: entityIdSchema.optional().describe("Filter by token ID"),
    serialNumber: z.number().optional().describe("Filter by serial number"),
  }),
  execute: async ({ accountId, spenderId, tokenId, serialNumber }) => {
    const result = await mirrorClient.account.getNfts(asEntityId(accountId), {
      "spender.id": spenderId ? asEntityId(spenderId) : undefined,
      "token.id": tokenId ? asEntityId(tokenId) : undefined,
      serial_number: serialNumber,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getStakingRewards = createTool({
  id: "get-staking-rewards",
  description: "Get staking rewards for a Hedera account",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
    timestamp: z.string().optional().describe("ISO timestamp to query rewards at a specific time"),
  }),
  execute: async ({ accountId, timestamp }) => {
    const result = await mirrorClient.account.getStakingRewards(asEntityId(accountId), {
      timestamp,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getCryptoAllowances = createTool({
  id: "get-crypto-allowances",
  description: "Get HBAR allowances granted by a Hedera account to spenders",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
    spenderId: entityIdSchema.optional().describe("Filter by spender ID"),
  }),
  execute: async ({ accountId, spenderId }) => {
    const result = await mirrorClient.account.getCryptoAllowances(asEntityId(accountId), {
      "spender.id": spenderId ? asEntityId(spenderId) : undefined,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getTokenAllowances = createTool({
  id: "get-token-allowances",
  description: "Get token allowances granted by a Hedera account to spenders",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
    spenderId: entityIdSchema.optional().describe("Filter by spender ID"),
    tokenId: entityIdSchema.optional().describe("Filter by token ID"),
  }),
  execute: async ({ accountId, spenderId, tokenId }) => {
    const result = await mirrorClient.account.getTokenAllowances(asEntityId(accountId), {
      "spender.id": spenderId ? asEntityId(spenderId) : undefined,
      "token.id": tokenId ? asEntityId(tokenId) : undefined,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getNftAllowances = createTool({
  id: "get-nft-allowances",
  description: "Get NFT allowances granted by a Hedera account to spenders",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
    accountIdFilter: entityIdSchema.optional().describe("Filter by account ID"),
    tokenId: entityIdSchema.optional().describe("Filter by token ID"),
    owner: z.boolean().optional().describe("Filter by owner status"),
  }),
  execute: async ({ accountId, accountIdFilter, tokenId, owner }) => {
    const result = await mirrorClient.account.getNftAllowances(asEntityId(accountId), {
      "account.id": accountIdFilter ? asEntityId(accountIdFilter) : undefined,
      "token.id": tokenId ? asEntityId(tokenId) : undefined,
      owner,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getOutstandingAirdrops = createTool({
  id: "get-outstanding-airdrops",
  description: "Get outstanding airdrops for a Hedera account",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
    receiverId: entityIdSchema.optional().describe("Filter by receiver ID"),
    serialNumber: z.number().optional().describe("Filter by serial number"),
    tokenId: entityIdSchema.optional().describe("Filter by token ID"),
  }),
  execute: async ({ accountId, receiverId, serialNumber, tokenId }) => {
    const result = await mirrorClient.account.getOutstandingAirdrops(asEntityId(accountId), {
      "receiver.id": receiverId ? asEntityId(receiverId) : undefined,
      serial_number: serialNumber,
      "token.id": tokenId ? asEntityId(tokenId) : undefined,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getPendingAirdrops = createTool({
  id: "get-pending-airdrops",
  description: "Get pending airdrops for a Hedera account",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
    senderId: entityIdSchema.optional().describe("Filter by sender ID"),
    serialNumber: z.number().optional().describe("Filter by serial number"),
    tokenId: entityIdSchema.optional().describe("Filter by token ID"),
  }),
  execute: async ({ accountId, senderId, serialNumber, tokenId }) => {
    const result = await mirrorClient.account.getPendingAirdrops(asEntityId(accountId), {
      "sender.id": senderId ? asEntityId(senderId) : undefined,
      serial_number: serialNumber,
      "token.id": tokenId ? asEntityId(tokenId) : undefined,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const listAccounts = createTool({
  id: "list-accounts",
  description: "List all Hedera accounts. Returns all results.",
  inputSchema: z.object({
    account: entityIdSchema.optional().describe("Filter by account ID"),
    alias: z.string().optional().describe("Filter by alias"),
    balance: z.number().optional().describe("Filter by exact balance"),
    balanceGte: z.number().optional().describe("Filter by balance greater than or equal to"),
    balanceLte: z.number().optional().describe("Filter by balance less than or equal to"),
    evmAddress: z.string().optional().describe("Filter by EVM address"),
    key: z.string().optional().describe("Filter by public key"),
    limit: z.number().optional().describe("Maximum number of results to return"),
    memo: z.string().optional().describe("Filter by memo"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    publicKey: z.string().optional().describe("Filter by public key"),
    smartContract: z.boolean().optional().describe("Filter by smart contract status"),
    stakedAccountId: entityIdSchema.optional().describe("Filter by staked account ID"),
    stakedNodeId: z.number().optional().describe("Filter by staked node ID"),
  }),
  execute: async (params) => {
    const result = await mirrorClient.account.listPaginated({
      account: params.account as `${number}.${number}.${number}` | undefined,
      alias: params.alias,
      balance: params.balance,
      balance_gte: params.balanceGte,
      balance_lte: params.balanceLte,
      evm_address: params.evmAddress,
      key: params.key,
      limit: params.limit,
      memo: params.memo,
      order: params.order,
      public_key: params.publicKey,
      smart_contract: params.smartContract,
      staked_account_id: params.stakedAccountId as `${number}.${number}.${number}` | undefined,
      staked_node_id: params.stakedNodeId,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});
