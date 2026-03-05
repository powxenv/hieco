import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { mirrorClient } from "../../mirror-client";
import { asEntityId } from "@hieco/utils";
import { handleApiResult } from "../../errors";
import {
  entityIdSchema,
  evmAddressSchema,
  limitSchema,
  nodeIdSchema,
  serialNumberSchema,
  timestampSchema,
  toApiParams,
} from "../../schemas";

export const getAccountInfo = createTool({
  id: "get-account-info",
  description:
    "Get detailed information about a Hedera account including current HBAR balance, " +
    "memo message, ECDSA public key, account relationships (staking, allowances), " +
    "and smart contract status. Use this to verify account existence and check balances " +
    "before initiating transactions.",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
    timestamp: timestampSchema.describe("ISO timestamp to query account state at a specific time"),
    transactions: z
      .boolean()
      .optional()
      .describe("Include recent transaction information (may increase response size)"),
  }),
  execute: async ({ accountId, timestamp, transactions }) => {
    const result = await mirrorClient.account.getInfo(asEntityId(accountId), {
      timestamp,
      transactions,
    });
    return handleApiResult(result, `getAccountInfo(${accountId})`);
  },
});

export const getAccountBalances = createTool({
  id: "get-account-balances",
  description:
    "Get all token balances for a Hedera account including HBAR balance and all " +
    "fungible token balances. Returns zero balances for tokens with no holdings. " +
    "Use this to check if an account has sufficient funds before transactions.",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
  }),
  execute: async ({ accountId }) => {
    const result = await mirrorClient.account.getBalances(asEntityId(accountId));
    return handleApiResult(result, `getAccountBalances(${accountId})`);
  },
});

export const getAccountTokens = createTool({
  id: "get-account-tokens",
  description:
    "Get all tokens associated with a Hedera account, including fungible tokens " +
    "and NFT collections. Shows token relationships like balances, allowances, " +
    "and ownership. Use to discover what tokens an account can interact with.",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
    tokenId: entityIdSchema.optional().describe("Filter by specific token ID"),
  }),
  execute: async ({ accountId, tokenId }) => {
    const result = await mirrorClient.account.getTokens(asEntityId(accountId), {
      "token.id": tokenId ? asEntityId(tokenId) : undefined,
    });
    return handleApiResult(result, `getAccountTokens(${accountId})`);
  },
});

export const getAccountNfts = createTool({
  id: "get-account-nfts",
  description:
    "Get all NFTs held by a Hedera account. Returns NFT details including token ID, " +
    "serial number, metadata, and owner information. Use to verify NFT ownership " +
    "and track NFT collections.",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
    spenderId: entityIdSchema.optional().describe("Filter by spender ID (for approved NFTs)"),
    tokenId: entityIdSchema.optional().describe("Filter by specific token ID"),
    serialNumber: serialNumberSchema.describe("Filter by serial number"),
  }),
  execute: async ({ accountId, spenderId, tokenId, serialNumber }) => {
    const result = await mirrorClient.account.getNfts(asEntityId(accountId), {
      "spender.id": spenderId ? asEntityId(spenderId) : undefined,
      "token.id": tokenId ? asEntityId(tokenId) : undefined,
      serial_number: serialNumber,
    });
    return handleApiResult(result, `getAccountNfts(${accountId})`);
  },
});

export const getStakingRewards = createTool({
  id: "get-staking-rewards",
  description:
    "Get staking rewards for a Hedera account. Shows historical reward payments " +
    "from node staking or account staking. Use to track staking income and verify " +
    "reward payments.",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
    timestamp: timestampSchema.describe("ISO timestamp to query rewards at a specific time"),
  }),
  execute: async ({ accountId, timestamp }) => {
    const result = await mirrorClient.account.getStakingRewards(asEntityId(accountId), {
      timestamp,
    });
    return handleApiResult(result, `getStakingRewards(${accountId})`);
  },
});

export const getCryptoAllowances = createTool({
  id: "get-crypto-allowances",
  description:
    "Get HBAR allowances granted by a Hedera account to spender accounts. " +
    "Shows how much HBAR each spender is approved to spend. Use to verify " +
    "allowance amounts before allowance-based transactions.",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
    spenderId: entityIdSchema.optional().describe("Filter by spender account ID"),
  }),
  execute: async ({ accountId, spenderId }) => {
    const result = await mirrorClient.account.getCryptoAllowances(asEntityId(accountId), {
      "spender.id": spenderId ? asEntityId(spenderId) : undefined,
    });
    return handleApiResult(result, `getCryptoAllowances(${accountId})`);
  },
});

