import type { Block } from "@hieco/mirror";
import { state } from "./state.js";
import type { Factory } from "./account.js";

export type BlockFixtureOptions = Partial<
  Pick<Block, "hash" | "number" | "gas_used" | "record_file_hash" | "state_hash" | "previous_hash">
> & {
  readonly timestampFrom?: string;
  readonly timestampTo?: string;
};

const createBlock = (options: BlockFixtureOptions = {}): Block => ({
  hash: options.hash ?? "mock-block-hash",
  number: options.number ?? state.incrementBlock(),
  timestamp: {
    from: options.timestampFrom ?? Date.now().toString(),
    to: options.timestampTo ?? (Date.now() + 2000).toString(),
  },
  gas_used: options.gas_used ?? 0,
  record_file_hash: options.record_file_hash ?? "mock-record-hash",
  state_hash: options.state_hash ?? "mock-state-hash",
  previous_hash: options.previous_hash ?? "mock-previous-hash",
});

export const mockBlock: Factory<Block, BlockFixtureOptions> = {
  build: (overrides) => createBlock(overrides),
  buildList: (count, overrides) => Array.from({ length: count }, () => createBlock(overrides)),
};
