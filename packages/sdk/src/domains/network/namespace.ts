import type { Result } from "../../foundation/results.ts";
import type { AddressBookData, NetworkVersionData } from "../../foundation/results-shapes.ts";

export interface NetworkNamespace {
  version: () => Promise<Result<NetworkVersionData>>;
  addressBook: (options?: {
    readonly fileId?: string;
    readonly limit?: number;
  }) => Promise<Result<AddressBookData>>;
}
