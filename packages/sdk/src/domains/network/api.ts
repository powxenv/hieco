import type { Result } from "../../foundation/results.ts";
import { err, ok } from "../../foundation/results.ts";
import { createError } from "../../foundation/errors.ts";
import type { AddressBookData, NetworkVersionData } from "../../foundation/results-shapes.ts";
import type { NetworkNamespace } from "./namespace.ts";
import { AddressBookQuery, NetworkVersionInfoQuery } from "@hiero-ledger/sdk";

export function createNetworkNamespace(context: {
  readonly client: import("@hiero-ledger/sdk").Client;
}): NetworkNamespace {
  const version = async (): Promise<Result<NetworkVersionData>> => {
    try {
      const info = await new NetworkVersionInfoQuery().execute(context.client);
      return ok({ info });
    } catch (error) {
      if (error instanceof Error) {
        return err(
          createError("NETWORK_QUERY_FAILED", `Network version query failed: ${error.message}`, {
            hint: "Verify network connectivity",
          }),
        );
      }
      return err(
        createError("NETWORK_QUERY_FAILED", "Network version query failed", {
          hint: "Verify network connectivity",
        }),
      );
    }
  };

  const addressBook = async (options?: {
    readonly fileId?: string;
    readonly limit?: number;
  }): Promise<Result<AddressBookData>> => {
    try {
      const query = new AddressBookQuery();
      if (options?.fileId) query.setFileId(options.fileId);
      if (options?.limit !== undefined) query.setLimit(options.limit);
      const book = await query.execute(context.client);
      return ok({ book });
    } catch (error) {
      if (error instanceof Error) {
        return err(
          createError("NETWORK_QUERY_FAILED", `Address book query failed: ${error.message}`, {
            hint: "Verify mirror node connectivity and address book file id",
          }),
        );
      }
      return err(
        createError("NETWORK_QUERY_FAILED", "Address book query failed", {
          hint: "Verify mirror node connectivity and address book file id",
        }),
      );
    }
  };

  return { version, addressBook };
}
