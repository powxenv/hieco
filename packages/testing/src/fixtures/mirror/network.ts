import type {
  ExchangeRate,
  NetworkNode,
  NetworkSupply,
  TimestampRange,
  EntityId,
} from "@hieco/mirror";
import type { Factory } from "./account.js";

export type ExchangeRateFixtureOptions = {
  readonly centEquivalent?: number;
  readonly hbarEquivalent?: number;
  readonly expirationTime?: string;
  readonly nextCentEquivalent?: number;
  readonly nextHbarEquivalent?: number;
  readonly nextExpirationTime?: string;
  readonly rateTimestamp?: string;
};

export type NetworkNodeFixtureOptions = Partial<
  Pick<
    NetworkNode,
    "node_account_id" | "node_id" | "public_key" | "description" | "stake" | "stake_rewarded"
  >
> & {
  readonly fileId?: string;
  readonly nodeCertHash?: string | null;
  readonly serviceEndpoints?: readonly { readonly ip_address_v4: string; readonly port: number }[];
};

export type NetworkSupplyFixtureOptions = Partial<
  Pick<NetworkSupply, "total_supply" | "released_supply">
> & {
  readonly totalSupply?: number;
  readonly releasedSupply?: number;
};

interface Rate {
  readonly cent_equality: number;
  readonly expiration_time: string;
  readonly hbar_equality: number;
}

const createRate = (
  options: Omit<
    ExchangeRateFixtureOptions,
    "nextCentEquivalent" | "nextHbarEquivalent" | "nextExpirationTime" | "rateTimestamp"
  > = {},
): Rate => ({
  cent_equality: options.centEquivalent ?? 12000,
  expiration_time: options.expirationTime ?? Date.now().toString(),
  hbar_equality: options.hbarEquivalent ?? 1,
});

const createTimestampRange = (from: string, to: string | null = null): TimestampRange => ({
  from,
  to,
});

const createExchangeRate = (options: ExchangeRateFixtureOptions = {}): ExchangeRate => ({
  current_rate: createRate(options),
  next_rate: createRate({
    centEquivalent: options.nextCentEquivalent,
    expirationTime: options.nextExpirationTime,
    hbarEquivalent: options.nextHbarEquivalent,
  }),
  timestamp: options.rateTimestamp ?? Date.now().toString(),
});

const createNetworkNode = (options: NetworkNodeFixtureOptions = {}): NetworkNode => ({
  admin_key: null,
  decline_reward: null,
  description: options.description ?? null,
  file_id: (options.fileId ?? "0.0.1") as EntityId,
  max_stake: null,
  memo: null,
  min_stake: null,
  node_account_id: options.node_account_id ?? ("0.0.3" as EntityId),
  node_id: options.node_id ?? 0,
  node_cert_hash: options.nodeCertHash ?? null,
  public_key: options.public_key ?? null,
  reward_rate_start: null,
  service_endpoints: options.serviceEndpoints ?? [],
  stake: options.stake ?? null,
  stake_not_rewarded: null,
  stake_rewarded: options.stake_rewarded ?? null,
  staking_period: createTimestampRange(Date.now().toString(), null),
  timestamp: createTimestampRange(Date.now().toString(), null),
});

const createNetworkSupply = (options: NetworkSupplyFixtureOptions = {}): NetworkSupply => ({
  timestamp: Date.now().toString(),
  total_supply: options.total_supply ?? options.totalSupply ?? 500000000000,
  released_supply: options.released_supply ?? options.releasedSupply ?? 50000000000,
});

export const mockExchangeRate: Factory<ExchangeRate, ExchangeRateFixtureOptions> = {
  build: (overrides) => createExchangeRate(overrides),
  buildList: (count, overrides) =>
    Array.from({ length: count }, () => createExchangeRate(overrides)),
};

export const mockNetworkNode: Factory<NetworkNode, NetworkNodeFixtureOptions> = {
  build: (overrides) => createNetworkNode(overrides),
  buildList: (count, overrides) =>
    Array.from({ length: count }, () => createNetworkNode(overrides)),
};

export const mockNetworkSupply: Factory<NetworkSupply, NetworkSupplyFixtureOptions> = {
  build: (overrides) => createNetworkSupply(overrides),
  buildList: (count, overrides) =>
    Array.from({ length: count }, () => createNetworkSupply(overrides)),
};
