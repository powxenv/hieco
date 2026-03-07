import type { PaginationParams } from "@hieco/mirror";
import type { ReadsNamespace, TopicMessagesParams } from "./namespace.ts";
import { readList, readPage, readSingle, type ReadsContext, withDefaultLimit } from "./shared.ts";

export function createTopicsReads(context: ReadsContext): ReadsNamespace["topics"] {
  const list = async (params?: PaginationParams) => {
    return readPage(
      await context.mirror.topic.listPaginatedPage(withDefaultLimit(params)),
      "Mirror topic.listPaginatedPage failed",
    );
  };

  const listPageByUrl = async (url: string) => {
    return readPage(
      await context.mirror.topic.listPaginatedPageByUrl(url),
      "Mirror topic.listPaginatedPageByUrl failed",
    );
  };

  const info = async (topicId: string) => {
    return readSingle(await context.mirror.topic.getInfo(topicId), "Mirror topic.getInfo failed");
  };

  const messages = async (topicId: string, params?: TopicMessagesParams) => {
    return readList(
      await context.mirror.topic.getMessages(topicId, params),
      "Mirror topic.getMessages failed",
    );
  };

  const message = async (topicId: string, sequenceNumber: number) => {
    return readSingle(
      await context.mirror.topic.getMessage(topicId, sequenceNumber),
      "Mirror topic.getMessage failed",
    );
  };

  const messageByTimestamp = async (timestamp: string) => {
    return readSingle(
      await context.mirror.topic.getMessageByTimestamp(timestamp),
      "Mirror topic.getMessageByTimestamp failed",
    );
  };

  return {
    list,
    listPageByUrl,
    info,
    messages,
    message,
    messageByTimestamp,
  };
}
