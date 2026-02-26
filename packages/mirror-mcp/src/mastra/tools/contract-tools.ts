import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { mirrorClient } from "../../config/client";
import { asEntityId } from "@hiecom/mirror-shared";

const entityIdSchema = z.string().regex(/^\d+\.\d+\.\d+$/);

export const getContractInfo = createTool({
  id: "get-contract-info",
  description: "Get detailed information about a Hedera smart contract including bytecode and ABI",
  inputSchema: z.object({
    contractIdOrAddress: z.string().describe("Hedera contract ID (0.0.123) or EVM address (0x...)"),
    timestamp: z
      .string()
      .optional()
      .describe("ISO timestamp to query contract state at a specific time"),
  }),
  execute: async ({ contractIdOrAddress, timestamp }) => {
    const result = await mirrorClient.contract.getInfo(contractIdOrAddress, {
      timestamp,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const callContract = createTool({
  id: "call-contract",
  description:
    "Execute a read-only smart contract call (local call). Does not submit a transaction.",
  inputSchema: z.object({
    contractId: z.string().describe("Hedera contract ID or EVM address to call"),
    from: z.string().optional().describe("Caller EVM address"),
    gas: z.number().optional().describe("Gas limit for the call"),
    gasPrice: z.number().optional().describe("Gas price in tinybars"),
    data: z.string().optional().describe("Encoded function call data"),
    estimate: z.boolean().optional().describe("Whether to estimate gas"),
    block: z.string().optional().describe("Block number or 'latest'"),
    value: z.number().optional().describe("Value to send in tinybars"),
  }),
  execute: async ({ contractId, from, gas, gasPrice, data, estimate, block, value }) => {
    const callParams: Record<string, unknown> = { contractId };
    if (from) callParams.from = from;
    if (gas !== undefined) callParams.gas = gas;
    if (gasPrice !== undefined) callParams.gasPrice = gasPrice;
    if (data) callParams.data = data;
    if (estimate !== undefined) callParams.estimate = estimate;
    if (block) callParams.block = block;
    if (value !== undefined) callParams.value = value;

    const result = await mirrorClient.contract.call(
      callParams as unknown as Parameters<typeof mirrorClient.contract.call>[0],
    );
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getContractResults = createTool({
  id: "get-contract-results",
  description: "Get all contract execution results for a specific contract",
  inputSchema: z.object({
    contractId: entityIdSchema.describe("Hedera contract ID in format 0.0.123"),
    blockHash: z.string().optional().describe("Filter by block hash"),
    blockNumber: z.number().optional().describe("Filter by block number"),
    from: z.string().optional().describe("Filter by caller address"),
    internal: z.boolean().optional().describe("Filter for internal calls"),
    timestamp: z.string().optional().describe("ISO timestamp filter"),
    transactionIndex: z.number().optional().describe("Filter by transaction index"),
  }),
  execute: async ({
    contractId,
    blockHash,
    blockNumber,
    from,
    internal,
    timestamp,
    transactionIndex,
  }) => {
    const result = await mirrorClient.contract.getResults(asEntityId(contractId), {
      "block.hash": blockHash,
      block_number: blockNumber,
      from,
      internal,
      timestamp,
      transaction_index: transactionIndex,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getContractResult = createTool({
  id: "get-contract-result",
  description: "Get a specific contract result by contract ID and timestamp",
  inputSchema: z.object({
    contractId: entityIdSchema.describe("Hedera contract ID in format 0.0.123"),
    timestamp: z.string().describe("ISO timestamp of the contract result"),
  }),
  execute: async ({ contractId, timestamp }) => {
    const result = await mirrorClient.contract.getResult(asEntityId(contractId), timestamp);
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getContractState = createTool({
  id: "get-contract-state",
  description: "Get contract storage state (slot values) for a specific contract",
  inputSchema: z.object({
    contractId: entityIdSchema.describe("Hedera contract ID in format 0.0.123"),
    slot: z.string().optional().describe("Filter by storage slot"),
    timestamp: z.string().optional().describe("ISO timestamp to query state at a specific time"),
  }),
  execute: async ({ contractId, slot, timestamp }) => {
    const result = await mirrorClient.contract.getState(asEntityId(contractId), {
      slot,
      timestamp,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getContractLogs = createTool({
  id: "get-contract-logs",
  description: "Get event logs for a specific contract",
  inputSchema: z.object({
    contractId: entityIdSchema.describe("Hedera contract ID in format 0.0.123"),
    index: z.number().optional().describe("Filter by log index"),
    timestamp: z.string().optional().describe("ISO timestamp filter"),
    topic0: z.string().optional().describe("Filter by event signature (topic 0)"),
    topic1: z.string().optional().describe("Filter by topic 1"),
    topic2: z.string().optional().describe("Filter by topic 2"),
    topic3: z.string().optional().describe("Filter by topic 3"),
    transactionHash: z.string().optional().describe("Filter by transaction hash"),
  }),
  execute: async ({
    contractId,
    index,
    timestamp,
    topic0,
    topic1,
    topic2,
    topic3,
    transactionHash,
  }) => {
    const result = await mirrorClient.contract.getLogs(asEntityId(contractId), {
      index,
      timestamp,
      topic0,
      topic1,
      topic2,
      topic3,
      "transaction.hash": transactionHash,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getAllContractResults = createTool({
  id: "get-all-contract-results",
  description: "Get all contract execution results across all contracts",
  inputSchema: z.object({
    from: z.string().optional().describe("Filter by caller address"),
    blockHash: z.string().optional().describe("Filter by block hash"),
    blockNumber: z.number().optional().describe("Filter by block number"),
    internal: z.boolean().optional().describe("Filter for internal calls"),
    timestamp: z.string().optional().describe("ISO timestamp filter"),
    transactionIndex: z.number().optional().describe("Filter by transaction index"),
  }),
  execute: async ({ from, blockHash, blockNumber, internal, timestamp, transactionIndex }) => {
    const result = await mirrorClient.contract.getAllResults({
      from,
      block_hash: blockHash,
      block_number: blockNumber,
      internal,
      timestamp,
      transaction_index: transactionIndex,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getResultByTransaction = createTool({
  id: "get-result-by-transaction",
  description: "Get contract result details by transaction ID or hash",
  inputSchema: z.object({
    transactionIdOrHash: z.string().describe("Transaction ID or hash"),
    nonce: z.number().optional().describe("Transaction nonce"),
  }),
  execute: async ({ transactionIdOrHash, nonce }) => {
    const result = await mirrorClient.contract.getResultByTransactionIdOrHash(transactionIdOrHash, {
      nonce,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getResultActions = createTool({
  id: "get-result-actions",
  description: "Get contract result actions (internal calls) by transaction ID or hash",
  inputSchema: z.object({
    transactionIdOrHash: z.string().describe("Transaction ID or hash"),
    index: z.number().optional().describe("Filter by action index"),
  }),
  execute: async ({ transactionIdOrHash, index }) => {
    const result = await mirrorClient.contract.getResultActions(transactionIdOrHash, {
      index,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const getResultOpcodes = createTool({
  id: "get-result-opcodes",
  description: "Get contract result opcodes (execution trace) by transaction ID or hash",
  inputSchema: z.object({
    transactionIdOrHash: z.string().describe("Transaction ID or hash"),
    stack: z.boolean().optional().describe("Include stack trace"),
    memory: z.boolean().optional().describe("Include memory dump"),
    storage: z.boolean().optional().describe("Include storage state"),
  }),
  execute: async ({ transactionIdOrHash, stack, memory, storage }) => {
    const result = await mirrorClient.contract.getResultOpcodes(transactionIdOrHash, {
      stack,
      memory,
      storage,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});

export const listContracts = createTool({
  id: "list-contracts",
  description: "List all Hedera smart contracts. Returns all results.",
  inputSchema: z.object({
    address: z.string().optional().describe("Filter by EVM address"),
    contractId: entityIdSchema.optional().describe("Filter by contract ID"),
    limit: z.number().optional().describe("Maximum number of results to return"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order"),
    smartContractId: entityIdSchema.optional().describe("Filter by smart contract ID"),
  }),
  execute: async (params) => {
    const result = await mirrorClient.contract.listPaginated({
      "contract.id": params.contractId as `${number}.${number}.${number}` | undefined,
      address: params.address,
      limit: params.limit,
      order: params.order,
      smart_contract_id: params.smartContractId as `${number}.${number}.${number}` | undefined,
    });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  },
});
