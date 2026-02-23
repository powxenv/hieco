import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type {
  UseQueryOptions,
  UseInfiniteQueryOptions,
  UseQueryResult,
  UseInfiniteQueryResult,
} from "@tanstack/react-query";
import type {
  ApiResult,
  ApiError,
  EntityId,
  QueryOperator,
  Timestamp,
} from "../../../types/rest-api";
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
} from "../../../types/entities/contract";
import { useMirrorNodeClient } from "../../../react/hooks";
import { mirrorNodeKeys } from "../query-keys";

export type {
  ContractListParams,
  ContractResultsParams,
  ContractStateParams,
  ContractLogsParams,
} from "../../../core/apis/contract-api";

type ContractQueryFnData<T> = ApiResult<T>;
type ContractQueryError = ApiError;

export interface UseContractInfoOptions extends Omit<
  UseQueryOptions<ContractQueryFnData<ContractInfo>, ContractQueryError>,
  "queryKey" | "queryFn"
> {
  contractIdOrAddress: EntityId | string;
}

export type UseContractInfoResult = UseQueryResult<
  ContractQueryFnData<ContractInfo>,
  ContractQueryError
>;

export interface UseContractCallOptions extends Omit<
  UseQueryOptions<ContractQueryFnData<ContractCallResult>, ContractQueryError>,
  "queryKey" | "queryFn"
> {
  params: ContractCallParams;
}

export type UseContractCallResult = UseQueryResult<
  ContractQueryFnData<ContractCallResult>,
  ContractQueryError
>;

export interface UseContractResultsOptions extends Omit<
  UseQueryOptions<ContractQueryFnData<ContractResult[]>, ContractQueryError>,
  "queryKey" | "queryFn"
> {
  contractId: EntityId;
  params?: { limit?: number; order?: "asc" | "desc"; timestamp?: Timestamp };
}

export type UseContractResultsResult = UseQueryResult<
  ContractQueryFnData<ContractResult[]>,
  ContractQueryError
>;

export interface UseContractResultOptions extends Omit<
  UseQueryOptions<ContractQueryFnData<ContractResult>, ContractQueryError>,
  "queryKey" | "queryFn"
> {
  contractId: EntityId;
  timestamp: Timestamp;
}

export type UseContractResultResult = UseQueryResult<
  ContractQueryFnData<ContractResult>,
  ContractQueryError
>;

export interface UseContractStateOptions extends Omit<
  UseQueryOptions<ContractQueryFnData<ContractState[]>, ContractQueryError>,
  "queryKey" | "queryFn"
> {
  contractId: EntityId;
  params?: { limit?: number; order?: "asc" | "desc"; slot?: string };
}

export type UseContractStateResult = UseQueryResult<
  ContractQueryFnData<ContractState[]>,
  ContractQueryError
>;

export interface UseContractLogsOptions extends Omit<
  UseQueryOptions<ContractQueryFnData<ContractLog[]>, ContractQueryError>,
  "queryKey" | "queryFn"
> {
  contractId: EntityId;
  params?: { limit?: number; order?: "asc" | "desc"; timestamp?: Timestamp; index?: number };
}

export type UseContractLogsResult = UseQueryResult<
  ContractQueryFnData<ContractLog[]>,
  ContractQueryError
>;

export interface UseContractsOptions extends Omit<
  UseQueryOptions<ContractQueryFnData<ContractInfo[]>, ContractQueryError>,
  "queryKey" | "queryFn"
> {
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    address?: string;
    smart_contract_id?: EntityId | QueryOperator<EntityId>;
  };
}

export type UseContractsResult = UseQueryResult<
  ContractQueryFnData<ContractInfo[]>,
  ContractQueryError
>;

export interface UseContractsInfiniteOptions extends Omit<
  UseInfiniteQueryOptions<ContractQueryFnData<ContractInfo[]>, ContractQueryError>,
  "queryKey" | "queryFn" | "getNextPageParam"
> {
  params?: { limit?: number; order?: "asc" | "desc" };
}

export type UseContractsInfiniteResult = UseInfiniteQueryResult<
  ContractQueryFnData<ContractInfo[]>,
  ContractQueryError
>;

export function useContractInfo(
  options: UseContractInfoOptions,
): UseContractInfoResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.info(options.contractIdOrAddress),
    queryFn: async () => {
      return client.contract.getInfo(options.contractIdOrAddress);
    },
  });
}

export function useContractCall(
  options: UseContractCallOptions,
): UseContractCallResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.call(),
    queryFn: async () => {
      return client.contract.call(options.params);
    },
  });
}

export function useContractResults(
  options: UseContractResultsOptions,
): UseContractResultsResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.results(options.contractId),
    queryFn: async () => {
      return client.contract.getResults(options.contractId, options.params);
    },
  });
}