export const getTokenAllowances = createTool({
  id: "get-token-allowances",
  description:
    "Get token allowances granted by a Hedera account to spender accounts. " +
    "Shows how much of each token each spender is approved to spend. Use to " +
    "verify token allowance amounts before allowance-based token transfers.",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
    spenderId: entityIdSchema.optional().describe("Filter by spender account ID"),
    tokenId: entityIdSchema.optional().describe("Filter by token ID"),
  }),
  execute: async ({ accountId, spenderId, tokenId }) => {
    const result = await mirrorClient.account.getTokenAllowances(asEntityId(accountId), {
      "spender.id": spenderId ? asEntityId(spenderId) : undefined,
      "token.id": tokenId ? asEntityId(tokenId) : undefined,
    });
    return handleApiResult(result, `getTokenAllowances(${accountId})`);
  },
});

export const getNftAllowances = createTool({
  id: "get-nft-allowances",
  description:
    "Get NFT allowances granted by a Hedera account. Shows which NFTs have " +
    "been approved for spending by other accounts. Use to verify NFT approvals " +
    "before NFT transfers.",
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
    return handleApiResult(result, `getNftAllowances(${accountId})`);
  },
});

export const getOutstandingAirdrops = createTool({
  id: "get-outstanding-airdrops",
  description:
    "Get outstanding airdrops for a Hedera account. Shows pending NFT airdrops " +
    "that have been scheduled but not yet claimed. Use to track incoming airdrops " +
    "and check airdrop status.",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
    receiverId: entityIdSchema.optional().describe("Filter by receiver account ID"),
    serialNumber: serialNumberSchema.describe("Filter by serial number"),
    tokenId: entityIdSchema.optional().describe("Filter by token ID"),
  }),
  execute: async ({ accountId, receiverId, serialNumber, tokenId }) => {
    const result = await mirrorClient.account.getOutstandingAirdrops(asEntityId(accountId), {
      "receiver.id": receiverId ? asEntityId(receiverId) : undefined,
      serial_number: serialNumber,
      "token.id": tokenId ? asEntityId(tokenId) : undefined,
    });
    return handleApiResult(result, `getOutstandingAirdrops(${accountId})`);
  },
});

export const getPendingAirdrops = createTool({
  id: "get-pending-airdrops",
  description:
    "Get pending airdrops for a Hedera account. Shows NFT airdrops that are " +
    "in progress but not yet completed. Use to monitor ongoing airdrop operations.",
  inputSchema: z.object({
    accountId: entityIdSchema.describe("Hedera account ID in format 0.0.123"),
    senderId: entityIdSchema.optional().describe("Filter by sender account ID"),
    serialNumber: serialNumberSchema.describe("Filter by serial number"),
    tokenId: entityIdSchema.optional().describe("Filter by token ID"),
  }),
  execute: async ({ accountId, senderId, serialNumber, tokenId }) => {
    const result = await mirrorClient.account.getPendingAirdrops(asEntityId(accountId), {
      "sender.id": senderId ? asEntityId(senderId) : undefined,
      serial_number: serialNumber,
      "token.id": tokenId ? asEntityId(tokenId) : undefined,
    });
    return handleApiResult(result, `getPendingAirdrops(${accountId})`);
  },
});

export const listAccounts = createTool({
  id: "list-accounts",
  description:
    "List all Hedera accounts with optional filters. Returns paginated results " +
    "with account details including balances, keys, and metadata. Use for account " +
    "discovery and filtering. Consider using specific filters to reduce response size.",
  inputSchema: z.object({
    account: entityIdSchema.optional().describe("Filter by account ID"),
    alias: z.string().optional().describe("Filter by alias (base64 encoded)"),
    balance: z.number().optional().describe("Filter by exact HBAR balance (in tinybars)"),
    balanceGte: z.number().optional().describe("Filter by balance greater than or equal to"),
    balanceLte: z.number().optional().describe("Filter by balance less than or equal to"),
    evmAddress: evmAddressSchema.describe("Filter by EVM address (0x...)"),
    key: z.string().optional().describe("Filter by public key (hex encoded)"),
    limit: limitSchema,
    memo: z.string().optional().describe("Filter by memo content"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order (asc or desc)"),
    publicKey: z.string().optional().describe("Filter by public key"),
    smartContract: z.boolean().optional().describe("Filter for smart contracts only"),
    stakedAccountId: entityIdSchema.optional().describe("Filter by staked account ID"),
    stakedNodeId: nodeIdSchema.describe("Filter by staked node ID"),
  }),
  execute: async (params) => {
    const apiParams = toApiParams({
      account: params.account,
      alias: params.alias,
      balance: params.balance,
      balanceGte: params.balanceGte,
      balanceLte: params.balanceLte,
      evmAddress: params.evmAddress,
      key: params.key,
      limit: params.limit,
      memo: params.memo,
      order: params.order,
      publicKey: params.publicKey,
      smartContract: params.smartContract,
      stakedAccountId: params.stakedAccountId,
      stakedNodeId: params.stakedNodeId,
    });
    const result = await mirrorClient.account.listPaginated(apiParams);
    return handleApiResult(result, "listAccounts");
  },
});
