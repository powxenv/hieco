import { formatOutput, formatError, formatHbar, type FormatOptions } from "../utils/format";
import { getClient } from "./accounts";

export async function getBalances(
  options: FormatOptions & {
    account?: string;
    accountBalance?: number;
    limit?: number;
    order?: "asc" | "desc";
    publicKey?: string;
    timestamp?: string;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.balance.getBalances({
      account: options.account,
      "account.balance": options.accountBalance,
      limit: options.limit,
      order: options.order,
      public_key: options.publicKey,
      timestamp: options.timestamp,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      Timestamp: data.timestamp || "N/A",
      "Total Accounts": data.balances?.length || 0,
      Balances:
        data.balances?.map((b) => ({
          "Account ID": b.account,
          Balance: formatHbar(b.balance || 0),
          Tokens: `${b.tokens.length} tokens`,
        })) || [],
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function listBalances(
  options: FormatOptions & {
    account?: string;
    accountBalance?: number;
    limit?: number;
    order?: "asc" | "desc";
    publicKey?: string;
    timestamp?: string;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.balance.listPaginated({
      account: options.account,
      "account.balance": options.accountBalance,
      limit: options.limit,
      order: options.order,
      public_key: options.publicKey,
      timestamp: options.timestamp,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Total Accounts": data.length,
      Accounts: data.map((b) => ({
        "Account ID": b.account,
        Balance: formatHbar(b.balance || 0),
        Tokens: `${b.tokens.length} tokens`,
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}
