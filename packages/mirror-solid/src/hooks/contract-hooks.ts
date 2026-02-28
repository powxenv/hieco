import { useQuery } from "@tanstack/solid-query";
import type { UseQueryResult, UseInfiniteQueryResult } from "@tanstack/solid-query";
import type { ApiResult, ApiError, EntityId, QueryOperator, Timestamp } from "@hieco/mirror";
import type {
  ContractCallParams,
  ContractCallResult,
  ContractInfo,
  ContractLog,
  ContractResult,
  ContractState,
  ContractResultDetails,
  ContractResultsResponse,
  ContractAction,
  ContractOpcodesResponse,
} from "@hieco/mirror";
import type { PaginatedResponse } from "@hieco/mirror";
import type { Accessor } from "solid-js";
import { useMirrorNodeClient, useNetwork } from "../context-hooks";
import { mirrorNodeKeys } from "@hieco/mirror-shared";
import { createMirrorNodeInfiniteQuery } from "../utils";

export type {
  ContractListParams,
  ContractResultsParams,
  ContractStateParams,
  ContractLogsParams,
} from "@hieco/mirror";

export interface CreateContractInfoOptions {
  readonly contractIdOrAddress: EntityId | string;
  readonly enabled?: boolean;
}

export type CreateContractInfoResult = UseQueryResult<ApiResult<ContractInfo>, ApiError>;

export interface CreateContractCallOptions {
  readonly params: ContractCallParams;
  readonly enabled?: boolean;
}

export type CreateContractCallResult = UseQueryResult<ApiResult<ContractCallResult>, ApiError>;

export interface CreateContractResultsOptions {
  readonly contractId: EntityId;
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly timestamp?: Timestamp;
  };
  readonly enabled?: boolean;
}

export type CreateContractResultsResult = UseQueryResult<
  ApiResult<ContractResultsResponse>,
  ApiError
>;

export interface CreateContractResultOptions {
  readonly contractId: EntityId;
  readonly timestamp: Timestamp;
  readonly enabled?: boolean;
}

export type CreateContractResultResult = UseQueryResult<ApiResult<ContractResultDetails>, ApiError>;

export interface CreateContractStateOptions {
  readonly contractId: EntityId;
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly slot?: string;
  };
  readonly enabled?: boolean;
}

export type CreateContractStateResult = UseQueryResult<ApiResult<ContractState>, ApiError>;

export interface CreateContractLogsOptions {
  readonly contractId: EntityId;
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly timestamp?: Timestamp;
    readonly index?: number;
  };
  readonly enabled?: boolean;
}

export type CreateContractLogsResult = UseQueryResult<ApiResult<ContractLog[]>, ApiError>;

export interface CreateContractsOptions {
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly address?: string;
    readonly smart_contract_id?: EntityId | QueryOperator<EntityId>;
  };
  readonly enabled?: boolean;
}

export type CreateContractsResult = UseQueryResult<ApiResult<ContractInfo[]>, ApiError>;

export interface CreateContractsInfiniteOptions {
  readonly params?: { readonly limit?: number; readonly order?: "asc" | "desc" };
  readonly enabled?: boolean;
}

export type CreateContractsInfiniteResult = UseInfiniteQueryResult<
  ApiResult<PaginatedResponse<ContractInfo>>,
  ApiError
>;

