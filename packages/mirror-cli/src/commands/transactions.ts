import { asEntityId } from "@hieco/utils";
import {
  formatOutput,
  formatError,
  formatHbar,
  formatYesNo,
  type FormatOptions,
} from "../utils/format";
import { getClient } from "./accounts";

export async function getTransactionInfo(
  transactionId: string,
  options: FormatOptions & {
    nonce?: number;
    scheduled?: boolean;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.transaction.getById(transactionId, {
      nonce: options.nonce,
      scheduled: options.scheduled,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Transaction ID": data.transaction_id || transactionId,
      Name: data.name || "N/A",
      "Consensus Timestamp": data.consensus_timestamp || "N/A",
      Result: data.result ? (data.result === "SUCCESS" ? "✓ Success" : `✗ ${data.result}`) : "N/A",
      "Charged Tx Fee": formatHbar(data.charged_tx_fee || 0),
      "Max Fee": data.max_fee ? formatHbar(BigInt(data.max_fee)) : "N/A",
      "Memo Base64": data.memo_base64 || "N/A",
      "Transaction Hash": data.transaction_hash || "N/A",
      "Valid Start": data.valid_start_timestamp || "N/A",
      "Valid Duration": data.valid_duration_seconds || "N/A",
      Scheduled: formatYesNo(data.scheduled),
      Node: data.node || "N/A",
      "Entity ID": data.entity_id || "N/A",
      "NFT Transfers": data.nft_transfers?.length || 0,
      "Token Transfers": data.token_transfers?.length || 0,
      Transfers: data.transfers?.length || 0,
      "Staking Reward Transfers": data.staking_reward_transfers?.length || 0,
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getTransactionsByAccount(
  accountId: string,
  options: FormatOptions & {
    result?: string;
    scheduled?: boolean;
    timestamp?: string;
    transactionId?: string;
    transactionHash?: string;
    transactionType?: string;
    type?: "credit" | "debit";
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.transaction.listByAccount(asEntityId(accountId), {
      result: options.result,
      scheduled: options.scheduled,
      timestamp: options.timestamp,
      transaction_id: options.transactionId,
      transactionhash: options.transactionHash,
      transactiontype: options.transactionType,
      type: options.type,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Account ID": accountId,
      "Total Transactions": data.length,
      Transactions: data.map((tx) => ({
        "Transaction ID": tx.transaction_id,
        Name: tx.name,
        Result: tx.result,
        "Consensus Timestamp": tx.consensus_timestamp,
        "Charged Fee": formatHbar(tx.charged_tx_fee),
        "Transaction Hash": tx.transaction_hash,
        Scheduled: formatYesNo(tx.scheduled),
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function listTransactions(
  options: FormatOptions & {
    account?: string;
    accountId?: string;
    limit?: number;
    order?: "asc" | "desc";
    result?: string;
    scheduled?: boolean;
    timestamp?: string;
    transactionHash?: string;
    transactionId?: string;
    transactionType?: string;
    transfersAccount?: string;
    type?: "credit" | "debit";
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.transaction.listPaginated({
      account: options.account ? asEntityId(options.account) : undefined,
      "account.id": options.accountId ? asEntityId(options.accountId) : undefined,
      limit: options.limit,
      order: options.order,
      result: options.result,
      scheduled: options.scheduled,
      timestamp: options.timestamp,
      transactionhash: options.transactionHash,
      transaction_id: options.transactionId,
      transactiontype: options.transactionType,
      "transfers.account": options.transfersAccount
        ? asEntityId(options.transfersAccount)
        : undefined,
      type: options.type,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Total Transactions": data.length,
      Transactions: data.map((tx) => ({
        "Transaction ID": tx.transaction_id,
        Name: tx.name,
        Result: tx.result,
        "Consensus Timestamp": tx.consensus_timestamp,
        "Charged Fee": formatHbar(tx.charged_tx_fee),
        "Transaction Hash": tx.transaction_hash,
        Scheduled: formatYesNo(tx.scheduled),
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}
