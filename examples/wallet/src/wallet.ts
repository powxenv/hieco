import {
  createWallet,
  genericWalletConnectWallet,
  hashpack,
  hederaTestnet,
  kabila,
} from "@hieco/wallet";

const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const walletAppUrl = import.meta.env.VITE_APP_URL?.trim() || "http://localhost:5173";
const walletAppIconUrl = new URL("/wallet-icon.svg", walletAppUrl).toString();

export const walletRuntimeMode = walletConnectProjectId ? "explicit" : "managed";

export const walletRuntime = createWallet({
  projectId: walletConnectProjectId,
  app: {
    name: "Hieco Wallet Example",
    description: "Vite example app for @hieco/wallet and @hieco/wallet-react",
    url: walletAppUrl,
    icons: [walletAppIconUrl],
  },
  chains: [hederaTestnet()],
  wallets: [hashpack(), kabila(), genericWalletConnectWallet()],
});