export function createContractInfo(
  options: Accessor<CreateContractInfoOptions>,
): CreateContractInfoResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.contract.info(network(), opts.contractIdOrAddress),
      queryFn: async () => {
        return client().contract.getInfo(opts.contractIdOrAddress);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createContractCall(
  options: Accessor<CreateContractCallOptions>,
): CreateContractCallResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.contract.call(network()),
      queryFn: async () => {
        return client().contract.call(opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createContractResults(
  options: Accessor<CreateContractResultsOptions>,
): CreateContractResultsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.contract.results(network(), opts.contractId),
      queryFn: async () => {
        return client().contract.getResults(opts.contractId, opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createContractResult(
  options: Accessor<CreateContractResultOptions>,
): CreateContractResultResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.contract.result(network(), opts.contractId, opts.timestamp),
      queryFn: async () => {
        return client().contract.getResult(opts.contractId, opts.timestamp);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createContractState(
  options: Accessor<CreateContractStateOptions>,
): CreateContractStateResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.contract.state(network(), opts.contractId),
      queryFn: async () => {
        return client().contract.getState(opts.contractId, opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createContractLogs(
  options: Accessor<CreateContractLogsOptions>,
): CreateContractLogsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.contract.logs(network(), opts.contractId),
      queryFn: async () => {
        return client().contract.getLogs(opts.contractId, opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createContracts(
  options: Accessor<CreateContractsOptions> = () => ({}),
): CreateContractsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.contract.list(network()),
      queryFn: async () => {
        return client().contract.listPaginated(opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createContractsInfinite(
  options: Accessor<CreateContractsInfiniteOptions>,
): CreateContractsInfiniteResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return createMirrorNodeInfiniteQuery(
    mirrorNodeKeys.contract.list(network()),
    options,
    (pageParam, opts) => {
      if (pageParam) {
        return client().contract.listPaginatedPageByUrl(pageParam);
      }
      return client().contract.listPaginatedPage({
        ...opts.params,
        limit: opts.params?.limit ?? 25,
      });
    },
    (lastPage) => {
      if (!lastPage.success) return undefined;
      return lastPage.data.links.next ?? undefined;
    },
  );
}

export interface CreateContractAllResultsOptions {
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly from?: string;
    readonly block_hash?: string;
    readonly block_number?: number;
    readonly internal?: boolean;
    readonly timestamp?: Timestamp;
    readonly transaction_index?: number;
  };
  readonly enabled?: boolean;
}

export type CreateContractAllResultsResult = UseQueryResult<ApiResult<ContractResult[]>, ApiError>;

export interface CreateContractResultByTransactionIdOrHashOptions {
  readonly transactionIdOrHash: string;
  readonly params?: { readonly nonce?: number };
  readonly enabled?: boolean;
}

export type CreateContractResultByTransactionIdOrHashResult = UseQueryResult<
  ApiResult<ContractResultDetails>,
  ApiError
>;

export interface CreateContractResultActionsOptions {
  readonly transactionIdOrHash: string;
  readonly enabled?: boolean;
}

export type CreateContractResultActionsResult = UseQueryResult<
  ApiResult<ContractAction[]>,
  ApiError
>;

export interface CreateContractResultOpcodesOptions {
  readonly transactionIdOrHash: string;
  readonly enabled?: boolean;
}

export type CreateContractResultOpcodesResult = UseQueryResult<
  ApiResult<ContractOpcodesResponse>,
  ApiError
>;

export interface CreateContractAllLogsOptions {
  readonly params?: {
    readonly limit?: number;
    readonly order?: "asc" | "desc";
    readonly timestamp?: Timestamp;
    readonly index?: number;
  };
  readonly enabled?: boolean;
}

export type CreateContractAllLogsResult = UseQueryResult<
  ApiResult<PaginatedResponse<ContractLog>>,
  ApiError
>;

export function createContractAllResults(
  options: Accessor<CreateContractAllResultsOptions> = () => ({}),
): CreateContractAllResultsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.contract.allResults(network()),
      queryFn: async () => {
        return client().contract.getAllResults(opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createContractResultByTransactionIdOrHash(
  options: Accessor<CreateContractResultByTransactionIdOrHashOptions>,
): CreateContractResultByTransactionIdOrHashResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.contract.resultByTx(network(), opts.transactionIdOrHash),
      queryFn: async () => {
        return client().contract.getResultByTransactionIdOrHash(
          opts.transactionIdOrHash,
          opts.params,
        );
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createContractResultActions(
  options: Accessor<CreateContractResultActionsOptions>,
): CreateContractResultActionsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.contract.resultActions(network(), opts.transactionIdOrHash),
      queryFn: async () => {
        return client().contract.getResultActions(opts.transactionIdOrHash);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createContractResultOpcodes(
  options: Accessor<CreateContractResultOpcodesOptions>,
): CreateContractResultOpcodesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.contract.resultOpcodes(network(), opts.transactionIdOrHash),
      queryFn: async () => {
        return client().contract.getResultOpcodes(opts.transactionIdOrHash);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createContractAllLogs(
  options: Accessor<CreateContractAllLogsOptions> = () => ({}),
): CreateContractAllLogsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.contract.allLogs(network()),
      queryFn: async () => {
        return client().contract.getAllContractLogs(opts.params);
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}
