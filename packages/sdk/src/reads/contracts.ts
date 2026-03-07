import type { ContractCallParams, PaginationParams } from "@hieco/mirror";
import { ok } from "../results/result.ts";
import type {
  ContractListParams,
  ContractLogsParams,
  ContractResultsParams,
  ContractStateParams,
  ReadsNamespace,
} from "./namespace.ts";
import { readList, readPage, readSingle, type ReadsContext, withDefaultLimit } from "./shared.ts";

export function createContractsReads(context: ReadsContext): ReadsNamespace["contracts"] {
  const list = async (params?: ContractListParams) => {
    return readPage(
      await context.mirror.contract.listPaginatedPage(withDefaultLimit(params)),
      "Mirror contract.listPaginatedPage failed",
    );
  };

  const listPageByUrl = async (url: string) => {
    return readPage(
      await context.mirror.contract.listPaginatedPageByUrl(url),
      "Mirror contract.listPaginatedPageByUrl failed",
    );
  };

  const info = async (contractIdOrAddress: string, params?: { readonly timestamp?: string }) => {
    return readSingle(
      await context.mirror.contract.getInfo(contractIdOrAddress, params),
      "Mirror contract.getInfo failed",
    );
  };

  const call = async (params: ContractCallParams) => {
    return readSingle(await context.mirror.contract.call(params), "Mirror contract.call failed");
  };

  const results = async (contractId: string, params?: ContractResultsParams) => {
    return readList(
      await context.mirror.contract.getResults(contractId, params),
      "Mirror contract.getResults failed",
    );
  };

  const result = async (contractId: string, timestamp: string) => {
    return readSingle(
      await context.mirror.contract.getResult(contractId, timestamp),
      "Mirror contract.getResult failed",
    );
  };

  const state = async (contractId: string, params?: ContractStateParams) => {
    return readList(
      await context.mirror.contract.getState(contractId, params),
      "Mirror contract.getState failed",
    );
  };

  const logs = async (contractId: string, params?: ContractLogsParams) => {
    return readList(
      await context.mirror.contract.getLogs(contractId, params),
      "Mirror contract.getLogs failed",
    );
  };

  const resultsAll = async (params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly from?: string;
    readonly block_hash?: string;
    readonly block_number?: number;
    readonly internal?: boolean;
    readonly timestamp?: string;
    readonly transaction_index?: number;
  }) => {
    return readSingle(
      await context.mirror.contract.getAllResults(params),
      "Mirror contract.getAllResults failed",
    );
  };

  const resultByTransactionIdOrHash = async (
    transactionIdOrHash: string,
    params?: { readonly nonce?: number },
  ) => {
    return readSingle(
      await context.mirror.contract.getResultByTransactionIdOrHash(transactionIdOrHash, params),
      "Mirror contract.getResultByTransactionIdOrHash failed",
    );
  };

  const resultActions = async (
    transactionIdOrHash: string,
    params?: PaginationParams & { readonly index?: number },
  ) => {
    const result = readSingle(
      await context.mirror.contract.getResultActions(transactionIdOrHash, params),
      "Mirror contract.getResultActions failed",
    );

    if (!result.ok) {
      return result;
    }

    return ok({ actions: result.value.actions });
  };

  const resultOpcodes = async (
    transactionIdOrHash: string,
    params?: { readonly stack?: boolean; readonly memory?: boolean; readonly storage?: boolean },
  ) => {
    return readSingle(
      await context.mirror.contract.getResultOpcodes(transactionIdOrHash, params),
      "Mirror contract.getResultOpcodes failed",
    );
  };

  const logsAll = async (
    params?: PaginationParams & {
      readonly index?: number;
      readonly timestamp?: string;
      readonly topic0?: string;
      readonly topic1?: string;
      readonly topic2?: string;
      readonly topic3?: string;
      readonly "transaction.hash"?: string;
    },
  ) => {
    return readPage(
      await context.mirror.contract.getAllContractLogs(params),
      "Mirror contract.getAllContractLogs failed",
    );
  };

  return {
    list,
    listPageByUrl,
    info,
    call,
    results,
    result,
    state,
    logs,
    resultsAll,
    resultByTransactionIdOrHash,
    resultActions,
    resultOpcodes,
    logsAll,
  };
}
