import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WalletProvider } from "@hieco/wallet-react";
import App from "./App";
import "./index.css";
import { walletRuntime } from "./wallet";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WalletProvider wallet={walletRuntime}>
      <App />
    </WalletProvider>
  </StrictMode>,
);
