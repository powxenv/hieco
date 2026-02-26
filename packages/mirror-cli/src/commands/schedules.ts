import { asEntityId } from "@hiecom/mirror-shared";
import { formatOutput, formatError, formatYesNo, type FormatOptions } from "../utils/format";
import { getClient } from "./accounts";

export async function getScheduleInfo(
  scheduleId: string,
  options: FormatOptions & { network?: string; mirrorUrl?: string },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.schedule.getInfo(asEntityId(scheduleId));

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Schedule ID": data.schedule_id || scheduleId,
      "Creator Account ID": data.creator_account_id || "N/A",
      "Payer Account ID": data.payer_account_id || "N/A",
      Deleted: formatYesNo(data.deleted),
      Memo: data.memo || "N/A",
      "Consensus Timestamp": data.consensus_timestamp || "N/A",
      "Executed Timestamp": data.executed_timestamp || "Not Executed",
      "Expiration Time": data.expiration_time || "N/A",
      "Wait for Expiry": formatYesNo(data.wait_for_expiry),
      Signatures: data.signatures?.length || 0,
      "Admin Key": data.admin_key !== null ? "Set" : "N/A",
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function listSchedules(
  options: FormatOptions & {
    accountId?: string;
    adminKey?: string;
    creatorAccountId?: string;
    deleted?: boolean;
    executedTimestamp?: string;
    expirationTimestamp?: string;
    limit?: number;
    memo?: string;
    order?: "asc" | "desc";
    payerAccountId?: string;
    scheduleId?: string;
    waitForExpiryExpiration?: string;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.schedule.listPaginated({
      "account.id": options.accountId ? asEntityId(options.accountId) : undefined,
      admin_key: options.adminKey,
      "creator.account.id": options.creatorAccountId
        ? asEntityId(options.creatorAccountId)
        : undefined,
      deleted: options.deleted,
      executed_timestamp: options.executedTimestamp,
      expiration_timestamp: options.expirationTimestamp,
      limit: options.limit,
      memo: options.memo,
      order: options.order,
      "payer.account.id": options.payerAccountId ? asEntityId(options.payerAccountId) : undefined,
      schedule_id: options.scheduleId ? asEntityId(options.scheduleId) : undefined,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Total Schedules": data.length,
      Schedules: data.map((s) => ({
        "Schedule ID": s.schedule_id,
        "Creator Account": s.creator_account_id,
        "Payer Account": s.payer_account_id,
        Deleted: formatYesNo(s.deleted),
        Memo: s.memo || "N/A",
        "Consensus Timestamp": s.consensus_timestamp,
        "Executed Timestamp": s.executed_timestamp || "Not Executed",
        "Expiration Time": s.expiration_time || "N/A",
        Signatures: s.signatures.length,
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}
