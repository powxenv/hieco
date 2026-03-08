import type { ReactNode } from "react";
import { useWallet } from "../use-wallet";
import { useWalletModal } from "../use-wallet-modal";

export function WalletButton(): ReactNode {
  const { openModal } = useWalletModal();
  const wallet = useWallet();

  if (wallet.wallet && wallet.account) {
    return <WalletAccountButton />;
  }

  return (
    <button onClick={openModal} type="button">
      {wallet.status === "connecting"
        ? "Connecting wallet..."
        : wallet.status === "restoring"
          ? "Restoring wallet..."
          : "Connect wallet"}
    </button>
  );
}

export function WalletAccountButton(): ReactNode {
  const { openModal } = useWalletModal();
  const wallet = useWallet();
  const accountId = wallet.account?.accountId;
  const label =
    accountId && accountId.length > 10
      ? `${accountId.slice(0, 6)}...${accountId.slice(-4)}`
      : (accountId ?? wallet.wallet?.name ?? "Wallet");

  return (
    <button onClick={openModal} type="button">
      {label}
    </button>
  );
}
