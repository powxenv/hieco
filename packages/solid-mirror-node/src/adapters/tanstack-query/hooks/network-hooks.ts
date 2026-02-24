import { useQuery } from "@tanstack/solid-query";
import type { UseQueryResult } from "@tanstack/solid-query";
import type { ApiResult, ApiError } from "@hiecom/mirror-node";
import type { Accessor } from "solid-js";
import { useMirrorNodeClient, useNetwork } from "../../../solid/hooks";
import { mirrorNodeKeys } from "../query-keys";

export interface CreateNetworkExchangeRateOptions {
  readonly enabled?: boolean;
}

export type CreateNetworkExchangeRateResult = UseQueryResult<ApiResult<any>, ApiError>;

export interface CreateNetworkFeesOptions {
  readonly enabled?: boolean;
}

export type CreateNetworkFeesResult = UseQueryResult<ApiResult<any>, ApiError>;

export interface CreateNetworkNodesOptions {
  readonly enabled?: boolean;
}

export type CreateNetworkNodesResult = UseQueryResult<ApiResult<any>, ApiError>;

export interface CreateNetworkStakeOptions {
  readonly enabled?: boolean;
}

export type CreateNetworkStakeResult = UseQueryResult<ApiResult<any>, ApiError>;

export interface CreateNetworkSupplyOptions {
  readonly enabled?: boolean;
}

export type CreateNetworkSupplyResult = UseQueryResult<ApiResult<any>, ApiError>;

export function createNetworkExchangeRate(
  options: Accessor<CreateNetworkExchangeRateOptions> = () => ({}),
): CreateNetworkExchangeRateResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.network.exchangeRate(network()),
      queryFn: async () => {
        return client().network.getExchangeRate();
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createNetworkFees(
  options: Accessor<CreateNetworkFeesOptions> = () => ({}),
): CreateNetworkFeesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.network.fees(network()),
      queryFn: async () => {
        return client().network.getFees();
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createNetworkNodes(
  options: Accessor<CreateNetworkNodesOptions> = () => ({}),
): CreateNetworkNodesResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.network.nodes(network()),
      queryFn: async () => {
        return client().network.getNodes();
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createNetworkStake(
  options: Accessor<CreateNetworkStakeOptions> = () => ({}),
): CreateNetworkStakeResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.network.stake(network()),
      queryFn: async () => {
        return client().network.getStake();
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}

export function createNetworkSupply(
  options: Accessor<CreateNetworkSupplyOptions> = () => ({}),
): CreateNetworkSupplyResult {
  const client = useMirrorNodeClient();
  const { network } = useNetwork();

  return useQuery(() => {
    const opts = options();
    return {
      queryKey: mirrorNodeKeys.network.supply(network()),
      queryFn: async () => {
        return client().network.getSupply();
      },
      get enabled() {
        return opts.enabled ?? true;
      },
    };
  });
}
