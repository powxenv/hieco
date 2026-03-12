import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MirrorNodeProvider } from "@hieco/mirror-react";
import { hederaTestnet, hashpack, kabila } from "@hieco/wallet";
import { WalletProvider } from "@hieco/wallet-react";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();
const walletConnectProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID?.trim() || undefined;
const walletAppUrl = import.meta.env.VITE_APP_URL?.trim() || "http://localhost:5173";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WalletProvider
      app={{
        name: "Hieco Wallet Example",
        description: "Vite example app for @hieco/wallet and @hieco/wallet-react",
        url: walletAppUrl,
        icons: [new URL("/wallet-icon.svg", walletAppUrl).toString()],
      }}
      chain={hederaTestnet()}
      projectId={walletConnectProjectId}
      restoreOnStart
      wallets={[hashpack(), kabila()]}
    >
      <QueryClientProvider client={queryClient}>
        <MirrorNodeProvider config={{ defaultNetwork: "testnet" }}>
          <App />
        </MirrorNodeProvider>
      </QueryClientProvider>
    </WalletProvider>
  </StrictMode>,
);
