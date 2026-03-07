import { MirrorNodeClient } from "@hieco/mirror";
import type { NetworkType } from "@hieco/utils";
import {
  formatOutput,
  formatError,
  formatHbar,
  formatYesNo,
  type FormatOptions,
} from "../utils/format";

let client: MirrorNodeClient | null = null;

function parseNetworkType(network?: string): NetworkType {
  if (!network) return "mainnet";
  if (network === "mainnet" || network === "testnet" || network === "previewnet") {
    return network;
  }
  return "mainnet";
}

export function getClient(network?: string, mirrorUrl?: string) {
  const networkType = parseNetworkType(network);
  if (!client || client.networkType !== networkType) {
    client = new MirrorNodeClient({ network: networkType, mirrorNodeUrl: mirrorUrl });
  }
  return client;
}

export async function getAccountInfo(
  accountId: string,
  options: FormatOptions & { timestamp?: string; network?: string; mirrorUrl?: string },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.account.getInfo(accountId, {
      timestamp: options.timestamp,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Account ID": data.account,
      Alias: data.alias || "N/A",
      "ECDSA Public Key": data.key?.key || "N/A",
      Balance: formatHbar(data.balance.balance ?? 0),
      "Token Balances": `${data.balance.tokens.length} tokens`,
      "Auto Renew Period": data.auto_renew_period ? `${data.auto_renew_period}s` : "N/A",
      "Max Automatic Token Associations": data.max_automatic_token_associations || "N/A",
      Memo: data.memo || "N/A",
      Deleted: formatYesNo(data.deleted),
      "EVM Address": data.evm_address || "N/A",
      "Ethereum Nonce": data.ethereum_nonce || "N/A",
      "Staked Node ID": data.staked_node_id || "N/A",
      "Staked Account ID": data.staked_account_id || "N/A",
      "Decline Reward": formatYesNo(data.decline_reward),
      "Pending Reward": formatHbar(data.pending_reward ?? 0),
      "Stake Period Start": data.stake_period_start || "N/A",
      "Receiver Sig Required": formatYesNo(data.receiver_sig_required),
      "Created Timestamp": data.created_timestamp || "N/A",
      "Expiry Timestamp": data.expiry_timestamp || "N/A",
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getAccountBalance(
  accountId: string,
  options: FormatOptions & { network?: string; mirrorUrl?: string },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.account.getBalances(accountId);

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Account ID": accountId,
      Timestamp: data.timestamp || "N/A",
      "HBAR Balance": formatHbar(data.balance ?? 0),
      "Token Balances":
        data.tokens.length > 0
          ? data.tokens.map((t) => ({
              "Token ID": t.token_id,
              Balance: t.balance,
            }))
          : "No token balances",
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getAccountTokens(
  accountId: string,
  options: FormatOptions & {
    tokenId?: string;
    limit?: number;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.account.getTokens(
      accountId,
      options.tokenId ? { "token.id": options.tokenId } : undefined,
    );

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Account ID": accountId,
      "Total Tokens": data.length,
      Tokens: data.map((t) => ({
        "Token ID": t.token_id,
        Balance: t.balance,
        Decimals: t.decimals,
        "Freeze Status": t.freeze_status,
        "KYC Status": t.kyc_status,
        "Auto Association": formatYesNo(t.automatic_association),
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getAccountNfts(
  accountId: string,
  options: FormatOptions & {
    spenderId?: string;
    tokenId?: string;
    serialNumber?: number;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.account.getNfts(accountId, {
      "spender.id": options.spenderId,
      "token.id": options.tokenId,
      serial_number: options.serialNumber,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Account ID": accountId,
      "Total NFTs": data.length,
      NFTs: data.map((nft) => ({
        "Token ID": nft.token_id,
        Balance: nft.balance,
        Decimals: nft.decimals,
        "Freeze Status": nft.freeze_status,
        "KYC Status": nft.kyc_status,
        "Auto Association": formatYesNo(nft.automatic_association),
        Created: nft.created_timestamp,
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getStakingRewards(
  accountId: string,
  options: FormatOptions & { timestamp?: string; network?: string; mirrorUrl?: string },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.account.getStakingRewards(accountId, {
      timestamp: options.timestamp,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Account ID": accountId,
      "Total Rewards": data.length,
      Rewards: data.map((r) => ({
        "Node ID": r.node_id,
        Amount: formatHbar(r.amount),
        "Account Reward Sum": formatHbar(r.account_reward_sum),
        "Reward Sum": formatHbar(r.reward_sum),
        Timestamp: r.calculated_timestamp,
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getCryptoAllowances(
  accountId: string,
  options: FormatOptions & { spenderId?: string; network?: string; mirrorUrl?: string },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.account.getCryptoAllowances(
      accountId,
      options.spenderId ? { "spender.id": options.spenderId } : undefined,
    );

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Account ID": accountId,
      "Total Allowances": data.length,
      Allowances: data.map((a) => ({
        Spender: a.spender,
        Amount: formatHbar(a.amount),
        "Owner Approved": formatYesNo(a.owner_already_approved),
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getTokenAllowances(
  accountId: string,
  options: FormatOptions & {
    spenderId?: string;
    tokenId?: string;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.account.getTokenAllowances(accountId, {
      "spender.id": options.spenderId,
      "token.id": options.tokenId,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Account ID": accountId,
      "Total Allowances": data.length,
      Allowances: data.map((a) => ({
        "Token ID": a.token_id,
        Spender: a.spender,
        Amount: a.amount,
        "Owner Approved": formatYesNo(a.owner_already_approved),
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getNftAllowances(
  accountId: string,
  options: FormatOptions & {
    accountIdFilter?: string;
    tokenId?: string;
    owner?: boolean;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.account.getNftAllowances(accountId, {
      "account.id": options.accountIdFilter,
      "token.id": options.tokenId,
      owner: options.owner,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Account ID": accountId,
      "Total Allowances": data.length,
      Allowances: data.map((a) => ({
        "Token ID": a.token_id,
        Spender: a.spender,
        "Approved For All": formatYesNo(a.approved_for_all),
        "Serial Numbers": a.serial_numbers.join(", "),
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getOutstandingAirdrops(
  accountId: string,
  options: FormatOptions & {
    receiverId?: string;
    serialNumber?: number;
    tokenId?: string;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.account.getOutstandingAirdrops(accountId, {
      "receiver.id": options.receiverId,
      serial_number: options.serialNumber,
      "token.id": options.tokenId,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Account ID": accountId,
      "Total Airdrops": data.airdrops.length,
      Airdrops: data.airdrops.map((a) => ({
        "Token ID": a.token_id,
        "Serial Numbers": a.serial_numbers.join(", "),
        "Sender Account": a.sender_account_id,
        "Receiver Account": a.receiver_account_id,
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getPendingAirdrops(
  accountId: string,
  options: FormatOptions & {
    senderId?: string;
    serialNumber?: number;
    tokenId?: string;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.account.getPendingAirdrops(accountId, {
      "sender.id": options.senderId,
      serial_number: options.serialNumber,
      "token.id": options.tokenId,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Account ID": accountId,
      "Total Airdrops": data.airdrops.length,
      Airdrops: data.airdrops.map((a) => ({
        "Token ID": a.token_id,
        "Serial Numbers": a.serial_numbers.join(", "),
        "Sender Account": a.sender_account_id,
        "Receiver Account": a.receiver_account_id,
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function listAccounts(
  options: FormatOptions & {
    account?: string;
    alias?: string;
    balance?: number;
    balanceGte?: number;
    balanceLte?: number;
    evmAddress?: string;
    key?: string;
    limit?: number;
    memo?: string;
    order?: "asc" | "desc";
    publicKey?: string;
    smartContract?: boolean;
    stakedAccountId?: string;
    stakedNodeId?: number;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.account.listPaginated({
      account: options.account,
      alias: options.alias,
      balance: options.balance,
      balance_gte: options.balanceGte,
      balance_lte: options.balanceLte,
      evm_address: options.evmAddress,
      public_key: options.publicKey || options.key,
      limit: options.limit,
      memo: options.memo,
      order: options.order,
      smart_contract: options.smartContract,
      staked_account_id: options.stakedAccountId,
      staked_node_id: options.stakedNodeId,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Total Accounts": data.length,
      Accounts: data.map((acc) => ({
        "Account ID": acc.account,
        Balance: formatHbar(acc.balance.balance ?? 0),
        "EVM Address": acc.evm_address || "N/A",
        Alias: acc.alias || "N/A",
        Memo: acc.memo || "N/A",
        Deleted: formatYesNo(acc.deleted),
        "Decline Reward": formatYesNo(acc.decline_reward),
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}
