import { asEntityId } from "@hieco/mirror-shared";
import { formatOutput, formatError, formatYesNo, type FormatOptions } from "../utils/format";
import { getClient } from "./accounts";

export async function getTopicInfo(
  topicId: string,
  options: FormatOptions & { network?: string; mirrorUrl?: string },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.topic.getInfo(asEntityId(topicId));

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Topic ID": data.topic_id || topicId,
      "Admin Key": data.admin_key !== null ? "Set" : "N/A",
      "Auto Renew Account": data.auto_renew_account || "N/A",
      "Auto Renew Period": data.auto_renew_period ? `${data.auto_renew_period}s` : "N/A",
      "Fee Schedule Key": data.fee_schedule_key !== null ? "Set" : "N/A",
      "Submit Key": data.submit_key !== null ? "Set" : "N/A",
      "Fee Exempt Key List": data.fee_exempt_key_list?.length || 0,
      Deleted: formatYesNo(data.deleted),
      "Custom Fees": `${data.custom_fees?.fixed_fees?.length || 0} fixed fees`,
      Memo: data.memo || "N/A",
      "Created Timestamp": data.created_timestamp || "N/A",
      Timestamp: data.timestamp || "N/A",
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getTopicMessages(
  topicId: string,
  options: FormatOptions & {
    encoding?: "base64" | "utf-8";
    sequenceNumber?: number;
    timestamp?: string;
    transactionId?: string;
    scheduled?: boolean;
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.topic.getMessages(
      topicId as `${number}.${number}.${number}`,
      {
        encoding: options.encoding,
        sequencenumber: options.sequenceNumber,
        timestamp: options.timestamp,
        transaction_id: options.transactionId,
        scheduled: options.scheduled,
      },
    );

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Topic ID": topicId,
      "Total Messages": data.length,
      Messages: data.map((m) => ({
        "Sequence Number": m.sequence_number,
        "Consensus Timestamp": m.consensus_timestamp,
        Message: m.message.substring(0, 100) + (m.message.length > 100 ? "..." : ""),
        "Payer Account": m.payer_account_id,
        "Running Hash": m.running_hash,
        "Running Hash Version": m.running_hash_version,
        "Chunk Info": m.chunk_info ? `Chunk ${m.chunk_info.number}/${m.chunk_info.total}` : "N/A",
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getTopicMessage(
  topicId: string,
  sequenceNumber: number,
  options: FormatOptions & { network?: string; mirrorUrl?: string },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.topic.getMessage(
      topicId as `${number}.${number}.${number}`,
      sequenceNumber,
    );

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Topic ID": topicId,
      "Sequence Number": data.sequence_number,
      "Consensus Timestamp": data.consensus_timestamp,
      Message: data.message,
      "Payer Account": data.payer_account_id,
      "Running Hash": data.running_hash,
      "Running Hash Version": data.running_hash_version,
      "Chunk Info": data.chunk_info
        ? `Chunk ${data.chunk_info.number}/${data.chunk_info.total}`
        : "N/A",
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function getMessageByTimestamp(
  timestamp: string,
  options: FormatOptions & { network?: string; mirrorUrl?: string },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.topic.getMessageByTimestamp(timestamp);

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Topic ID": data.topic_id,
      "Sequence Number": data.sequence_number,
      "Consensus Timestamp": data.consensus_timestamp,
      Message: data.message,
      "Payer Account": data.payer_account_id,
      "Running Hash": data.running_hash,
      "Running Hash Version": data.running_hash_version,
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}

export async function listTopics(
  options: FormatOptions & {
    limit?: number;
    order?: "asc" | "desc";
    network?: string;
    mirrorUrl?: string;
  },
): Promise<void> {
  try {
    const mirrorClient = getClient(options.network, options.mirrorUrl);
    const result = await mirrorClient.topic.listPaginated({
      limit: options.limit,
      order: options.order,
    });

    if (!result.success) {
      console.error(formatError(new Error(result.error.message)));
      process.exit(1);
    }

    const data = result.data;
    const formatted = {
      "Total Topics": data.length,
      Topics: data.map((t) => ({
        "Topic ID": t.topic_id,
        "Admin Key": t.admin_key !== null ? "Set" : "N/A",
        "Auto Renew Account": t.auto_renew_account || "N/A",
        "Submit Key": t.submit_key !== null ? "Set" : "N/A",
        Memo: t.memo || "N/A",
        Deleted: formatYesNo(t.deleted),
        Timestamp: t.timestamp,
      })),
    };

    console.log(formatOutput(formatted, options));
  } catch (error) {
    console.error(formatError(error as Error));
    process.exit(1);
  }
}
