import { hederaTestnet } from "./chains";
import type { CreateWalletOptions, WalletDefinition, WalletOption, WalletState } from "./types";
import { getDefaultWallets } from "./wallets";

function toWalletOption(definition: WalletDefinition): WalletOption | null {
  if (!definition.transports.includes("extension") || !definition.desktop?.extension) {
    return null;
  }

  return {
    id: definition.id,
    name: definition.name,
    icon: definition.icon,
    availability: "unavailable",
    canConnect: false,
    installUrl: definition.desktop.extension.extensionUrl ?? definition.installUrl ?? undefined,
  };
}

export function createWalletInitialState(
  options: Pick<CreateWalletOptions, "chain" | "projectId" | "wallets">,
): WalletState {
  const chain = options.chain ?? hederaTestnet();
  const projectId = options.projectId?.trim();
  const definitions = options.wallets ?? getDefaultWallets();

  return {
    chain,
    walletConnectEnabled: projectId !== undefined,
    wallets: definitions.flatMap((definition) => {
      const wallet = toWalletOption(definition);
      return wallet ? [wallet] : [];
    }),
    session: null,
    connection: null,
  };
}
