import type { TokenInfo, CustomFees, EntityId } from "@hiecom/mirror-js";
import { state } from "../utils/state.js";
import type { Factory } from "./account.js";

export type TokenFixtureOptions = Partial<
  Pick<TokenInfo, "token_id" | "name" | "symbol" | "decimals" | "total_supply" | "type">
>;

const nextTokenId = (): EntityId => `0.0.${state.incrementToken()}` as EntityId;

const createEmptyCustomFees = (): CustomFees => ({
  created_timestamp: Date.now().toString(),
});

const createToken = (options: TokenFixtureOptions = {}): TokenInfo => {
  return {
    admin_key: null,
    auto_renew_account: null,
    auto_renew_period: null,
    created_timestamp: Date.now().toString(),
    decimals: options.decimals ?? 8,
    deleted: false,
    expiry_timestamp: null,
    fee_schedule_key: null,
    freeze_default: false,
    freeze_key: null,
    kyc_key: null,
    supply_key: null,
    wipe_key: null,
    pause_key: null,
    metadata_key: null,
    max_supply: null,
    modified_timestamp: Date.now().toString(),
    name: options.name ?? "Test Token",
    memo: "",
    pause_status: "NOT_PAUSED",
    symbol: options.symbol ?? "TT",
    supply_type: "FINITE",
    token_id: options.token_id ?? nextTokenId(),
    total_supply: options.total_supply ?? 100000000,
    treasury_account_id: "0.0.1" as EntityId,
    type: options.type ?? "FUNGIBLE_COMMON",
    custom_fees: createEmptyCustomFees(),
  };
};

export const mockToken: Factory<TokenInfo, TokenFixtureOptions> = {
  build: (overrides) => createToken(overrides),
  buildList: (count, overrides) => Array.from({ length: count }, () => createToken(overrides)),
};
