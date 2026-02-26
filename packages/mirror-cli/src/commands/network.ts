import {
  formatOutput,
  formatError,
  formatHbar,
  formatYesNo,
  type FormatOptions,
} from "../utils/format";
import { getClient } from "./accounts";

export async function getNetworkState(
  options: FormatOptions & { network?: string; mirrorUrl?: string },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network || "mainnet", options.mirrorUrl);
    const [exchangeRateResult, feesResult, stakeResult, supplyResult] = await Promise.all([
      mirrorClient.network.getExchangeRate(),
      mirrorClient.network.getFees(),
      mirrorClient.network.getStake(),
      mirrorClient.network.getSupply(),
    ]);

    const errors = [exchangeRateResult, feesResult, stakeResult, supplyResult].filter(
      (r) => !r.success,
    );

    if (errors.length > 0) {
      console.error(formatError(new Error(`Failed to fetch ${errors.length} endpoints`)));
      process.exit(1);
    }

    const exchangeRate = exchangeRateResult.success ? exchangeRateResult.data : null;
    const fees = feesResult.success ? feesResult.data : null;
    const stake = stakeResult.success ? stakeResult.data : null;
    const supply = supplyResult.success ? supplyResult.data : null;

    const formatted = {
      "Exchange Rate": exchangeRate
        ? {
            "Current Rate": `${exchangeRate.current_rate.cent_equality / 100} cents = ${exchangeRate.current_rate.hbar_equality / 100000000} ℏ`,
            "Next Rate": `${exchangeRate.next_rate.cent_equality / 100} cents = ${exchangeRate.next_rate.hbar_equality / 100000000} ℏ`,
            "Current Rate Expiration": exchangeRate.current_rate.expiration_time || "N/A",
            Timestamp: exchangeRate.timestamp || "N/A",
          }
        : "N/A",
      Fees: fees
        ? {
            "Data Fees": fees.data?.length || 0,
            Timestamp: fees.timestamp || "N/A",
          }
        : "N/A",
      Stake: stake
        ? {
            "Staking Period": `${stake.staking_period?.from || "N/A"} to ${stake.staking_period?.to || "N/A"}`,
            "Staking Reward Rate": `${stake.staking_reward_rate || 0} / 10,000`,
            "Max Staking Reward Rate": `${stake.max_staking_reward_rate_per_hbar || 0} / 10,000`,
            "Max Stake Rewarded": formatHbar(stake.max_stake_rewarded || 0),
            "Stake Total": formatHbar(stake.stake_total || 0),
          }
        : "N/A",
      Supply: supply
        ? {
            "Total Supply": formatHbar(supply.total_supply || 0),
            "Released Supply": formatHbar(supply.released_supply || 0),
            Timestamp: supply.timestamp || "N/A",
          }
        : "N/A",
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getExchangeRate(
  options: FormatOptions & { timestamp?: string; network?: string; mirrorUrl?: string },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.network.getExchangeRate({ timestamp: options.timestamp });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Current Rate": `${data.current_rate.cent_equality / 100} cents = ${data.current_rate.hbar_equality / 100000000} ℏ`,
      "Current Rate Expiration": data.current_rate.expiration_time || "N/A",
      "Next Rate": `${data.next_rate.cent_equality / 100} cents = ${data.next_rate.hbar_equality / 100000000} ℏ`,
      "Next Rate Expiration": data.next_rate.expiration_time || "N/A",
      Timestamp: data.timestamp || "N/A",
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getNetworkFees(
  options: FormatOptions & {
    limit?: number;
    order?: "asc" | "desc";
    timestamp?: string;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.network.getFees({
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
      "Total Fee Data": data.data?.length || 0,
      Timestamp: data.timestamp || "N/A",
      Fees:
        data.data?.map((f) => ({
          Denominator: f.denominator,
          Gas: f.gas,
          Maximum: f.maximum,
          Minimum: f.minimum,
          Numerator: f.numerator,
          Operations: f.operations.join(", "),
          Rate: f.rate,
        })) || [],
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getNetworkNodes(
  options: FormatOptions & {
    fileId?: number;
    nodeId?: number;
    limit?: number;
    order?: "asc" | "desc";
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.network.getNodes({
      "file.id": options.fileId,
      "node.id": options.nodeId,
      limit: options.limit,
      order: options.order,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Total Nodes": data.length,
      Nodes: data.map((node) => ({
        "Node ID": node.node_id,
        "Node Account ID": node.node_account_id,
        Description: node.description || "N/A",
        "File ID": node.file_id,
        Memo: node.memo || "N/A",
        Stake: node.stake || "N/A",
        "Stake Rewarded": node.stake_rewarded || "N/A",
        "Stake Not Rewarded": node.stake_not_rewarded || "N/A",
        "Max Stake": node.max_stake || "N/A",
        "Min Stake": node.min_stake || "N/A",
        "Reward Rate Start": node.reward_rate_start || "N/A",
        "Decline Reward": formatYesNo(node.decline_reward),
        "Admin Key": node.admin_key !== null ? "Set" : "N/A",
        "Public Key": node.public_key || "N/A",
        "Node Cert Hash": node.node_cert_hash || "N/A",
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getNetworkStake(
  options: FormatOptions & { network?: string; mirrorUrl?: string },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.network.getStake();

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Staking Period": `${data.staking_period?.from || "N/A"} to ${data.staking_period?.to || "N/A"}`,
      "Staking Period Duration": `${data.staking_period_duration || "N/A"}s`,
      "Staking Periods Stored": data.staking_periods_stored || "N/A",
      "Stake Total": formatHbar(data.stake_total || 0),
      "Max Stake Rewarded": formatHbar(data.max_stake_rewarded || 0),
      "Max Total Reward": formatHbar(data.max_total_reward || 0),
      "Staking Reward Rate": `${data.staking_reward_rate || 0} / 10,000`,
      "Max Staking Reward Rate": `${data.max_staking_reward_rate_per_hbar || 0} / 10,000`,
      "Staking Reward Fee Fraction": data.staking_reward_fee_fraction || "N/A",
      "Node Reward Fee Fraction": data.node_reward_fee_fraction || "N/A",
      "Reserved Staking Rewards": formatHbar(data.reserved_staking_rewards || 0),
      "Unreserved Staking Reward Balance": formatHbar(data.unreserved_staking_reward_balance || 0),
      "Reward Balance Threshold": formatHbar(data.reward_balance_threshold || 0),
      "Staking Start Threshold": formatHbar(data.staking_start_threshold || 0),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getNetworkSupply(
  options: FormatOptions & { network?: string; mirrorUrl?: string },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.network.getSupply();

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Total Supply": formatHbar(data.total_supply || 0),
      "Released Supply": formatHbar(data.released_supply || 0),
      Timestamp: data.timestamp || "N/A",
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function listNetworkNodes(
  options: FormatOptions & {
    fileId?: number;
    nodeId?: number;
    limit?: number;
    order?: "asc" | "desc";
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.network.listPaginated({
      "file.id": options.fileId,
      "node.id": options.nodeId,
      limit: options.limit,
      order: options.order,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Total Nodes": data.length,
      Nodes: data.map((node) => ({
        "Node ID": node.node_id,
        "Node Account ID": node.node_account_id,
        Description: node.description || "N/A",
        "File ID": node.file_id,
        Memo: node.memo || "N/A",
        Stake: node.stake || "N/A",
        "Decline Reward": formatYesNo(node.decline_reward),
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}
