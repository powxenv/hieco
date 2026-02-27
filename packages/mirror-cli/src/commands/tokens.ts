import { asEntityId } from "@hieco/mirror-shared";
import { formatOutput, formatError, formatYesNo, type FormatOptions } from "../utils/format";
import { getClient } from "./accounts";

export async function getTokenInfo(
  tokenId: string,
  options: FormatOptions & { network?: string; mirrorUrl?: string },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.token.getInfo(asEntityId(tokenId));

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Token ID": data.token_id,
      Name: data.name || "N/A",
      Symbol: data.symbol || "N/A",
      Type: data.type,
      "Supply Type": data.supply_type,
      "Total Supply": formatSupply(data.total_supply.toString(), data.decimals),
      "Max Supply":
        data.max_supply !== null
          ? formatSupply(data.max_supply.toString(), data.decimals)
          : "Unlimited",
      Decimals: data.decimals,
      "Admin Key": data.admin_key !== null ? "Set" : "N/A",
      "Kyc Key": data.kyc_key !== null ? "Set" : "N/A",
      "Freeze Key": data.freeze_key !== null ? "Set" : "N/A",
      "Wipe Key": data.wipe_key !== null ? "Set" : "N/A",
      "Supply Key": data.supply_key !== null ? "Set" : "N/A",
      "Fee Schedule Key": data.fee_schedule_key !== null ? "Set" : "N/A",
      "Pause Key": data.pause_key !== null ? "Set" : "N/A",
      "Metadata Key": data.metadata_key !== null ? "Set" : "N/A",
      "Custom Fees": `${data.custom_fees.fixed_fees?.length || 0} fixed, ${data.custom_fees.fractional_fees?.length || 0} fractional, ${data.custom_fees.royalty_fees?.length || 0} royalty`,
      "Default Freeze Status": data.freeze_default ? "Frozen" : "Unfrozen",
      "Pause Status": data.pause_status || "Not Paused",
      "Created Timestamp": data.created_timestamp || "N/A",
      "Modified Timestamp": data.modified_timestamp || "N/A",
      "Treasury Account ID": data.treasury_account_id || "N/A",
      "Auto Renew Account": data.auto_renew_account || "N/A",
      "Auto Renew Period": data.auto_renew_period ? `${data.auto_renew_period}s` : "N/A",
      "Expiry Timestamp": data.expiry_timestamp || "N/A",
      Memo: data.memo || "N/A",
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

function formatSupply(supply: string, decimals: number): string {
  const value = Number(supply) / Math.pow(10, decimals);
  return `${value.toLocaleString()} (${supply} raw)`;
}

export async function getTokenBalances(
  tokenId: string,
  options: FormatOptions & {
    accountId?: string;
    accountBalance?: number;
    accountPublicKey?: string;
    timestamp?: string;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.token.getBalances(asEntityId(tokenId), {
      account: options.accountId ? asEntityId(options.accountId) : undefined,
      "account.balance": options.accountBalance,
      "account.publickey": options.accountPublicKey,
      timestamp: options.timestamp,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Token ID": tokenId,
      "Total Holdings": data.length,
      Holdings: data.map((h) => ({
        Account: h.account,
        Balance: h.balance,
        Decimals: h.decimals,
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getTokenNfts(
  tokenId: string,
  options: FormatOptions & {
    accountId?: string;
    serialNumber?: number;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.token.getNfts(asEntityId(tokenId), {
      "account.id": options.accountId ? asEntityId(options.accountId) : undefined,
      serial_number: options.serialNumber,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const nfts = Array.isArray(data.nfts) ? data.nfts : [];
    const formatted = {
      "Token ID": tokenId,
      "Total NFTs": nfts.length || 0,
      NFTs: nfts.map((nft) => ({
        "Account ID": nft.account,
        "Serial Number": nft.serial_number,
        Delegated: nft.delegated_account_id || "N/A",
        Deleted: formatYesNo(nft.deleted),
        Metadata: nft.metadata || "N/A",
        "IPFS Hash": nft.ipfs_hash || "N/A",
        Created: nft.created_timestamp,
        Spender: nft.spender || "N/A",
        Symbol: nft.symbol || "N/A",
        Name: nft.name || "N/A",
        Treasury: formatYesNo(nft.treasury),
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getNftBySerial(
  tokenId: string,
  serialNumber: number,
  options: FormatOptions & { network?: string; mirrorUrl?: string },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.token.getNft(asEntityId(tokenId), serialNumber);

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Token ID": tokenId,
      "Serial Number": data.serial_number,
      "Account ID": data.account,
      Delegated: data.delegated_account_id || "N/A",
      Deleted: formatYesNo(data.deleted),
      Metadata: data.metadata || "N/A",
      "IPFS Hash": data.ipfs_hash || "N/A",
      Created: data.created_timestamp,
      Modified: data.modified_timestamp,
      Spender: data.spender || "N/A",
      Symbol: data.symbol || "N/A",
      Name: data.name || "N/A",
      Treasury: formatYesNo(data.treasury),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getNftTransactions(
  tokenId: string,
  serialNumber: number,
  options: FormatOptions & { timestamp?: string; network?: string; mirrorUrl?: string },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.token.getNftTransactions(asEntityId(tokenId), serialNumber, {
      timestamp: options.timestamp,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Token ID": tokenId,
      "Serial Number": serialNumber,
      "Total Transactions": data.length,
      Transactions: data.map((tx) => ({
        "Transaction ID": tx.transaction_id,
        Name: tx.name,
        Result: tx.result,
        "Consensus Timestamp": tx.consensus_timestamp,
        "Transaction Hash": tx.transaction_hash,
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function listTokens(
  options: FormatOptions & {
    accountId?: string;
    tokenId?: string;
    limit?: number;
    name?: string;
    order?: "asc" | "desc";
    publicKey?: string;
    type?: "FUNGIBLE_COMMON" | "NON_FUNGIBLE_UNIQUE";
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.token.listPaginated({
      "account.id": options.accountId ? asEntityId(options.accountId) : undefined,
      "token.id": options.tokenId ? asEntityId(options.tokenId) : undefined,
      limit: options.limit,
      name: options.name,
      order: options.order,
      public_key: options.publicKey,
      type: options.type,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Total Tokens": data.length,
      Tokens: data.map((token) => ({
        "Token ID": token.token_id,
        Name: token.name,
        Symbol: token.symbol,
        Type: token.type,
        Decimals: token.decimals,
        "Total Supply": token.total_supply,
        "Treasury Account": token.treasury_account_id,
        Memo: token.memo || "N/A",
        Deleted: formatYesNo(token.deleted),
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}
