import type {
  ApiResult,
  Key,
  PaginationParams,
  QueryOperator,
  TimestampFilter,
} from "@hieco/utils";
import { QueryBuilder, type CursorPaginator, type PaginatedResponse } from "./shared/builders";
import { BaseApi } from "./shared/base";

export interface ContractListParams extends PaginationParams {
  "contract.id"?: string | QueryOperator<string>;
  address?: string;
  smart_contract_id?: string | QueryOperator<string>;
  created_timestamp?: TimestampFilter;
}

export interface ContractResultsParams extends PaginationParams {
  "block.hash"?: string;
  block_number?: number;
  from?: string;
  internal?: boolean;
  timestamp?: string;
  transaction_index?: number;
}

export interface ContractStateParams extends PaginationParams {
  slot?: string;
  timestamp?: string;
}

export interface ContractLogsParams extends PaginationParams {
  index?: number;
  timestamp?: string;
  topic0?: string;
  topic1?: string;
  topic2?: string;
  topic3?: string;
  "transaction.hash"?: string;
}

export class ContractApi extends BaseApi {
  async getInfo(
    contractIdOrAddress: string,
    params?: { timestamp?: string },
  ): Promise<ApiResult<ContractInfo>> {
    const builder = new QueryBuilder();

    if (params?.timestamp) {
      builder.addTimestamp(params.timestamp);
    }

    return this.getSingle<ContractInfo>(`contracts/${contractIdOrAddress}`, builder.build());
  }

  async call(params: ContractCallParams): Promise<ApiResult<ContractCallResult>> {
    return this.client.post<ContractCallResult>("contracts/call", {
      to: params.contractId,
      ...(params.from !== undefined && { from: params.from }),
      ...(params.gas !== undefined && { gas: params.gas }),
      ...(params.gasPrice !== undefined && { gasPrice: params.gasPrice }),
      ...(params.data !== undefined && { data: params.data }),
      ...(params.estimate !== undefined && { estimate: params.estimate }),
      ...(params.block !== undefined && { block: params.block }),
      ...(params.value !== undefined && { value: params.value }),
    });
  }

