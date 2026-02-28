import type { Nft, EntityId } from "@hieco/mirror";
import { state } from "../utils/state.js";
import type { Factory } from "./account.js";

export type NftFixtureOptions = Partial<
  Pick<Nft, "account" | "token_id" | "serial_number" | "metadata" | "ipfs_hash">
>;

const nextSerial = (): number => {
  const current = state.messageSequence;
  state.incrementMessage();
  return current + 1;
};

const createNft = (options: NftFixtureOptions = {}): Nft => {
  const serial = options.serial_number ?? nextSerial();
  const tokenId = options.token_id ?? "0.0.456";
  const timestamp = Date.now().toString();

  return {
    account: options.account ?? "0.0.123",
    created_timestamp: timestamp,
    delegated_account_id: undefined,
    deleted: false,
    ipfs_hash: options.ipfs_hash ?? undefined,
    metadata: options.metadata ?? `metadata-${serial}`,
    modified_timestamp: timestamp,
    serial_number: serial,
    token_id: tokenId as EntityId,
    spender: undefined,
    symbol: undefined,
    name: undefined,
    treasury: false,
  };
};

export const mockNft: Factory<Nft, NftFixtureOptions> = {
  build: (overrides) => createNft(overrides),
  buildList: (count, overrides) =>
    Array.from({ length: count }, (_, i) => createNft({ ...overrides, serial_number: i + 1 })),
};
