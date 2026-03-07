import { createAppKit, type CreateAppKit } from "@reown/appkit/react";
import { HederaProvider } from "@hashgraph/hedera-wallet-connect";

export type CreateHiecoAppKitOptions = Omit<CreateAppKit, "universalProvider">;

export async function createHiecoAppKit(options: CreateHiecoAppKitOptions) {
  const { metadata, projectId, ...appKitOptions } = options;
  const universalProvider = await HederaProvider.init({
    metadata,
    projectId,
  });

  return createAppKit({
    ...appKitOptions,
    metadata,
    projectId,
    universalProvider,
  });
}
