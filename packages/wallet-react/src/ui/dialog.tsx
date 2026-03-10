import * as stylex from "@stylexjs/stylex";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { type ConnectOptions, type WalletError, type WalletOption } from "@hieco/wallet";
import { useWallet } from "../use-wallet";
import { WalletQr } from "./qr";
import { walletUiStyles } from "./styles.stylex";

async function copyText(value: string): Promise<boolean> {
  if (!navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}

function hasExtension(wallet: WalletOption): boolean {
  return wallet.transports.includes("extension") && Boolean(wallet.desktop?.extension);
}

function isInstalled(wallet: WalletOption): boolean {
  return Boolean(wallet.extension);
}

function canUseWalletConnect(wallet: WalletOption): boolean {
  return wallet.transports.includes("walletconnect");
}

function walletStateLabel(wallet: WalletOption): string {
  if (isInstalled(wallet)) {
    return "Installed in this browser";
  }

  return "Install required";
}

function walletStateDescription(wallet: WalletOption): string {
  if (isInstalled(wallet)) {
    return "Connect with the browser extension already installed.";
  }

  return "Install the browser extension to connect in this browser.";
}

function isConnectDisabled(status: ReturnType<typeof useWallet>["status"]): boolean {
  return status === "restoring" || status === "disconnecting";
}

function isExtensionApprovalPending(
  wallet: ReturnType<typeof useWallet>,
  item: WalletOption,
): boolean {
  return (
    wallet.status === "connecting" &&
    wallet.transport === "extension" &&
    wallet.wallet?.id === item.id
  );
}

function connectButtonLabel(wallet: ReturnType<typeof useWallet>, item: WalletOption): string {
  return isExtensionApprovalPending(wallet, item) ? `Open ${item.name} again` : "Connect";
}

function startConnection(wallet: ReturnType<typeof useWallet>, options: ConnectOptions): void {
  void wallet.connect(options).catch(() => {});
}

function walletErrorCopy(error: WalletError): {
  readonly title: string;
  readonly message: string;
} {
  if (error.code === "USER_REJECTED") {
    return {
      title: "Connection canceled",
      message: "You canceled the wallet request. Try again whenever you're ready.",
    };
  }

  if (error.code === "WALLET_NOT_INSTALLED") {
    return {
      title: "Wallet not installed",
      message: "Install the wallet extension first, then try connecting again.",
    };
  }

  if (error.code === "CONNECT_FAILED") {
    return {
      title: "Couldn’t connect",
      message: "We couldn’t connect to the wallet. Try again from the dialog.",
    };
  }

  return {
    title: "Wallet request failed",
    message: error.message,
  };
}

const primaryButtonProps = stylex.props(
  walletUiStyles.interactive,
  walletUiStyles.focusRing,
  walletUiStyles.button,
);

const secondaryButtonProps = stylex.props(
  walletUiStyles.interactive,
  walletUiStyles.focusRing,
  walletUiStyles.button,
  walletUiStyles.buttonSecondary,
);

const linkProps = stylex.props(
  walletUiStyles.interactive,
  walletUiStyles.focusRing,
  walletUiStyles.link,
);

const overlayProps = stylex.props(walletUiStyles.overlay);
const dialogProps = stylex.props(walletUiStyles.dialog);
const headerProps = stylex.props(walletUiStyles.header);
const stackProps = stylex.props(walletUiStyles.stackSm);
const titleProps = stylex.props(walletUiStyles.title);
const copyProps = stylex.props(walletUiStyles.copy);
const actionsProps = stylex.props(walletUiStyles.actions);
const cardProps = stylex.props(walletUiStyles.stackSm, walletUiStyles.card);
const errorProps = stylex.props(walletUiStyles.stackSm, walletUiStyles.error);
const walletListProps = stylex.props(walletUiStyles.walletList);
const walletProps = stylex.props(walletUiStyles.wallet);
const walletHeaderProps = stylex.props(walletUiStyles.walletHeader);
const walletCopyProps = stylex.props(walletUiStyles.walletCopy);
const walletMetaProps = stylex.props(walletUiStyles.walletMeta);
const qrSectionProps = stylex.props(walletUiStyles.qrSection);
const desktopSectionProps = stylex.props(walletUiStyles.desktopSection);

function getPreferredQrWallet(wallets: readonly WalletOption[]): WalletOption | null {
  return (
    wallets.find((item) => item.id === "hedera-wallet") ??
    wallets.find((item) => canUseWalletConnect(item)) ??
    null
  );
}

export function WalletDialog(): ReactNode {
  const wallet = useWallet();
  const { isModalOpen: isOpen, closeModal } = wallet;
  const preferredQrWallet = useMemo(() => getPreferredQrWallet(wallet.wallets), [wallet.wallets]);
  const [copied, setCopied] = useState(false);
  const errorCopy = wallet.error ? walletErrorCopy(wallet.error) : null;

  useEffect(() => {
    if (!isOpen || wallet.status !== "connected" || !wallet.account) {
      return;
    }

    closeModal();
  }, [closeModal, isOpen, wallet.account, wallet.status]);

  useEffect(() => {
    if (
      !isOpen ||
      wallet.account ||
      wallet.prompt ||
      wallet.status === "restoring" ||
      wallet.status === "disconnecting" ||
      !preferredQrWallet
    ) {
      return;
    }

    void wallet.prepareQr({
      wallet: preferredQrWallet.id,
      chain: wallet.chain.id,
    });
  }, [
    isOpen,
    preferredQrWallet,
    wallet,
    wallet.account,
    wallet.chain.id,
    wallet.prompt,
    wallet.status,
  ]);

  if (!isOpen) {
    return null;
  }

  return (
    <div aria-modal="true" role="dialog" {...overlayProps}>
      <div {...dialogProps}>
        <div {...headerProps}>
          <div {...stackProps}>
            <strong {...titleProps}>Wallet</strong>
            <span {...copyProps}>
              Scan the WalletConnect QR code with your phone first, or use a desktop wallet below if
              you want to stay in this browser.
            </span>
          </div>
          <button onClick={closeModal} type="button" {...secondaryButtonProps}>
            Close
          </button>
        </div>

        {wallet.wallet && wallet.account ? (
          <ConnectedWalletCard
            accountId={wallet.account.accountId}
            chainId={wallet.chain.id}
            onDisconnect={() => {
              void wallet.disconnect().finally(closeModal);
            }}
            transport={wallet.transport}
            walletName={wallet.wallet.name}
          />
        ) : (
          <div {...stackProps}>
            <WalletPromptCard
              copied={copied}
              onCopy={async () => {
                const prompt = wallet.prompt;

                if (!prompt?.uri) {
                  return;
                }

                const didCopy = await copyText(prompt.uri);
                setCopied(didCopy);

                if (didCopy) {
                  window.setTimeout(() => {
                    setCopied(false);
                  }, 1400);
                }
              }}
              preferredQrWallet={preferredQrWallet}
              wallet={wallet}
            />
            <DesktopWalletList />
          </div>
        )}

        {errorCopy ? (
          <div {...errorProps}>
            <strong {...titleProps}>{errorCopy.title}</strong>
            <span {...copyProps}>{errorCopy.message}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

interface ConnectedWalletCardProps {
  readonly walletName: string;
  readonly accountId: string;
  readonly chainId: string;
  readonly transport: ReturnType<typeof useWallet>["transport"];
  readonly onDisconnect: () => void;
}

function ConnectedWalletCard({
  walletName,
  accountId,
  chainId,
  transport,
  onDisconnect,
}: ConnectedWalletCardProps): ReactNode {
  return (
    <div {...cardProps}>
      <strong {...titleProps}>{walletName}</strong>
      <span {...copyProps}>{accountId}</span>
      <span {...copyProps}>{chainId}</span>
      <span {...copyProps}>
        {transport === "extension"
          ? "Connected through desktop extension"
          : "Connected through WalletConnect"}
      </span>
      <button onClick={onDisconnect} type="button" {...secondaryButtonProps}>
        Disconnect
      </button>
    </div>
  );
}

interface WalletPromptCardProps {
  readonly wallet: ReturnType<typeof useWallet>;
  readonly copied: boolean;
  readonly onCopy: () => void;
  readonly preferredQrWallet: WalletOption | null;
}

function WalletPromptCard({
  wallet,
  copied,
  onCopy,
  preferredQrWallet,
}: WalletPromptCardProps): ReactNode {
  const prompt = wallet.prompt;

  if (prompt?.uri) {
    return (
      <div {...qrSectionProps}>
        <strong {...titleProps}>Scan with your mobile wallet</strong>
        <span {...copyProps}>
          Open a Hedera wallet on your phone and scan this WalletConnect QR code to connect right
          away.
        </span>
        <WalletQr value={prompt.uri} />
        <button onClick={onCopy} type="button" {...primaryButtonProps}>
          {copied ? "Pairing link copied" : "Copy pairing link"}
        </button>
      </div>
    );
  }

  return (
    <div {...qrSectionProps}>
      <strong {...titleProps}>Scan with your mobile wallet</strong>
      <span {...copyProps}>
        {preferredQrWallet
          ? `Opening a WalletConnect session for ${preferredQrWallet.name}. The QR code will appear here as soon as the pairing is ready.`
          : "WalletConnect is not available for the current wallet configuration."}
      </span>
    </div>
  );
}

export function WalletList(): ReactNode {
  return <DesktopWalletList />;
}

function DesktopWalletList(): ReactNode {
  const wallet = useWallet();
  const disabled = isConnectDisabled(wallet.status);
  const desktopWallets = wallet.wallets.filter(hasExtension);

  if (desktopWallets.length === 0) {
    return null;
  }

  return (
    <div {...desktopSectionProps}>
      <div {...stackProps}>
        <strong {...titleProps}>Desktop wallet options</strong>
        <span {...copyProps}>
          Prefer staying on this device? Use an installed extension or add one in this browser.
        </span>
      </div>
      <div {...walletListProps}>
        {desktopWallets.map((item) => (
          <div key={item.id} {...walletProps}>
            <div {...walletHeaderProps}>
              <img
                alt=""
                height={28}
                src={item.icon}
                width={28}
                {...stylex.props(walletUiStyles.walletIcon)}
              />
              <div {...walletCopyProps}>
                <strong {...titleProps}>{item.name}</strong>
                <span {...walletMetaProps}>{walletStateLabel(item)}</span>
                <span {...walletMetaProps}>{walletStateDescription(item)}</span>
              </div>
            </div>

            <div {...actionsProps}>
              {isInstalled(item) ? (
                <button
                  disabled={disabled}
                  onClick={() => {
                    startConnection(wallet, {
                      wallet: item.id,
                      transport: "extension",
                    });
                  }}
                  type="button"
                  {...primaryButtonProps}
                >
                  {connectButtonLabel(wallet, item)}
                </button>
              ) : item.installUrl ? (
                <a href={item.installUrl} rel="noreferrer" target="_blank" {...linkProps}>
                  Install
                </a>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
