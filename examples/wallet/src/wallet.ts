import {
  createWallet,
  genericWalletConnectWallet,
  hashpack,
  hederaTestnet,
  kabila,
} from "@hieco/wallet";

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim() || undefined;

export const walletRuntimeMode = walletConnectProjectId ? "explicit" : "managed";

export const walletRuntime = createWallet({
  ...(walletConnectProjectId ? { projectId: walletConnectProjectId } : {}),
  app: {
    name: "Hieco Wallet Example",
    description: "Vite example app for @hieco/wallet and @hieco/wallet-react",
  },
  chains: [hederaTestnet()],
  wallets: [hashpack(), kabila(), genericWalletConnectWallet()],
});
