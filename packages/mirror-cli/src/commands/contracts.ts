import { asEntityId } from "@hieco/mirror-shared";
import { formatOutput, formatError, formatYesNo, type FormatOptions } from "../utils/format";
import { getClient } from "./accounts";

export async function getContractInfo(
  contractId: string,
  options: FormatOptions & { timestamp?: string; network?: string; mirrorUrl?: string },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.contract.getInfo(contractId, {
      timestamp: options.timestamp,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Contract ID": data.contract_id || contractId,
      "EVM Address": data.evm_address || "N/A",
      "Admin Key": data.admin_key !== null ? "Set" : "N/A",
      "Auto Renew Account": data.auto_renew_account || "N/A",
      "Auto Renew Period": data.auto_renew_period ? `${data.auto_renew_period}s` : "N/A",
      Memo: data.memo || "N/A",
      Deleted: formatYesNo(data.deleted),
      "Permanent Removal": formatYesNo(data.permanent_removal),
      "Created Timestamp": data.created_timestamp || "N/A",
      "Expiry Timestamp": data.expiration_timestamp || "N/A",
      "File ID": data.file_id || "N/A",
      "Obtainer ID": data.obtainer_id || "N/A",
      "Proxy Account ID": data.proxy_account_id || "N/A",
      "Max Automatic Token Associations": data.max_automatic_token_associations || "N/A",
      Timestamp: data.timestamp || "N/A",
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function callContract(
  contractId: string,
  options: FormatOptions & {
    from?: string;
    gas?: number;
    gasPrice?: number;
    data?: string;
    estimate?: boolean;
    block?: string;
    value?: number;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const callParams = {
      contractId: asEntityId(contractId),
      ...(options.from !== undefined && { from: options.from }),
      ...(options.gas !== undefined && { gas: options.gas }),
      ...(options.gasPrice !== undefined && { gasPrice: options.gasPrice }),
      ...(options.data !== undefined && { data: options.data }),
      ...(options.estimate !== undefined && { estimate: options.estimate }),
      ...(options.block !== undefined && { block: options.block }),
      ...(options.value !== undefined && { value: options.value }),
    };

    const result = await mirrorClient.contract.call(callParams);

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Contract ID": contractId,
      Result: data.result || "N/A",
      Error: data.error || "N/A",
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getContractResults(
  contractId: string,
  options: FormatOptions & {
    blockHash?: string;
    blockNumber?: number;
    from?: string;
    internal?: boolean;
    timestamp?: string;
    transactionIndex?: number;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.contract.getResults(
      contractId as `${number}.${number}.${number}`,
      {
        "block.hash": options.blockHash,
        block_number: options.blockNumber,
        from: options.from,
        internal: options.internal,
        timestamp: options.timestamp,
        transaction_index: options.transactionIndex,
      },
    );

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Contract ID": contractId,
      "Total Results": data.length,
      Results: data.map((r) => ({
        "Contract ID": r.contract_id,
        Address: r.address,
        "Call Result": r.call_result || "N/A",
        "Error Message": r.error_message || "N/A",
        "Gas Used": r.gas_used,
        Result: r.result || "N/A",
        Timestamp: r.timestamp,
        To: r.to,
        From: r.from || "N/A",
        "Function Parameters": r.function_parameters,
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getContractResult(
  contractId: string,
  timestamp: string,
  options: FormatOptions & { network?: string; mirrorUrl?: string },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.contract.getResult(
      contractId as `${number}.${number}.${number}`,
      timestamp,
    );

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Contract ID": contractId,
      Timestamp: data.timestamp,
      "Call Result": data.call_result || "N/A",
      "Error Message": data.error_message || "N/A",
      "Gas Used": data.gas_used,
      Result: data.result || "N/A",
      To: data.to,
      From: data.from || "N/A",
      "Function Parameters": data.function_parameters,
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getContractState(
  contractId: string,
  options: FormatOptions & {
    slot?: string;
    timestamp?: string;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.contract.getState(
      contractId as `${number}.${number}.${number}`,
      {
        slot: options.slot,
        timestamp: options.timestamp,
      },
    );

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Contract ID": contractId,
      "Total State Slots": data.length,
      State: data.map((s) => ({
        "Contract ID": s.contract_id,
        Address: s.address,
        Slot: s.slot,
        Value: s.value,
        Timestamp: s.timestamp,
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getContractLogs(
  contractId: string,
  options: FormatOptions & {
    index?: number;
    timestamp?: string;
    topic0?: string;
    topic1?: string;
    topic2?: string;
    topic3?: string;
    transactionHash?: string;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.contract.getLogs(
      contractId as `${number}.${number}.${number}`,
      {
        index: options.index,
        timestamp: options.timestamp,
        topic0: options.topic0,
        topic1: options.topic1,
        topic2: options.topic2,
        topic3: options.topic3,
        "transaction.hash": options.transactionHash,
      },
    );

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Contract ID": contractId,
      "Total Logs": data.length,
      Logs: data.map((log) => ({
        Address: log.address,
        "Block Hash": log.block_hash,
        "Block Number": log.block_number,
        Data: log.data,
        Index: log.index,
        "Root Contract ID": log.root_contract_id,
        Timestamp: log.timestamp,
        Topics: log.topics.join(", "),
        "Transaction Hash": log.transaction_hash,
        "Transaction Index": log.transaction_index || "N/A",
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getAllContractResults(
  options: FormatOptions & {
    from?: string;
    blockHash?: string;
    blockNumber?: number;
    internal?: boolean;
    timestamp?: string;
    transactionIndex?: number;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.contract.getAllResults({
      from: options.from,
      block_hash: options.blockHash,
      block_number: options.blockNumber,
      internal: options.internal,
      timestamp: options.timestamp,
      transaction_index: options.transactionIndex,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Total Results": data.results?.length || 0,
      Results:
        data.results?.map((r) => ({
          "Contract ID": r.contract_id,
          Address: r.address,
          "Call Result": r.call_result || "N/A",
          "Error Message": r.error_message || "N/A",
          "Gas Used": r.gas_used,
          Result: r.result || "N/A",
          Timestamp: r.timestamp,
        })) || [],
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getResultByTransaction(
  transactionIdOrHash: string,
  options: FormatOptions & { nonce?: number; network?: string; mirrorUrl?: string },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.contract.getResultByTransactionIdOrHash(transactionIdOrHash, {
      nonce: options.nonce,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Transaction ID": data.transaction_id || transactionIdOrHash,
      Hash: data.hash || "N/A",
      "Contract ID": data.contract_id,
      "Call Result": data.call_result || "N/A",
      "Error Message": data.error_message || "N/A",
      "Gas Used": data.gas_used,
      Result: data.result || "N/A",
      To: data.to,
      From: data.from || "N/A",
      "Function Parameters": data.function_parameters,
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getResultActions(
  transactionIdOrHash: string,
  options: FormatOptions & { index?: number; network?: string; mirrorUrl?: string },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.contract.getResultActions(transactionIdOrHash, {
      index: options.index,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Transaction ID/Hash": transactionIdOrHash,
      "Total Actions": data.actions?.length || 0,
      Actions:
        data.actions?.map((a) => ({
          Caller: a.caller,
          "Call Depth": a.call_depth,
          "Call Operation Type": a.call_operation_type,
          "Call Type": a.call_type,
          "Destination Data": a.destination_data,
          "Function Parameters": a.function_parameters,
          "Function Result Data": a.function_result_data,
          Gas: a.gas,
          Index: a.index,
          Input: a.input,
          Recipient: a.recipient,
          "Result Data": a.result_data,
          Type: a.type,
          Value: a.value,
        })) || [],
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getResultOpcodes(
  transactionIdOrHash: string,
  options: FormatOptions & {
    stack?: boolean;
    memory?: boolean;
    storage?: boolean;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.contract.getResultOpcodes(transactionIdOrHash, {
      stack: options.stack,
      memory: options.memory,
      storage: options.storage,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Transaction ID/Hash": transactionIdOrHash,
      "Total Opcodes": data.opcodes?.length || 0,
      Opcodes:
        data.opcodes?.map((op) => ({
          Address: op.address,
          Instruction: op.instruction,
          Opcode: op.opcode,
          Gas: op.gas,
        })) || [],
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function listContracts(
  options: FormatOptions & {
    address?: string;
    contractId?: string;
    limit?: number;
    order?: "asc" | "desc";
    smartContractId?: string;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.contract.listPaginated({
      address: options.address,
      "contract.id": options.contractId as `${number}.${number}.${number}`,
      limit: options.limit,
      order: options.order,
      smart_contract_id: options.smartContractId as `${number}.${number}.${number}`,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Total Contracts": data.length,
      Contracts: data.map((c) => ({
        "Contract ID": c.contract_id,
        "EVM Address": c.evm_address,
        "Admin Key": c.admin_key !== null ? "Set" : "N/A",
        Memo: c.memo || "N/A",
        Deleted: formatYesNo(c.deleted),
        "Created Timestamp": c.created_timestamp,
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}
