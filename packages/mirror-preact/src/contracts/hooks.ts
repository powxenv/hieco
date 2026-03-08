import { useQuery, useInfiniteQuery } from "@tanstack/preact-query";
import type {
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseQueryResult,
  UseInfiniteQueryResult,
} from "@tanstack/preact-query";
import type { ApiResult, ApiError, QueryOperator } from "@hieco/mirror";
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
import { useMirrorNodeClient, useNetwork } from "../context-hooks";
import { mirrorNodeKeys } from "@hieco/utils";

export type {
  ContractListParams,
  ContractResultsParams,
  ContractStateParams,
  ContractLogsParams,
} from "@hieco/mirror";

export interface UseContractInfoOptions extends Omit<
  UseQueryOptions<ApiResult<ContractInfo>, ApiError>,
  "queryKey" | "queryFn"
> {
  contractIdOrAddress: string;
}

export type UseContractInfoResult = UseQueryResult<ApiResult<ContractInfo>, ApiError>;

export interface UseContractCallOptions extends Omit<
  UseQueryOptions<ApiResult<ContractCallResult>, ApiError>,
  "queryKey" | "queryFn"
> {
  params: ContractCallParams;
}

export type UseContractCallResult = UseQueryResult<ApiResult<ContractCallResult>, ApiError>;

export interface UseContractResultsOptions extends Omit<
  UseQueryOptions<ApiResult<ContractResult[]>, ApiError>,
  "queryKey" | "queryFn"
> {
  contractId: string;
  params?: { limit?: number; order?: "asc" | "desc"; timestamp?: string };
}

export type UseContractResultsResult = UseQueryResult<ApiResult<ContractResult[]>, ApiError>;

export interface UseContractResultOptions extends Omit<
  UseQueryOptions<ApiResult<ContractResult>, ApiError>,
  "queryKey" | "queryFn"
> {
  contractId: string;
  timestamp: string;
}

export type UseContractResultResult = UseQueryResult<ApiResult<ContractResult>, ApiError>;

export interface UseContractStateOptions extends Omit<
  UseQueryOptions<ApiResult<ContractState[]>, ApiError>,
  "queryKey" | "queryFn"
> {
  contractId: string;
  params?: { limit?: number; order?: "asc" | "desc"; slot?: string };
}

export type UseContractStateResult = UseQueryResult<ApiResult<ContractState[]>, ApiError>;

export interface UseContractLogsOptions extends Omit<
  UseQueryOptions<ApiResult<ContractLog[]>, ApiError>,
  "queryKey" | "queryFn"
> {
  contractId: string;
  params?: { limit?: number; order?: "asc" | "desc"; timestamp?: string; index?: number };
}

export type UseContractLogsResult = UseQueryResult<ApiResult<ContractLog[]>, ApiError>;

export interface UseContractsOptions extends Omit<
  UseQueryOptions<ApiResult<ContractInfo[]>, ApiError>,
  "queryKey" | "queryFn"
> {
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    address?: string;
    smart_contract_id?: string | QueryOperator<string>;
  };
}

export type UseContractsResult = UseQueryResult<ApiResult<ContractInfo[]>, ApiError>;

export interface UseContractsInfiniteOptions extends Omit<
  UseInfiniteQueryOptions<ApiResult<PaginatedResponse<ContractInfo>>, ApiError>,
  "queryKey" | "queryFn" | "getNextPageParam"
> {
  params?: { limit?: number; order?: "asc" | "desc" };
}

export type UseContractsInfiniteResult = UseInfiniteQueryResult<
  ApiResult<PaginatedResponse<ContractInfo>>,
  ApiError
>;

export function useContractInfo(options: UseContractInfoOptions): UseContractInfoResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.info(network, options.contractIdOrAddress),
    queryFn: async () => {
      return client.contract.getInfo(options.contractIdOrAddress);
    },
  });
}

export function useContractCall(options: UseContractCallOptions): UseContractCallResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.call(network),
    queryFn: async () => {
      return client.contract.call(options.params);
    },
  });
}

export function useContractResults(options: UseContractResultsOptions): UseContractResultsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.results(network, options.contractId),
    queryFn: async () => {
      return client.contract.getResults(options.contractId, options.params);
    },
  });
}

export function useContractResult(options: UseContractResultOptions): UseContractResultResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.result(network, options.contractId, options.timestamp),
    queryFn: async () => {
      return client.contract.getResult(options.contractId, options.timestamp);
    },
  });
}

