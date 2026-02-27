import type { ContractInfo, EntityId } from "@hieco/mirror-js";
import { state } from "../utils/state.js";
import type { Factory } from "./account.js";

export type ContractFixtureOptions = Partial<
  Pick<
    ContractInfo,
    | "contract_id"
    | "file_id"
    | "evm_address"
    | "auto_renew_account"
    | "auto_renew_period"
    | "proxy_account_id"
    | "max_automatic_token_associations"
    | "memo"
    | "expiration_timestamp"
  >
>;

const nextContractId = (): EntityId => `0.0.${state.incrementContract()}` as EntityId;

const createContract = (options: ContractFixtureOptions = {}): ContractInfo => {
  return {
    admin_key: null,
    auto_renew_account: options.auto_renew_account ?? null,
    auto_renew_period: options.auto_renew_period ?? null,
    contract_id: options.contract_id ?? nextContractId(),
    created_timestamp: Date.now().toString(),
    deleted: false,
    evm_address: options.evm_address ?? "0x0000000000000000000000000000000000000000",
    expiration_timestamp: options.expiration_timestamp ?? null,
    file_id: options.file_id ?? ("0.0.1" as EntityId),
    max_automatic_token_associations: options.max_automatic_token_associations ?? null,
    memo: options.memo ?? "",
    obtainer_id: null,
    permanent_removal: null,
    proxy_account_id: options.proxy_account_id ?? null,
    timestamp: null,
  };
};

export const mockContract: Factory<ContractInfo, ContractFixtureOptions> = {
  build: (overrides) => createContract(overrides),
  buildList: (count, overrides) => Array.from({ length: count }, () => createContract(overrides)),
};
