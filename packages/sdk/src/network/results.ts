import type { NetworkVersionInfo, NodeAddressBook } from "@hieco/runtime";

export interface NetworkVersionData {
  readonly info: NetworkVersionInfo;
}

export interface AddressBookData {
  readonly book: NodeAddressBook;
}

export interface PingNodeResult {
  readonly nodeAccountId: string;
  readonly ok: boolean;
  readonly error?: string;
}

export interface PingAllData {
  readonly nodes: ReadonlyArray<PingNodeResult>;
}