export function useContractResult(
  options: UseContractResultOptions,
): UseContractResultResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.result(options.contractId, options.timestamp),
    queryFn: async () => {
      return client.contract.getResult(options.contractId, options.timestamp);
    },
  });
}

export function useContractState(
  options: UseContractStateOptions,
): UseContractStateResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.state(options.contractId),
    queryFn: async () => {
      return client.contract.getState(options.contractId, options.params);
    },
  });
}

export function useContractLogs(
  options: UseContractLogsOptions,
): UseContractLogsResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.logs(options.contractId),
    queryFn: async () => {
      return client.contract.getLogs(options.contractId, options.params);
    },
  });
}

export function useContracts(options: UseContractsOptions = {}): UseContractsResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.list(),
    queryFn: async () => {
      return client.contract.listPaginated(options.params);
    },
  });
}

export function useContractsInfinite(
  options: UseContractsInfiniteOptions,
): UseContractsInfiniteResult {
  const client = useMirrorNodeClient();

  return useInfiniteQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.list(),
    queryFn: async () => {
      const params = {
        ...options.params,
        limit: options.params?.limit ?? 25,
      };

      const result = await client.contract.listPaginated(params);

      return result;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.success || lastPage.data.length === 0) {
        return undefined;
      }
      return lastPage.data.length;
    },
    initialPageParam: 0,
  });
}

export interface UseContractAllResultsOptions extends Omit<
  UseQueryOptions<ContractQueryFnData<ContractResultsResponse>, ContractQueryError>,
  "queryKey" | "queryFn"
> {
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    from?: string;
    block_hash?: string;
    block_number?: number;
    internal?: boolean;
    timestamp?: Timestamp;
    transaction_index?: number;
  };
}

export type UseContractAllResultsResult = UseQueryResult<
  ContractQueryFnData<ContractResultsResponse>,
  ContractQueryError
>;

export interface UseContractResultByTransactionIdOrHashOptions extends Omit<
  UseQueryOptions<ContractQueryFnData<ContractResultDetails>, ContractQueryError>,
  "queryKey" | "queryFn"
> {
  transactionIdOrHash: string;
  params?: { nonce?: number };
}

export type UseContractResultByTransactionIdOrHashResult = UseQueryResult<
  ContractQueryFnData<ContractResultDetails>,
  ContractQueryError
>;

export interface UseContractResultActionsOptions extends Omit<
  UseQueryOptions<ContractQueryFnData<{ actions: ContractAction[] }>, ContractQueryError>,
  "queryKey" | "queryFn"
> {
  transactionIdOrHash: string;
}

export type UseContractResultActionsResult = UseQueryResult<
  ContractQueryFnData<{ actions: ContractAction[] }>,
  ContractQueryError
>;

export interface UseContractResultOpcodesOptions extends Omit<
  UseQueryOptions<ContractQueryFnData<ContractOpcodesResponse>, ContractQueryError>,
  "queryKey" | "queryFn"
> {
  transactionIdOrHash: string;
}

export type UseContractResultOpcodesResult = UseQueryResult<
  ContractQueryFnData<ContractOpcodesResponse>,
  ContractQueryError
>;

export interface UseContractAllLogsOptions extends Omit<
  UseQueryOptions<
    ContractQueryFnData<{ logs: ContractLog[]; links: { next?: string } }>,
    ContractQueryError
  >,
  "queryKey" | "queryFn"
> {
  params?: {
    limit?: number;
    order?: "asc" | "desc";
    timestamp?: Timestamp;
    index?: number;
  };
}

export type UseContractAllLogsResult = UseQueryResult<
  ContractQueryFnData<{ logs: ContractLog[]; links: { next?: string } }>,
  ContractQueryError
>;

export function useContractAllResults(
  options: UseContractAllResultsOptions = {},
): UseContractAllResultsResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.allResults(),
    queryFn: async () => {
      return client.contract.getAllResults(options.params);
    },
  });
}

export function useContractResultByTransactionIdOrHash(
  options: UseContractResultByTransactionIdOrHashOptions,
): UseContractResultByTransactionIdOrHashResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.resultByTx(options.transactionIdOrHash),
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

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.resultActions(options.transactionIdOrHash),
    queryFn: async () => {
      return client.contract.getResultActions(options.transactionIdOrHash);
    },
  });
}

export function useContractResultOpcodes(
  options: UseContractResultOpcodesOptions,
): UseContractResultOpcodesResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.resultOpcodes(options.transactionIdOrHash),
    queryFn: async () => {
      return client.contract.getResultOpcodes(options.transactionIdOrHash);
    },
  });
}

export function useContractAllLogs(
  options: UseContractAllLogsOptions = {},
): UseContractAllLogsResult {
  const client = useMirrorNodeClient();

  return useQuery({
    ...options,
    queryKey: mirrorNodeKeys.contract.allLogs(),
    queryFn: async () => {
      return client.contract.getAllContractLogs(options.params);
    },
  });
}
