import { formatOutput, formatError, type FormatOptions } from "../utils/format";
import { getClient } from "./accounts";

export async function getBlockInfo(
  blockHashOrNumber: string,
  options: FormatOptions & { network?: string; mirrorUrl?: string },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.block.getBlock(blockHashOrNumber);

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Block Hash": data.hash || blockHashOrNumber,
      "Block Number": data.number || "N/A",
      "Consensus Start": data.timestamp?.from || "N/A",
      "Consensus End": data.timestamp?.to || "N/A",
      "Gas Used": data.gas_used || 0,
      "Previous Hash": data.previous_hash || "N/A",
      "Record File Hash": data.record_file_hash || "N/A",
      "State Hash": data.state_hash || "N/A",
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getBlocks(
  options: FormatOptions & {
    blockNumber?: number;
    limit?: number;
    order?: "asc" | "desc";
    timestamp?: string;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.block.getBlocks({
      block_number: options.blockNumber,
      limit: options.limit,
      order: options.order,
      timestamp: options.timestamp,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Total Blocks": data.blocks?.length || 0,
      Blocks:
        data.blocks?.map((block) => ({
          "Block Hash": block.hash,
          "Block Number": block.number,
          "Consensus Start": block.timestamp?.from,
          "Consensus End": block.timestamp?.to,
          "Gas Used": block.gas_used,
          "Previous Hash": block.previous_hash,
        })) || [],
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function listBlocks(
  options: FormatOptions & {
    blockNumber?: number;
    limit?: number;
    order?: "asc" | "desc";
    timestamp?: string;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.block.listPaginated({
      block_number: options.blockNumber,
      limit: options.limit,
      order: options.order,
      timestamp: options.timestamp,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Total Blocks": data.length,
      Blocks: data.map((block) => ({
        "Block Hash": block.hash,
        "Block Number": block.number,
        "Consensus Start": block.timestamp?.from,
        "Consensus End": block.timestamp?.to,
        "Gas Used": block.gas_used,
        "Previous Hash": block.previous_hash,
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}