export function useContractState(options: UseContractStateOptions): UseContractStateResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.state(network, options.contractId),
    queryFn: async () => {
      return client.contract.getState(options.contractId, options.params);
    },
  });
}

export function useContractLogs(options: UseContractLogsOptions): UseContractLogsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.logs(network, options.contractId),
    queryFn: async () => {
      return client.contract.getLogs(options.contractId, options.params);
    },
  });
}

export function useContracts(options: UseContractsOptions = {}): UseContractsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.list(network),
    queryFn: async () => {
      return client.contract.listPaginated(options.params);
    },
  });
}

export function useContractsInfinite(
  options: UseContractsInfiniteOptions,
): UseContractsInfiniteResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useInfiniteQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.list(network),
    queryFn: async ({ pageParam }) => {
      if (typeof pageParam === "string") {
        return client.contract.listPaginatedPageByUrl(pageParam);
      }
      return client.contract.listPaginatedPage({
        ...options.params,
        limit: options.params?.limit ?? 25,
      });
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.success) return undefined;
      return lastPage.data.links.next ?? undefined;
    },
    initialPageParam: null,
  });
}

export interface UseContractAllResultsOptions extends Omit<
  UseQueryOptions<ApiResult<ContractResultsResponse>, ApiError>,
  "queryKey" | "queryFn"
> {
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    from?: string;
    block_hash?: string;
    block_number?: number;
    internal?: boolean;
    timestamp?: string;
    transaction_index?: number;
  };
}

export type UseContractAllResultsResult = UseQueryResult<
  ApiResult<ContractResultsResponse>,
  ApiError
>;

export interface UseContractResultByTransactionIdOrHashOptions extends Omit<
  UseQueryOptions<ApiResult<ContractResultDetails>, ApiError>,
  "queryKey" | "queryFn"
> {
  transactionIdOrHash: string;
  params?: { nonce?: number };
}

export type UseContractResultByTransactionIdOrHashResult = UseQueryResult<
  ApiResult<ContractResultDetails>,
  ApiError
>;

export interface UseContractResultActionsOptions extends Omit<
  UseQueryOptions<ApiResult<{ actions: ContractAction[] }>, ApiError>,
  "queryKey" | "queryFn"
> {
  transactionIdOrHash: string;
}

export type UseContractResultActionsResult = UseQueryResult<
  ApiResult<{ actions: ContractAction[] }>,
  ApiError
>;

export interface UseContractResultOpcodesOptions extends Omit<
  UseQueryOptions<ApiResult<ContractOpcodesResponse>, ApiError>,
  "queryKey" | "queryFn"
> {
  transactionIdOrHash: string;
}

export type UseContractResultOpcodesResult = UseQueryResult<
  ApiResult<ContractOpcodesResponse>,
  ApiError
>;

export interface UseContractAllLogsOptions extends Omit<
  UseQueryOptions<ApiResult<PaginatedResponse<ContractLog>>, ApiError>,
  "queryKey" | "queryFn"
> {
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    timestamp?: string;
    index?: number;
  };
}

export type UseContractAllLogsResult = UseQueryResult<
  ApiResult<PaginatedResponse<ContractLog>>,
  ApiError
>;

export function useContractAllResults(
  options: UseContractAllResultsOptions = {},
): UseContractAllResultsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.allResults(network),
    queryFn: async () => {
      return client.contract.getAllResults(options.params);
    },
  });
}

export function useContractResultByTransactionIdOrHash(
  options: UseContractResultByTransactionIdOrHashOptions,
): UseContractResultByTransactionIdOrHashResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.resultByTx(network, options.transactionIdOrHash),
    queryFn: async () => {
      return client.contract.getResultByTransactionIdOrHash(
        options.transactionIdOrHash,
        options.params,
      );
    },
  });
}

export function useContractResultActions(
  options: UseContractResultActionsOptions,
): UseContractResultActionsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.resultActions(network, options.transactionIdOrHash),
    queryFn: async () => {
      return client.contract.getResultActions(options.transactionIdOrHash);
    },
  });
}

export function useContractResultOpcodes(
  options: UseContractResultOpcodesOptions,
): UseContractResultOpcodesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.resultOpcodes(network, options.transactionIdOrHash),
    queryFn: async () => {
      return client.contract.getResultOpcodes(options.transactionIdOrHash);
    },
  });
}

export function useContractAllLogs(
  options: UseContractAllLogsOptions = {},
): UseContractAllLogsResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.allLogs(network),
    queryFn: async () => {
      return client.contract.getAllContractLogs(options.params);
    },
  });
}