  async getResults(
    contractId: string,
    params?: ContractResultsParams,
  ): Promise<ApiResult<ContractResult[]>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params["block.hash"]) {
        builder.add("block.hash", params["block.hash"]);
      }
      if (params.block_number !== undefined) {
        builder.add("block.number", params.block_number);
      }
      if (params.from) {
        builder.add("from", params.from);
      }
      if (params.internal !== undefined) {
        builder.add("internal", params.internal);
      }
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
      if (params.transaction_index !== undefined) {
        builder.add("transaction.index", params.transaction_index);
      }
    }

    return this.getList<ContractResult>(`contracts/${contractId}/results`, builder.build());
  }

  async getResult(contractId: string, timestamp: string): Promise<ApiResult<ContractResult>> {
    return this.getSingle<ContractResult>(`contracts/${contractId}/results/${timestamp}`);
  }

  async getState(
    contractId: string,
    params?: ContractStateParams,
  ): Promise<ApiResult<ContractState[]>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.slot) {
        builder.add("slot", params.slot);
      }
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
    }

    return this.getList<ContractState>(`contracts/${contractId}/state`, builder.build());
  }

  async getLogs(
    contractId: string,
    params?: ContractLogsParams,
  ): Promise<ApiResult<ContractLog[]>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.index !== undefined) {
        builder.add("index", params.index);
      }
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
      if (params.topic0) {
        builder.add("topic0", params.topic0);
      }
      if (params.topic1) {
        builder.add("topic1", params.topic1);
      }
      if (params.topic2) {
        builder.add("topic2", params.topic2);
      }
      if (params.topic3) {
        builder.add("topic3", params.topic3);
      }
      if (params["transaction.hash"]) {
        builder.add("transaction.hash", params["transaction.hash"]);
      }
    }

    return this.getList<ContractLog>(`contracts/${contractId}/results/logs`, builder.build());
  }

  async getAllResults(params?: {
    limit?: number;
    order?: "asc" | "desc";
    from?: string;
    block_hash?: string;
    block_number?: number;
    internal?: boolean;
    timestamp?: string;
    transaction_index?: number;
  }): Promise<ApiResult<ContractResultsResponse>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.from) {
        builder.add("from", params.from);
      }
      if (params.block_hash) {
        builder.add("block.hash", params.block_hash);
      }
      if (params.block_number !== undefined) {
        builder.add("block.number", params.block_number);
      }
      if (params.internal !== undefined) {
        builder.add("internal", params.internal);
      }
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
      if (params.transaction_index !== undefined) {
        builder.add("transaction.index", params.transaction_index);
      }
    }

    return this.getSingle<ContractResultsResponse>("contracts/results", builder.build());
  }

  async getResultByTransactionIdOrHash(
    transactionIdOrHash: string,
    params?: { nonce?: number },
  ): Promise<ApiResult<ContractResultDetails>> {
    const builder = new QueryBuilder();

    if (params?.nonce !== undefined) {
      builder.add("nonce", params.nonce);
    }

    return this.getSingle<ContractResultDetails>(
      `contracts/results/${transactionIdOrHash}`,
      builder.build(),
    );
  }

  async getResultActions(
    transactionIdOrHash: string,
    params?: PaginationParams & { index?: number },
  ): Promise<ApiResult<{ actions: ContractAction[] }>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);
      if (params.index !== undefined) {
        builder.add("index", params.index);
      }
    }

    return this.getSingle<{ actions: ContractAction[] }>(
      `contracts/results/${transactionIdOrHash}/actions`,
      builder.build(),
    );
  }

  async getResultOpcodes(
    transactionIdOrHash: string,
    params?: { stack?: boolean; memory?: boolean; storage?: boolean },
  ): Promise<ApiResult<ContractOpcodesResponse>> {
    const builder = new QueryBuilder();

    if (params) {
      if (params.stack !== undefined) {
        builder.add("stack", params.stack);
      }
      if (params.memory !== undefined) {
        builder.add("memory", params.memory);
      }
      if (params.storage !== undefined) {
        builder.add("storage", params.storage);
      }
    }

    return this.getSingle<ContractOpcodesResponse>(
      `contracts/results/${transactionIdOrHash}/opcodes`,
      builder.build(),
    );
  }

  async getAllContractLogs(
    params?: PaginationParams & {
      index?: number;
      timestamp?: string;
      topic0?: string;
      topic1?: string;
      topic2?: string;
      topic3?: string;
      "transaction.hash"?: string;
    },
  ): Promise<ApiResult<PaginatedResponse<ContractLog>>> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params.index !== undefined) {
        builder.add("index", params.index);
      }
      if (params.timestamp) {
        builder.addTimestamp(params.timestamp);
      }
      if (params.topic0) {
        builder.add("topic0", params.topic0);
      }
      if (params.topic1) {
        builder.add("topic1", params.topic1);
      }
      if (params.topic2) {
        builder.add("topic2", params.topic2);
      }
      if (params.topic3) {
        builder.add("topic3", params.topic3);
      }
      if (params["transaction.hash"]) {
        builder.add("transaction.hash", params["transaction.hash"]);
      }
    }

    return this.getSinglePage<ContractLog>("contracts/results/logs", builder.build());
  }

  private buildContractListParams(params?: ContractListParams): Record<string, string> {
    const builder = new QueryBuilder();

    if (params) {
      builder.addPagination(params);

      if (params["contract.id"]) {
        builder.add("contract.id", params["contract.id"]);
      }
      if (params.address) {
        builder.add("address", params.address);
      }
      if (params.smart_contract_id) {
        builder.add("smartcontractid", params.smart_contract_id);
      }
      if (params.created_timestamp) {
        builder.addTimestamp(params.created_timestamp);
      }
    }

    return builder.build();
  }

  async listPaginated(params?: ContractListParams): Promise<ApiResult<ContractInfo[]>> {
    return this.getAllPaginated<ContractInfo>("contracts", this.buildContractListParams(params));
  }

  async listPaginatedPage(
    params?: ContractListParams,
  ): Promise<ApiResult<PaginatedResponse<ContractInfo>>> {
    return this.getSinglePage<ContractInfo>("contracts", this.buildContractListParams(params));
  }

  async listPaginatedPageByUrl(url: string): Promise<ApiResult<PaginatedResponse<ContractInfo>>> {
    return this.getSinglePageByUrl<ContractInfo>(url);
  }

  createContractPaginator(params?: ContractListParams): CursorPaginator<ContractInfo> {
    return super.createPaginator<ContractInfo>("contracts", this.buildContractListParams(params));
  }
}

