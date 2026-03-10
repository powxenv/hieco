import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";
import { useWallet } from "../use-wallet";
import { walletUiStyles } from "./styles.stylex";

const primaryButtonProps = stylex.props(
  walletUiStyles.interactive,
  walletUiStyles.focusRing,
  walletUiStyles.button,
);

function walletButtonLabel(wallet: ReturnType<typeof useWallet>): string {
  if (wallet.isModalOpen) {
    if (wallet.prompt) {
      return "Scan QR code";
    }

    return "Choose wallet";
  }

  if (wallet.status === "restoring") {
    return "Restoring wallet...";
  }

  if (wallet.status === "connecting" && wallet.transport === "extension" && !wallet.prompt) {
    return wallet.wallet ? `Approve in ${wallet.wallet.name}` : "Approve in wallet";
  }

  if (wallet.status === "disconnecting") {
    return "Disconnecting...";
  }

  return "Connect wallet";
}

export function WalletButton(): ReactNode {
  const wallet = useWallet();
  const label = walletButtonLabel(wallet);

  if (wallet.wallet && wallet.account) {
    return <WalletAccountButton />;
  }

  return (
    <button
      onClick={() => {
        wallet.openModal();
      }}
      type="button"
      {...primaryButtonProps}
    >
      {label}
    </button>
  );
}

export function WalletAccountButton(): ReactNode {
  const wallet = useWallet();
  const accountId = wallet.account?.accountId;
  const label =
    accountId && accountId.length > 10
      ? `${accountId.slice(0, 6)}...${accountId.slice(-4)}`
      : (accountId ?? wallet.wallet?.name ?? "Wallet");

  return (
    <button onClick={wallet.openModal} type="button" {...primaryButtonProps}>
      {label}
    </button>
  );
}