export interface ContractInfo {
  readonly admin_key: Key | null;
  readonly auto_renew_account: string | null;
  readonly auto_renew_period: number | null;
  readonly contract_id: string;
  readonly created_timestamp: string;
  readonly deleted: boolean;
  readonly evm_address: string;
  readonly expiration_timestamp: string | null;
  readonly file_id: string | null;
  readonly max_automatic_token_associations: number | null;
  readonly memo: string;
  readonly obtainer_id: string | null;
  readonly permanent_removal: boolean | null;
  readonly proxy_account_id: string | null;
  readonly timestamp: string | null;
}

export interface ContractResult {
  readonly access_list: string | null;
  readonly address: string;
  readonly amount: number | null;
  readonly block_gas_used: number | null;
  readonly block_hash: string | null;
  readonly block_number: number | null;
  readonly bloom: string | null;
  readonly call_result: string | null;
  readonly chain_id: string | null;
  readonly contract_id: string;
  readonly created_contract_ids: readonly string[];
  readonly error_message: string | null;
  readonly from: string | null;
  readonly function_parameters: string;
  readonly gas: number | null;
  readonly gas_used: number;
  readonly max_gas_allowance: number | null;
  readonly nonce: number | null;
  readonly parent_hash: string | null;
  readonly result: string | null;
  readonly timestamp: string;
  readonly to: string;
  readonly value: string | null;
}

export interface ContractLog {
  readonly address: string;
  readonly block_hash: string;
  readonly block_number: number;
  readonly contract_id: string;
  readonly data: string;
  readonly index: number;
  readonly root_contract_id: string;
  readonly timestamp: string;
  readonly topics: readonly string[];
  readonly transaction_hash: string;
  readonly transaction_index: number | null;
}

export interface ContractState {
  readonly contract_id: string;
  readonly address: string;
  readonly slot: string;
  readonly value: string;
  readonly timestamp: string;
}

export interface ContractCallParams {
  readonly contractId: string;
  readonly from?: string;
  readonly gas?: number;
  readonly gasPrice?: number;
  readonly data?: string;
  readonly estimate?: boolean;
  readonly block?: string;
  readonly value?: number;
}

export interface ContractCallResult {
  readonly result: string;
  readonly error?: string;
}

export interface ContractResultDetails {
  readonly access_list: string | null;
  readonly amount: number | null;
  readonly block_gas_used: number | null;
  readonly block_hash: string | null;
  readonly block_number: number | null;
  readonly bloom: string | null;
  readonly call_result: string | null;
  readonly chain_id: string | null;
  readonly contract_id: string;
  readonly created_contract_ids: readonly string[];
  readonly error_message: string | null;
  readonly from: string | null;
  readonly function_parameters: string;
  readonly gas: number | null;
  readonly gas_used: number;
  readonly hash: string;
  readonly max_gas_allowance: number | null;
  readonly nonce: number | null;
  readonly parent_hash: string | null;
  readonly result: string | null;
  readonly timestamp: string;
  readonly to: string;
  readonly transaction_id: string;
  readonly value: string | null;
}

export interface ContractResultsResponse {
  readonly results: readonly ContractResult[];
  readonly links: {
    readonly next?: string;
  };
}

export interface ContractAction {
  readonly caller: string;
  readonly call_depth: number;
  readonly call_operation_type: string;
  readonly call_type: string;
  readonly destination_data: string;
  readonly function_parameters: string;
  readonly function_result_data: string;
  readonly gas: number;
  readonly index: number;
  readonly input: string;
  readonly recipient: string;
  readonly result_data: string;
  readonly type: string;
  readonly value: number;
}

export interface ContractOpcodesResponse {
  readonly opcodes: readonly {
    readonly address: string;
    readonly instruction: string;
    readonly opcode: number;
    readonly gas: number;
  }[];
}
